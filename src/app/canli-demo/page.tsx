import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/icons";
import { addDays, dayKey, fmtDayLong, minutesOfDay, weekdayOf } from "@/lib/time";
import { DemoApp, type DayInfo } from "./demo-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canlı demo",
  description: "Randevum'u hesap açmadan deneyin: müşteri olarak randevu alın, yönetim panelinde onaylayın ve SMS hatırlatmayı görün.",
  alternates: { canonical: "/canli-demo" },
};

const WD = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function LiveDemo() {
  const now = new Date();
  const today = dayKey(now);
  const days: DayInfo[] = Array.from({ length: 7 }, (_, offset) => {
    const key = addDays(today, offset);
    const wd = weekdayOf(key);
    return {
      offset,
      wd: WD[wd]!,
      d: String(Number(key.slice(8, 10))),
      m: MONTHS[Number(key.slice(5, 7)) - 1]!,
      long: fmtDayLong(key),
      closed: wd === 0,
    };
  });

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <span className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted sm:inline-flex">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: "var(--confirmed-dot)" }} /><span className="relative inline-flex size-2 rounded-full" style={{ background: "var(--confirmed-dot)" }} /></span>
            Canlı demo · veriler kaydedilmez
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="btn btn-ghost hidden sm:inline-flex">Ana sayfa</Link>
            <a href="https://github.com/Emreceyhnn/randevum#quick-start-docker" target="_blank" rel="noreferrer" className="btn btn-primary">
              <Icon name="server" size={16} /> <span className="sm:hidden">Kurulum</span><span className="hidden sm:inline">Kendi işletmem için kur</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Etkileşimli demo</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">İki tarafı da kendiniz deneyin</h1>
          <p className="mt-3 text-muted">
            Solda müşterinin gördüğü sayfadan randevu alın; sağdaki yönetim panelinde anında belirdiğini görün ve onaylayın.
          </p>
        </div>
        <DemoApp days={days} nowMin={minutesOfDay(now)} />
      </main>
    </div>
  );
}
