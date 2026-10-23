import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { findAdminPage } from "@/lib/admin-pages";
import { Notice, buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/AdminShell";
import { saveSection } from "@/server/admin";
import { parseJson, sql } from "@/lib/db";
import { getMediaAssets } from "@/lib/content";
import { ImageField } from "@/components/admin/ImageField";
import { CmsImage } from "@/components/site/CmsImage";
import { iconOptions } from "@/components/site/IconMark";

type Item = Record<string, unknown>;

export default async function SectionEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sectionId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id, sectionId } = await params;
  const query = await searchParams;
  const page = await findAdminPage(id);
  if (!page) notFound();
  if (/^\d+$/.test(id) && page.slug !== id) redirect(`/admin/pages/${page.slug}/sections/${sectionId}`);
  const rows = await sql<{
    id: number; page_id: number; section_type: string; admin_name: string; eyebrow: string | null; title: string | null;
    subtitle: string | null; description: string | null; image_url: string | null; image_alt: string | null;
    button_label: string | null; button_url: string | null; secondary_button_label: string | null; secondary_button_url: string | null;
    items_json: string | null; gallery_json: string | null; config_json: string | null; visible: boolean; status: string;
  }>(
    `SELECT id, page_id, section_type, admin_name, eyebrow, title, subtitle, description, image_url, image_alt,
            button_label, button_url, secondary_button_label, secondary_button_url, items_json, gallery_json, config_json, visible, status
     FROM page_sections WHERE id = $1 AND page_id = $2 AND deleted_at IS NULL`,
    [Number(sectionId), page.id],
  );
  const section = rows[0];
  if (!section) notFound();
  const items = parseJson<Item[]>(section.items_json, []);
  const gallery = parseJson<{ url: string; alt: string; caption?: string }[]>(section.gallery_json, []);
  const config = parseJson<Record<string, unknown>>(section.config_json, {});
  const media = await getMediaAssets();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-3 sm:p-6" role="presentation">
      <Link href={`/admin/pages/${page.slug}#phan-section`} aria-label="Đóng cửa sổ chỉnh sửa" className="absolute inset-0" />
      <section role="dialog" aria-modal="true" aria-labelledby="section-editor-title" className="relative z-10 max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-elegant sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 id="section-editor-title" className="font-display text-2xl font-extrabold">{section.admin_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Loại: {section.section_type}. Ảnh và nội dung được lưu trong PostgreSQL.</p>
          </div>
          <Link href={`/admin/pages/${page.slug}#phan-section`} className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-semibold">Đóng</Link>
        </div>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveSection} className="mt-5 space-y-4 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="item_count" value={items.length} />
        <input type="hidden" name="gallery_count" value={gallery.length} />
        <label className="block text-sm font-semibold">Tên trong quản trị<input name="adminName" defaultValue={section.admin_name} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Nhãn nhỏ<input name="eyebrow" defaultValue={section.eyebrow || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Tiêu đề<input name="title" defaultValue={section.title || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Tiêu đề phụ<input name="subtitle" defaultValue={section.subtitle || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Mô tả<textarea name="description" defaultValue={section.description || ""} rows={4} className={inputClass} /></label>
        <ImageField name="imageUrl" value={section.image_url || ""} media={media} label="Ảnh banner / ảnh chính" />
        <label className="block text-sm font-semibold">Văn bản thay thế<input name="imageAlt" defaultValue={section.image_alt || ""} className={inputClass} /></label>
        {section.section_type === "page-hero" ? <label className="block text-sm font-semibold">Biểu tượng banner<select name="configIcon" defaultValue={String(config.icon || "building")} className={inputClass}>{iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label> : null}
        {section.section_type === "pricing" ? <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Phụ đề Văn phòng ảo<input name="officeSubtitle" defaultValue={String(config.officeSubtitle || "")} className={inputClass} /></label><label className="text-sm font-semibold">Phụ đề Dịch vụ kế toán<input name="accountingSubtitle" defaultValue={String(config.accountingSubtitle || "")} className={inputClass} /></label></div> : null}
        {section.section_type === "technology-stack" ? <div className="space-y-3 rounded-lg border border-border p-4"><label className="block text-sm font-semibold">Tiêu đề ưu điểm<input name="benefitsTitle" defaultValue={String(config.benefitsTitle || "")} className={inputClass} /></label><label className="block text-sm font-semibold">Ưu điểm<textarea name="benefits" defaultValue={Array.isArray(config.benefits) ? config.benefits.map(String).join("\n") : ""} rows={4} className={inputClass} placeholder="Mỗi dòng một ưu điểm" /></label></div> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Nút chính<input name="buttonLabel" defaultValue={section.button_label || ""} className={inputClass} /></label>
          <label className="text-sm font-semibold">URL nút chính<input name="buttonUrl" defaultValue={section.button_url || ""} className={inputClass} /></label>
          <label className="text-sm font-semibold">Nút phụ<input name="secondaryButtonLabel" defaultValue={section.secondary_button_label || ""} className={inputClass} /></label>
          <label className="text-sm font-semibold">URL nút phụ<input name="secondaryButtonUrl" defaultValue={section.secondary_button_url || ""} className={inputClass} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked={section.visible} /> Hiển thị</label>
        <label className="block text-sm font-semibold">Trạng thái
          <select name="status" defaultValue={section.status} className={inputClass}>
            <option value="published">Xuất bản</option>
            <option value="draft">Nháp</option>
          </select>
        </label>
        <ItemFields type={section.section_type} items={items} />
        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-bold">Thư viện ảnh</legend>
          {gallery.map((image, index) => (
            <div key={`${image.url}-${index}`} className="grid gap-2 rounded-lg bg-secondary/50 p-3">
              {image.url ? <span className="relative block h-32 w-full overflow-hidden rounded-md bg-background"><CmsImage src={image.url} alt={image.alt || ""} className="object-contain" sizes="480px" /></span> : null}
              <ImageField name={`gallery_url_${index}`} uploadName={`gallery_file_${index}`} value={image.url} media={media} label="Ảnh" />
              <input name={`gallery_alt_${index}`} defaultValue={image.alt} className={inputClass} placeholder="Văn bản thay thế" />
              <input name={`gallery_caption_${index}`} defaultValue={image.caption || ""} className={inputClass} placeholder="Chú thích" />
              <div className="flex gap-2">
                <button className={secondaryButtonClass} name="intent" value={`move-gallery:${index}:-1`} type="submit">Lên</button>
                <button className={secondaryButtonClass} name="intent" value={`move-gallery:${index}:1`} type="submit">Xuống</button>
                <button className={secondaryButtonClass} name="intent" value={`remove-gallery:${index}`} type="submit">Xóa ảnh</button>
              </div>
            </div>
          ))}
          <ImageField name="new_gallery_url" uploadName="new_gallery_file" media={media} label="Ảnh mới" />
          <input name="new_gallery_alt" className={inputClass} placeholder="Văn bản thay thế" />
          <input name="new_gallery_caption" className={inputClass} placeholder="Chú thích" />
          <button className={secondaryButtonClass} name="intent" value="add-gallery" type="submit">Thêm ảnh</button>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button className={buttonClass} name="intent" value="save" type="submit">Lưu</button>
          <button className={buttonClass} name="intent" value="publish" type="submit">Xuất bản</button>
          <button className={secondaryButtonClass} name="intent" value="draft" type="submit">Lưu nháp</button>
        </div>
      </form>
      </section>
    </div>
  );
}

function ItemFields({ type, items }: { type: string; items: Item[] }) {
  if (!["faq", "cards", "pillars", "steps", "team", "testimonials", "stats", "comparison", "addons", "notes", "hero", "page-hero", "media", "technology-stack"].includes(type)) {
    return null;
  }
  return (
    <fieldset className="space-y-3 rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-bold">Các mục trong Section</legend>
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-lg bg-secondary/40 p-3">
          {type === "faq" ? (
            <>
              <textarea name={`item_question_${index}`} defaultValue={String(item.question || "")} className={inputClass} rows={2} />
              <textarea name={`item_answer_${index}`} defaultValue={String(item.answer || "")} className={inputClass} rows={3} />
            </>
          ) : null}
          {type === "team" ? (
            <>
              <input name={`item_name_${index}`} defaultValue={String(item.name || "")} className={inputClass} placeholder="Tên" />
              <input name={`item_role_${index}`} defaultValue={String(item.role || "")} className={inputClass} placeholder="Vai trò" />
              <input name={`item_initials_${index}`} defaultValue={String(item.initials || "")} className={inputClass} placeholder="Chữ viết tắt" />
              <textarea name={`item_credential_${index}`} defaultValue={String(item.credential || "")} className={inputClass} />
            </>
          ) : null}
          {type === "testimonials" ? (
            <>
              <textarea name={`item_quote_${index}`} defaultValue={String(item.quote || "")} className={inputClass} />
              <input name={`item_author_${index}`} defaultValue={String(item.author || "")} className={inputClass} />
              <input name={`item_company_${index}`} defaultValue={String(item.company || "")} className={inputClass} />
              <input name={`item_avatar_${index}`} defaultValue={String(item.avatar || "")} className={inputClass} placeholder="Chữ viết tắt avatar" />
              <label className="block text-sm font-semibold">Số sao<select name={`item_rating_${index}`} defaultValue={String(item.rating || 5)} className={inputClass}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}</select></label>
            </>
          ) : null}
          {type === "stats" ? (
            <>
              <input name={`item_value_${index}`} defaultValue={String(item.value || "")} className={inputClass} />
              <input name={`item_label_${index}`} defaultValue={String(item.label || "")} className={inputClass} />
            </>
          ) : null}
          {type === "comparison" ? (
            <>
              <input name={`item_label_${index}`} defaultValue={String(item.label || "")} className={inputClass} />
              {(Array.isArray(item.values) ? item.values : ["", "", ""]).map((value, col) => (
                <input key={col} name={`item_value_${index}_${col}`} defaultValue={String(value || "")} className={inputClass} />
              ))}
            </>
          ) : null}
          {type === "addons" ? (
            <>
              <input name={`item_name_${index}`} defaultValue={String(item.name || "")} className={inputClass} />
              <input name={`item_price_${index}`} defaultValue={String(item.price || "")} className={inputClass} />
            </>
          ) : null}
          {type === "technology-stack" ? (
            <>
              <input name={`item_name_${index}`} defaultValue={String(item.name || "")} className={inputClass} placeholder="Tên công nghệ" />
              <input name={`item_mark_${index}`} defaultValue={String(item.mark || "")} className={inputClass} placeholder="Ký hiệu logo" />
              <input name={`item_color_${index}`} defaultValue={String(item.color || "#094690")} className={inputClass} placeholder="Màu logo" />
            </>
          ) : null}
          {type === "notes" || type === "hero" || type === "page-hero" ? (
            <>
              <input name={`item_label_${index}`} defaultValue={String(item.label || "")} className={inputClass} />
              <textarea name={`item_text_${index}`} defaultValue={String(item.text || "")} className={inputClass} />
            </>
          ) : null}
          {["cards", "steps", "media", "pillars"].includes(type) ? (
            <>
              <input name={`item_title_${index}`} defaultValue={String(item.title || "")} className={inputClass} placeholder="Tiêu đề" />
              <textarea name={`item_description_${index}`} defaultValue={String(item.description || "")} className={inputClass} />
              <label className="block text-sm font-semibold">Biểu tượng<select name={`item_icon_${index}`} defaultValue={String(item.icon || "building")} className={inputClass}>{iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label>
              {type === "pillars" ? <textarea name={`item_points_${index}`} defaultValue={Array.isArray(item.points) ? item.points.join("\n") : ""} className={inputClass} placeholder="Mỗi dòng một ý" /> : null}
              {type === "pillars" ? <input name={`item_color_${index}`} defaultValue={String(item.color || "#094690")} className={inputClass} placeholder="Màu nhận diện #094690" /> : null}
              <input name={`item_href_${index}`} defaultValue={String(item.href || "")} className={inputClass} placeholder="Liên kết" />
              <input name={`item_cta_${index}`} defaultValue={String(item.cta || "")} className={inputClass} placeholder="Nhãn nút" />
            </>
          ) : null}
          <button className={secondaryButtonClass} name="intent" value={`remove-item:${index}`} type="submit">Xóa mục</button>
        </div>
      ))}
      <button className={secondaryButtonClass} name="intent" value="add-item" type="submit">Thêm mục</button>
    </fieldset>
  );
}
