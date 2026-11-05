import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { DAY_NAMES, fmtMinutes } from "@/lib/time";
import { saveSettings } from "../actions";
import { AdminNav } from "../nav";

export const dynamic = "force-dynamic";

const input = "w-full rounded-lg border border-neutral-300 p-2 text-sm";
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function Settings() {
  await requireAdmin();
  const b = await db.business.findFirst();
  const hours = await db.workingHour.findMany();
  if (!b) return <main className="p-6">İşletme kaydı yok. Önce seed çalıştırın.</main>;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <AdminNav />
      <h1 className="mb-4 text-xl font-semibold">Ayarlar</h1>
      <form action={saveSettings} className="space-y-6">
        <section className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <label className="col-span-2 text-xs text-neutral-500">İşletme adı<input name="name" defaultValue={b.name} className={input} /></label>
          <label className="text-xs text-neutral-500">Telefon<input name="phone" defaultValue={b.phone} className={input} /></label>
          <label className="text-xs text-neutral-500">Adres<input name="address" defaultValue={b.address} className={input} /></label>
          <label className="text-xs text-neutral-500">Slot aralığı (dk)<input name="slotIntervalMin" type="number" defaultValue={b.slotIntervalMin} className={input} /></label>
          <label className="text-xs text-neutral-500">Min. hazırlık (dk)<input name="minLeadMinutes" type="number" defaultValue={b.minLeadMinutes} className={input} /></label>
          <label className="text-xs text-neutral-500">En fazla kaç gün ilerisi<input name="maxAdvanceDays" type="number" defaultValue={b.maxAdvanceDays} className={input} /></label>
          <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" name="smsEnabled" defaultChecked={b.smsEnabled} /> SMS bildirimleri açık</label>
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="mb-3 font-medium">Çalışma saatleri</h2>
          <div className="space-y-2">
            {ORDER.map((wd) => {
              const h = hours.find((x) => x.weekday === wd);
              return (
                <div key={wd} className="grid grid-cols-[5.5rem_1fr_1fr_auto] items-center gap-2 text-sm">
                  <span>{DAY_NAMES[wd]}</span>
                  <input name={`open_${wd}`} type="time" defaultValue={fmtMinutes(h?.openMin ?? 540)} className={input} />
                  <input name={`close_${wd}`} type="time" defaultValue={fmtMinutes(h?.closeMin ?? 1080)} className={input} />
                  <label className="flex items-center gap-1"><input type="checkbox" name={`closed_${wd}`} defaultChecked={h?.isClosed ?? false} /> Kapalı</label>
                </div>
              );
            })}
          </div>
        </section>
        <button className="w-full rounded-xl bg-teal-700 px-4 py-3 font-medium text-white">Kaydet</button>
      </form>
    </main>
  );
}
