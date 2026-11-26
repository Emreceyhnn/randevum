import { REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// llms.txt standardı: yapay zekâ asistanları için siteyi özetleyen Markdown.
export function GET() {
  const base = siteUrl();
  const body = `# ${SITE_NAME}

> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}

${SITE_NAME}, Türkiye'deki küçük işletmeler (kuaför, berber, güzellik salonu, diş kliniği, psikolog, veteriner, oto servis, fizyoterapi) için geliştirilmiş, MIT lisanslı, açık kaynak bir randevu yazılımıdır. Müşteri üye olmadan 3 adımda randevu alır; işletme sahibi yönetim panelinden randevuları onaylar/iptal eder; ertesi günün randevuları için SMS hatırlatma (Netgsm) gider. Veriler işletmenin kendi sunucusunda tek bir SQLite dosyasında durur; abonelik yoktur.

## Sayfalar

- [Ana sayfa](${base}/): ürün tanıtımı, özellikler, karşılaştırma ve sık sorulan sorular
- [Canlı demo](${base}/canli-demo): hesap açmadan müşteri ve yönetici deneyimini deneyin
- [Tam içerik (llms-full.txt)](${base}/llms-full.txt): özellikler ve sık sorulan soruların tamamı tek dosyada

## Kaynaklar

- [Kaynak kod ve kurulum (GitHub)](${REPO_URL}): README, Docker ile tek komut kurulum

## Önemli bilgiler

- Dil: Türkçe arayüz, Europe/Istanbul saat dilimi, Türk lirası fiyatlar
- Kurulum: \`docker compose up -d --build\`
- Lisans: MIT (ticari kullanım serbest)
- Sınırlama: şu an tek bir randevu takvimi vardır; personel bazlı ayrı takvim yoktur
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
