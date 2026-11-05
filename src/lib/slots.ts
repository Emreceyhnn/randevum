import { db } from "./db";
import { addDays, addMinutes, dayKey, istanbulToDate, weekdayOf, fmtMinutes } from "./time";

export type Slot = { time: string; startAt: string };

/** Bir gün + hizmet için müsait saat slotları. */
export async function getSlots(day: string, durationMin: number, now = new Date()): Promise<Slot[]> {
  const business = await db.business.findFirst();
  if (!business) return [];
  const today = dayKey(now);
  if (day < today || day > addDays(today, business.maxAdvanceDays)) return [];

  const wh = await db.workingHour.findUnique({ where: { weekday: weekdayOf(day) } });
  if (!wh || wh.isClosed) return [];

  const dayStart = istanbulToDate(day, 0);
  const dayEnd = istanbulToDate(day, 24 * 60);
  const busy = await db.appointment.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] }, startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
    select: { startAt: true, endAt: true },
  });

  const earliest = addMinutes(now, business.minLeadMinutes);
  const slots: Slot[] = [];
  for (let m = wh.openMin; m + durationMin <= wh.closeMin; m += business.slotIntervalMin) {
    const start = istanbulToDate(day, m);
    const end = addMinutes(start, durationMin);
    if (start < earliest) continue;
    if (busy.some((b) => b.startAt < end && b.endAt > start)) continue;
    slots.push({ time: fmtMinutes(m), startAt: start.toISOString() });
  }
  return slots;
}
