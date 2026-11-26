# Randevum — Ürün & Tasarım Planı (v2 "Enterprise-grade, küçük işletme ölçeği")

> Hedef: 0–10 kişilik bir işletmenin sahibi de, 10–60 kişilik bir işletmenin yöneticisi de aynı ürünü
> "pahalı, güvenilir, hızlı" hissetsin. Görsel kalite kurumsal seviyede; karmaşıklık küçük işletme seviyesinde.

## 1. Problem ve fırsat

Mevcut MVP işlevsel ama görsel olarak "şablon" hissi veriyor: tek renk vurgu, gri kartlar, hiyerarşi yok,
yönetici paneli yalnızca bir liste. Müşteri ilk 5 saniyede işletmeye güvenmeli; yönetici ise
günün durumunu 3 saniyede okuyabilmeli.

## 2. Personalar

| Persona | Ölçek | Cihaz | Asıl iş | Başarı ölçütü |
|---|---|---|---|---|
| **Sahip-operatör** (kuaför, psikolog) | 0–10 kişi | Telefon, ayakta | "Bugün kimler geliyor, kim onaysız?" | Panele girip 3 sn'de cevabı görür |
| **Salon / klinik yöneticisi** | 10–60 kişi | Masaüstü + resepsiyon ekranı | Yoğunluk, onay kuyruğu, no-show, ciro tahmini | Gün başı toplantısında ekranı projeksiyona yansıtır |
| **Müşteri** | — | %85 telefon | Hızlı, güvenilir randevu | 3 adımda, hesapsız, <45 sn |

## 3. Tasarım ilkeleri

1. **Önce durum, sonra liste.** Her ekran üstte "şu an ne oluyor" özetiyle açılır (KPI şeridi).
2. **Tek vurgu + anlamsal renkler.** Marka rengi (teal/zümrüt) yalnızca birincil eylemlerde; durum renkleri
   (bekliyor = amber, onaylı = yeşil, iptal = kırmızı, tamamlandı = slate) hiçbir zaman dekoratif kullanılmaz.
3. **Yoğunluk esnek.** Masaüstünde kenar çubuğu + tablo/zaman çizelgesi; telefonda alt gezinme + kartlar.
4. **Tek elle kullanım.** Telefondaki tüm birincil eylemler baş parmak bölgesinde, dokunma hedefi ≥ 44px.
5. **Güven işaretleri.** Müşteri akışında: net süre/fiyat, "hesap gerekmez", işletme adresi/telefon, SMS hatırlatma bilgisi.
6. **Karanlık mod birinci sınıf.** Tüm renkler token; `prefers-color-scheme` ile otomatik.
7. **Erişilebilirlik (WCAG 2.2 AA).** Kontrast ≥ 4.5:1, görünür odak halkası, `aria-*` etiketleri, `prefers-reduced-motion`.
8. **Emoji yok, ikon seti dahili SVG** (yeni bağımlılık eklenmez — SPEC kuralı).

## 4. Tasarım sistemi (tokenlar)

- **Tipografi:** Geist Sans (UI) + Geist Mono (saat, telefon, tutar — `tabular-nums`). Ölçek: 12 / 13 / 14 / 16 / 20 / 28 / 36.
- **Renk:** `--brand` zümrüt (#0F766E ailesi, 50–900 ölçeği), nötr olarak sıcak-slate; yüzey katmanları `bg → surface → raised`.
- **Yarıçap:** 8 (girdi/buton) · 12 (kart) · 16 (modal/özet) · tam yuvarlak (rozet).
- **Gölge:** üç kademe (xs hairline, sm kart, md yüzen); karanlık modda gölge yerine 1px kenarlık.
- **Hareket:** 120–180ms ease-out; sadece durum geçişlerinde.
- **Bileşenler:** Button (primary/secondary/ghost/danger), Badge (4 durum), Card, Stat, Field/Input/Switch,
  Stepper, SlotChip, DayChip, EmptyState, AppShell (sidebar + bottom-nav).

## 5. Bilgi mimarisi

```
/[slug]                 Müşteri rezervasyon sayfası (marka başlığı + 3 adım + özet çubuğu)
/admin                  Giriş
/admin/panel            Gösterge: KPI şeridi + bugün zaman çizelgesi + onay kuyruğu + yarın
/admin/hizmetler        Hizmet kataloğu (tablo/kart, satır içi düzenleme, boş durum)
/admin/ayarlar          Bölümlü ayarlar: İşletme · Rezervasyon kuralları · Bildirimler · Çalışma saatleri
```

## 6. Ekran gereksinimleri

### 6.1 Müşteri — rezervasyon
- **Başlık bandı:** işletme adı, adres, "Şimdi randevu al" + canlı durum ("Bugün açık · 09:00–19:00"). Monogram avatar.
- **Stepper (3 adım):** Hizmet → Zaman → Bilgiler; tamamlanan adımlar özetlenir, geri dönülebilir.
- **Hizmet kartları:** ad, süre, fiyat, seçili durumda onay işareti.
- **Gün şeridi:** ay/gün/hafta günü ayrı hiyerarşi (ör. `CUM` / `13` / `Kas`), kapalı günler üstü çizili.
- **Saat ızgarası:** "Sabah / Öğleden sonra / Akşam" gruplama, seçili chip belirgin.
- **Yapışkan özet çubuğu (telefon):** hizmet · tarih/saat · toplam; birincil eylem alt sabit.
- **Başarı:** büyük onay, randevu kartı (bilet stili), "Takvime ekle (.ics)", "İşletmeyi ara", SMS bilgilendirmesi.
- **Hata/boş durumlar:** slot yok, slot az önce doldu (inline, yeniden yükle), doğrulama mesajları alan altında.

### 6.2 Yönetici — gösterge
- **KPI şeridi:** Bugünkü randevu · Onay bekleyen · Tahmini ciro (bugün) · Doluluk %.
- **Zaman çizelgesi:** bugünün randevuları saat sütunuyla, geçmiş/şu an/sonraki ayrımı, şu anki randevu vurgulu.
- **Onay kuyruğu:** bekleyenler öne çıkar, tek tık Onayla / İptal.
- **Filtre sekmeleri:** Tümü · Bekleyen · Onaylı · Tamamlanan · İptal (sayaçlı) — URL arama parametresi, sunucu tarafı.
- **Yarın önizlemesi** ve hızlı arama/ara/WhatsApp bağlantıları.
- 10–60 kişilik işletmeler için: yoğun tablo görünümü (masaüstü), sayaçlar, kolay taranabilir satırlar.

### 6.3 Yönetici — hizmetler & ayarlar
- Hizmetler: başlık + "Yeni hizmet" birincil eylemi, satır başına süre/fiyat/aktiflik anahtarı, boş durum.
- Ayarlar: sol bölüm başlıkları + sağ içerik, açıklayıcı yardım metinleri, switch bileşeni (SMS), çalışma saatlerinde haftalık ızgara.

## 7. Kapsam dışı (bilinçli)
Çoklu personel / çoklu şube veri modeli, ödeme, müşteri hesabı. Tasarım bunlara yer bırakır (kenar çubuğu
bölümleri, "Personel" için ayrılmış bilgi mimarisi) ama bu sürümde veri modeli **değişmez**. Eylemlerin sunucu
mantığı (server actions, slot motoru, SMS) aynen korunur.

## 8. Başarı ölçütleri
- Müşteri akışı ≤ 3 dokunuş + form; Lighthouse erişilebilirlik ≥ 95.
- Panelde "bugün kaç randevu / kaç onaysız" bilgisi ilk ekranda, kaydırmadan görünür.
- 360px–1920px arası düzen bozulmaz; karanlık/aydınlık mod eşit kalite.
- `npm run build`, `npm run lint`, `npm test` yeşil.

## 9. Uygulama sırası
1. Tokenlar + global stil + ikon/UI primitifleri
2. Müşteri rezervasyon akışı
3. Admin kabuğu (AppShell) + gösterge
4. Hizmetler + ayarlar + giriş
5. Gerçek tarayıcıda 360 / 768 / 1440 px, aydınlık + karanlık doğrulama
