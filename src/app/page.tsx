import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Logo } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { FAQ, FEATURES } from "@/lib/content";
import { REPO_URL, SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import { DashboardMock, PhoneMock, SmsMock } from "@/components/marketing/mockups";

export const dynamic = "force-dynamic";

const REPO = "https://github.com/Emreceyhnn/randevum";

export const metadata: Metadata = {
  title: { absolute: "Randevum — Türkiye'deki işletmeler için randevu ve SMS hatırlatma sistemi" },
  description:
    "Kuaför, güzellik salonu, klinik ve servisler için kendi sunucunuzda çalışan online randevu sistemi. Hesap gerektirmeyen rezervasyon sayfası, yönetim paneli ve SMS hatırlatma. Abonelik yok.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: "Randevum — randevu defteriniz, tek bir bağlantıda",
    description: "Müşterileriniz 3 dokunuşla randevu alsın, siz günün tamamını tek bakışta görün. Verileriniz kendi sunucunuzda.",
    siteName: "Randevum",
  },
  twitter: { card: "summary_large_image", title: "Randevum — randevu defteriniz, tek bir bağlantıda" },
};

const SECTORS = ["Kuaför & berber", "Güzellik salonu", "Diş kliniği", "Psikolog & terapist", "Veteriner", "Oto servis", "Fizyoterapi"];

const STEPS = [
  { n: "01", icon: "server" as IconName, title: "Kurun", text: "Tek komutla ayağa kalkar. Veritabanı geçişleri kendiliğinden uygulanır, örnek işletme ilk açılışta yüklenir.", code: "docker compose up -d --build" },
  { n: "02", icon: "scissors" as IconName, title: "Tanımlayın", text: "Hizmetlerinizi, sürelerini, fiyatlarını ve çalışma saatlerinizi panelden girin. Ortalama birkaç dakika sürer." },
  { n: "03", icon: "zap" as IconName, title: "Paylaşın", text: "Rezervasyon bağlantınızı müşterilerinize gönderin. Randevular panelinize ve SMS hatırlatmalar müşterilerinize ulaşır." },
];

const COMPARE: { row: string; us: string; them: string }[] = [
  { row: "Aylık abonelik", us: "Yok", them: "Genellikle var" },
  { row: "Verinizin durduğu yer", us: "Kendi sunucunuz, tek bir SQLite dosyası", them: "Sağlayıcının bulutu" },
  { row: "Yedekleme", us: "Dosyayı kopyalamak yeterli", them: "Sağlayıcıya bağlı" },
  { row: "SMS sağlayıcısı", us: "Netgsm hazır, arayüz genişletilebilir", them: "Çoğunlukla sabit" },
  { row: "Kaynak kod ve lisans", us: "Açık kaynak, MIT", them: "Kapalı" },
  { row: "Özelleştirme", us: "Kodu istediğiniz gibi değiştirin", them: "Sunulan ayarlarla sınırlı" },
];

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted">
      <span className="grid size-5 place-items-center rounded-full bg-brand-soft text-brand-ink"><Icon name="check" size={12} /></span>
      {children}
    </li>
  );
}

export default async function Landing() {
  // Tek işletmelik kurulumlarda ana sayfa doğrudan rezervasyon sayfasına yönlenebilir: SITE_MODE=business
  let slug: string | null = null;
  try {
    const b = await db.business.findFirst();
    slug = b?.slug ?? null;
  } catch {
    slug = null;
  }
  if (process.env.SITE_MODE === "business") {
    if (!slug) notFound();
    redirect(`/${slug}`);
  }
  const bookingHref = slug ? `/${slug}` : "/canli-demo";

  const base = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: base,
        logo: `${base}/icon.svg`,
        sameAs: [REPO_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: SITE_NAME,
        inLanguage: "tr-TR",
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#software`,
        name: SITE_NAME,
        url: base,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Randevu yönetimi",
        operatingSystem: "Web, Docker",
        inLanguage: "tr-TR",
        description: SITE_DESCRIPTION,
        featureList: FEATURES.map((f) => f.title),
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        license: "https://opensource.org/licenses/MIT",
        codeRepository: REPO_URL,
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${base}/#faq`,
        inLanguage: "tr-TR",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ───── Üst menü ───── */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Ana menü" className="ml-6 hidden items-center gap-1 md:flex">
            {[["Özellikler", "#ozellikler"], ["Nasıl çalışır", "#nasil"], ["Karşılaştırma", "#karsilastirma"], ["SSS", "#sss"]].map(([l, h]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-sunken hover:text-ink">{l}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost hidden sm:inline-flex"><Icon name="github" size={17} /> GitHub</a>
            <Link href="/canli-demo" className="btn btn-primary">Canlı demo</Link>
            <details className="relative md:hidden">
              <summary className="btn btn-secondary list-none px-3 [&::-webkit-details-marker]:hidden" aria-label="Menüyü aç"><Icon name="menu" size={18} /></summary>
              <div className="card absolute right-0 top-12 w-56 p-2 shadow-md">
                {[["Özellikler", "#ozellikler"], ["Nasıl çalışır", "#nasil"], ["Karşılaştırma", "#karsilastirma"], ["SSS", "#sss"]].map(([l, h]) => (
                  <a key={h} href={h} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sunken">{l}</a>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <main>
        {/* ───── Hero ───── */}
        <section className="relative">
          <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
            style={{ background: "radial-gradient(800px 380px at 50% -10%, color-mix(in srgb, var(--brand) 20%, transparent), transparent 70%)" }}
          />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8 lg:pb-24">
            <div className="rise">
              <a href={REPO} target="_blank" rel="noreferrer" className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3.5 text-[13px] font-medium text-muted shadow-xs transition hover:border-line-strong">
                <span className="shrink-0 whitespace-nowrap rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-brand-fg">Açık kaynak</span>
                <span className="whitespace-nowrap">MIT lisanslı<span className="hidden sm:inline"> · Türkiye&apos;deki işletmeler için</span></span>
                <Icon name="arrowRight" size={14} />
              </a>
              <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
                Randevu defteriniz,<br /> <span className="gradient-text">tek bir bağlantıda.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Müşterileriniz birkaç dokunuşla randevu alsın, siz günün tamamını tek bakışta görün. SMS hatırlatma ile boş koltukları azaltın. Üstelik her şey kendi sunucunuzda, abonelik olmadan.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/canli-demo" className="btn btn-primary btn-lg sm:w-auto sm:px-7"><Icon name="play" size={16} /> Canlı demoyu dene</Link>
                <Link href={bookingHref} className="btn btn-secondary btn-lg sm:w-auto sm:px-7">Müşteri sayfasını gör <Icon name="arrowRight" size={17} /></Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                <Check>Müşteri hesabı gerekmez</Check>
                <Check>Abonelik yok</Check>
                <Check>Verileriniz sizde</Check>
              </ul>
            </div>

            <div className="rise relative [animation-delay:120ms]">
              <DashboardMock className="relative z-0 lg:ml-4" />
              <PhoneMock className="absolute -bottom-10 -left-2 z-10 hidden scale-[0.82] sm:block lg:-left-14 lg:scale-90" />
              <div className="absolute -right-1 top-[58%] z-10 hidden sm:block lg:-right-6">
                <SmsMock className="max-w-[230px]" />
              </div>
            </div>
          </div>
        </section>

        {/* ───── Sektörler ───── */}
        <section aria-label="Uygun sektörler" className="border-y border-line bg-surface/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
            <p className="shrink-0 text-sm font-medium text-muted">Randevuyla çalışan her işletme için:</p>
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {SECTORS.map((s) => (
                <li key={s} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-medium text-muted">{s}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───── Problem → çözüm ───── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Neden Randevum</p>
            <h2 className="section-title mt-3">Kağıt defter ve WhatsApp karmaşasına son</h2>
            <p className="mt-4 text-lg text-muted">Randevular telefonda, mesajda ve kafada dağılınca unutulan saatler ve boş kalan koltuklar kaçınılmaz olur.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="card-flat p-6 sm:p-7">
              <p className="eyebrow mb-4">Şimdi</p>
              <ul className="space-y-3.5 text-[15px] text-muted">
                {["Müşteri aradığında siz müsait olmayabilirsiniz", "Randevular DM, mesaj ve defter arasında dağınık", "Hatırlatma yapılmadığı için gelmeyen müşteri (no-show)", "Aynı saate iki randevu yazma riski"].map((t) => (
                  <li key={t} className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full" style={{ background: "var(--cancelled-bg)", color: "var(--cancelled-fg)" }}><Icon name="x" size={12} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="card relative overflow-hidden p-6 sm:p-7" style={{ borderColor: "color-mix(in srgb, var(--brand) 40%, var(--line))" }}>
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 22%, transparent), transparent 70%)" }} />
              <p className="eyebrow mb-4" style={{ color: "var(--brand)" }}>Randevum ile</p>
              <ul className="relative space-y-3.5 text-[15px]">
                {["Müşteri 7/24 kendisi randevu alır, siz çalışırken bile", "Tüm randevular tek panelde, durumlarıyla birlikte", "Ertesi gün için otomatik SMS hatırlatma", "Çakışmayı sistem engeller, saatler hep doğru"].map((t) => (
                  <li key={t} className="flex gap-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-fg"><Icon name="check" size={12} /></span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───── Özellikler ───── */}
        <section id="ozellikler" className="border-y border-line bg-surface/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="max-w-2xl">
              <p className="eyebrow">Özellikler</p>
              <h2 className="section-title mt-3">Küçük işletmenin ihtiyacı kadar, kurumsal bir titizlikle</h2>
              <p className="mt-4 text-lg text-muted">Gereksiz modül yok. Randevu almanın ve yönetmenin her adımı düşünülerek cilalandı.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {FEATURES.map((f) => (
                <article key={f.title} className={`card p-6 transition hover:-translate-y-0.5 hover:shadow-md ${f.wide ? "md:col-span-2" : ""}`}>
                  <span className="mb-5 grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-ink"><Icon name={f.icon} size={22} /></span>
                  <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Panel vitrini ───── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow">Yönetim paneli</p>
              <h2 className="section-title mt-3">Resepsiyon ekranınız, telefonunuzda da</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Masaüstünde kenar çubuklu, telefonda alt sekmeli bir panel. Hangi cihazdan açarsanız açın günün durumu ilk saniyede okunur.
              </p>
              <ul className="mt-7 space-y-4">
                {[
                  ["inbox", "Onay kuyruğu", "Bekleyen randevular öne çıkar; tek tıkla onaylayın ya da iptal edin."],
                  ["search", "Filtre ve arama", "Duruma, müşteri adına, telefona veya hizmete göre anında bulun."],
                  ["phone", "Tek dokunuşla iletişim", "Müşteriyi arayın ya da WhatsApp'tan yazın."],
                ].map(([i, t, d]) => (
                  <li key={t} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink"><Icon name={i as IconName} size={19} /></span>
                    <div><p className="font-semibold">{t}</p><p className="text-sm text-muted">{d}</p></div>
                  </li>
                ))}
              </ul>
              <Link href="/canli-demo" className="btn btn-primary mt-8">Paneli kendiniz deneyin <Icon name="arrowRight" size={17} /></Link>
            </div>
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[32px]" style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--brand) 14%, transparent), transparent)" }} />
              <DashboardMock />
            </div>
          </div>
        </section>

        {/* ───── Nasıl çalışır ───── */}
        <section id="nasil" className="border-y border-line bg-surface/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Nasıl çalışır</p>
              <h2 className="section-title mt-3">Üç adımda yayında</h2>
            </div>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="card relative p-6">
                  <span className="num absolute right-5 top-5 text-4xl font-semibold text-line-strong/70">{s.n}</span>
                  <span className="mb-5 grid size-11 place-items-center rounded-xl bg-brand text-brand-fg"><Icon name={s.icon} size={21} /></span>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                  {s.code && (
                    <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0b1218] px-3.5 py-3 text-[12.5px] text-[#9be8dc]"><code className="font-mono">$ {s.code}</code></pre>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───── SMS ───── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="card grid items-center gap-10 overflow-hidden p-7 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">SMS hatırlatma</p>
              <h2 className="section-title mt-3">Gelmeyen müşteriye karşı en sade çözüm</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Her gün belirlediğiniz saatte, ertesi günün onaylı randevuları için müşteriye SMS gönderilir. Gönderilen randevu işaretlenir, aynı mesaj iki kez gitmez.
              </p>
              <ul className="mt-6 space-y-2.5">
                <Check>Netgsm ile gerçek gönderim, “stub” modu ile güvenli test</Check>
                <Check>Telefon numaraları otomatik normalleştirilir</Check>
                <Check>Hata olursa randevu etkilenmez, kayıt günlüğe düşer</Check>
              </ul>
            </div>
            <div className="relative grid place-items-center rounded-2xl bg-sunken p-8 sm:p-12">
              <div aria-hidden="true" className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--brand) 12%, transparent), transparent)" }} />
              <SmsMock className="relative" />
            </div>
          </div>
        </section>

        {/* ───── Karşılaştırma ───── */}
        <section id="karsilastirma" className="border-y border-line bg-surface/60">
          <div className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Sahiplik modeli</p>
              <h2 className="section-title mt-3">Kiralamak yerine sahip olun</h2>
              <p className="mt-4 text-lg text-muted">Her işletme kendi kurulumunu çalıştırır. Ortak veritabanı yok, abonelik yok.</p>
            </div>
            <div className="card mt-10 overflow-hidden">
              <div className="hidden grid-cols-[1.1fr_1.3fr_1fr] border-b border-line bg-sunken px-6 py-3 text-xs font-semibold uppercase tracking-wider text-faint sm:grid">
                <span />
                <span style={{ color: "var(--brand)" }}>Randevum</span>
                <span>Çoğu abonelikli servis</span>
              </div>
              <ul className="divide-y divide-line">
                {COMPARE.map((c) => (
                  <li key={c.row} className="grid gap-1.5 px-5 py-4 sm:grid-cols-[1.1fr_1.3fr_1fr] sm:items-center sm:gap-0 sm:px-6">
                    <span className="font-medium">{c.row}</span>
                    <span className="flex items-start gap-2 text-[15px]"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-fg"><Icon name="check" size={12} /></span>{c.us}</span>
                    <span className="text-[15px] text-muted"><span className="text-faint sm:hidden">Çoğu abonelikli serviste: </span>{c.them}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───── Güvenlik / teknik ───── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">Altyapı ve güvenlik</p>
            <h2 className="section-title mt-3">Sade teknoloji, sağlam temel</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: "lock", t: "Güvenli oturum", d: "Yönetici oturumu imzalı (HMAC) ve httpOnly çerezle, 7 gün geçerli." },
              { i: "shield", t: "Sunucu tarafı doğrulama", d: "Tüm girdiler Zod ile sunucuda doğrulanır; yönetim işlemleri oturum ister." },
              { i: "layers", t: "Tek dosya veri", d: "SQLite ve Prisma. Yedeklemek bir dosyayı kopyalamak kadar kolay." },
              { i: "code", t: "Test edilmiş çekirdek", d: "Slot motoru, telefon ve saat yardımcıları 50 birim testle korunur." },
            ].map((x) => (
              <div key={x.t} className="card-flat p-5">
                <span className="mb-4 grid size-10 place-items-center rounded-xl bg-sunken text-ink"><Icon name={x.i as IconName} size={19} /></span>
                <p className="font-semibold">{x.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-faint">Next.js 16 · React 19 · TypeScript (strict) · Prisma · SQLite · Docker</p>
        </section>

        {/* ───── SSS ───── */}
        <section id="sss" className="border-y border-line bg-surface/60">
          <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
            <div className="text-center">
              <p className="eyebrow">Sık sorulanlar</p>
              <h2 className="section-title mt-3">Aklınıza takılanlar</h2>
            </div>
            <div className="mt-10 space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="card group p-0 open:shadow-md">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15.5px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Icon name="chevronDown" size={18} className="shrink-0 text-faint transition group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Son çağrı ───── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="relative overflow-hidden rounded-[28px] bg-[#0b1d1b] px-6 py-16 text-center text-white sm:px-12">
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(600px 300px at 50% 0%, rgb(43 196 176 / 0.35), transparent 70%), radial-gradient(500px 260px at 100% 100%, rgb(43 196 176 / 0.18), transparent 70%)" }} />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Önce kendiniz deneyin</h2>
              <p className="mt-4 text-lg text-white/75">Canlı demoda müşteri olarak randevu alın, sonra yönetim panelinde onaylayın. Kayıt ya da kurulum gerekmez.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/canli-demo" className="btn btn-lg bg-[#2bc4b0] text-[#03201c] hover:bg-[#52d6c4] sm:w-auto sm:px-8"><Icon name="play" size={16} /> Canlı demoyu aç</Link>
                <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-lg border border-white/25 bg-white/5 text-white hover:bg-white/10 sm:w-auto sm:px-8"><Icon name="github" size={18} /> Kodu inceleyin</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-muted">Türkiye&apos;deki küçük işletmeler için açık kaynak randevu ve SMS hatırlatma sistemi.</p>
          </div>
          <nav aria-label="Alt menü" className="grid grid-cols-2 gap-x-14 gap-y-2.5 text-sm">
            <Link href="/canli-demo" className="text-muted hover:text-ink">Canlı demo</Link>
            <a href="#ozellikler" className="text-muted hover:text-ink">Özellikler</a>
            <Link href={bookingHref} className="text-muted hover:text-ink">Müşteri sayfası</Link>
            <a href="#sss" className="text-muted hover:text-ink">SSS</a>
            <a href={REPO} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">GitHub</a>
            <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">MIT lisansı</a>
          </nav>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-faint">© {new Date().getFullYear()} Randevum · MIT lisansı altında açık kaynak olarak yayımlanır.</div>
      </footer>
    </div>
  );
}
