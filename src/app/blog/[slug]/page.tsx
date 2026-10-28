import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/blog/PostCard";
import { Byline, Tag } from "@/components/blog/PostMeta";
import Toc from "@/components/blog/Toc";
import JsonLd from "@/components/JsonLd";
import { getPosts, loadPost } from "@/lib/blog";
import { SITE_URL, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await loadPost((await params).slug);
  if (!post) return {};
  const { title, description, date, image, imageAlt, slug, tag } = post.meta;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title, description, url: `/blog/${slug}`, publishedTime: date, section: tag, images: image ? [{ url: image, alt: imageAlt }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await loadPost((await params).slug);
  if (!post) notFound();
  const { meta, Content } = post;
  const others = (await getPosts()).filter((p) => p.slug !== meta.slug);
  const related = [...others.filter((p) => p.tag === meta.tag), ...others.filter((p) => p.tag !== meta.tag)].slice(0, 3);
  const url = `${SITE_URL}/blog/${meta.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": url,
              headline: meta.title,
              description: meta.description,
              datePublished: meta.date,
              articleSection: meta.tag,
              image: meta.image ? SITE_URL + meta.image : undefined,
              url,
              mainEntityOfPage: url,
              author: { "@id": `${SITE_URL}/#org` },
              publisher: { "@id": `${SITE_URL}/#org` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: site.name, item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
                { "@type": "ListItem", position: 3, name: meta.title, item: url },
              ],
            },
          ],
        }}
      />
      <article>
        <header className="mx-auto max-w-page px-5 pt-10 md:px-8 md:pt-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li><Link href="/" className="lnk">{site.name}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" className="lnk">Blog</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="truncate text-ink">{meta.title}</li>
            </ol>
          </nav>
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {meta.tag && <Tag>{meta.tag}</Tag>}
              <h1 className="d h1 mt-4">{meta.title}</h1>
            </div>
            <div className="lg:col-span-4 lg:self-end">
              <p className="text-lg text-muted">{meta.description}</p>
              <Byline post={meta} className="mt-5 border-t border-line pt-4" />
            </div>
          </div>
          {meta.image && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-mod bg-s2 md:aspect-[21/9]">
              <Image src={meta.image} alt={meta.imageAlt ?? ""} fill priority sizes="(min-width:1280px) 1216px, 100vw" className="object-cover" />
            </div>
          )}
        </header>

        <div className="mx-auto grid max-w-page gap-10 px-5 pb-20 pt-12 md:px-8 lg:grid-cols-12 lg:pt-16">
          {meta.headings.length > 1 && (
            <aside className="lg:col-span-3">
              <div className="hidden lg:sticky lg:top-24 lg:block">
                <Toc headings={meta.headings} />
              </div>
              <details className="mod px-5 py-4 lg:hidden">
                <summary className="mod-t cursor-pointer">Contents</summary>
                <ol className="mt-3 space-y-2 text-sm">
                  {meta.headings.map((h) => <li key={h.id} className={h.level === 3 ? "pl-4" : ""}><a href={`#${h.id}`} className="lnk">{h.text}</a></li>)}
                </ol>
              </details>
            </aside>
          )}
          <div className={"min-w-0 " + (meta.headings.length > 1 ? "lg:col-span-7 lg:col-start-5" : "lg:col-span-8 lg:col-start-3")}>
            <div className="measure [&>*:first-child]:mt-0">
              <Content />
            </div>
            <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Byline post={meta} />
              <Link href="/blog" className="btn btn-ln">Blog</Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-20" aria-labelledby="more-h">
          <div className="mx-auto max-w-page px-5 md:px-8">
            <h2 id="more-h" className="d h2">Related</h2>
            <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
