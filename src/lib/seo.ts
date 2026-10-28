import type { Metadata } from "next";
import { PAGES, site } from "@/lib/site";

/** Page metadata from the route table: title, description, canonical URL and link-preview text. */
export function pageMeta(route: keyof typeof PAGES): Metadata {
  const p = PAGES[route];
  const isHome = route === "/";
  return {
    title: isHome ? { absolute: p.title } : p.title,
    description: p.description,
    alternates: { canonical: route },
    openGraph: { title: isHome ? `${site.name} — ${site.tagline}` : `${p.title} | ${site.name}`, description: p.description, url: route },
    twitter: { title: isHome ? `${site.name} — ${site.tagline}` : `${p.title} | ${site.name}`, description: p.description },
  };
}

/** WebPage + breadcrumb structured data for a route. */
export function pageLd(route: keyof typeof PAGES, SITE_URL: string) {
  const p = PAGES[route];
  const url = SITE_URL + (route === "/" ? "/" : route);
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name: p.title, description: p.description, isPartOf: { "@id": `${SITE_URL}/#website` }, inLanguage: "en" },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: site.name, item: SITE_URL + "/" },
          ...(route === "/" ? [] : [{ "@type": "ListItem", position: 2, name: p.title, item: url }]),
        ],
      },
    ],
  };
}
