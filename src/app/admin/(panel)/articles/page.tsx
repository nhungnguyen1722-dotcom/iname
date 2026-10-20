import Link from "next/link";
import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { sql } from "@/lib/db";
import { CmsImage } from "@/components/site/CmsImage";

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; q?: string; status?: string; page?: string }> }) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page || 1));
  const params: unknown[] = [];
  const where = ["deleted_at IS NULL"];
  if (query.q) { params.push(`%${query.q}%`); where.push(`title ILIKE $${params.length}`); }
  if (query.status === "draft" || query.status === "published") { params.push(query.status); where.push(`status = $${params.length}`); }
  const totalRows = await sql<{ n: string }>(`SELECT COUNT(*)::text AS n FROM articles WHERE ${where.join(" AND ")}`, params);
  const total = Number(totalRows[0]?.n || 0);
  params.push(10, (page - 1) * 10);
  const articles = await sql<{ id: number; title: string; slug: string; status: string; cover_url: string | null; cover_alt: string | null }>(
    `SELECT id, title, slug, status, cover_url, cover_alt FROM articles WHERE ${where.join(" AND ")} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  const pages = Math.max(1, Math.ceil(total / 10));
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="font-display text-3xl font-extrabold">Bài viết</h1><Link className={buttonClass} href="/admin/articles/new">Tạo bài</Link></div>
      <Notice saved={query.saved} error={query.error} />
      <form className="mt-4 flex gap-2">
        <input name="q" defaultValue={query.q || ""} className={inputClass} placeholder="Tìm tiêu đề" />
        <select name="status" defaultValue={query.status || ""} className={inputClass}><option value="">Tất cả</option><option value="published">Xuất bản</option><option value="draft">Nháp</option></select>
        <button className={buttonClass}>Lọc</button>
      </form>
      <ul className="mt-4 space-y-2">
        {articles.map((article) => (
          <li key={article.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                {article.cover_url ? <CmsImage src={article.cover_url} alt={article.cover_alt || article.title} className="object-cover" sizes="64px" /> : <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">Chưa có ảnh</span>}
              </div>
              <span className="min-w-0">{article.title} <em className="text-xs text-muted-foreground">{article.status}</em></span>
            </div>
            <Link className="text-sm font-semibold text-primary" href={`/admin/articles/${article.id}`}>Sửa</Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">Trang {page}/{pages}</p>
    </div>
  );
}
