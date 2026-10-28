import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { PAGES, SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = (Object.keys(PAGES) as (keyof typeof PAGES)[]).map((route) => ({
    url: SITE_URL + route,
    changeFrequency: "monthly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));
  const posts = await getPosts();
  const blog = posts.length
    ? [
        { url: `${SITE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.6 },
        ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.5 })),
      ]
    : [];
  return [...pages, ...blog];
}
