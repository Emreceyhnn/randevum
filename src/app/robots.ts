import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/lib/site";

/** Yapay zekâ arama/asistan botları: içeriğin alıntılanması ve önerilmesi için açıkça izinli. */
const AI_BOTS = [
  "GPTBot", // OpenAI eğitim
  "OAI-SearchBot", // ChatGPT arama
  "ChatGPT-User", // ChatGPT kullanıcı istekleri
  "ClaudeBot", // Anthropic
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini / Vertex
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "MistralAI-User",
  "YouBot",
  "Diffbot",
];

// SITE_URL çalışma zamanında okunur (Docker); build anında dondurulmamalı.
export const dynamic = "force-dynamic";

const PRIVATE =["/admin", "/api/"];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (!isIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow: PRIVATE },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
