import type { Metadata } from "next";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { DAY_NAMES, fmtMinutes } from "@/lib/time";
import { Icon } from "@/components/icons";
import { saveSettings } from "../actions";
import { AdminShell } from "../nav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ayarlar" };

const ORDER = [1, 2, 3, 4, 5, 6, 0];

function Section({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
      <div className="card p-4 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, hint, name, children }: { label: string; hint?: string; name: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export default async function Settings() {
  await requireAdmin();
  const b = await db.business.findFirst();
  const hours = await db.workingHour.findMany();
  if (!b) {
    return (
      <AdminShell active="ayarlar" title="Ayarlar">
        <div className="card-flat border-dashed p-10 text-center text-muted">İşletme kaydı yok. Önce seed çalıştırın.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell active="ayarlar" title="Ayarlar" subtitle="İşletme bilgileri, rezervasyon kuralları ve çalışma saatleri">
      <form action={saveSettings} className="space-y-10">
        <Section title="İşletme bilgileri" text="Müşterilerin rezervasyon sayfasında ve SMS'lerde gördüğü bilgiler.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="İşletme adı" name="name"><input id="name" name="name" defaultValue={b.name} className="field" /></Field>
            </div>
            <Field label="Telefon" name="phone"><input id="phone" name="phone" defaultValue={b.phone} className="field num" inputMode="tel" /></Field>
            <Field label="Adres" name="address"><input id="address" name="address" defaultValue={b.address} className="field" /></Field>
          </div>
        </Section>

        <Section title="Rezervasyon kuralları" text="Müşterilerin hangi saatlerde ve ne kadar önceden randevu alabileceğini belirleyin.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Slot aralığı (dk)" name="slotIntervalMin" hint="Saat seçeneklerinin sıklığı"><input id="slotIntervalMin" name="slotIntervalMin" type="number" defaultValue={b.slotIntervalMin} className="field num" /></Field>
            <Field label="Min. hazırlık (dk)" name="minLeadMinutes" hint="En geç ne kadar önce alınır"><input id="minLeadMinutes" name="minLeadMinutes" type="number" defaultValue={b.minLeadMinutes} className="field num" /></Field>
            <Field label="En fazla kaç gün ilerisi" name="maxAdvanceDays" hint="Takvimin uzunluğu"><input id="maxAdvanceDays" name="maxAdvanceDays" type="number" defaultValue={b.maxAdvanceDays} className="field num" /></Field>
          </div>
        </Section>

        <Section title="Bildirimler" text="Randevudan önceki gün müşteriye otomatik SMS gönderilir.">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink"><Icon name="bell" size={18} /></span>
              <span>
                <span className="block font-medium">SMS hatırlatmaları</span>
                <span className="block text-sm text-muted">Yarınki onaylı randevular için hatırlatma gönder.</span>
              </span>
            </span>
            <span className="switch"><input type="checkbox" name="smsEnabled" defaultChecked={b.smsEnabled} /><span /></span>
          </label>
        </Section>

        <Section title="Çalışma saatleri" text="Kapalı günler müşteri takviminde seçilemez.">
          <ul className="divide-y divide-line">
            {ORDER.map((wd) => {
              const h = hours.find((x) => x.weekday === wd);
              return (
                <li key={wd} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[130px_1fr_auto]">
                  <span className="font-medium">{DAY_NAMES[wd]}</span>
                  <label className="flex items-center gap-2.5 justify-self-end text-sm text-muted sm:order-last">
                    Kapalı
                    <span className="switch"><input type="checkbox" name={`closed_${wd}`} defaultChecked={h?.isClosed ?? false} aria-label={`${DAY_NAMES[wd]} kapalı`} /><span /></span>
                  </label>
                  <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                    <input name={`open_${wd}`} type="time" defaultValue={fmtMinutes(h?.openMin ?? 540)} className="field field-sm num max-w-32" aria-label={`${DAY_NAMES[wd]} açılış`} />
                    <span className="text-faint">–</span>
                    <input name={`close_${wd}`} type="time" defaultValue={fmtMinutes(h?.closeMin ?? 1080)} className="field field-sm num max-w-32" aria-label={`${DAY_NAMES[wd]} kapanış`} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-10 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:mx-0 lg:rounded-2xl lg:border lg:px-5 lg:shadow-md">
          <p className="mr-auto hidden text-sm text-muted sm:block">Değişiklikler kaydedildiğinde hemen uygulanır.</p>
          <button className="btn btn-primary"><Icon name="check" size={16} /> Değişiklikleri kaydet</button>
        </div>
      </form>
    </AdminShell>
  );
}
