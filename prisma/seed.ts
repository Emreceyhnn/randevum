import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { addDays, dayKey, istanbulToDate } from "../src/lib/time";

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }) });

async function main() {
  await db.appointment.deleteMany();
  await db.service.deleteMany();
  await db.workingHour.deleteMany();
  await db.business.deleteMany();

  await db.business.create({
    data: { name: "Demo Güzellik Salonu", slug: "demo", phone: "0212 555 00 00", address: "Kadıköy, İstanbul", smsEnabled: true },
  });

  const services = await Promise.all(
    [
      { name: "Saç Kesimi", durationMin: 30, priceTry: 400, sortOrder: 0 },
      { name: "Boya + Fön", durationMin: 90, priceTry: 1500, sortOrder: 1 },
      { name: "Manikür", durationMin: 45, priceTry: 600, sortOrder: 2 },
    ].map((s) => db.service.create({ data: s })),
  );

  // 0=Pazar .. 6=Cumartesi; Pazar kapalı, Cumartesi kısa gün
  for (let wd = 0; wd < 7; wd++) {
    await db.workingHour.create({
      data: { weekday: wd, openMin: 9 * 60, closeMin: wd === 6 ? 17 * 60 : 19 * 60, isClosed: wd === 0 },
    });
  }

  const today = dayKey(new Date());
  const samples = [
    { day: today, min: 15 * 60, s: 0, name: "Ayşe Yılmaz", phone: "5321112233", status: "CONFIRMED" },
    { day: today, min: 16 * 60, s: 2, name: "Mehmet Kaya", phone: "5334445566", status: "PENDING" },
    { day: addDays(today, 1), min: 10 * 60, s: 1, name: "Zeynep Demir", phone: "5357778899", status: "CONFIRMED" },
    { day: addDays(today, 1), min: 14 * 60, s: 0, name: "Can Öztürk", phone: "5421234567", status: "PENDING" },
  ];
  for (const a of samples) {
    const svc = services[a.s];
    const startAt = istanbulToDate(a.day, a.min);
    await db.appointment.create({
      data: {
        serviceId: svc.id,
        startAt,
        endAt: new Date(startAt.getTime() + svc.durationMin * 60_000),
        customerName: a.name,
        customerPhone: a.phone,
        status: a.status,
      },
    });
  }
  console.log("Seed tamam: /demo");
}

main().finally(() => db.$disconnect());
