"use client";

import { useEffect } from "react";

/**
 * Every SMIL-animated drawing on the page keeps its own clock: it pauses while off screen,
 * and under reduced motion it stands still on a representative frame. Drawings marked
 * .smil-hover play only while their card is hovered (or, on touch screens, while on screen).
 */
const STILL: Record<string, number> = { "rt-sub": 3.8, "rt-own": 0.95 };

export default function SmilPause() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover: hover)").matches;
    const svgs = [...document.querySelectorAll<SVGSVGElement>("main svg")].filter(
      (s) => s.ownerSVGElement === null && s.querySelector("animate, animateMotion, animateTransform"),
    );
    if (reduce) {
      svgs.forEach((sv) => { sv.pauseAnimations(); sv.setCurrentTime(STILL[sv.id] ?? 1.5); });
      return;
    }
    const cleanups: (() => void)[] = [];
    const visible = new IntersectionObserver((entries) =>
      entries.forEach((e) => { const sv = e.target as SVGSVGElement; e.isIntersecting ? sv.unpauseAnimations() : sv.pauseAnimations(); }),
    );
    svgs.forEach((sv) => {
      if (sv.classList.contains("smil-hover") && canHover) {
        const card = (sv.closest("article, li, .mod") as HTMLElement) ?? sv;
        sv.pauseAnimations();
        const on = () => sv.unpauseAnimations();
        const off = () => sv.pauseAnimations();
        card.addEventListener("pointerenter", on);
        card.addEventListener("pointerleave", off);
        cleanups.push(() => { card.removeEventListener("pointerenter", on); card.removeEventListener("pointerleave", off); });
      } else visible.observe(sv);
    });
    return () => { visible.disconnect(); cleanups.forEach((c) => c()); };
  }, []);
  return null;
}
