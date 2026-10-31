import { redirect } from "next/navigation";
import { Notice, inputClass, buttonClass } from "@/components/admin/AdminShell";
import { SectionManager } from "@/components/admin/SectionManager";
import { savePage, createSection } from "@/server/admin";
import { findAdminPage } from "@/lib/admin-pages";
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
  const page = await findAdminPage(id);
  if (!page) notFound();
  if (/^\d+$/.test(id) && page.slug !== id) redirect(`/admin/pages/${page.slug}`);
  const sections = await sql<{ id: number; admin_name: string; section_type: string; visible: boolean; status: string }>(
    "SELECT id, admin_name, section_type, visible, status FROM page_sections WHERE page_id = $1 AND deleted_at IS NULL ORDER BY sort_order, id",
    [page.id],
  );
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

      <section id="phan-section" className="mt-10">
        <h2 className="font-display text-2xl font-extrabold">Section — {page.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Kéo thả để đổi vị trí, bật hoặc tắt từng section, rồi bấm Lưu thứ tự.</p>
        <div className="mt-5">
          <SectionManager key={sections.map((section) => `${section.id}:${section.visible}:${section.status}:${section.admin_name}`).join(",")} pageSlug={page.slug} sections={sections} />
        </div>
        <form action={createSection} className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end">
          <input type="hidden" name="pageId" value={page.id} />
          <label className="text-sm font-semibold">Loại Section mới
            <select name="sectionType" className={inputClass}>
              {["hero", "page-hero", "media", "gallery", "cards", "pillars", "steps", "pricing", "faq", "cta", "team", "stats", "comparison", "testimonials", "addons", "notes", "technology-stack", "articles", "contact"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <button className={buttonClass} type="submit">Tạo Section</button>
        </form>
      </section>
    </div>
  );
}
