"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { formatDuration, formatTry, STATUS_LABEL } from "@/lib/format";

export type DayInfo = { offset: number; wd: string; d: string; m: string; long: string; closed: boolean };
type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";
type Svc = { id: string; name: string; dur: number; price: number };
type Appt = { id: string; offset: number; time: string; svcId: string; name: string; phone: string; status: Status; mine?: boolean };

const SERVICES: Svc[] = [
  { id: "cut", name: "Saç Kesimi", dur: 30, price: 400 },
  { id: "color", name: "Boya + Fön", dur: 90, price: 1500 },
  { id: "mani", name: "Manikür", dur: 45, price: 600 },
];
const SVC = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<string, Svc>;

const OPEN = 9 * 60;
const CLOSE = 19 * 60;
const STEP = 30;
const LEAD = 120;

const SEED: Appt[] = [
  { id: "s1", offset: 0, time: "15:00", svcId: "cut", name: "Ayşe Yılmaz", phone: "0532 111 22 33", status: "CONFIRMED" },
  { id: "s2", offset: 0, time: "16:00", svcId: "mani", name: "Mehmet Kaya", phone: "0533 444 55 66", status: "PENDING" },
  { id: "s3", offset: 1, time: "10:00", svcId: "color", name: "Zeynep Demir", phone: "0535 777 88 99", status: "CONFIRMED" },
  { id: "s4", offset: 1, time: "14:00", svcId: "cut", name: "Can Öztürk", phone: "0542 123 45 67", status: "PENDING" },
];

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function freeSlots(appts: Appt[], offset: number, dur: number, nowMin: number): string[] {
  const busy = appts
    .filter((a) => a.offset === offset && a.status !== "CANCELLED")
    .map((a) => [toMin(a.time), toMin(a.time) + SVC[a.svcId]!.dur] as const);
  const out: string[] = [];
  for (let s = OPEN; s + dur <= CLOSE; s += STEP) {
    if (offset === 0 && s < nowMin + LEAD) continue;
    if (busy.some(([b0, b1]) => s < b1 && s + dur > b0)) continue;
    out.push(fmt(s));
  }
  return out;
}

function Stat({ icon, label, value, sub, warn }: { icon: IconName; label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="card-flat flex flex-col items-start gap-2.5 p-3.5">
      <span
        className="grid size-8 place-items-center rounded-lg"
        style={warn ? { background: "var(--pending-bg)", color: "var(--pending-fg)" } : { background: "var(--brand-soft)", color: "var(--brand-ink)" }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div>
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="num text-2xl font-semibold leading-tight tracking-tight">{value}</p>
        <p className="text-[11.5px] text-faint">{sub}</p>
      </div>
    </div>
  );
}

export function DemoApp({ days, nowMin }: { days: DayInfo[]; nowMin: number }) {
  const [appts, setAppts] = useState<Appt[]>(SEED);
  const [tab, setTab] = useState<"customer" | "admin">("customer");
  const [seenAdmin, setSeenAdmin] = useState(false);
  const [toast, setToast] = useState<{ phone: string; text: string } | null>(null);
  const seq = useRef(0);

  // müşteri formu
  const [svc, setSvc] = useState<Svc | null>(null);
  const [offset, setOffset] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("Demo Müşteri");
  const [phone, setPhone] = useState("0532 000 11 22");
  const [done, setDone] = useState<Appt | null>(null);

  // Geniş ekranda iki görünüm yan yana olduğundan panel zaten görünürdür.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const mine = appts.filter((a) => a.mine);
  const booked = mine.length > 0;
  const confirmed = mine.some((a) => a.status === "CONFIRMED");
  const pendingCount = appts.filter((a) => a.status === "PENDING").length;

  function book() {
    if (!svc || offset === null || !slot) return;
    const a: Appt = { id: `n${++seq.current}`, offset, time: slot, svcId: svc.id, name: name.trim() || "Demo Müşteri", phone, status: "PENDING", mine: true };
    setAppts((p) => [...p, a]);
    setDone(a);
  }

  function setStatus(id: string, status: Status) {
    const a = appts.find((x) => x.id === id);
    setAppts((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    if (a && status === "CONFIRMED") {
      const when = days[a.offset]!;
      setToast({
        phone: a.phone,
        text: `Merhaba ${a.name.split(" ")[0]}, ${when.d} ${when.m} saat ${a.time} ${SVC[a.svcId]!.name} randevunuz onaylandı. Görüşmek üzere!`,
      });
    }
  }

  function reset() {
    setAppts(SEED);
    setSvc(null);
    setOffset(null);
    setSlot(null);
    setDone(null);
    setSeenAdmin(false);
    setToast(null);
  }

  // KPI
  const todayLive = appts.filter((a) => a.offset === 0 && a.status !== "CANCELLED");
  const revenue = todayLive.reduce((s, a) => s + SVC[a.svcId]!.price, 0);
  const bookedMin = todayLive.reduce((s, a) => s + SVC[a.svcId]!.dur, 0);
  const occupancy = Math.min(100, Math.round((bookedMin / (CLOSE - OPEN)) * 100));

  const slots = svc && offset !== null ? freeSlots(appts, offset, svc.dur, nowMin) : null;

  const guide: { t: string; d: string; ok: boolean }[] = [
    { t: "Müşteri olarak randevu alın", d: "Hizmet, gün ve saat seçip onaylayın.", ok: booked },
    { t: "Yönetim paneline bakın", d: "Randevunuz “Bekliyor” olarak düştü.", ok: booked && (wide || seenAdmin || tab === "admin" || confirmed) },
    { t: "Randevuyu onaylayın", d: "Müşteriye giden SMS'i görün.", ok: confirmed },
  ];
  const activeStep = guide.findIndex((g) => !g.ok);

  const groups = Array.from(new Set(appts.map((a) => a.offset))).sort((a, b) => a - b);

  return (
    <div className="mt-10">
      {/* Rehber */}
      <ol className="card mb-6 grid gap-1 p-2 sm:grid-cols-3" aria-label="Demo adımları">
        {guide.map((g, i) => {
          const current = i === activeStep;
          return (
            <li key={g.t} className={`flex items-start gap-3 rounded-xl p-3.5 transition ${current ? "bg-brand-soft" : ""}`}>
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${g.ok ? "bg-brand text-brand-fg" : current ? "border border-brand text-brand" : "bg-sunken text-faint"}`}>
                {g.ok ? <Icon name="check" size={13} /> : i + 1}
              </span>
              <div>
                <p className={`text-sm font-semibold ${g.ok ? "text-muted line-through decoration-line-strong" : ""}`}>{g.t}</p>
                <p className="text-[13px] text-muted">{g.d}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobil sekmeler */}
      <div role="tablist" aria-label="Görünüm" className="mx-auto mb-5 grid max-w-sm grid-cols-2 rounded-xl bg-sunken p-1 lg:hidden">
        {([["customer", "Müşteri", null], ["admin", "Yönetim paneli", pendingCount]] as const).map(([k, l, n]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k);
              if (k === "admin") setSeenAdmin(true);
            }}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition ${tab === k ? "bg-surface shadow-sm" : "text-muted"}`}
          >
            {l}
            {n ? <span className="num rounded-full px-1.5 text-[11px] font-semibold" style={{ background: "var(--pending-bg)", color: "var(--pending-fg)" }}>{n}</span> : null}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* ───────── Müşteri ───────── */}
        <section className={`${tab === "customer" ? "block" : "hidden"} lg:block`} aria-label="Müşteri görünümü">
          <p className="eyebrow mb-3 hidden lg:block">Müşteri görünümü</p>
          <div className="card mx-auto w-full max-w-[420px] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3.5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand text-sm font-semibold text-brand-fg">DG</span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-tight">Demo Güzellik Salonu</p>
                <p className="flex items-center gap-1.5 text-xs text-muted"><Icon name="pin" size={12} /> Kadıköy, İstanbul</p>
              </div>
            </div>

            {done ? (
              <div className="rise p-5 text-center">
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-brand-soft text-brand"><Icon name="checkCircle" size={26} /></div>
                <h3 className="text-lg font-semibold">Randevunuz alındı</h3>
                <p className="mt-1 text-sm text-muted">{SVC[done.svcId]!.name} · {days[done.offset]!.long} · <span className="num">{done.time}</span></p>
                <p className="mx-auto mt-3 max-w-[280px] rounded-xl bg-sunken px-3 py-2 text-[13px] text-muted">
                  Şimdi sağdaki <b className="text-ink">yönetim paneline</b> bakın: randevunuz “Bekliyor” olarak düştü.
                </p>
                <div className="mt-4 grid gap-2">
                  <button className="btn btn-primary lg:hidden" onClick={() => { setTab("admin"); setSeenAdmin(true); }}>Yönetim paneline geç <Icon name="arrowRight" size={16} /></button>
                  <button className="btn btn-secondary" onClick={() => { setDone(null); setSvc(null); setOffset(null); setSlot(null); }}>Yeni randevu al</button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-4">
                <div>
                  <p className="mb-2 text-sm font-semibold">1. Hizmet</p>
                  <div className="space-y-2" role="radiogroup" aria-label="Hizmet">
                    {SERVICES.map((s) => {
                      const on = svc?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          role="radio"
                          aria-checked={on}
                          onClick={() => { setSvc(s); setSlot(null); }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${on ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-line-strong"}`}
                        >
                          <span>
                            <span className="block text-sm font-medium">{s.name}</span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted"><Icon name="clock" size={12} /> {formatDuration(s.dur)}</span>
                          </span>
                          <span className="num text-sm font-semibold">{formatTry(s.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {svc && (
                  <div className="rise">
                    <p className="mb-2 text-sm font-semibold">2. Gün ve saat</p>
                    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="radiogroup" aria-label="Gün">
                      {days.map((d) => {
                        const on = offset === d.offset;
                        return (
                          <button
                            key={d.offset}
                            role="radio"
                            aria-checked={on}
                            disabled={d.closed}
                            onClick={() => { setOffset(d.offset); setSlot(null); }}
                            className={`flex w-[54px] shrink-0 flex-col items-center rounded-xl border py-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-line-strong"}`}
                          >
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${on ? "" : "text-faint"}`}>{d.wd}</span>
                            <span className={`num text-lg font-semibold leading-tight ${d.closed ? "line-through" : ""}`}>{d.d}</span>
                            <span className={`text-[10px] ${on ? "" : "text-muted"}`}>{d.m}</span>
                          </button>
                        );
                      })}
                    </div>
                    {slots && (
                      slots.length === 0 ? (
                        <p className="mt-3 rounded-xl border border-dashed border-line-strong p-4 text-center text-sm text-muted">Bu gün için müsait saat yok. Başka bir gün seçin.</p>
                      ) : (
                        <div className="mt-3 grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Saat">
                          {slots.map((t) => {
                            const on = slot === t;
                            return (
                              <button
                                key={t}
                                role="radio"
                                aria-checked={on}
                                onClick={() => setSlot(t)}
                                className={`num min-h-10 rounded-lg border text-sm font-medium transition ${on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-brand hover:text-brand"}`}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                )}

                {slot && svc && (
                  <form className="rise space-y-3" onSubmit={(e) => { e.preventDefault(); book(); }}>
                    <p className="text-sm font-semibold">3. Bilgileriniz</p>
                    <div>
                      <label htmlFor="dm-name" className="label">Ad soyad</label>
                      <input id="dm-name" className="field field-sm" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="dm-phone" className="label">Cep telefonu</label>
                      <input id="dm-phone" className="field field-sm num" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg">
                      Randevuyu onayla · <span className="num">{formatTry(svc.price)}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ───────── Yönetim ───────── */}
        <section className={`${tab === "admin" ? "block" : "hidden"} min-w-0 lg:block`} aria-label="Yönetim paneli görünümü">
          <div className="mb-3 hidden items-center justify-between lg:flex">
            <p className="eyebrow">Yönetim paneli</p>
            <button onClick={reset} className="btn btn-ghost btn-sm">Demoyu sıfırla</button>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line bg-sunken px-3.5 py-2.5">
              <span className="flex gap-1.5" aria-hidden="true"><i className="size-2.5 rounded-full bg-[#ef6b5f]" /><i className="size-2.5 rounded-full bg-[#f5be4f]" /><i className="size-2.5 rounded-full bg-[#5fc455]" /></span>
              <span className="mx-auto flex items-center gap-1.5 rounded-md bg-surface px-3 py-1 text-[11px] text-faint"><Icon name="lock" size={11} /> randevu.isletmeniz.com/admin</span>
            </div>

            <div className="bg-bg p-4 sm:p-5">
              <h2 className="text-xl font-semibold tracking-tight">Randevular</h2>
              <p className="mb-4 text-sm text-muted">Bugün ve yaklaşan günler</p>

              <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                <Stat icon="calendar" label="Bugünkü randevu" value={String(todayLive.length)} sub="İptaller hariç" />
                <Stat icon="inbox" label="Onay bekleyen" value={String(pendingCount)} sub="Tüm günler" warn={pendingCount > 0} />
                <Stat icon="wallet" label="Tahmini ciro" value={formatTry(revenue)} sub="Bugün" />
                <Stat icon="gauge" label="Doluluk" value={`%${occupancy}`} sub={`${formatDuration(bookedMin)} / ${formatDuration(CLOSE - OPEN)}`} />
              </div>

              <div className="mt-5 space-y-5">
                {groups.map((g) => {
                  const list = appts.filter((a) => a.offset === g).sort((a, b) => a.time.localeCompare(b.time));
                  const day = days[g]!;
                  return (
                    <div key={g}>
                      <div className="mb-2 flex items-baseline gap-2">
                        <h3 className="text-sm font-semibold">{g === 0 ? "Bugün" : g === 1 ? "Yarın" : day.long}</h3>
                        {g < 2 && <span className="text-xs text-muted">{day.long}</span>}
                      </div>
                      <ul className="card-flat divide-y divide-line overflow-hidden">
                        {list.map((a) => {
                          const s = SVC[a.svcId]!;
                          const end = fmt(toMin(a.time) + s.dur);
                          return (
                            <li key={a.id} className={`relative flex flex-col gap-2.5 py-3 pl-4 pr-3 sm:flex-row sm:items-center ${a.status === "CANCELLED" ? "opacity-55" : ""} ${a.mine ? "bg-brand-soft/50" : ""}`}>
                              <span className="absolute inset-y-0 left-0 w-1" style={{ background: `var(--${a.status.toLowerCase()}-dot)` }} />
                              <div className="num w-[72px] shrink-0">
                                <p className="text-base font-semibold leading-tight">{a.time}</p>
                                <p className="text-[11px] text-faint">{end} · {formatDuration(s.dur)}</p>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                  {a.name}
                                  {a.mine && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-fg">Sizin randevunuz</span>}
                                </p>
                                <p className="text-[13px] text-muted">{s.name} · <span className="num">{formatTry(s.price)}</span> · <span className="num">{a.phone}</span></p>
                              </div>
                              <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                                <span className={`badge badge-${a.status}`}>{STATUS_LABEL[a.status]}</span>
                                <div className="flex gap-1.5">
                                  {a.status === "PENDING" && (
                                    <button onClick={() => setStatus(a.id, "CONFIRMED")} className={`btn btn-sm btn-primary ${a.mine && !confirmed ? "ring-2 ring-brand/40 ring-offset-2 ring-offset-bg" : ""}`}><Icon name="check" size={14} /> Onayla</button>
                                  )}
                                  {(a.status === "PENDING" || a.status === "CONFIRMED") && <button onClick={() => setStatus(a.id, "DONE")} className="btn btn-sm btn-secondary">Tamamlandı</button>}
                                  {a.status !== "CANCELLED" && a.status !== "DONE" && <button onClick={() => setStatus(a.id, "CANCELLED")} className="btn btn-sm btn-danger">İptal</button>}
                                  {(a.status === "CANCELLED" || a.status === "DONE") && <button onClick={() => setStatus(a.id, "PENDING")} className="btn btn-sm btn-ghost">Geri al</button>}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <button onClick={reset} className="btn btn-ghost btn-sm mt-3 lg:hidden">Demoyu sıfırla</button>
        </section>
      </div>

      {/* SMS simülasyonu */}
      {toast && (
        <div role="status" aria-live="polite" className="rise fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:w-[340px]">
          <div className="card p-4 shadow-md">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              <span className="grid size-6 place-items-center rounded-full bg-brand-soft text-brand-ink"><Icon name="message" size={12} /></span>
              <span className="font-semibold text-ink">SMS gönderildi</span>
              <span className="rounded-full bg-sunken px-2 py-0.5 text-[10px] font-medium">simülasyon</span>
              <button onClick={() => setToast(null)} className="ml-auto text-faint hover:text-ink" aria-label="Kapat"><Icon name="x" size={14} /></button>
            </div>
            <p className="num text-[11px] text-faint">Alıcı: {toast.phone}</p>
            <p className="mt-1 text-[13px] leading-snug">{toast.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
