import Link from "next/link";
import { logout } from "./actions";

export function AdminNav() {
  const link = "rounded-lg px-3 py-2 text-sm hover:bg-neutral-100";
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-3">
      <Link href="/admin/panel" className={link}>Randevular</Link>
      <Link href="/admin/hizmetler" className={link}>Hizmetler</Link>
      <Link href="/admin/ayarlar" className={link}>Ayarlar</Link>
      <form action={logout} className="ml-auto">
        <button className={link}>Çıkış</button>
      </form>
    </nav>
  );
}
