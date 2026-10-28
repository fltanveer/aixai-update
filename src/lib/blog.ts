import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { slugify } from "@/lib/slug";

/*
 * Blog posts are MDX files in src/content/blog/<slug>.mdx, each exporting its metadata:
 *
 *   export const metadata = { title, description, date: "2026-11-01", tag: "Framework", image: "/assets/img/…", imageAlt };
 *
 * See src/content/blog/README.md. Reading time and the table of contents come from the file itself.
 */
export type PostMeta = { title: string; description: string; date: string; tag?: string; image?: string; imageAlt?: string; draft?: boolean };
export type Heading = { id: string; text: string; level: 2 | 3 };
export type Post = PostMeta & { slug: string; minutes: number; headings: Heading[] };

const DIR = path.join(process.cwd(), "src", "content", "blog");

export function getSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

function readFacts(slug: string) {
  const raw = fs.readFileSync(path.join(DIR, `${slug}.mdx`), "utf8");
  const body = raw.replace(/export const metadata = \{[\s\S]*?\n\};/, "");
  const words = body.replace(/[`#>*_|\-[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
  const headings: Heading[] = [...body.matchAll(/^(##|###) (.+)$/gm)].map((m) => ({
    level: m[1].length as 2 | 3,
    text: m[2].trim(),
    id: slugify(m[2]),
  }));
  return { minutes: Math.max(1, Math.round(words / 220)), headings };
}

export async function loadPost(slug: string): Promise<{ meta: Post; Content: ComponentType } | null> {
  if (!getSlugs().includes(slug)) return null;
  const mod = await import(`@/content/blog/${slug}.mdx`);
  return { meta: { slug, ...(mod.metadata as PostMeta), ...readFacts(slug) }, Content: mod.default };
}

export async function getPosts(): Promise<Post[]> {
  const posts = await Promise.all(getSlugs().map(async (s) => (await loadPost(s))?.meta));
  return posts
    .filter((p): p is Post => !!p && !(p.draft && process.env.NODE_ENV === "production"))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const hasPosts = async () => (await getPosts()).length > 0;
