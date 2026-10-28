// One place for the site's identity, routes and per-page SEO text.
// Every visible string here is verbatim from the content prototype (archive/aixaiot-prototype-v1.0.html).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aixaiot.com").replace(/\/$/, "");

export const site = {
  name: "AIxAIoT",
  owner: "SenTekse LLC",
  title: "AIxAIoT — Edge AI Infrastructure | SenTekse LLC",
  tagline: "Autonomous Infrastructure × Artificial Intelligence",
  description: "AIxAIoT specifies the standards-based infrastructure they run on, including turnkey edge data centers.",
  ogImage: "/assets/img/cabinet.webp",
  locale: "en_US",
};

export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/framework", label: "Framework" },
  { href: "/domains", label: "Domains" },
  { href: "/examples", label: "Examples" },
];

export const INTAKE: NavItem = { href: "/examples#method", label: "Intake" };

/** Per-route SEO: title (page H1) and description (the page's own lede). */
export const PAGES = {
  "/": {
    title: site.title,
    description:
      "AI capabilities and efficiencies are tied directly to computational resources. AIxAIoT specifies the standards-based infrastructure they run on, including turnkey edge data centers.",
  },
  "/framework": {
    title: "Built from industry standards",
    description:
      "AIxAIoT delivers the infrastructure as a specified system — in every domain, and for the edge data center within it. Not a rack in a closet, and not a vendor architecture.",
  },
  "/domains": {
    title: "Every premises domain",
    description:
      "The framework follows the premises hierarchy the cabling standards already define. One generic standard underpins every premises domain — and one architecture makes any of them autonomous, instantiated per domain.",
  },
  "/examples": {
    title: "Pay for what you need",
    description:
      "The business and operational infrastructure (AI IT / AI OT) is sized from an intake process. Ten answers are enough to estimate and cost a build.",
  },
} as const;
