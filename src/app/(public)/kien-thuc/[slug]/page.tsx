import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanitizeRichText } from "@/lib/sanitize";
import { canPreview, getArticleBySlug, getPublicChrome, getRelatedArticles } from "@/lib/content";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const preview = query.preview === "1" && (await canPreview());
  const article = await getArticleBySlug(slug, preview);
  if (!article) return { title: "Không tìm thấy bài viết" };
  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || undefined,
    alternates: { canonical: `/kien-thuc/${article.slug}` },
    robots: article.status === "published" ? undefined : { index: false, follow: false },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || undefined,
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const previewRequested = query.preview === "1";
  const [preview, article] = await Promise.all([
    previewRequested ? canPreview() : Promise.resolve(false),
    getArticleBySlug(slug, previewRequested),
  ]);
  if (!article || (article.status !== "published" && !preview)) notFound();
  const [related, chrome] = await Promise.all([
    getRelatedArticles(article.slug, article.category_slug),
    getPublicChrome(),
  ]);
  const settings = chrome.settings;
  const html = sanitizeRichText(article.content || "");
  return (
    <main className="section-shell py-12 lg:py-16">
      <p className="text-sm text-muted-foreground">
        <Link href="/kien-thuc" className="font-semibold text-primary">Kiến thức</Link>
        {article.category_name ? ` / ${article.category_name}` : ""}
      </p>
      <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {article.published_at ? new Date(article.published_at).toLocaleDateString("vi-VN") : "Bản nháp"} · {article.read_minutes || 0} phút đọc
      </p>
      {article.status !== "published" ? <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm">Đây là bản xem trước, chưa xuất bản.</p> : null}
      <article className="prose-content mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mt-10">
        <Link href="/lien-he" className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground">Nhận tư vấn miễn phí</Link>
        <p className="mt-2 text-xs text-muted-foreground">Hotline {settings.hotline}</p>
      </div>
      {related.length ? (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-extrabold">Bài viết liên quan</h2>
          <ul className="mt-4 space-y-3">
            {related.map((item) => (
              <li key={item.id}><Link href={`/kien-thuc/${item.slug}`} className="font-semibold text-primary">{item.title}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
