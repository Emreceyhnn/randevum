// Türkiye kalıcı olarak UTC+3 (DST yok).
const OFFSET_MS = 3 * 60 * 60 * 1000;
const MIN = 60 * 1000;

export const DAY_NAMES = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** "YYYY-MM-DD" + gün içi dakika -> gerçek an (UTC Date) */
export function istanbulToDate(day: string, minutes: number): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes) - OFFSET_MS);
}

/** Bir anın İstanbul'daki "YYYY-MM-DD" karşılığı */
export function dayKey(date: Date): string {
  return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function weekdayOf(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function minutesOfDay(date: Date): number {
  const t = new Date(date.getTime() + OFFSET_MS);
  return t.getUTCHours() * 60 + t.getUTCMinutes();
}

export function fmtMinutes(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const v = Number(m[1]) * 60 + Number(m[2]);
  return v >= 0 && v <= 24 * 60 ? v : null;
}

export function fmtTime(date: Date): string {
  return fmtMinutes(minutesOfDay(date));
}

export function fmtDayLong(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function fmtDayShort(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function addMinutes(date: Date, n: number): Date {
  return new Date(date.getTime() + n * MIN);
}
