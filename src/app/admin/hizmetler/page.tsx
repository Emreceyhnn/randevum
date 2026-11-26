import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDuration, formatTry } from "@/lib/format";
import { Icon } from "@/components/icons";
import { deleteService, saveService } from "../actions";
import { AdminShell } from "../nav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hizmetler" };

export default async function Services() {
  await requireAdmin();
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  const active = services.filter((s) => s.isActive).length;

  return (
    <AdminShell
      active="hizmetler"
      title="Hizmetler"
      subtitle={`${services.length} hizmet · ${active} tanesi müşterilere açık`}
      actions={
        <a href="#yeni" className="btn btn-primary">
          <Icon name="plus" size={16} /> Yeni hizmet
        </a>
      }
    >
      <div className="space-y-3">
        {services.length === 0 && (
          <div className="card-flat flex flex-col items-center gap-1 border-dashed py-14 text-center">
            <Icon name="scissors" size={28} className="text-faint" />
            <p className="mt-1 font-medium">Henüz hizmet eklemediniz</p>
            <p className="text-sm text-muted">Müşteriler hizmet olmadan randevu alamaz. Aşağıdan ilkini ekleyin.</p>
          </div>
        )}

        {services.map((s) => (
          <article key={s.id} className={`card p-4 sm:p-5 ${s.isActive ? "" : "opacity-75"}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.name}</p>
                <p className="num text-[13px] text-muted">{formatDuration(s.durationMin)} · {formatTry(s.priceTry)}</p>
              </div>
              <span className={`badge ${s.isActive ? "badge-CONFIRMED" : "badge-DONE"}`}>{s.isActive ? "Yayında" : "Gizli"}</span>
            </div>

            <form action={saveService} className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_120px_140px_90px_auto_auto] lg:items-end">
              <input type="hidden" name="id" value={s.id} />
              <div className="col-span-2 lg:col-span-1">
                <label className="label" htmlFor={`n-${s.id}`}>Hizmet adı</label>
                <input id={`n-${s.id}`} name="name" defaultValue={s.name} className="field field-sm" />
              </div>
              <div>
                <label className="label" htmlFor={`d-${s.id}`}>Süre (dk)</label>
                <input id={`d-${s.id}`} name="durationMin" type="number" defaultValue={s.durationMin} className="field field-sm num" />
              </div>
              <div>
                <label className="label" htmlFor={`p-${s.id}`}>Fiyat (₺)</label>
                <input id={`p-${s.id}`} name="priceTry" type="number" defaultValue={s.priceTry} className="field field-sm num" />
              </div>
              <div>
                <label className="label" htmlFor={`o-${s.id}`}>Sıra</label>
                <input id={`o-${s.id}`} name="sortOrder" type="number" defaultValue={s.sortOrder} className="field field-sm num" />
              </div>
              <label className="flex min-h-[38px] items-center gap-2.5 text-sm font-medium">
                <span className="switch"><input type="checkbox" name="isActive" defaultChecked={s.isActive} /><span /></span>
                Aktif
              </label>
              <button className="btn btn-secondary col-span-2 lg:col-span-1">Kaydet</button>
            </form>

            <form action={deleteService} className="mt-3 border-t border-line pt-3">
              <input type="hidden" name="id" value={s.id} />
              <button className="btn btn-danger btn-sm">
                <Icon name="trash" size={14} /> Sil
              </button>
              <span className="ml-3 text-xs text-faint">Randevusu olan hizmet silinmez, gizlenir.</span>
            </form>
          </article>
        ))}
      </div>

      <section id="yeni" className="mt-10 scroll-mt-6">
        <h2 className="mb-3 text-base font-semibold">Yeni hizmet ekle</h2>
        <form action={saveService} className="card grid grid-cols-2 gap-3 p-4 sm:p-5 lg:grid-cols-[1fr_120px_140px_90px_auto] lg:items-end">
          <div className="col-span-2 lg:col-span-1">
            <label className="label" htmlFor="new-name">Hizmet adı</label>
            <input id="new-name" name="name" required placeholder="Örn. Saç Kesimi" className="field field-sm" />
          </div>
          <div>
            <label className="label" htmlFor="new-dur">Süre (dk)</label>
            <input id="new-dur" name="durationMin" type="number" required placeholder="30" className="field field-sm num" />
          </div>
          <div>
            <label className="label" htmlFor="new-price">Fiyat (₺)</label>
            <input id="new-price" name="priceTry" type="number" required placeholder="400" className="field field-sm num" />
          </div>
          <div>
            <label className="label" htmlFor="new-order">Sıra</label>
            <input id="new-order" name="sortOrder" type="number" defaultValue={services.length} className="field field-sm num" />
          </div>
          <button className="btn btn-primary col-span-2 lg:col-span-1"><Icon name="plus" size={16} /> Ekle</button>
        </form>
      </section>
    </AdminShell>
  );
}
