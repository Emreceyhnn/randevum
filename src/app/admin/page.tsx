import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { Icon, type IconName } from "@/components/icons";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Yönetici girişi" };

const POINTS: { icon: IconName; title: string; text: string }[] = [
  { icon: "calendar", title: "Günün tamamı tek bakışta", text: "Bugünkü randevular, onay bekleyenler ve doluluk anında görünür." },
  { icon: "bell", title: "No-show'a karşı SMS", text: "Ertesi gün için otomatik hatırlatma, boş koltuğu azaltır." },
  { icon: "shield", title: "Verileriniz sizde", text: "Kendi sunucunuzda çalışır; abonelik veya ortak veritabanı yok." },
];

export default async function AdminLogin() {
  if (await isAuthed()) redirect("/admin/panel");
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-soft lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 420px at 10% 0%, color-mix(in srgb, var(--brand) 28%, transparent), transparent 70%), radial-gradient(600px 400px at 100% 100%, color-mix(in srgb, var(--brand) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-brand-ink">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-brand-fg"><Icon name="calendar" size={20} /></span>
            <span className="text-lg font-semibold tracking-tight">Randevum</span>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">İşletmenizin randevu takvimi, sakin ve kontrollü.</h2>
            <ul className="mt-10 space-y-6">
              {POINTS.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface/70 shadow-sm"><Icon name={p.icon} size={20} /></span>
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm opacity-80">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs opacity-70">Tek kişilik salondan 60 kişilik kliniğe kadar.</p>
        </div>
      </aside>

      <main className="grid place-items-center px-4 py-12 sm:px-8">
        <div className="rise w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-brand-fg"><Icon name="calendar" size={20} /></span>
            <span className="text-lg font-semibold tracking-tight">Randevum</span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight">Yönetici girişi</h1>
          <p className="mb-7 mt-1.5 text-muted">Panele erişmek için şifrenizi girin.</p>
          <LoginForm />
          <p className="mt-8 flex items-center gap-2 text-xs text-faint"><Icon name="lock" size={14} /> Oturumunuz bu cihazda 7 gün açık kalır.</p>
        </div>
      </main>
    </div>
  );
}
