import { notFound } from "next/navigation";
import { buttonClass, inputClass } from "@/components/admin/AdminShell";
import { deleteArticle, saveArticle } from "@/server/admin";
import { getCategories } from "@/lib/content";
import { sql } from "@/lib/db";

export async function ArticleForm({ id }: { id: string }) {
  const categories = await getCategories();
  const rows = id === "new" ? [] : await sql<{ id: number; category_id: number | null; title: string; slug: string; excerpt: string | null; content: string | null; cover_url: string | null; cover_alt: string | null; seo_title: string | null; seo_description: string | null; status: string; read_minutes: number | null }>(
    "SELECT id, category_id, title, slug, excerpt, content, cover_url, cover_alt, seo_title, seo_description, status, read_minutes FROM articles WHERE id = $1 AND deleted_at IS NULL",
    [Number(id)],
  );
  const article = rows[0];
  if (id !== "new" && !article) notFound();
  return (
    <form action={saveArticle} className="mt-6 max-w-3xl space-y-3 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="id" value={article?.id || ""} />
      <input name="title" required defaultValue={article?.title || ""} className={inputClass} placeholder="Tiêu đề" />
      <input name="slug" defaultValue={article?.slug || ""} className={inputClass} placeholder="Slug" />
      <select name="categoryId" defaultValue={article?.category_id || ""} className={inputClass}>
        <option value="">Không chuyên mục</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <textarea name="excerpt" defaultValue={article?.excerpt || ""} className={inputClass} rows={3} />
      <textarea name="content" defaultValue={article?.content || ""} className={inputClass} rows={12} />
      <input name="coverUrl" defaultValue={article?.cover_url || ""} className={inputClass} placeholder="Ảnh đại diện" />
      <input name="coverAlt" defaultValue={article?.cover_alt || ""} className={inputClass} />
      <input name="seoTitle" defaultValue={article?.seo_title || ""} className={inputClass} placeholder="SEO title" />
      <textarea name="seoDescription" defaultValue={article?.seo_description || ""} className={inputClass} />
      <input name="readMinutes" type="number" defaultValue={article?.read_minutes || 5} className={inputClass} />
      <select name="status" defaultValue={article?.status || "draft"} className={inputClass}><option value="draft">Nháp</option><option value="published">Xuất bản</option></select>
      <div><button className={buttonClass}>Lưu bài viết</button>{article ? <button className="ml-3 text-sm text-destructive" formAction={deleteArticle}>Xóa mềm</button> : null}</div>
    </form>
  );
}
