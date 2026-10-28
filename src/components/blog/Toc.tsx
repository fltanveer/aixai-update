"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/blog";

/** Table of contents that follows the reader: the section in view is marked. */
export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id);
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  return (
    <nav aria-label="Contents">
      <p className="mod-t">Contents</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} aria-current={active === h.id ? "location" : undefined}
              className={"-ml-px block border-l-2 py-1.5 text-sm transition-colors " + (h.level === 3 ? "pl-7 " : "pl-4 ") +
                (active === h.id ? "border-acc text-ink" : "border-transparent text-muted hover:text-ink")}>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
