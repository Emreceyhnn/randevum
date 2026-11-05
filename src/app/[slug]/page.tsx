import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addDays, dayKey, weekdayOf } from "@/lib/time";
import { BookingFlow } from "./booking-flow";

export const dynamic = "force-dynamic";

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

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{business.name}</h1>
        {business.address && <p className="text-sm text-neutral-500">{business.address}</p>}
      </header>
      <BookingFlow
        services={services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin, priceTry: s.priceTry }))}
        days={days}
      />
    </main>
  );
}
