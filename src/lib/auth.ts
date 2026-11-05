import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "randevum_admin";
const MAX_AGE = 7 * 24 * 60 * 60;

function secret(): string {
  return `${process.env.CRON_SECRET ?? ""}|${process.env.ADMIN_PASSWORD ?? ""}|randevum`;
}
function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && safeEqual(input, expected);
}

export async function createSession(): Promise<void> {
  const exp = String(Date.now() + MAX_AGE * 1000);
  const jar = await cookies();
  jar.set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now();
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin");
}
