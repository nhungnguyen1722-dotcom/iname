import { notFound } from "next/navigation";
import { buttonClass, inputClass } from "@/components/admin/AdminShell";
import { deleteService, saveService } from "@/server/admin";
import { getMediaAssets } from "@/lib/content";
import { sql } from "@/lib/db";
import { ImageField } from "./ImageField";

export async function ServiceEditor({ id }: { id: number | null }) {
  const media = await getMediaAssets();
  const rows = id
    ? await sql<{ id: number; name: string; slug: string; summary: string | null; description: string | null; image_url: string | null; image_alt: string | null; button_label: string | null; button_url: string | null; category: string; visible: boolean; sort_order: number }>(
        "SELECT id, name, slug, summary, description, image_url, image_alt, button_label, button_url, category, visible, sort_order FROM services WHERE id = $1 AND deleted_at IS NULL",
        [id],
      )
    : [];
  const service = rows[0];
  if (id && !service) notFound();
  return (
    <form action={saveService} className="mt-6 max-w-2xl space-y-3 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="id" value={service?.id || ""} />
      <input name="name" defaultValue={service?.name || ""} className={inputClass} placeholder="Tên" required />
      <input name="slug" defaultValue={service?.slug || ""} className={inputClass} placeholder="Slug" />
      <textarea name="summary" defaultValue={service?.summary || ""} className={inputClass} rows={3} />
      <textarea name="description" defaultValue={service?.description || ""} className={inputClass} rows={4} />
      <ImageField name="imageUrl" uploadName="service_image_file" value={service?.image_url || ""} media={media} label="Ảnh dịch vụ" />
      <input name="imageAlt" defaultValue={service?.image_alt || ""} className={inputClass} placeholder="Văn bản thay thế" />
      <input name="buttonLabel" defaultValue={service?.button_label || ""} className={inputClass} />
      <input name="buttonUrl" defaultValue={service?.button_url || ""} className={inputClass} />
      <select name="category" defaultValue={service?.category || "office"} className={inputClass}>
        <option value="office">Văn phòng ảo</option>
        <option value="accounting">Kế toán</option>
      </select>
      <input name="sortOrder" type="number" defaultValue={service?.sort_order || 0} className={inputClass} />
      <label className="text-sm"><input type="checkbox" name="visible" defaultChecked={service?.visible ?? true} /> Hiển thị</label>
      <button className={buttonClass}>Lưu dịch vụ</button>
      {service ? <button className="ml-2 text-sm text-destructive" formAction={deleteService}>Xóa mềm</button> : null}
    </form>
  );
}
