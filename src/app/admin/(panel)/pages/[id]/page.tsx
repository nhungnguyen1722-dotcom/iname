import { Notice, inputClass, buttonClass } from "@/components/admin/AdminShell";
import { savePage } from "@/server/admin";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const rows = await sql<{ id: number; title: string; path: string; slug: string; seo_title: string | null; seo_description: string | null; og_image: string | null; is_system: boolean }>(
    "SELECT id, title, path, slug, seo_title, seo_description, og_image, is_system FROM pages WHERE id = $1 AND deleted_at IS NULL",
    [Number(id)],
  );
  const page = rows[0];
  if (!page) notFound();
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Sửa trang</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={savePage} className="mt-6 max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="id" value={page.id} />
        <label className="block text-sm font-semibold">Tên trang<input name="title" defaultValue={page.title} className={inputClass} /></label>
        <p className="text-sm text-muted-foreground">URL hệ thống: {page.path}. Slug `{page.slug}` được giữ cố định để không làm gãy điều hướng.</p>
        <label className="block text-sm font-semibold">SEO title<input name="seoTitle" defaultValue={page.seo_title || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Meta description<textarea name="seoDescription" defaultValue={page.seo_description || ""} className={inputClass} rows={4} /></label>
        <label className="block text-sm font-semibold">Ảnh chia sẻ (HTTPS)<input name="ogImage" defaultValue={page.og_image || ""} className={inputClass} /></label>
        <button className={buttonClass} type="submit">Lưu trang</button>
      </form>
    </div>
  );
}
