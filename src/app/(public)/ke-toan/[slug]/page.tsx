import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsImage } from "@/components/site/CmsImage";
import { HoverArticleCard } from "@/components/site/HoverArticleCard";
import {
  canPreview,
  getArticleBySlug,
  getCategories,
  getPopularArticles,
  getPublicChrome,
  getRelatedArticles,
} from "@/lib/content";
import { sanitizeRichText, slugify } from "@/lib/sanitize";

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
  if (!article) return { title: "Không tìm thấy dịch vụ kế toán" };
  return {
    title: `${article.seo_title || article.title} | Dịch Vụ Kế Toán iName`,
    description: article.seo_description || article.excerpt || undefined,
    alternates: { canonical: `/ke-toan/${article.slug}` },
    robots: article.status === "published" ? undefined : { index: false, follow: false },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || undefined,
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function AccountingArticlePage({
  params,
  searchParams,
}: {
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
    getRelatedArticles(article.slug, article.category_slug || "ke-toan"),
    getPopularArticles(),
    getCategories(),
    getPublicChrome(),
  ]);

  const headingIds = new Set<string>();
  const headings: { id: string; label: string; level: number }[] = [];
  const withIds = (article.content || "").replace(
    /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, contents: string) => {
      const label = contents
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .trim();
      let id = slugify(label) || `muc-${headings.length + 1}`;
      if (headingIds.has(id)) id = `${id}-${headings.length + 1}`;
      headingIds.add(id);
      headings.push({ id, label, level: Number(level) });
      return `<h${level} id="${id}">${contents}</h${level}>`;
    },
  );
  const safeHtml = sanitizeRichText(withIds);

  return (
    <main className="flex-1">
      {/* Top Banner */}
      <header className="page-banner relative isolate overflow-hidden bg-primary text-primary-foreground">
        {article.cover_url ? (
          <div className="absolute inset-0 -z-20 opacity-30">
            <CmsImage src={article.cover_url} alt="" className="object-cover" sizes="100vw" priority />
          </div>
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-primary/90 to-primary/60" />
        <div className="bg-mesh pointer-events-none absolute inset-0 opacity-40" />

        <div className="section-shell py-14 sm:py-16 lg:py-20">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-primary-foreground/75" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-foreground transition-colors">Trang chủ</Link>
            <span>›</span>
            <Link href="/ke-toan" className="hover:text-primary-foreground transition-colors">Dịch vụ kế toán</Link>
            <span>›</span>
            <span className="font-semibold text-primary-foreground">{article.title}</span>
          </nav>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
            Dịch vụ kế toán doanh nghiệp
          </div>

          <h1 className="banner-h1 max-w-4xl font-extrabold">
            {article.title}
          </h1>

          {article.excerpt ? (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-primary-foreground/75">
            <span>Đội ngũ Kế toán & Kiểm toán viên iName</span>
            <span>·</span>
            <span>Cập nhật mới nhất 2026</span>
          </div>

          {article.status !== "published" ? (
            <p className="mt-4 inline-block rounded-lg bg-amber-400/20 px-3 py-1 text-xs text-amber-200">
              Bài viết đang ở chế độ xem trước (Bản nháp).
            </p>
          ) : null}
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="section-shell grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div>
          {/* Mục lục */}
          {headings.length ? (
            <nav className="mb-8 rounded-xl border border-border bg-secondary/50 p-5 shadow-card" aria-label="Mục lục">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nội dung chính
              </h2>
              <ol className="mt-3 space-y-2">
                {headings.map((heading, index) => (
                  <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                    <a
                      href={`#${heading.id}`}
                      className="text-sm text-foreground/80 hover:text-primary transition-colors flex items-start gap-2"
                    >
                      <span className="font-semibold text-primary">{index + 1}.</span>
                      <span>{heading.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          {/* Article Body */}
          <article
            className="prose-content max-w-none text-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          {/* Cam kết & Giá trị iName mang lại */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h3 className="font-display text-xl font-bold text-foreground">
              Cam kết của iName khi phụ trách {article.title}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-emerald-600">✓</span>
                <span><strong>Bảo mật thông tin tài chính:</strong> Số liệu kế toán chỉ dùng để làm sổ và kê khai, có cam kết bảo mật bằng văn bản.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-emerald-600">✓</span>
                <span><strong>Chứng từ chính xác:</strong> Đối chiếu hóa đơn và dữ liệu trước khi nộp, hạn chế sai sót làm phát sinh phạt.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-emerald-600">✓</span>
                <span><strong>Bàn giao sổ sách mỗi tháng:</strong> Hồ sơ được trả đầy đủ theo kỳ, doanh nghiệp không bị giữ chứng từ.</span>
              </li>
            </ul>
          </div>

          {/* Call to action card */}
          <div className="mt-8 rounded-2xl bg-hero-gradient p-6 text-primary-foreground sm:p-8 shadow-glow">
            <h2 className="font-display text-xl font-extrabold sm:text-2xl">
              Cần tư vấn chi tiết về {article.title}?
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/85 leading-relaxed">
              Để lại thông tin hoặc gọi ngay hotline, chuyên viên kế toán trưởng của iName sẽ liên hệ hỗ trợ bạn trong vòng 15 phút làm việc.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/lien-he"
                className="inline-flex h-11 items-center rounded-lg bg-card px-5 text-sm font-semibold text-primary shadow-card hover:bg-card/90 transition-all"
              >
                Nhận tư vấn miễn phí ngay →
              </Link>
              <a
                href={chrome.settings.hotline_href}
                className="inline-flex h-11 items-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition-all"
              >
                Hotline: {chrome.settings.hotline}
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Hotline Box */}
          <section className="rounded-xl border border-primary/20 bg-primary-soft p-5 shadow-card">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-accent">Hỗ trợ 24/7</p>
            <h3 className="mt-1 font-display font-bold text-foreground">Tư vấn Kế toán & Thuế</h3>
            <p className="mt-2 text-xs text-muted-foreground">Gọi ngay để trao đổi trực tiếp với chuyên gia kế toán:</p>
            <a
              className="mt-3 block font-display text-xl font-extrabold text-primary hover:underline"
              href={chrome.settings.hotline_href}
            >
              {chrome.settings.hotline}
            </a>
            <Link
              href="/lien-he"
              className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
            >
              Gửi yêu cầu báo giá →
            </Link>
          </section>

          {/* Danh mục dịch vụ kế toán */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold text-foreground">Dịch vụ kế toán khác</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/ke-toan/ke-toan-tron-goi" className="text-muted-foreground hover:text-primary transition-colors">
                  • Kế toán trọn gói
                </Link>
              </li>
              <li>
                <Link href="/ke-toan/bao-cao-thue-dinh-ky" className="text-muted-foreground hover:text-primary transition-colors">
                  • Báo cáo thuế định kỳ
                </Link>
              </li>
              <li>
                <Link href="/ke-toan/quyet-toan-thue" className="text-muted-foreground hover:text-primary transition-colors">
                  • Quyết toán thuế
                </Link>
              </li>
              <li>
                <Link href="/ke-toan/ra-soat-so-sach-truoc-thanh-tra" className="text-muted-foreground hover:text-primary transition-colors">
                  • Rà soát sổ sách trước thanh tra
                </Link>
              </li>
              <li>
                <Link href="/ke-toan/ke-toan-truong-thue-ngoai" className="text-muted-foreground hover:text-primary transition-colors">
                  • Kế toán trưởng thuê ngoài
                </Link>
              </li>
              <li>
                <Link href="/ke-toan/hoa-don-dien-tu-va-chu-ky-so" className="text-muted-foreground hover:text-primary transition-colors">
                  • Hóa đơn điện tử và chữ ký số
                </Link>
              </li>
              <li>
                <Link href="/ke-toan/tu-van-thue-phap-ly-va-bao-hiem-xa-hoi" className="text-muted-foreground hover:text-primary transition-colors">
                  • Tư vấn thuế, pháp lý & BHXH
                </Link>
              </li>
            </ul>
          </section>

          {/* Bài viết phổ biến */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold text-foreground">Kiến thức hữu ích</h3>
            <ul className="mt-3 space-y-3">
              {popular.map((item) => (
                <li key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <Link
                    href={`/tin-tuc/${item.slug}`}
                    className="text-xs font-semibold leading-relaxed text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{item.category_name}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* Related Articles */}
      {related.length ? (
        <section className="border-t border-border bg-secondary/35 py-12 lg:py-16">
          <div className="section-shell">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">Có thể bạn quan tâm</p>
            <h2 className="font-display text-2xl font-extrabold text-foreground">Dịch vụ & Bài viết liên quan</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <HoverArticleCard
                  key={item.id}
                  href={`/ke-toan/${item.slug}`}
                  title={item.title}
                  excerpt={item.excerpt}
                  coverUrl={item.cover_url}
                  coverAlt={item.cover_alt}
                  category={item.category_name || "Kế toán"}
                  cta="Xem chi tiết"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
