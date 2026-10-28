import { getPosts } from "@/lib/blog";
import { SITE_URL, site } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS feed of the blog, for readers and aggregators. */
export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map((p) => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}</link><guid>${SITE_URL}/blog/${p.slug}</guid><pubDate>${new Date(p.date + "T00:00:00Z").toUTCString()}</pubDate><description>${esc(p.description)}</description>${p.tag ? `<category>${esc(p.tag)}</category>` : ""}</item>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)} Blog</title><link>${SITE_URL}/blog</link><description>${esc(site.description)}</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
