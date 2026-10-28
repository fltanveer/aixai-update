"use client";

import { useEffect } from "react";

/** SMIL scenes keep one shared clock; they stand still under reduced motion and pause off screen. */
export default function SmilPause({ ids }: { ids: string[] }) {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const sv = document.getElementById(id) as SVGSVGElement | null;
      if (!sv) return;
      if (reduce) { sv.pauseAnimations(); sv.setCurrentTime(0.95 * (id === "rt-sub" ? 4 : 1)); return; }
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? sv.unpauseAnimations() : sv.pauseAnimations()));
      io.observe(sv);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
  }, [ids]);
  return null;
}
