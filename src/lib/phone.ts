/** TR cep telefonunu 5xxxxxxxxx formatına çevirir; geçersizse null. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return /^5\d{9}$/.test(d) ? d : null;
}

export function displayPhone(p: string): string {
  return p.length === 10 ? `0${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 8)} ${p.slice(8)}` : p;
}
