import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsImage } from "@/components/site/CmsImage";
import { HoverArticleCard } from "@/components/site/HoverArticleCard";
import { SocialShareLinks } from "@/components/site/SocialLinks";
import { canPreview, getArticleBySlug, getCategories, getPopularArticles, getPublicChrome, getRelatedArticles } from "@/lib/content";
import { sanitizeRichText, slugify } from "@/lib/sanitize";
import { absoluteSiteUrl } from "@/lib/site-url";

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const preview = query.preview === "1" && await canPreview();
  const article = await getArticleBySlug(slug, preview);
  if (!article) return { title: "Không tìm thấy bài viết" };
  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || undefined,
    alternates: { canonical: `/tin-tuc/${article.slug}` },
    robots: article.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title: article.seo_title || article.title, description: article.seo_description || article.excerpt || undefined, images: article.cover_url ? [article.cover_url] : undefined },
  };
}

export default async function NewsArticle({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const previewRequested = query.preview === "1";
  const [preview, article] = await Promise.all([
    previewRequested ? canPreview() : Promise.resolve(false),
    getArticleBySlug(slug, previewRequested),
  ]);
  if (!article || (article.status !== "published" && !preview)) notFound();
  const [related, popular, categories, chrome] = await Promise.all([
    getRelatedArticles(article.slug, article.category_slug),
    getPopularArticles(),
    getCategories(),
    getPublicChrome(),
  ]);
  const headingIds = new Set<string>();
  const headings: { id: string; label: string; level: number }[] = [];
  const withIds = (article.content || "").replace(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level: string, contents: string) => {
    const label = contents.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, "\"").replace(/&#39;/g, "'").trim();
    let id = slugify(label) || `muc-${headings.length + 1}`;
    if (headingIds.has(id)) id = `${id}-${headings.length + 1}`;
    headingIds.add(id);
    headings.push({ id, label, level: Number(level) });
    return `<h${level} id="${id}">${contents}</h${level}>`;
  });
  const safeHtml = sanitizeRichText(withIds);
  const shareUrl = absoluteSiteUrl(`/tin-tuc/${article.slug}`);

  return (
    <main className="flex-1">
      <header className="page-banner relative isolate overflow-hidden bg-primary text-primary-foreground">
        {article.cover_url ? <div className="absolute inset-0 -z-20 opacity-30"><CmsImage src={article.cover_url} alt="" className="object-cover" sizes="100vw" priority /></div> : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-primary/90 to-primary/60" />
        <div className="bg-mesh pointer-events-none absolute inset-0 opacity-40" />
        <div className="section-shell relative py-14 sm:py-16 lg:py-20">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-primary-foreground/75" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><Link href="/tin-tuc">Tin tức</Link>{article.category_name ? <><span>›</span><span>{article.category_name}</span></> : null}</nav>
          {article.category_name ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-200">{article.category_name}</p> : null}
          <h1 className="banner-h1 max-w-4xl font-extrabold">{article.title}</h1>
          {article.excerpt ? <p className="mt-4 max-w-3xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">{article.excerpt}</p> : null}
          <p className="mt-5 text-sm text-primary-foreground/70">{article.published_at ? new Date(article.published_at).toLocaleDateString("vi-VN") : "Bản nháp"} · {article.read_minutes || 0} phút đọc</p>
          {article.status !== "published" ? <p className="mt-4 inline-block rounded-lg bg-amber-200/20 px-3 py-2 text-sm">Bài viết đang ở chế độ xem trước.</p> : null}
        </div>
      </header>

      <div className="section-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:py-14">
        <div>
          {headings.length ? <nav className="mb-8 rounded-xl border border-border bg-secondary/60 p-5" aria-label="Mục lục"><h2 className="font-display text-sm font-extrabold uppercase tracking-wide">Mục lục</h2><ol className="mt-3 space-y-2">{headings.map((heading, index) => <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}><a href={`#${heading.id}`} className="text-sm text-muted-foreground hover:text-primary">{index + 1}. {heading.label}</a></li>)}</ol></nav> : null}
          <article className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          <div className="mt-8">
            <SocialShareLinks url={shareUrl} title={article.title} />
          </div>
          <div className="mt-10 rounded-2xl bg-hero-gradient p-6 text-primary-foreground sm:p-8">
            <h2 className="font-display text-xl font-extrabold">Cần trao đổi về hồ sơ của bạn?</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">Chuyên viên iName sẽ giúp bạn xác định bước tiếp theo.</p>
            <Link href="/lien-he" className="mt-4 inline-flex rounded-lg bg-card px-4 py-2 text-sm font-semibold text-primary">Nhận tư vấn miễn phí →</Link>
            <p className="mt-2 text-xs text-primary-foreground/75">Hotline {chrome.settings.hotline}</p>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5 shadow-card"><h2 className="font-display font-bold">Bài viết phổ biến</h2><ul className="mt-3 space-y-3">{popular.map((item) => <li key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0"><Link href={`/tin-tuc/${item.slug}`} className="text-sm font-semibold leading-relaxed hover:text-primary">{item.title}</Link><span className="mt-1 block text-xs text-muted-foreground">{item.category_name}</span></li>)}</ul></section>
          <section className="rounded-xl border border-border bg-card p-5 shadow-card"><h2 className="font-display font-bold">Chuyên mục</h2><ul className="mt-3 space-y-2">{categories.map((item) => <li key={item.slug}><Link href={`/tin-tuc?category=${item.slug}`} className="text-sm text-muted-foreground hover:text-primary">{item.name}</Link></li>)}</ul></section>
          <section className="rounded-xl border border-primary/15 bg-primary-soft p-5"><p className="font-display font-bold">Hotline iName</p><a className="mt-2 block font-display text-xl font-extrabold text-primary" href={chrome.settings.hotline_href}>{chrome.settings.hotline}</a><Link href="/lien-he" className="mt-3 inline-flex text-sm font-semibold text-primary">Liên hệ với chúng tôi →</Link></section>
        </aside>
      </div>

      {related.length ? (
        <section className="border-y border-border bg-secondary/45 py-12 lg:py-16">
          <div className="section-shell">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">Xem thêm</p>
            <h2 className="font-display text-2xl font-extrabold">Bài viết liên quan</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <HoverArticleCard key={item.id} href={`/tin-tuc/${item.slug}`} title={item.title} excerpt={item.excerpt} coverUrl={item.cover_url} coverAlt={item.cover_alt} category={item.category_name} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
