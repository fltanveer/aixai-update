"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/blog";
import FeaturedPost from "./FeaturedPost";
import PostCard from "./PostCard";

/** Featured post, tag filter and the grid. Filtering happens in the browser; every post is in the HTML for crawlers. */
export default function BlogIndex({ posts }: { posts: Post[] }) {
  const tags = useMemo(() => [...new Set(posts.map((p) => p.tag).filter(Boolean))] as string[], [posts]);
  const [tag, setTag] = useState<string | null>(null);
  const shown = tag ? posts.filter((p) => p.tag === tag) : posts;
  const [featured, ...rest] = shown;

  return (
    <>
      {tags.length > 1 && (
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
          {[null, ...tags].map((t) => (
            <button key={t ?? "all"} type="button" aria-pressed={tag === t} onClick={() => setTag(t)}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm transition-colors hover:bg-s2 aria-pressed:border-acc aria-pressed:bg-[#FFF6CC]">
              {t ?? "All"}
              <span className="ml-2 text-muted">{t ? posts.filter((p) => p.tag === t).length : posts.length}</span>
            </button>
          ))}
        </div>
      )}
      {featured && <div className="mt-8"><FeaturedPost post={featured} /></div>}
      {rest.length > 0 && (
        <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
      )}
    </>
  );
}
