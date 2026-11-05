import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteService, saveService } from "../actions";
import { AdminNav } from "../nav";

export const dynamic = "force-dynamic";

const input = "w-full rounded-lg border border-neutral-300 p-2 text-sm";

export default async function Services() {
  await requireAdmin();
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <AdminNav />
      <h1 className="mb-4 text-xl font-semibold">Hizmetler</h1>
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <form action={saveService} className="grid grid-cols-2 gap-2">
              <input type="hidden" name="id" value={s.id} />
              <input name="name" defaultValue={s.name} className={`${input} col-span-2`} aria-label="Ad" />
              <label className="text-xs text-neutral-500">Süre (dk)<input name="durationMin" type="number" defaultValue={s.durationMin} className={input} /></label>
              <label className="text-xs text-neutral-500">Fiyat (₺)<input name="priceTry" type="number" defaultValue={s.priceTry} className={input} /></label>
              <label className="text-xs text-neutral-500">Sıra<input name="sortOrder" type="number" defaultValue={s.sortOrder} className={input} /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={s.isActive} /> Aktif</label>
              <button className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white">Kaydet</button>
            </form>
            <form action={deleteService} className="mt-2">
              <input type="hidden" name="id" value={s.id} />
              <button className="text-sm text-red-600">Sil</button>
            </form>
          </div>
        ))}
      </div>
      <h2 className="mb-2 mt-8 font-semibold">Yeni hizmet</h2>
      <form action={saveService} className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200 bg-white p-4">
        <input name="name" required placeholder="Ad" className={`${input} col-span-2`} />
        <input name="durationMin" type="number" required placeholder="Süre (dk)" className={input} />
        <input name="priceTry" type="number" required placeholder="Fiyat (₺)" className={input} />
        <input name="sortOrder" type="number" defaultValue={services.length} className={input} />
        <button className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white">Ekle</button>
      </form>
    </main>
  );
}
