import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const b = await db.business.findFirst();
  if (!b) notFound();
  redirect(`/${b.slug}`);
}
