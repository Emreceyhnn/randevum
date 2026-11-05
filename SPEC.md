# Randevum — MVP Spec

Türkiye'deki mikro işletmeler (diş kliniği, güzellik salonu, kuaför, psikolog, veteriner, oto servis)
için Türkçe randevu uygulaması. **Single-tenant**: her işletme için ayrı kurulum.

## Stack
- Next.js (App Router) + TypeScript strict + Tailwind CSS
- Prisma + SQLite (sonra Postgres'e geçilebilir)
- Server Actions veya Route Handlers (tercihen server actions)
- Tüm UI Türkçe, saat dilimi Europe/Istanbul

## Veri modeli (Prisma)
- `Business` (tek satır): name, slug, phone, address, slotIntervalMin (default 30), minLeadMinutes (default 120),
  maxAdvanceDays (default 30), smsEnabled, adminPasswordHash
- `Service`: name, durationMin, priceTry (Int), isActive, sortOrder
- `WorkingHour`: weekday (0=Pazar..6=Cumartesi), openMin, closeMin, isClosed  (@@unique weekday)
- `Appointment`: serviceId, startAt (DateTime), endAt, customerName, customerPhone, note,
  status (PENDING|CONFIRMED|CANCELLED|DONE), smsSentAt, createdAt
  @@index([startAt])

## Sayfalar

### Public — `/[slug]`
1. Hizmet seçimi (kart listesi: ad, süre, fiyat)
2. Gün seçimi (önümüzdeki `maxAdvanceDays` gün, kapalı günler disabled) + saat slotları
3. Ad, telefon (TR formatı doğrulama), not → onay
4. Başarı ekranı: tarih/saat özeti + "İşletmeyi ara" linki

Slot üretimi: workingHours içinde `slotIntervalMin` adımlarla, `durationMin` sığacak şekilde,
geçmiş/çok yakın saatler (`minLeadMinutes`) ve dolu randevular (overlap) hariç.

### Admin — `/admin`
- `/admin` → şifre girişi (env `ADMIN_PASSWORD` ile karşılaştır, httpOnly cookie session, 7 gün)
- `/admin/panel` → bugün + yarın randevuları, durum değiştirme butonları (Onayla / İptal / Tamamlandı)
- `/admin/hizmetler` → hizmet CRUD
- `/admin/ayarlar` → işletme bilgisi, çalışma saatleri, slot aralığı

## SMS
`src/lib/sms.ts`: `sendSms(phone, message)` — provider arayüzü.
- `SMS_PROVIDER=netgsm|stub`, netgsm için `NETGSM_USERNAME`, `NETGSM_PASSWORD`, `NETGSM_HEADER`
- stub provider: konsola yazar, `{ ok: true, provider: "stub" }` döner
- Telefonu 5xxxxxxxxx formatına normalize et
- Hata durumunda randevu oluşturmayı ASLA bozma (fire-and-forget, logla)

`/api/cron/reminders` (GET, `Authorization: Bearer $CRON_SECRET`):
yarının CONFIRMED randevularına hatırlatma SMS'i at, `smsSentAt` işaretle.

## Kurulum
- `prisma/seed.ts`: demo işletme + 3 hizmet + çalışma saatleri + birkaç randevu
- `.env.example`: DATABASE_URL, ADMIN_PASSWORD, CRON_SECRET, SMS_PROVIDER, NETGSM_*
- README: Türkçe, ne işe yarar, 5 dakikada çalıştırma, deploy notu, satış argümanı

## Kurallar
- `any` yok, strict TS. Zod ile input doğrulama.
- Para birimi: ₺ formatı `Intl.NumberFormat("tr-TR")`
- Mobil öncelikli, temiz ve sade tasarım (nötr + tek accent renk). Emoji yok.
- `npm run build` hatasız geçmeli. Lint uyarısı bırakma.
- Gereksiz bağımlılık ekleme.
