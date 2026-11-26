import { Icon } from "../icons";

/* Dekoratif ürün önizlemeleri: gerçek arayüzün sadeleştirilmiş, statik kopyaları. */

const ROWS = [
  { t: "15:00", end: "15:30", name: "Ayşe Yılmaz", svc: "Saç Kesimi", price: "₺400", st: "CONFIRMED", label: "Onaylandı", now: true },
  { t: "16:00", end: "16:45", name: "Mehmet Kaya", svc: "Manikür", price: "₺600", st: "PENDING", label: "Bekliyor" },
  { t: "17:30", end: "19:00", name: "Zeynep Demir", svc: "Boya + Fön", price: "₺1.500", st: "CONFIRMED", label: "Onaylandı" },
];

function MiniStat({ icon, label, value, warn }: { icon: "calendar" | "inbox" | "wallet" | "gauge"; label: string; value: string; warn?: boolean }) {
  return (
    <div className="card-flat flex flex-col gap-1.5 p-2.5 sm:p-3">
      <span
        className="grid size-6 place-items-center rounded-md"
        style={warn ? { background: "var(--pending-bg)", color: "var(--pending-fg)" } : { background: "var(--brand-soft)", color: "var(--brand-ink)" }}
      >
        <Icon name={icon} size={13} />
      </span>
      <div>
        <p className="text-[10px] font-medium text-muted sm:text-[11px]">{label}</p>
        <p className="num text-base font-semibold leading-tight sm:text-lg">{value}</p>
      </div>
    </div>
  );
}

export function DashboardMock({ className = "" }: { className?: string }) {
  return (
    <div role="img" aria-label="Randevum yönetim paneli önizlemesi" className={`card overflow-hidden shadow-md ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-sunken px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="size-2.5 rounded-full bg-[#ef6b5f]" />
          <i className="size-2.5 rounded-full bg-[#f5be4f]" />
          <i className="size-2.5 rounded-full bg-[#5fc455]" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-surface px-3 py-1 text-[11px] text-faint">
          <Icon name="lock" size={11} /> randevu.isletmeniz.com/admin
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr]" aria-hidden="true">
        <div className="hidden w-40 border-r border-line bg-surface p-3 sm:block">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-brand text-[10px] font-semibold text-brand-fg">DG</span>
            <span className="text-[11px] font-semibold leading-tight">Demo Güzellik<br /><span className="font-normal text-faint">Yönetim paneli</span></span>
          </div>
          {[
            { i: "calendar", l: "Randevular", on: true },
            { i: "scissors", l: "Hizmetler" },
            { i: "settings", l: "Ayarlar" },
          ].map((it) => (
            <div key={it.l} className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${it.on ? "bg-brand-soft text-brand-ink" : "text-muted"}`}>
              <Icon name={it.i as "calendar"} size={13} /> {it.l}
            </div>
          ))}
        </div>

        <div className="min-w-0 bg-bg p-3 sm:p-4">
          <p className="text-sm font-semibold sm:text-base">Randevular</p>
          <p className="mb-3 text-[11px] text-muted">Bugün ve yarın</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat icon="calendar" label="Bugünkü randevu" value="8" />
            <MiniStat icon="inbox" label="Onay bekleyen" value="3" warn />
            <MiniStat icon="wallet" label="Tahmini ciro" value="₺4.850" />
            <MiniStat icon="gauge" label="Doluluk" value="%72" />
          </div>
          <ul className="card-flat mt-3 divide-y divide-line overflow-hidden">
            {ROWS.map((r) => (
              <li key={r.t} className="relative flex items-center gap-3 py-2.5 pl-4 pr-3">
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `var(--${r.st.toLowerCase()}-dot)` }} />
                <div className="num w-11 shrink-0">
                  <p className="text-[13px] font-semibold leading-tight">{r.t}</p>
                  <p className="text-[10px] text-faint">{r.end}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[12px] font-semibold">
                    {r.name}
                    {r.now && <span className="rounded-full bg-brand px-1.5 text-[9px] font-semibold text-brand-fg">Şimdi</span>}
                  </p>
                  <p className="truncate text-[11px] text-muted">{r.svc} · <span className="num">{r.price}</span></p>
                </div>
                <span className={`badge badge-${r.st} !text-[10px]`}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PhoneMock({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Randevum müşteri rezervasyon sayfası önizlemesi"
      className={`relative w-[236px] rounded-[34px] border-[7px] border-[#1b2733] bg-bg shadow-md dark:border-[#2c3b49] ${className}`}
    >
      <span aria-hidden="true" className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-[#1b2733] dark:bg-[#2c3b49]" />
      <div aria-hidden="true" className="overflow-hidden rounded-[26px] bg-bg">
        <div className="border-b border-line bg-surface px-3.5 pb-3 pt-7">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-[11px] font-semibold text-brand-fg">DG</span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-tight">Demo Güzellik Salonu</p>
              <p className="flex items-center gap-1 text-[10px] text-muted">
                <span className="size-1.5 rounded-full" style={{ background: "var(--confirmed-dot)" }} /> Şu an açık
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 p-3">
          <div className="rounded-xl border border-brand bg-brand-soft p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold">Saç Kesimi</p>
              <p className="num text-[11px] font-semibold">₺400</p>
            </div>
            <p className="flex items-center gap-1 text-[10px] text-muted"><Icon name="clock" size={10} /> 30 dk</p>
          </div>

          <div className="flex gap-1.5">
            {[["PER", "26"], ["CUM", "27"], ["CMT", "28"], ["PZT", "30"]].map(([w, d], i) => (
              <div key={w} className={`flex flex-1 flex-col items-center rounded-lg border py-1.5 ${i === 1 ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface"}`}>
                <span className={`text-[8px] font-semibold ${i === 1 ? "" : "text-faint"}`}>{w}</span>
                <span className="num text-[13px] font-semibold leading-tight">{d}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].map((t, i) => (
              <div key={t} className={`num rounded-lg border py-1.5 text-center text-[10px] font-medium ${i === 3 ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface"}`}>{t}</div>
            ))}
          </div>

          <div className="rounded-xl bg-brand py-2.5 text-center text-[11px] font-semibold text-brand-fg">Randevuyu onayla</div>
        </div>
      </div>
    </div>
  );
}

export function SmsMock({ className = "" }: { className?: string }) {
  return (
    <div role="img" aria-label="SMS hatırlatma örneği" className={`w-full max-w-[290px] ${className}`}>
      <div aria-hidden="true" className="rounded-2xl border border-line bg-surface p-3.5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-muted">
          <span className="grid size-6 place-items-center rounded-full bg-brand-soft text-brand-ink"><Icon name="message" size={12} /></span>
          <span className="font-semibold text-ink">DEMOGUZELLIK</span>
          <span className="ml-auto text-faint">Dün 18:00</span>
        </div>
        <p className="text-[13px] leading-snug">
          Merhaba Ayşe, yarın saat <b className="num">15:00</b>&apos;daki Saç Kesimi randevunuzu hatırlatırız. Görüşmek üzere!
        </p>
      </div>
    </div>
  );
}
