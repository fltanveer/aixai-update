import type { Post } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mod-t inline-flex items-center gap-2 !text-ink">
      <span className="h-2 w-2 rounded-full bg-acc" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Byline({ post, className = "" }: { post: Pick<Post, "date" | "minutes">; className?: string }) {
  return (
    <p className={"flex items-center gap-2 text-sm text-muted " + className}>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.minutes} min read</span>
    </p>
  );
}
