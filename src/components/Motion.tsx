"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
 * Site-wide motion, in one place:
 * - inertia smooth scrolling on pointer devices (touch keeps native scrolling), anchor links included;
 * - scroll reveals: content below the fold fades and rises in as it enters, staggered within a group;
 *   images settle from a slight zoom. Content already on screen is never hidden, so nothing flashes.
 * Everything stays off under prefers-reduced-motion.
 */

// what reveals: the building blocks of a section, not every nested element
const CANDIDATES = [
  "main section h1", "main section h2", "main section h3", "main section > div > p", "main section > p",
  "main section .mod", "main section figure", "main section table", "main section dl > div",
  "main section ol > li", "main section ul > li", "main section a.group", "main section article", "main section img", "main section video",
  "main section [class*='grid'] > p", "main section [class*='grid'] > div > p",
].join(",");

export default function Motion() {
  const path = usePathname();

  // smooth scrolling, once
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3.2), anchors: { offset: -80 }, smoothWheel: true });
    let id = 0;
    const raf = (t: number) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);

  // a new page starts at the top, without a smooth glide from where the last one was
  useEffect(() => {
    if (location.hash) return;
    (window as unknown as { __lenis?: Lenis }).__lenis?.scrollTo(0, { immediate: true });
  }, [path]);

  // scroll reveals, per page
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const all = [...document.querySelectorAll<HTMLElement>(CANDIDATES)];
    // keep the outermost candidates only, and skip anything already on screen
    const els = all.filter((el) => !all.some((o) => o !== el && o.contains(el)) && !el.closest("details") && el.getBoundingClientRect().top > innerHeight * 0.92);
    els.forEach((el) => el.classList.add(el.tagName === "IMG" || el.tagName === "VIDEO" ? "rv-media" : "rv"));
    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        shown.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
        shown.forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
          el.classList.add("rv-in");
          io.unobserve(el);
          el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    // a fast jump (anchor link, scrollbar drag) can skip a block entirely: anything already above the viewport shows at once
    let ticking = false;
    const sweep = () => {
      ticking = false;
      els.forEach((el) => {
        if (!el.classList.contains("rv-in") && el.getBoundingClientRect().bottom < 0) { el.classList.add("rv-in"); io.unobserve(el); }
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); removeEventListener("scroll", onScroll); els.forEach((el) => el.classList.remove("rv", "rv-media", "rv-in")); };
  }, [path]);

  return null;
}
