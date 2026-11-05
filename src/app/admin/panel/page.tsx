import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addDays, dayKey, fmtDayLong, fmtTime, istanbulToDate } from "@/lib/time";
import { displayPhone } from "@/lib/phone";
import { STATUS_LABEL } from "@/lib/format";
import { setStatus } from "../actions";
import { AdminNav } from "../nav";

export const dynamic = "force-dynamic";

const ACTIONS: { status: string; label: string }[] = [
  { status: "CONFIRMED", label: "Onayla" },
  { status: "CANCELLED", label: "İptal" },
  { status: "DONE", label: "Tamamlandı" },
];

export default async function Panel() {
  await requireAdmin();
  const today = dayKey(new Date());
  const tomorrow = addDays(today, 1);
  const appts = await db.appointment.findMany({
    where: { startAt: { gte: istanbulToDate(today, 0), lt: istanbulToDate(addDays(today, 2), 0) } },
    include: { service: true },
    orderBy: { startAt: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <AdminNav />
      {[today, tomorrow].map((day) => {
        const list = appts.filter((a) => dayKey(a.startAt) === day);
        return (
          <section key={day} className="mb-8">
            <h2 className="mb-3 font-semibold">{day === today ? "Bugün" : "Yarın"} <span className="font-normal text-neutral-500">· {fmtDayLong(day)}</span></h2>
            {list.length === 0 && <p className="text-sm text-neutral-500">Randevu yok.</p>}
            <div className="space-y-2">
              {list.map((a) => (
                <div key={a.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{fmtTime(a.startAt)} – {fmtTime(a.endAt)} · {a.service.name}</p>
                      <p className="text-sm">{a.customerName} · <a className="text-teal-700" href={`tel:+90${a.customerPhone}`}>{displayPhone(a.customerPhone)}</a></p>
                      {a.note && <p className="text-sm text-neutral-500">Not: {a.note}</p>}
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{STATUS_LABEL[a.status] ?? a.status}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {ACTIONS.filter((x) => x.status !== a.status).map((x) => (
                      <form key={x.status} action={setStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value={x.status} />
                        <button className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">{x.label}</button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
