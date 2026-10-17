import Link from "next/link";
import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { createSection, deleteSection, duplicateSection, moveSection } from "@/server/admin";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function SectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const pages = await sql<{ id: number; title: string; path: string }>("SELECT id, title, path FROM pages WHERE id = $1 AND deleted_at IS NULL", [Number(id)]);
  const page = pages[0];
  if (!page) notFound();
  const sections = await sql<{ id: number; admin_name: string; section_type: string; visible: boolean; status: string; sort_order: number; image_url: string | null }>(
    "SELECT id, admin_name, section_type, visible, status, sort_order, image_url FROM page_sections WHERE page_id = $1 AND deleted_at IS NULL ORDER BY sort_order, id",
    [page.id],
  );
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Section — {page.title}</h1>
      <Notice saved={query.saved} error={query.error} />
      <div className="mt-6 space-y-3">
        {sections.map((section, index) => (
          <article key={section.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{section.admin_name}</p>
              <p className="text-xs text-muted-foreground">{section.section_type} · {section.status === "published" ? "Xuất bản" : "Nháp"} · {section.visible ? "Đang hiện" : "Đang ẩn"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" href={`/admin/pages/${page.id}/sections/${section.id}`}>Sửa</Link>
              <form action={moveSection}><input type="hidden" name="id" value={section.id} /><input type="hidden" name="direction" value="-1" /><button className="rounded-md border px-3 py-2 text-sm" disabled={index === 0}>Lên</button></form>
              <form action={moveSection}><input type="hidden" name="id" value={section.id} /><input type="hidden" name="direction" value="1" /><button className="rounded-md border px-3 py-2 text-sm" disabled={index === sections.length - 1}>Xuống</button></form>
              <form action={duplicateSection}><input type="hidden" name="id" value={section.id} /><button className="rounded-md border px-3 py-2 text-sm">Sao chép</button></form>
              <form action={deleteSection}><input type="hidden" name="id" value={section.id} /><button className="rounded-md border px-3 py-2 text-sm text-destructive">Ẩn khỏi hệ thống</button></form>
            </div>
          </article>
        ))}
      </div>
      <form action={createSection} className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end">
        <input type="hidden" name="pageId" value={page.id} />
        <label className="text-sm font-semibold">Loại Section mới
          <select name="sectionType" className={inputClass}>
            {["hero", "page-hero", "media", "gallery", "cards", "pillars", "steps", "pricing", "faq", "cta", "team", "stats", "comparison", "testimonials", "addons", "notes", "articles", "contact"].map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <button className={buttonClass} type="submit">Tạo Section</button>
      </form>
    </div>
  );
}
