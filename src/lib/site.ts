export const SITE_NAME = "Randevum";
export const SITE_TAGLINE = "Türkiye'deki işletmeler için randevu ve SMS hatırlatma sistemi";
export const SITE_DESCRIPTION =
  "Kuaför, güzellik salonu, klinik ve servisler için kendi sunucunuzda çalışan online randevu sistemi. Hesap gerektirmeyen rezervasyon sayfası, yönetim paneli ve SMS hatırlatma. Abonelik yok.";
export const REPO_URL = "https://github.com/Emreceyhnn/randevum";

export const KEYWORDS = [
  "randevu sistemi",
  "online randevu",
  "randevu programı",
  "SMS hatırlatma",
  "kuaför randevu programı",
  "güzellik salonu randevu",
  "klinik randevu sistemi",
  "açık kaynak randevu",
  "kendi sunucunuzda randevu",
  "Netgsm randevu",
  "no-show azaltma",
  "randevu defteri",
];

/** Herkese açık kök adres (sonunda / olmadan). */
export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Arama motorlarının indekslemesi mantıklı mı? (localhost'ta hayır) */
export function isIndexable(): boolean {
  return !/localhost|127\.0\.0\.1/.test(siteUrl());
}
