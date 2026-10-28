import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/blog";
import { Byline, Tag } from "./PostMeta";

/** A post in a grid: image, tag, title, lede and byline; the whole card is the link. */
export default function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-mod bg-s2">
        {post.image && (
          <Image src={post.image} alt={post.imageAlt ?? ""} fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" priority={priority}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        {post.tag && <Tag>{post.tag}</Tag>}
        <h3 className="d mt-3 text-2xl leading-tight">
          <Link href={`/blog/${post.slug}`} className="underline decoration-transparent decoration-1 underline-offset-4 transition-colors group-hover:decoration-ink">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-muted">{post.description}</p>
        <Byline post={post} className="mt-auto pt-4" />
      </div>
    </article>
  );
}
