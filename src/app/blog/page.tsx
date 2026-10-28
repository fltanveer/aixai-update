import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogIndex from "@/components/blog/BlogIndex";
import JsonLd from "@/components/JsonLd";
import { getPosts } from "@/lib/blog";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: site.description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { title: `Blog | ${site.name}`, url: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  if (!posts.length) notFound();
  return (
    <section className="mx-auto max-w-page px-5 pb-24 pt-14 md:px-8 md:pt-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${site.name} Blog`,
          url: `${SITE_URL}/blog`,
          publisher: { "@id": `${SITE_URL}/#org` },
          blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })),
        }}
      />
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="mod-t">{site.name}</p>
          <h1 className="d h1 mt-4">Blog</h1>
        </div>
        <p className="text-lg text-muted lg:col-span-5">{site.description}</p>
      </div>
      <BlogIndex posts={posts} />
    </section>
  );
}
