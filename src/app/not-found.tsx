import Link from "next/link";
import { NAV } from "@/lib/site";

export const metadata = { title: "404", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="mx-auto max-w-page px-5 py-24 md:px-8 md:py-32">
      <p className="kpi">404</p>
      <nav className="mt-10 flex flex-wrap gap-3" aria-label="Pages">
        {NAV.map((n, i) => <Link key={n.href} href={n.href} className={i ? "btn btn-ln" : "btn btn-acc"}>{n.label}</Link>)}
      </nav>
    </section>
  );
}
