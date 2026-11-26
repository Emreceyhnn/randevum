import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addDays, dayKey, fmtMinutes, minutesOfDay, weekdayOf } from "@/lib/time";
import { Icon } from "@/components/icons";
import { BookingFlow } from "./booking-flow";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = await db.business.findUnique({ where: { slug } });
  return b ? { title: `${b.name} · Online randevu` } : {};
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase("tr-TR"))
    .join("");
}

export default async function BusinessPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const business = await db.business.findUnique({ where: { slug } });
  if (!business) notFound();

  const [services, hours] = await Promise.all([
    db.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.workingHour.findMany(),
  ]);
  const closed = new Set(hours.filter((h) => h.isClosed).map((h) => h.weekday));
  const today = dayKey(new Date());
  const days = Array.from({ length: business.maxAdvanceDays + 1 }, (_, i) => {
    const key = addDays(today, i);
    return { key, disabled: closed.has(weekdayOf(key)) || !hours.some((h) => h.weekday === weekdayOf(key)) };
  });

  // Canlı durum: şu an açık mı?
  const todayHours = hours.find((h) => h.weekday === weekdayOf(today) && !h.isClosed);
  const nowMin = minutesOfDay(new Date());
  const isOpen = !!todayHours && nowMin >= todayHours.openMin && nowMin < todayHours.closeMin;
  const statusText = !todayHours
    ? "Bugün kapalı"
    : isOpen
      ? `Şu an açık · ${fmtMinutes(todayHours.closeMin)}'e kadar`
      : nowMin < todayHours.openMin
        ? `Bugün ${fmtMinutes(todayHours.openMin)}'de açılıyor`
        : "Bugün için çalışma saati bitti";
  const telHref = `tel:+90${business.phone.replace(/\D/g, "").replace(/^0/, "")}`;

  return (
    <div className="min-h-dvh">
      <header className="relative overflow-hidden border-b border-line bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(900px 260px at 85% -40%, color-mix(in srgb, var(--brand) 22%, transparent), transparent 70%), radial-gradient(600px 200px at 0% 120%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-9">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-semibold tracking-wide text-brand-fg shadow-md sm:size-16 sm:text-xl"
            >
              {initials(business.name)}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Online randevu</p>
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{business.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                {business.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="pin" size={15} /> {business.address}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ background: isOpen ? "var(--confirmed-dot)" : "var(--faint)" }}
                  />
                  {statusText}
                </span>
              </div>
            </div>
          </div>
          <a href={telHref} className="btn btn-secondary self-start sm:self-center">
            <Icon name="phone" size={16} /> Ara
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-9">
        <BookingFlow
          services={services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin, priceTry: s.priceTry }))}
          days={days}
          business={{ name: business.name, address: business.address, phone: business.phone, smsEnabled: business.smsEnabled }}
        />
        <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-6 text-xs text-faint">
          <span className="inline-flex items-center gap-1.5"><Icon name="lock" size={14} /> Bilgileriniz yalnızca randevu için kullanılır</span>
          <span>Randevum ile hazırlandı</span>
        </footer>
      </main>
    </div>
  );
}
