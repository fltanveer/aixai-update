import Link from "next/link";
import { NAV, type NavItem } from "@/lib/site";

export default function SiteFooter({ extra = [] }: { extra?: NavItem[] }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-page flex-col gap-4 px-5 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p>© SenTekse LLC. AIxAI and the domain profile designations are the work of SenTekse LLC.</p>
        <nav className="-my-2 flex flex-wrap gap-x-6" aria-label="Footer">
          {[...NAV, ...extra].map((n) => <Link key={n.href} className="lnk py-2" href={n.href}>{n.label}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
