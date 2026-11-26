import type { MetadataRoute } from "next";

// SITE_URL çalışma zamanında verilir; build sırasında statik üretilirse localhost'a sabitlenir.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/canli-demo`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
