import Link from "next/link";
import { CmsImage } from "@/components/site/CmsImage";
import { Notice, buttonClass } from "@/components/admin/AdminShell";
import { toggleArticleStatus } from "@/server/admin";
import { sql } from "@/lib/db";

export default async function AccountingArticlesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [query, categories] = await Promise.all([
    searchParams,
    sql<{ id: number; name: string; slug: string }>(
      `SELECT id, name, slug FROM article_categories
       WHERE slug ILIKE '%ke-toan%' OR name ILIKE '%kế toán%'
       ORDER BY sort_order, id LIMIT 1`,
    ),
  ]);
  const category = categories[0];
  const articles = category
    ? await sql<{
        id: number;
        title: string;
        slug: string;
        status: string;
        cover_url: string | null;
        cover_alt: string | null;
        updated_at: string;
      }>(
        `SELECT id, title, slug, status, cover_url, cover_alt, updated_at::text AS updated_at
         FROM articles
         WHERE deleted_at IS NULL AND category_id = $1
         ORDER BY updated_at DESC, id DESC`,
        [category.id],
      )
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Bài viết kế toán</h1>
        {category ? <Link className={buttonClass} href={`/admin/articles/new?category=${category.id}`}>Tạo bài viết</Link> : null}
      </div>
      <Notice saved={query.saved} error={query.error} />
      {!category ? (
        <p className="mt-5 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Chưa có chuyên mục Kế toán. <Link className="font-semibold text-primary" href="/admin/categories">Tạo chuyên mục trước</Link> để quản lý bài viết tại đây.
        </p>
      ) : articles.length ? (
        <ul className="mt-5 space-y-3">
          {articles.map((article) => (
            <li key={article.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {article.cover_url ? <CmsImage src={article.cover_url} alt={article.cover_alt || article.title} className="object-cover" sizes="64px" /> : <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">Chưa có ảnh</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{article.title}</p>
                  <p className="text-xs text-muted-foreground">{article.slug} · {article.status === "published" ? "Đã xuất bản" : "Bản nháp"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <form action={toggleArticleStatus}>
                  <input type="hidden" name="id" value={article.id} />
                  <button className="text-sm font-semibold text-primary">{article.status === "published" ? "Tắt hiển thị" : "Xuất bản"}</button>
                </form>
                <Link className="text-sm font-semibold text-primary" href={`/admin/articles/${article.id}`}>Sửa</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Chưa có bài viết trong chuyên mục {category.name}.</p>
      )}
    </div>
  );
}
