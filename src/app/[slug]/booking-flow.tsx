"use client";

import { useState, useTransition } from "react";
import { createAppointment, fetchSlots, type BookingResult } from "./actions";
import { formatDuration, formatTry } from "@/lib/format";
import { fmtDayShort } from "@/lib/time";

type Svc = { id: string; name: string; durationMin: number; priceTry: number };
type Day = { key: string; disabled: boolean };
type Slot = { time: string; startAt: string };

const card = "rounded-xl border border-neutral-200 bg-white p-4 text-left";
const accentBtn = "w-full rounded-xl bg-teal-700 px-4 py-3 font-medium text-white disabled:opacity-50";

export function BookingFlow({ services, days }: { services: Svc[]; days: Day[] }) {
  const [service, setService] = useState<Svc | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<BookingResult, { ok: true }> | null>(null);
  const [pending, start] = useTransition();

  function pickDay(svc: Svc, d: string) {
    setDay(d);
    setSlot(null);
    setSlots(null);
    start(async () => setSlots(await fetchSlots(svc.id, d)));
  }

  function submit() {
    if (!service || !slot) return;
    setError(null);
    start(async () => {
      const r = await createAppointment({ serviceId: service.id, startAt: slot.startAt, name, phone, note });
      if (r.ok) setResult(r);
      else {
        setError(r.error);
        if (day) setSlots(await fetchSlots(service.id, day));
      }
    });
  }

  if (result) {
    return (
      <div className={`${card} space-y-3`}>
        <h2 className="text-lg font-semibold text-teal-700">Randevunuz alındı</h2>
        <p>{result.serviceName}</p>
        <p className="font-medium">{result.when}</p>
        <a href={`tel:+90${result.businessPhone.replace(/\D/g, "").replace(/^0/, "")}`} className={`${accentBtn} block text-center`}>
          İşletmeyi ara
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-medium">1. Hizmet seçin</h2>
        <div className="space-y-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setService(s);
                setDay(null);
                setSlots(null);
                setSlot(null);
              }}
              className={`${card} flex w-full items-center justify-between ${service?.id === s.id ? "border-teal-700 ring-1 ring-teal-700" : ""}`}
            >
              <span>
                <span className="block font-medium">{s.name}</span>
                <span className="text-sm text-neutral-500">{formatDuration(s.durationMin)}</span>
              </span>
              <span className="font-medium">{formatTry(s.priceTry)}</span>
            </button>
          ))}
          {services.length === 0 && <p className="text-sm text-neutral-500">Şu an aktif hizmet yok.</p>}
        </div>
      </section>

      {service && (
        <section>
          <h2 className="mb-3 font-medium">2. Gün ve saat seçin</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => (
              <button
                key={d.key}
                disabled={d.disabled}
                onClick={() => pickDay(service, d.key)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  day === d.key ? "border-teal-700 bg-teal-700 text-white" : "border-neutral-200 bg-white"
                }`}
              >
                {fmtDayShort(d.key)}
              </button>
            ))}
          </div>
          {day && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {slots === null && <p className="col-span-4 text-sm text-neutral-500">Yükleniyor...</p>}
              {slots?.length === 0 && <p className="col-span-4 text-sm text-neutral-500">Bu gün için müsait saat yok.</p>}
              {slots?.map((s) => (
                <button
                  key={s.startAt}
                  onClick={() => setSlot(s)}
                  className={`rounded-lg border py-2 text-sm ${slot?.startAt === s.startAt ? "border-teal-700 bg-teal-700 text-white" : "border-neutral-200 bg-white"}`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {slot && (
        <section className="space-y-3">
          <h2 className="font-medium">3. Bilgileriniz</h2>
          <input className="w-full rounded-lg border border-neutral-300 p-3" placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-lg border border-neutral-300 p-3" placeholder="Telefon (05xx xxx xx xx)" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea className="w-full rounded-lg border border-neutral-300 p-3" placeholder="Not (isteğe bağlı)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className={accentBtn} disabled={pending || !name || !phone} onClick={submit}>
            {pending ? "Gönderiliyor..." : "Randevuyu onayla"}
          </button>
        </section>
      )}
    </div>
  );
}
