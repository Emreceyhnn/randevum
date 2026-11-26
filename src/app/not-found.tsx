import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Sayfa bulunamadı", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <p className="num text-7xl font-semibold tracking-tight text-line-strong">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Aradığınız sayfa bulunamadı</h1>
        <p className="mt-2 text-muted">Bağlantı hatalı olabilir ya da bu işletme artık randevu almıyor olabilir.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary"><Icon name="chevronLeft" size={16} /> Ana sayfaya dön</Link>
          <Link href="/canli-demo" className="btn btn-secondary">Canlı demoyu dene</Link>
        </div>
      </div>
    </main>
  );
}
