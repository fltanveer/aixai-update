import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/blog";
import { Byline, Tag } from "./PostMeta";

/** The newest post, large: image on one side, story on the other. */
export default function FeaturedPost({ post }: { post: Post }) {
  return (
    <article className="mod group relative grid overflow-hidden lg:grid-cols-12">
      <div className="relative aspect-[16/10] overflow-hidden bg-s2 lg:col-span-7 lg:aspect-auto lg:min-h-[420px]">
        {post.image && (
          <Image src={post.image} alt={post.imageAlt ?? ""} fill priority sizes="(min-width:1024px) 720px, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.02]" />
        )}
      </div>
      <div className="flex flex-col p-6 md:p-10 lg:col-span-5">
        {post.tag && <Tag>{post.tag}</Tag>}
        <h2 className="d h2 mt-4">
          <Link href={`/blog/${post.slug}`} className="underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-acc">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h2>
        <p className="mt-5 text-lg text-muted">{post.description}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-10">
          <Byline post={post} />
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-acc transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M3 9h12M10 4l5 5-5 5" fill="none" stroke="#17160F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </div>
    </article>
  );
}
