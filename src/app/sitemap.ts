import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

// SITE_URL çalışma zamanında verilir; build sırasında statik üretilirse localhost'a sabitlenir.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/canli-demo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
  try {
    const businesses = await db.business.findMany({ select: { slug: true } });
    for (const b of businesses) {
      entries.push({ url: `${base}/${b.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    }
  } catch {
    // Veritabanı hazır değilse statik sayfalarla devam et.
  }
  return entries;
}
