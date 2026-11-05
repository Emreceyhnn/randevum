"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { parseHHMM } from "@/lib/time";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword(pw)) return "Şifre hatalı";
  await createSession();
  redirect("/admin/panel");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

const statusSchema = z.object({ id: z.string().min(1), status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "DONE"]) });

export async function setStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const p = statusSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  await db.appointment.update({ where: { id: p.data.id }, data: { status: p.data.status } });
  revalidatePath("/admin/panel");
}

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  durationMin: z.coerce.number().int().min(5).max(600),
  priceTry: z.coerce.number().int().min(0).max(1_000_000),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export async function saveService(formData: FormData): Promise<void> {
  await requireAdmin();
  const p = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "on";
  if (id) await db.service.update({ where: { id }, data: { ...p.data, isActive } });
  else await db.service.create({ data: { ...p.data, isActive: true } });
  revalidatePath("/admin/hizmetler");
}

export async function deleteService(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const used = await db.appointment.count({ where: { serviceId: id } });
  // Randevusu olan hizmet silinmez, pasife alınır
  if (used > 0) await db.service.update({ where: { id }, data: { isActive: false } });
  else await db.service.delete({ where: { id } });
  revalidatePath("/admin/hizmetler");
}

const businessSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  address: z.string().trim().max(200),
  slotIntervalMin: z.coerce.number().int().min(5).max(240),
  minLeadMinutes: z.coerce.number().int().min(0).max(10080),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
});

export async function saveSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const p = businessSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  const smsEnabled = formData.get("smsEnabled") === "on";
  const b = await db.business.findFirst();
  if (!b) return;
  await db.business.update({ where: { id: b.id }, data: { ...p.data, smsEnabled } });

  for (let wd = 0; wd < 7; wd++) {
    const open = parseHHMM(String(formData.get(`open_${wd}`) ?? ""));
    const close = parseHHMM(String(formData.get(`close_${wd}`) ?? ""));
    const isClosed = formData.get(`closed_${wd}`) === "on" || open === null || close === null || close <= open;
    const data = { openMin: open ?? 540, closeMin: close ?? 1080, isClosed };
    await db.workingHour.upsert({ where: { weekday: wd }, update: data, create: { weekday: wd, ...data } });
  }
  revalidatePath("/admin/ayarlar");
  revalidatePath(`/${b.slug}`);
}
