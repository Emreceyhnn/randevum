import { FAQ, FEATURES } from "@/lib/content";
import { REPO_URL, SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// llms-full.txt: yapay zekâ asistanlarının alıntılayabilmesi için sitenin tüm metinsel içeriği.
export function GET() {
  const base = siteUrl();
  const features = FEATURES.map((f) => `### ${f.title}\n\n${f.text}`).join("\n\n");
  const faq = FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");
  const body = `# ${SITE_NAME} — tam içerik

> ${SITE_DESCRIPTION}

Site: ${base}/
Canlı demo: ${base}/canli-demo
Kaynak kod: ${REPO_URL}

## Özellikler

${features}

## Sık sorulan sorular

${faq}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
