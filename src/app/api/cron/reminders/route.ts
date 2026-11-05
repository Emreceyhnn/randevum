import { db } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { addDays, dayKey, fmtTime, istanbulToDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const business = await db.business.findFirst();
  if (!business?.smsEnabled) return Response.json({ sent: 0, skipped: "sms kapalı" });

  const tomorrow = addDays(dayKey(new Date()), 1);
  const appts = await db.appointment.findMany({
    where: {
      status: "CONFIRMED",
      smsSentAt: null,
      startAt: { gte: istanbulToDate(tomorrow, 0), lt: istanbulToDate(addDays(tomorrow, 1), 0) },
    },
    include: { service: true },
  });

  let sent = 0;
  for (const a of appts) {
    const r = await sendSms(a.customerPhone, `${business.name}: Yarın saat ${fmtTime(a.startAt)} ${a.service.name} randevunuzu hatırlatırız.`);
    if (r.ok) {
      await db.appointment.update({ where: { id: a.id }, data: { smsSentAt: new Date() } });
      sent++;
    }
  }
  return Response.json({ total: appts.length, sent });
}
