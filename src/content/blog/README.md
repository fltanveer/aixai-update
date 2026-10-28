# Blog posts

Add one `.mdx` file per post. The file name is the URL slug: `edge-ai-ownership.mdx` → `/blog/edge-ai-ownership`.

```mdx
export const metadata = {
  title: "Post title",
  description: "One or two sentences for search results and link previews.",
  date: "2026-11-01",
  image: "/assets/img/cabinet.webp", // optional, used for link previews
  draft: false,                       // drafts show in dev only
};

Body text in Markdown. Headings, lists and links are styled by src/mdx-components.tsx.
```

The `/blog` index, the "Blog" link in the header and footer, the sitemap entries and the
per-post structured data all switch on automatically once the first post is here.
