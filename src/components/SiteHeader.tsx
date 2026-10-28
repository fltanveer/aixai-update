"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { INTAKE, NAV, type NavItem } from "@/lib/site";

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export default function SiteHeader({ extra = [] }: { extra?: NavItem[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = [...NAV, ...extra];
  const current = items.find((n) => isActive(path, n.href))?.label ?? NAV[0].label;

  useEffect(() => setOpen(false), [path]);

  // a hairline shadow once the page moves under the header
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  // the open menu holds the page still and closes on Esc
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => { root.classList.remove("menu-open"); removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <header className={"hdr sticky top-0 z-50 border-b bg-canvas/85 backdrop-blur-md backdrop-saturate-150 " + (scrolled || open ? "hdr-on border-line" : "border-transparent")}>
      <nav className="mx-auto flex h-16 max-w-page items-center gap-8 px-5 md:px-8" aria-label="Primary">
        <Link href="/" className="d mr-auto flex items-center gap-2 text-xl" aria-label="AIxAIoT home">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect width="22" height="22" rx="5" fill="#17160F" /><path d="M7 7l8 8M15 7l-8 8" stroke="#F2C200" strokeWidth="2.2" strokeLinecap="round" /></svg>
          <span>AI<span className="text-edge">×</span>AIoT</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {items.map((n) => (
            <Link key={n.href} className="nl" href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}>{n.label}</Link>
          ))}
        </div>
        <Link href={INTAKE.href} className="btn btn-acc hidden !py-2 md:inline-flex">{INTAKE.label}</Link>
        <button type="button" className="btn btn-ln !gap-2.5 !px-3 !py-2 md:hidden" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((v) => !v)}>
          {current}
          <span className={"burger-i" + (open ? " is-open" : "")} aria-hidden="true"><i /><i /></span>
        </button>
      </nav>
      <div id="menu" className={"menu md:hidden" + (open ? " is-open" : "")} aria-hidden={!open} inert={!open}>
        <div className="px-5 pb-8 pt-2">
          {items.map((n, i) => (
            <Link key={n.href} style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }} className="menu-link d flex items-center justify-between border-b border-line py-4 text-2xl" href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}>
              {n.label}
              {isActive(path, n.href) && <span className="h-2 w-2 rounded-full bg-acc" aria-hidden="true" />}
            </Link>
          ))}
          <Link className="menu-link btn btn-acc mt-6" style={{ transitionDelay: open ? `${60 + items.length * 40}ms` : "0ms" }} href={INTAKE.href}>{INTAKE.label}</Link>
        </div>
      </div>
    </header>
  );
}
