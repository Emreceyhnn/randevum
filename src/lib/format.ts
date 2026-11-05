const tl = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
export const formatTry = (n: number): string => tl.format(n);

export function formatDuration(min: number): string {
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} sa ${r} dk` : `${h} sa`;
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal",
  DONE: "Tamamlandı",
};
