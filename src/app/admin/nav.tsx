import Link from "next/link";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { Icon, type IconName } from "@/components/icons";
import { logout } from "./actions";

type Key = "panel" | "hizmetler" | "ayarlar";

const ITEMS: { key: Key; href: string; label: string; icon: IconName }[] = [
  { key: "panel", href: "/admin/panel", label: "Randevular", icon: "calendar" },
  { key: "hizmetler", href: "/admin/hizmetler", label: "Hizmetler", icon: "scissors" },
  { key: "ayarlar", href: "/admin/ayarlar", label: "Ayarlar", icon: "settings" },
];

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toLocaleUpperCase("tr-TR")).join("");
}

export async function AdminShell({
  active,
  title,
  subtitle,
  actions,
  children,
}: {
  active: Key;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const b = await db.business.findFirst();
  const name = b?.name ?? "Randevum";

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
      {/* Masaüstü kenar çubuğu */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface lg:flex">
        <div className="flex items-center gap-3 px-5 pb-4 pt-6">
          <div className="grid size-10 place-items-center rounded-xl bg-brand text-sm font-semibold text-brand-fg shadow-sm">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{name}</p>
            <p className="text-xs text-faint">Yönetim paneli</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Yönetim">
          <p className="eyebrow px-3 pb-1.5 pt-3">Çalışma alanı</p>
          {ITEMS.map((it) => {
            const on = it.key === active;
            return (
              <Link
                key={it.key}
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition ${
                  on ? "bg-brand-soft text-brand-ink" : "text-muted hover:bg-sunken hover:text-ink"
                }`}
              >
                <Icon name={it.icon} size={18} /> {it.label}
              </Link>
            );
          })}
          {b && (
            <Link
              href={`/${b.slug}`}
              target="_blank"
              className="mt-3 flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-muted transition hover:bg-sunken hover:text-ink"
            >
              <Icon name="arrowRight" size={18} /> Rezervasyon sayfası
            </Link>
          )}
        </nav>
        <div className="border-t border-line p-3">
          <form action={logout}>
            <button className="btn btn-ghost w-full justify-start gap-3 px-3">
              <Icon name="logout" size={18} /> Çıkış yap
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobil üst çubuk */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="grid size-8 place-items-center rounded-lg bg-brand text-xs font-semibold text-brand-fg">{initials(name)}</div>
          <p className="truncate text-sm font-semibold">{name}</p>
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
            {actions}
          </header>
          {children}
        </main>

        {/* Mobil alt gezinme */}
        <nav
          aria-label="Yönetim"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          {ITEMS.map((it) => {
            const on = it.key === active;
            return (
              <Link
                key={it.key}
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${on ? "text-brand" : "text-muted"}`}
              >
                <Icon name={it.icon} size={21} /> {it.label}
              </Link>
            );
          })}
          <form action={logout} className="contents">
            <button className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted">
              <Icon name="logout" size={21} /> Çıkış
            </button>
          </form>
        </nav>
      </div>
    </div>
  );
}
