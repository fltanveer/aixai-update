import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { slugify } from "@/lib/slug";

const text = (n: ReactNode): string =>
  typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(text).join("") : n && typeof n === "object" && "props" in n ? text((n as { props: { children?: ReactNode } }).props.children) : "";

// Article typography for blog posts, in the v5 type system.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => <h2 id={slugify(text(children))} className="d h3 mt-14 scroll-mt-24 !text-[28px] !leading-tight">{children}</h2>,
    h3: ({ children }) => <h3 id={slugify(text(children))} className="d mt-10 scroll-mt-24 text-xl">{children}</h3>,
    p: (p) => <p className="mt-5 text-[17px] leading-[1.75] text-ink/80" {...p} />,
    a: (p) => <a className="lnk text-ink" {...p} />,
    strong: (p) => <strong className="font-medium text-ink" {...p} />,
    ul: (p) => <ul className="mt-5 space-y-2.5 text-[17px] text-ink/80 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[.7em] [&>li]:before:h-[7px] [&>li]:before:w-[7px] [&>li]:before:rounded-full [&>li]:before:bg-acc" {...p} />,
    ol: (p) => <ol className="mt-5 list-decimal space-y-2.5 pl-6 text-[17px] text-ink/80 marker:font-medium marker:text-ink" {...p} />,
    blockquote: (p) => <blockquote className="d my-10 border-l-[3px] border-acc pl-6 text-2xl leading-snug text-ink [&_p]:mt-0 [&_p]:text-[inherit] [&_p]:leading-[inherit] [&_p]:text-ink" {...p} />,
    code: (p) => <code className="id rounded-[6px] bg-s2 px-1.5 py-0.5 text-ink" {...p} />,
    hr: () => <hr className="my-12 border-line" />,
    table: (p) => <div className="mod my-8 overflow-x-auto"><table className="w-full text-left text-[15px]" {...p} /></div>,
    thead: (p) => <thead className="mod-t border-b border-line" {...p} />,
    th: (p) => <th className="px-5 py-3 font-medium" {...p} />,
    td: (p) => <td className="border-t border-line px-5 py-3 align-top first:font-medium" {...p} />,
    ...components,
  };
}
