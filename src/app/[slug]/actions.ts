"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSlots, type Slot } from "@/lib/slots";
import { normalizePhone } from "@/lib/phone";
import { sendSms } from "@/lib/sms";
import { addMinutes, fmtDayLong, fmtTime, dayKey } from "@/lib/time";

export async function fetchSlots(serviceId: string, day: string): Promise<Slot[]> {
  const parsed = z.object({ serviceId: z.string().min(1), day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).safeParse({ serviceId, day });
  if (!parsed.success) return [];
  const service = await db.service.findFirst({ where: { id: parsed.data.serviceId, isActive: true } });
  if (!service) return [];
  return getSlots(parsed.data.day, service.durationMin);
}

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  startAt: z.iso.datetime(),
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı").max(80),
  phone: z.string().trim(),
  note: z.string().trim().max(300).optional().default(""),
});

export type BookingResult =
  | { ok: true; when: string; serviceName: string; businessPhone: string; businessName: string }
  | { ok: false; error: string };

export async function createAppointment(input: z.input<typeof bookingSchema>): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi" };
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { ok: false, error: "Geçerli bir cep telefonu girin (05xx xxx xx xx)" };

  const business = await db.business.findFirst();
  const service = await db.service.findFirst({ where: { id: parsed.data.serviceId, isActive: true } });
  if (!business || !service) return { ok: false, error: "Hizmet bulunamadı" };

  const startAt = new Date(parsed.data.startAt);
  // Sunucu tarafında slotu yeniden doğrula (çifte rezervasyon / manipülasyon)
  const slots = await getSlots(dayKey(startAt), service.durationMin);
  if (!slots.some((s) => new Date(s.startAt).getTime() === startAt.getTime())) {
    return { ok: false, error: "Bu saat artık müsait değil, lütfen başka bir saat seçin." };
  }

  const endAt = addMinutes(startAt, service.durationMin);
  const appt = await db.appointment.create({
    data: { serviceId: service.id, startAt, endAt, customerName: parsed.data.name, customerPhone: phone, note: parsed.data.note, status: "PENDING" },
  });

  const when = `${fmtDayLong(dayKey(startAt))} ${fmtTime(startAt)}`;
  if (business.smsEnabled) {
    void sendSms(phone, `${business.name}: ${service.name} randevunuz ${when} için alındı.`)
      .then((r) => (r.ok ? db.appointment.update({ where: { id: appt.id }, data: { smsSentAt: new Date() } }) : undefined))
      .catch((e) => console.error("[sms] işaretleme hatası", e));
  }
  return { ok: true, when, serviceName: service.name, businessPhone: business.phone, businessName: business.name };
}
