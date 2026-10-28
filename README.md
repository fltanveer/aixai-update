# AIxAIoT website

Next.js 16 (App Router) + React 19 + Tailwind CSS 3.4, ported from the v5 design (`design/aixaiot-v5-studio.html`).
Every page is statically generated, so it can be hosted anywhere that serves a Next.js app (Vercel, Netlify, a Node server).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build; all routes prerender
npm start        # serve the production build
npm run lint     # type-check
```

Set the public URL before building for production. It is used in canonical links, Open Graph tags, the sitemap and structured data:

```bash
NEXT_PUBLIC_SITE_URL=https://aixaiot.com
```

## Pages

| Route | Source |
| --- | --- |
| `/` | `src/app/page.tsx` → `src/app/_pages/overview.generated.tsx` |
| `/framework` | `src/app/framework/page.tsx` → `framework.generated.tsx` |
| `/domains` | `src/app/domains/page.tsx` → `domains.generated.tsx` |
| `/examples` | `src/app/examples/page.tsx` → `examples.generated.tsx` |
| `/blog`, `/blog/[slug]`, `/blog/rss.xml` | `src/app/blog/` + posts in `src/content/blog/` |

The `*.generated.tsx` page bodies come from `design/aixaiot-v5-studio.html` via `npm run convert` (`scripts/convert-v5.py`), which keeps
every word of copy unchanged. To change page content, either edit the v5 HTML and re-run the converter, or edit the
generated file directly and stop using the converter from then on.

Interactive parts are client components in `src/components/`: `PremisesFigure` (hero drawing and legend filter),
`StackExplorer` (extended stack), `SmilPause` (round-trip scenes), `LazyVideo`, `SiteHeader` (mobile menu, active link).
Their drawings render on the server too, so they appear without JavaScript and to search engines.

## SEO

- Per-page `<title>`, description, canonical URL, Open Graph and Twitter cards (`src/lib/site.ts`, `src/lib/seo.ts`)
- `sitemap.xml` and `robots.txt` generated from the routes and posts
- JSON-LD: Organization + WebSite (all pages), WebPage + BreadcrumbList (pages), Blog / BlogPosting (blog)
- Fonts self-hosted by `next/font`; images served by `next/image` as AVIF/WebP with explicit sizes
- Semantic HTML, a skip link, and static HTML for every route

## Blog

Add a post by dropping an `.mdx` file into `src/content/blog/` — see `src/content/blog/README.md`.
The four posts there now are samples assembled from the site's own copy; replace them with real articles.
Reading time and the table of contents are worked out from the file. Post styling lives in `src/mdx-components.tsx`.
