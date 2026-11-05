# Randevum

Türkiye'deki mikro işletmeler (diş kliniği, güzellik salonu, kuaför, psikolog, veteriner, oto servis) için Türkçe online randevu uygulaması. Her işletme için ayrı kurulum (single-tenant).

- Müşteri: `/[slug]` üzerinden hizmet, gün, saat seçip randevu alır.
- İşletme: `/admin` üzerinden randevuları yönetir, hizmetleri ve çalışma saatlerini düzenler.
- SMS: randevu onayı ve ertesi gün hatırlatması (Netgsm veya stub).

## 5 dakikada çalıştırma

```bash
npm install
cp .env.example .env        # ADMIN_PASSWORD ve CRON_SECRET değerlerini değiştirin
npx prisma migrate dev      # veritabanını oluşturur
npx prisma db seed          # demo işletme + 3 hizmet + örnek randevular
npm run dev
```

- Müşteri sayfası: http://localhost:3000/demo
- Yönetim: http://localhost:3000/admin (şifre: `.env` içindeki `ADMIN_PASSWORD`)

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | SQLite için `file:./dev.db` |
| `ADMIN_PASSWORD` | Yönetim paneli şifresi |
| `CRON_SECRET` | `/api/cron/reminders` için Bearer token |
| `SMS_PROVIDER` | `stub` (konsola yazar) veya `netgsm` |
| `NETGSM_USERNAME`, `NETGSM_PASSWORD`, `NETGSM_HEADER` | Netgsm bilgileri |

## Hatırlatma SMS'i

Günde bir kez (ör. 18:00) çağırın:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://alanadiniz.com/api/cron/reminders
```

Yarının ONAYLI randevularına SMS gider. SMS hatası randevu oluşturmayı asla engellemez.

## Deploy notu

- Tek bir Node.js sunucusu yeterli: `npm run build && npm start`. SQLite dosyası kalıcı bir diskte durmalı (VPS, Railway/Fly volume). Vercel gibi geçici dosya sistemlerinde Postgres'e geçin (Prisma `provider` ve adapter değişir).
- Deploy sırasında `npx prisma migrate deploy` çalıştırın.
- Üretimde `ADMIN_PASSWORD` ve `CRON_SECRET` değerlerini güçlü yapın, HTTPS kullanın.
- Saat dilimi Europe/Istanbul (UTC+3) olarak sabittir.

## Satış argümanı

- Telefonla randevu yazma ve "WhatsApp'tan yazıp unutma" derdini bitirir; müşteri 7/24 kendisi randevu alar.
- SMS hatırlatma ile randevuya gelmeme (no-show) oranı belirgin düşer.
- Aylık abonelik yok: işletmeye özel kurulum, kendi verisi kendi sunucusunda.
- Kurulumu ve kullanımı basit; personel 5 dakikada öğrenir. Mobil öncelikli, Türkçe arayüz.
