"use client";

import { useEffect, useRef } from "react";

/** A decorative looping video: loads when it scrolls into view, plays only while visible, never under reduced motion. */
export default function LazyVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) { v.src = src; v.load(); }
        if (!reduce) v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} className={className} muted loop playsInline preload="none" poster={poster} aria-hidden="true" />;
}
