import { notFound } from "next/navigation";
import { buttonClass, inputClass } from "@/components/admin/AdminShell";
import { deleteArticle, saveArticle } from "@/server/admin";
import { getCategories, getMediaAssets } from "@/lib/content";
import { sql } from "@/lib/db";
import { ImageField } from "./ImageField";
import { RichTextEditor } from "./RichTextEditor";

export async function ArticleForm({ id, initialCategoryId, returnTo = "" }: { id: string; initialCategoryId?: string; returnTo?: string }) {
  const [categories, media] = await Promise.all([getCategories(), getMediaAssets()]);
  const rows = id === "new" ? [] : await sql<{ id: number; category_id: number | null; title: string; slug: string; excerpt: string | null; content: string | null; cover_url: string | null; cover_alt: string | null; seo_title: string | null; seo_description: string | null; status: string; read_minutes: number | null }>(
    "SELECT id, category_id, title, slug, excerpt, content, cover_url, cover_alt, seo_title, seo_description, status, read_minutes FROM articles WHERE id = $1 AND deleted_at IS NULL",
    [Number(id)],
  );
  const article = rows[0];
  if (id !== "new" && !article) notFound();
  return (
    <form key={article?.id ?? "new"} action={saveArticle} className="mt-6 max-w-3xl space-y-3 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="id" value={article?.id || ""} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <input name="title" required defaultValue={article?.title || ""} className={inputClass} placeholder="Tiêu đề" />
      <input name="slug" defaultValue={article?.slug || ""} className={inputClass} placeholder="Slug" />
      <select name="categoryId" defaultValue={article?.category_id || initialCategoryId || ""} className={inputClass}>
        <option value="">Không chuyên mục</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <textarea name="excerpt" defaultValue={article?.excerpt || ""} className={inputClass} rows={3} />
      <RichTextEditor name="content" label="Nội dung bài viết" defaultValue={article?.content || ""} media={media} />
      <ImageField key={`${article?.id ?? "new"}:${article?.cover_url || ""}`} name="coverUrl" uploadName="article_image_file" value={article?.cover_url || ""} media={media} label="Ảnh banner và ảnh đại diện" />
      <input name="coverAlt" defaultValue={article?.cover_alt || ""} className={inputClass} />
      <input name="seoTitle" defaultValue={article?.seo_title || ""} className={inputClass} placeholder="SEO title" />
      <textarea name="seoDescription" defaultValue={article?.seo_description || ""} className={inputClass} />
      <input name="readMinutes" type="number" defaultValue={article?.read_minutes || 5} className={inputClass} />
      <select name="status" defaultValue={article?.status || "draft"} className={inputClass}><option value="draft">Nháp</option><option value="published">Xuất bản</option></select>
      <div><button className={buttonClass}>Lưu bài viết</button>{article ? <button className="ml-3 text-sm text-destructive" formAction={deleteArticle}>Xóa mềm</button> : null}</div>
    </form>
  );
}
