import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Docker HEALTHCHECK ve izleme için: uygulama ayakta mı, veritabanına ulaşabiliyor mu?
export async function GET(): Promise<Response> {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
