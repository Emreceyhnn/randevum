import type { IconName } from "@/components/icons";

export const FEATURES: { icon: IconName; title: string; text: string; wide?: boolean }[] = [
  {
    icon: "calendar",
    title: "Hesapsız, 3 adımlı rezervasyon",
    text: "Müşteriniz hizmeti, günü ve saati seçer; adını ve telefonunu girer. Uygulama indirmek ya da üye olmak yok. Tek bir bağlantıyı Instagram'a, WhatsApp'a ya da Google profilinize koymanız yeterli.",
    wide: true,
  },
  {
    icon: "shield",
    title: "Çift rezervasyon olmaz",
    text: "Çalışma saatleri, hizmet süresi, minimum hazırlık süresi ve dolu randevular birlikte hesaplanır. Müşteri yalnızca gerçekten müsait saatleri görür.",
  },
  {
    icon: "bell",
    title: "SMS ile hatırlatma",
    text: "Ertesi günün onaylı randevularına otomatik SMS gider. Netgsm entegrasyonu hazır. SMS hatası randevu oluşturmayı hiçbir zaman engellemez.",
  },
  {
    icon: "gauge",
    title: "Günü tek bakışta gösteren panel",
    text: "Bugünkü randevu sayısı, onay bekleyenler, tahmini ciro ve doluluk oranı ilk ekranda. Tek tıkla onaylayın, iptal edin ya da tamamlayın; arayın ya da WhatsApp'tan yazın.",
    wide: true,
  },
  {
    icon: "sparkle",
    title: "Her cihazda aynı kalite",
    text: "Telefon, tablet ve masaüstünde akıcı çalışır. Sistem temasına göre aydınlık ya da karanlık görünür, hareketi azaltma tercihine saygı duyar.",
  },
  {
    icon: "settings",
    title: "Kurallar sizde",
    text: "Slot aralığı, en erken ve en geç randevu süresi, haftalık çalışma saatleri ve kapalı günler. Hepsi panelden, kod yazmadan.",
  },
  {
    icon: "globe",
    title: "Türkiye'ye göre tasarlandı",
    text: "0532…, 532… ve +90… biçimlerini tanıyan telefon doğrulama, Türk lirası fiyatlar, Europe/Istanbul saat dilimi ve baştan sona Türkçe arayüz.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Kurulum zor mu?",
    a: "Docker kullanabiliyorsanız tek komuttur: depoyu indirin, .env dosyasında yönetici şifresini belirleyin ve docker compose up çalıştırın. README adım adım anlatır. Teknik biri yoksa kurulumu bir geliştiriciye yaptırmak birkaç saatlik iştir.",
  },
  {
    q: "Hangi büyüklükteki işletmeler için uygun?",
    a: "Tek kişilik bir salondan, birkaç koltuklu bir kliniğe kadar. Şu anki sürüm tek bir randevu takvimi üzerinde çalışır; personel bazlı ayrı takvimler henüz yoktur. Bunu bilerek söylüyoruz ki beklentiniz doğru olsun.",
  },
  {
    q: "SMS için ayrıca ödeme yapacak mıyım?",
    a: "Randevum SMS için ücret almaz. SMS'i gönderen sağlayıcınızın (ör. Netgsm) tarifesi geçerlidir. Denemek için “stub” modunu kullanabilirsiniz; mesajlar gerçekten gönderilmez, sunucu günlüğüne yazılır.",
  },
  {
    q: "Müşteri verileri nerede duruyor?",
    a: "Kendi sunucunuzdaki tek bir SQLite dosyasında. Üçüncü bir tarafın veritabanı yok, abonelik bitince verinize erişimin kesilmesi gibi bir durum da yok. Yönetici oturumu imzalı ve httpOnly çerezle korunur.",
  },
  {
    q: "Müşterilerim üye olmak zorunda mı?",
    a: "Hayır. Ad soyad ve cep telefonu yeterlidir. Telefon numarası yalnızca randevu bildirimi için kullanılır.",
  },
  {
    q: "Lisansı nedir, ticari kullanabilir miyim?",
    a: "MIT lisansıyla açık kaynaktır. Kendi işletmenizde ya da müşterileriniz için ticari olarak kullanabilir, değiştirebilirsiniz.",
  },
];
