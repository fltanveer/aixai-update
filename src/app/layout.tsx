import type { Metadata, Viewport } from "next";
import { Red_Hat_Display, Red_Hat_Mono, Red_Hat_Text } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import Motion from "@/components/Motion";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { hasPosts } from "@/lib/blog";
import { SITE_URL, site, type NavItem } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time: no request to Google at runtime, no layout shift from late fonts.
const display = Red_Hat_Display({ subsets: ["latin"], weight: ["300", "500", "600"], variable: "--font-display", display: "swap" });
const text = Red_Hat_Text({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-text", display: "swap" });
const mono = Red_Hat_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  publisher: site.owner,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: "/",
    locale: site.locale,
    images: [{ url: site.ogImage, width: 1600, height: 1200, alt: "A compact locked 12U cabinet" }],
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.tagline}`, description: site.description, images: [site.ogImage] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#FBFBF8" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const extra: NavItem[] = (await hasPosts()) ? [{ href: "/blog", label: "Blog" }] : [];
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: site.owner, url: SITE_URL, brand: { "@type": "Brand", name: site.name } },
              { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: site.name, url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` }, inLanguage: "en" },
            ],
          }}
        />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-ctl focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas">Overview</a>
        <SiteHeader extra={extra} />
        <main id="main">{children}</main>
        <SiteFooter extra={extra} />
        <Motion />
      </body>
    </html>
  );
}
