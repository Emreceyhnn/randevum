import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addDays, dayKey, fmtDayLong, fmtTime, istanbulToDate, weekdayOf } from "@/lib/time";
import { displayPhone } from "@/lib/phone";
import { STATUS_LABEL, formatDuration, formatTry } from "@/lib/format";
import { Icon, type IconName } from "@/components/icons";
import { setStatus } from "../actions";
import { AdminShell } from "../nav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Randevular" };

const FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "PENDING", label: "Bekleyen" },
  { key: "CONFIRMED", label: "Onaylı" },
  { key: "DONE", label: "Tamamlanan" },
  { key: "CANCELLED", label: "İptal" },
] as const;

function Stat({ icon, label, value, sub, tone }: { icon: IconName; label: string; value: string; sub?: string; tone?: "warn" }) {
  return (
    <div className="card flex flex-col items-start gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl"
        style={tone === "warn" ? { background: "var(--pending-bg)", color: "var(--pending-fg)" } : { background: "var(--brand-soft)", color: "var(--brand-ink)" }}
      >
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <p className="num text-[26px] font-semibold leading-tight tracking-tight">{value}</p>
        {sub && <p className="text-xs text-faint">{sub}</p>}
      </div>
    </div>
  );
}

export default async function Panel({ searchParams }: PageProps<"/admin/panel">) {
  await requireAdmin();
  const sp = await searchParams;
  const durum = typeof sp.durum === "string" && FILTERS.some((f) => f.key === sp.durum) ? sp.durum : "all";
  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLocaleLowerCase("tr-TR");

  const now = new Date();
  const today = dayKey(now);
  const tomorrow = addDays(today, 1);
  const [all, hours] = await Promise.all([
    db.appointment.findMany({
      where: { startAt: { gte: istanbulToDate(today, 0), lt: istanbulToDate(addDays(today, 2), 0) } },
      include: { service: true },
      orderBy: { startAt: "asc" },
    }),
    db.workingHour.findFirst({ where: { weekday: weekdayOf(today) } }),
  ]);

  // KPI'lar (iptaller hariç)
  const live = all.filter((a) => a.status !== "CANCELLED");
  const todayLive = live.filter((a) => dayKey(a.startAt) === today);
  const pendingCount = all.filter((a) => a.status === "PENDING").length;
  const revenue = todayLive.reduce((s, a) => s + a.service.priceTry, 0);
  const bookedMin = todayLive.reduce((s, a) => s + a.service.durationMin, 0);
  const openMin = hours && !hours.isClosed ? hours.closeMin - hours.openMin : 0;
  const occupancy = openMin > 0 ? Math.min(100, Math.round((bookedMin / openMin) * 100)) : 0;
  const nextUp = todayLive.find((a) => a.startAt > now);

  const counts: Record<string, number> = { all: all.length };
  for (const a of all) counts[a.status] = (counts[a.status] ?? 0) + 1;

  const visible = all.filter((a) => {
    if (durum !== "all" && a.status !== durum) return false;
    if (q && !`${a.customerName} ${a.customerPhone} ${a.service.name}`.toLocaleLowerCase("tr-TR").includes(q)) return false;
    return true;
  });

  const href = (d: string) => `/admin/panel?durum=${d}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <AdminShell active="panel" title="Randevular" subtitle={`${fmtDayLong(today)} · bugün ve yarın`}>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <Stat icon="calendar" label="Bugünkü randevu" value={String(todayLive.length)} sub={nextUp ? `Sıradaki: ${fmtTime(nextUp.startAt)}` : "Sırada randevu yok"} />
        <Stat icon="inbox" label="Onay bekleyen" value={String(pendingCount)} sub="Bugün + yarın" tone={pendingCount > 0 ? "warn" : undefined} />
        <Stat icon="wallet" label="Tahmini ciro" value={formatTry(revenue)} sub="Bugün, iptaller hariç" />
        <Stat icon="gauge" label="Doluluk" value={`%${occupancy}`} sub={openMin > 0 ? `${formatDuration(bookedMin)} / ${formatDuration(openMin)}` : "Bugün kapalı"} />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Durum filtresi" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => {
            const on = durum === f.key;
            return (
              <Link
                key={f.key}
                href={href(f.key)}
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition ${
                  on ? "border-brand bg-brand-soft text-brand-ink" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {f.label}
                <span className="num rounded-full bg-sunken px-1.5 text-[11px] text-muted">{counts[f.key] ?? 0}</span>
              </Link>
            );
          })}
        </nav>
        <form action="/admin/panel" className="relative lg:w-72">
          <input type="hidden" name="durum" value={durum} />
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input name="q" defaultValue={q} placeholder="Müşteri, telefon veya hizmet ara" aria-label="Randevu ara" className="field field-sm pl-9" />
        </form>
      </div>

      <div className="mt-6 space-y-8">
        {[today, tomorrow].map((day) => {
          const list = visible.filter((a) => dayKey(a.startAt) === day);
          return (
            <section key={day} aria-labelledby={`d-${day}`}>
              <div className="mb-3 flex items-baseline gap-3">
                <h2 id={`d-${day}`} className="text-base font-semibold">{day === today ? "Bugün" : "Yarın"}</h2>
                <span className="text-sm text-muted">{fmtDayLong(day)}</span>
                <span className="num ml-auto text-xs text-faint">{list.length} randevu</span>
              </div>

              {list.length === 0 ? (
                <div className="card-flat flex flex-col items-center gap-1 border-dashed py-10 text-center">
                  <Icon name="inbox" size={26} className="text-faint" />
                  <p className="mt-1 font-medium">{durum !== "all" || q ? "Filtreye uyan randevu yok" : "Bu gün için randevu yok"}</p>
                  <p className="text-sm text-muted">{durum !== "all" || q ? "Filtreyi temizleyerek tümünü görün." : "Yeni randevular burada görünecek."}</p>
                </div>
              ) : (
                <ul className="card divide-y divide-line overflow-hidden">
                  {list.map((a) => {
                    const isNow = a.status !== "CANCELLED" && a.startAt <= now && a.endAt > now;
                    const isPast = a.endAt <= now;
                    const dim = a.status === "CANCELLED" || (isPast && a.status === "DONE");
                    return (
                      <li key={a.id} className={`relative flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-center sm:gap-5 ${dim ? "opacity-60" : ""}`}>
                        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ background: `var(--${a.status.toLowerCase()}-dot)` }} />
                        <div className="num w-[92px] shrink-0">
                          <p className="text-lg font-semibold leading-tight">{fmtTime(a.startAt)}</p>
                          <p className="text-xs text-faint">{fmtTime(a.endAt)} · {formatDuration(a.service.durationMin)}</p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{a.customerName}</p>
                            {isNow && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-fg">Şimdi</span>}
                          </div>
                          <p className="text-sm text-muted">
                            {a.service.name} · <span className="num">{formatTry(a.service.priceTry)}</span>
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                            <a className="num inline-flex items-center gap-1.5 text-brand hover:underline" href={`tel:+90${a.customerPhone}`}>
                              <Icon name="phone" size={14} /> {displayPhone(a.customerPhone)}
                            </a>
                            <a className="inline-flex items-center gap-1.5 text-muted hover:text-ink hover:underline" href={`https://wa.me/90${a.customerPhone}`} target="_blank" rel="noreferrer">
                              <Icon name="message" size={14} /> WhatsApp
                            </a>
                          </div>
                          {a.note && (
                            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-sunken px-2.5 py-1.5 text-[13px] text-muted">
                              <Icon name="note" size={14} className="mt-0.5 shrink-0" /> {a.note}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status] ?? a.status}</span>
                          <div className="flex gap-1.5">
                            {a.status === "PENDING" && <StatusBtn id={a.id} status="CONFIRMED" label="Onayla" cls="btn-primary" icon="check" />}
                            {(a.status === "PENDING" || a.status === "CONFIRMED") && <StatusBtn id={a.id} status="DONE" label="Tamamlandı" cls="btn-secondary" />}
                            {a.status !== "CANCELLED" && a.status !== "DONE" && <StatusBtn id={a.id} status="CANCELLED" label="İptal" cls="btn-danger" />}
                            {(a.status === "CANCELLED" || a.status === "DONE") && <StatusBtn id={a.id} status="PENDING" label="Geri al" cls="btn-ghost" />}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}

function StatusBtn({ id, status, label, cls, icon }: { id: string; status: string; label: string; cls: string; icon?: IconName }) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn btn-sm ${cls}`}>
        {icon && <Icon name={icon} size={15} />} {label}
      </button>
    </form>
  );
}
