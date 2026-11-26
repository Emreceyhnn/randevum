"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createAppointment, fetchSlots, type BookingResult } from "./actions";
import { formatDuration, formatTry } from "@/lib/format";
import { fmtDayLong, weekdayOf } from "@/lib/time";
import { Icon } from "@/components/icons";

type Svc = { id: string; name: string; durationMin: number; priceTry: number };
type Day = { key: string; disabled: boolean };
type Slot = { time: string; startAt: string };
type Biz = { name: string; address: string; phone: string; smsEnabled: boolean };

const WD = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function dayParts(key: string) {
  return { wd: WD[weekdayOf(key)], d: String(Number(key.slice(8, 10))), m: MONTHS[Number(key.slice(5, 7)) - 1] };
}

function groupSlots(slots: Slot[]): { label: string; items: Slot[] }[] {
  const groups = [
    { label: "Sabah", items: [] as Slot[] },
    { label: "Öğleden sonra", items: [] as Slot[] },
    { label: "Akşam", items: [] as Slot[] },
  ];
  for (const s of slots) {
    const h = Number(s.time.slice(0, 2));
    groups[h < 12 ? 0 : h < 17 ? 1 : 2]!.items.push(s);
  }
  return groups.filter((g) => g.items.length > 0);
}

function icsFor(biz: Biz, svc: Svc, slot: Slot): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = new Date(slot.startAt);
  const end = new Date(start.getTime() + svc.durationMin * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Randevum//TR",
    "BEGIN:VEVENT",
    `UID:${fmt(start)}-${svc.id}@randevum`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${svc.name} — ${biz.name}`,
    `LOCATION:${biz.address.replace(/[,;]/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

function Step({ n, title, done, children, hint }: { n: number; title: string; done: boolean; hint?: string; children: ReactNode }) {
  return (
    <section className="rise card p-4 sm:p-6" aria-labelledby={`step-${n}`}>
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid size-7 place-items-center rounded-full text-[13px] font-semibold ${done ? "bg-brand text-brand-fg" : "bg-sunken text-muted"}`}
        >
          {done ? <Icon name="check" size={15} /> : n}
        </span>
        <div>
          <h2 id={`step-${n}`} className="text-base font-semibold leading-tight">{title}</h2>
          {hint && <p className="text-[13px] text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function BookingFlow({ services, days, business }: { services: Svc[]; days: Day[]; business: Biz }) {
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
        if (day) {
          setSlots(await fetchSlots(service.id, day));
          setSlot(null);
        }
      }
    });
  }

  /* ───────── Başarı ───────── */
  if (result && service && slot) {
    const p = day ? dayParts(day) : null;
    return (
      <div className="rise mx-auto max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
            <Icon name="checkCircle" size={30} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Randevunuz onaylandı</h2>
          <p className="mt-1 text-muted">Detayları aşağıda bulabilirsiniz.</p>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            {p && (
              <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-brand-soft py-2 text-brand-ink">
                <span className="text-[11px] font-semibold uppercase tracking-wider">{p.m}</span>
                <span className="num text-2xl font-semibold leading-none">{p.d}</span>
                <span className="text-[11px] font-medium">{p.wd}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold">{result.serviceName}</p>
              <p className="num text-lg font-semibold text-brand">{result.when}</p>
              <p className="text-sm text-muted">{formatDuration(service.durationMin)} · {formatTry(service.priceTry)}</p>
            </div>
          </div>
          <div aria-hidden="true" className="relative border-t border-dashed border-line-strong">
            <span className="absolute -left-2 -top-2 size-4 rounded-full bg-bg ring-1 ring-line" />
            <span className="absolute -right-2 -top-2 size-4 rounded-full bg-bg ring-1 ring-line" />
          </div>
          <dl className="space-y-3 p-5 text-sm">
            <div className="flex items-start gap-3">
              <Icon name="pin" size={16} className="mt-0.5 text-faint" />
              <div>
                <dt className="font-medium">{result.businessName}</dt>
                {business.address && <dd className="text-muted">{business.address}</dd>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="user" size={16} className="mt-0.5 text-faint" />
              <dd className="text-muted">{name} · <span className="num">{phone}</span></dd>
            </div>
            {business.smsEnabled && (
              <div className="flex items-start gap-3">
                <Icon name="bell" size={16} className="mt-0.5 text-faint" />
                <dd className="text-muted">Randevudan önceki gün SMS ile hatırlatma göndereceğiz.</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <a href={icsFor(business, service, slot)} download="randevu.ics" className="btn btn-secondary btn-lg">
            <Icon name="download" size={18} /> Takvime ekle
          </a>
          <a href={`tel:+90${result.businessPhone.replace(/\D/g, "").replace(/^0/, "")}`} className="btn btn-primary btn-lg">
            <Icon name="phone" size={18} /> İşletmeyi ara
          </a>
        </div>
      </div>
    );
  }

  /* ───────── Akış ───────── */
  const canSubmit = !!service && !!slot && name.trim().length >= 2 && phone.trim().length >= 10 && !pending;
  const dp = day ? dayParts(day) : null;

  const summary = (
    <div className="space-y-3">
      <ul className="space-y-2.5 text-sm">
        <li className="flex items-start gap-3">
          <Icon name="scissors" size={16} className="mt-0.5 shrink-0 text-faint" />
          {service ? (
            <span className="min-w-0"><span className="block font-medium">{service.name}</span><span className="text-muted">{formatDuration(service.durationMin)}</span></span>
          ) : <span className="text-faint">Hizmet seçilmedi</span>}
        </li>
        <li className="flex items-start gap-3">
          <Icon name="calendar" size={16} className="mt-0.5 shrink-0 text-faint" />
          {day && slot ? (
            <span className="min-w-0"><span className="block font-medium">{fmtDayLong(day)}</span><span className="num text-muted">Saat {slot.time}</span></span>
          ) : <span className="text-faint">Tarih ve saat seçilmedi</span>}
        </li>
      </ul>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-sm text-muted">Toplam</span>
        <span className="num text-xl font-semibold">{service ? formatTry(service.priceTry) : "—"}</span>
      </div>
    </div>
  );

  const submitBtn = (cls: string) => (
    <button type="submit" form="booking-form" className={`btn btn-primary ${cls}`} disabled={!canSubmit}>
      {pending && slot ? "Gönderiliyor…" : slot ? "Randevuyu onayla" : service ? "Saat seçin" : "Hizmet seçin"}
      {!pending && <Icon name="arrowRight" size={18} />}
    </button>
  );

  return (
    <div className="grid items-start gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_340px] lg:pb-0">
      <div className="min-w-0 space-y-4">
        <Step n={1} title="Hizmet seçin" done={!!service} hint="Süre ve fiyat bilgisi şeffaftır, sürpriz yok.">
          <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Hizmet">
            {services.map((s) => {
              const on = service?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setService(s);
                    setDay(null);
                    setSlots(null);
                    setSlot(null);
                  }}
                  className={`group relative flex min-h-[76px] items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
                    on ? "border-brand bg-brand-soft shadow-sm" : "border-line bg-surface hover:border-line-strong hover:bg-raised"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{s.name}</span>
                    <span className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-muted">
                      <Icon name="clock" size={14} /> {formatDuration(s.durationMin)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="num font-semibold">{formatTry(s.priceTry)}</span>
                    <span
                      aria-hidden="true"
                      className={`grid size-5 place-items-center rounded-full border transition ${on ? "border-brand bg-brand text-brand-fg" : "border-line-strong text-transparent"}`}
                    >
                      <Icon name="check" size={12} />
                    </span>
                  </span>
                </button>
              );
            })}
            {services.length === 0 && <p className="text-sm text-muted">Şu an aktif hizmet yok.</p>}
          </div>
        </Step>

        {service && (
          <Step n={2} title="Gün ve saat seçin" done={!!slot} hint="Yalnızca müsait saatler gösterilir.">
            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6" role="radiogroup" aria-label="Gün">
              <div className="flex gap-2">
                {days.map((d) => {
                  const p = dayParts(d.key);
                  const on = day === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={d.disabled}
                      onClick={() => pickDay(service, d.key)}
                      className={`flex w-[58px] shrink-0 flex-col items-center rounded-xl border py-2.5 transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        on ? "border-brand bg-brand text-brand-fg shadow-sm" : "border-line bg-surface hover:border-line-strong"
                      }`}
                    >
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${on ? "opacity-90" : "text-faint"}`}>{p.wd}</span>
                      <span className={`num text-xl font-semibold leading-tight ${d.disabled ? "line-through" : ""}`}>{p.d}</span>
                      <span className={`text-[11px] ${on ? "opacity-90" : "text-muted"}`}>{p.m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {day && (
              <div className="mt-4" aria-live="polite">
                {slots === null && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Saatler yükleniyor">
                    {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-11" />)}
                  </div>
                )}
                {slots?.length === 0 && (
                  <div className="rounded-xl border border-dashed border-line-strong p-6 text-center">
                    <Icon name="calendar" size={22} className="mx-auto text-faint" />
                    <p className="mt-2 font-medium">Bu gün için müsait saat kalmadı</p>
                    <p className="text-sm text-muted">Başka bir gün seçerek devam edebilirsiniz.</p>
                  </div>
                )}
                {slots && groupSlots(slots).map((g) => (
                  <div key={g.label} className="mb-4 last:mb-0">
                    <p className="eyebrow mb-2">{g.label}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={g.label}>
                      {g.items.map((s) => {
                        const on = slot?.startAt === s.startAt;
                        return (
                          <button
                            key={s.startAt}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setSlot(s)}
                            className={`num min-h-11 rounded-xl border text-[15px] font-medium transition ${
                              on ? "border-brand bg-brand text-brand-fg shadow-sm" : "border-line bg-surface hover:border-brand hover:text-brand"
                            }`}
                          >
                            {s.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Step>
        )}

        {slot && (
          <Step n={3} title="Bilgileriniz" done={false} hint="Hesap oluşturmanız gerekmez.">
            <form
              id="booking-form"
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) submit();
              }}
            >
              <div>
                <label htmlFor="b-name" className="label">Ad soyad</label>
                <input id="b-name" className="field" autoComplete="name" placeholder="Örn. Ayşe Yılmaz" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="b-phone" className="label">Cep telefonu</label>
                <input id="b-phone" className="field num" inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="b-note" className="label">Not <span className="font-normal text-faint">(isteğe bağlı)</span></label>
                <textarea id="b-note" className="field" rows={2} placeholder="İşletmeye iletmek istediğiniz bir şey var mı?" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              {error && (
                <p role="alert" className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger">
                  <Icon name="x" size={16} className="mt-0.5 shrink-0" /> {error}
                </p>
              )}
              <p className="sm:col-span-2 flex items-center gap-2 text-xs text-faint">
                <Icon name="shield" size={14} /> Telefon numaranız yalnızca randevu bildirimi için kullanılır.
              </p>
            </form>
          </Step>
        )}
      </div>

      {/* Masaüstü özet */}
      <aside className="card sticky top-6 hidden p-5 lg:block" aria-label="Randevu özeti">
        <p className="eyebrow mb-3">Randevu özeti</p>
        {summary}
        <div className="mt-4">{submitBtn("btn-lg")}</div>
        {dp && <p className="mt-3 text-center text-xs text-faint">Ücretsiz iptal için işletmeyi arayabilirsiniz.</p>}
      </aside>

      {/* Mobil yapışkan çubuk */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{service ? service.name : "Hizmet seçin"}</p>
            <p className="num truncate text-xs text-muted">
              {slot && dp ? `${dp.d} ${dp.m} ${dp.wd} · ${slot.time}` : service ? "Tarih ve saat seçin" : "Başlamak için bir hizmet seçin"}
              {service ? ` · ${formatTry(service.priceTry)}` : ""}
            </p>
          </div>
          {submitBtn("shrink-0 px-5")}
        </div>
      </div>
    </div>
  );
}
