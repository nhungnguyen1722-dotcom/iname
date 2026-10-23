import { notFound } from "next/navigation";
import { buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/AdminShell";
import { deleteOfficeLocation, saveOfficeLocation } from "@/server/admin";
import { getMediaAssets } from "@/lib/content";
import { sql } from "@/lib/db";
import { GalleryField } from "./GalleryField";
import { ImageField } from "./ImageField";
import { RichTextEditor } from "./RichTextEditor";

type LocationRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  address: string;
  price_label: string;
  cover_url: string | null;
  cover_alt: string | null;
  banner_url: string | null;
  banner_alt: string | null;
  gallery_json: string | null;
  amenities_json: string | null;
  status: string;
  visible: boolean;
  sort_order: number;
};

export async function OfficeLocationForm({ id }: { id: string }) {
  const [media, rows] = await Promise.all([
    getMediaAssets(),
    id === "new"
      ? Promise.resolve([])
      : sql<LocationRow>(
          `SELECT id, title, slug, excerpt, content, address, price_label, cover_url, cover_alt, banner_url, banner_alt,
                  gallery_json::text AS gallery_json, amenities_json::text AS amenities_json,
                  status, visible, sort_order
           FROM office_locations WHERE id=$1 AND deleted_at IS NULL`,
          [Number(id)],
        ),
  ]);
  const location = rows[0];
  if (id !== "new" && !location) notFound();
  const gallery = location?.gallery_json ? JSON.parse(location.gallery_json) as { url: string }[] : [];
  const amenities = location?.amenities_json ? JSON.parse(location.amenities_json) as string[] : ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi"];

  return (
    <form action={saveOfficeLocation} encType="multipart/form-data" className="mt-6 max-w-3xl space-y-4 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="id" value={location?.id || ""} />
      <label className="block text-sm font-semibold">Tên địa điểm<input name="title" required defaultValue={location?.title || ""} className={inputClass} /></label>
      <label className="block text-sm font-semibold">Slug<input name="slug" defaultValue={location?.slug || ""} className={inputClass} placeholder="Tự tạo từ tên nếu để trống" /></label>
      <label className="block text-sm font-semibold">Địa chỉ đầy đủ<input name="address" required defaultValue={location?.address || ""} className={inputClass} /></label>
      <label className="block text-sm font-semibold">Mô tả ngắn<textarea name="excerpt" defaultValue={location?.excerpt || ""} rows={2} className={inputClass} /></label>
      <RichTextEditor name="content" label="Nội dung chi tiết (Vị trí, ưu thế, kết nối giao thông)" defaultValue={location?.content || ""} media={media} />
      <ImageField name="bannerUrl" uploadName="banner_file" value={location?.banner_url || ""} media={media} label="Ảnh Banner Top chi nhánh" />
      <label className="block text-sm font-semibold">Văn bản thay thế ảnh Banner<input name="bannerAlt" defaultValue={location?.banner_alt || ""} className={inputClass} /></label>
      <ImageField name="coverUrl" uploadName="cover_file" value={location?.cover_url || ""} media={media} label="Ảnh đại diện chi nhánh" />
      <label className="block text-sm font-semibold">Văn bản thay thế ảnh đại diện<input name="coverAlt" defaultValue={location?.cover_alt || ""} className={inputClass} /></label>
      <GalleryField initialValue={gallery.map((image) => image.url).join("\n")} media={media} />
      <label className="block text-sm font-semibold">Tiện ích — phân tách bằng dấu phẩy<input name="amenities" defaultValue={amenities.join(", ")} className={inputClass} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Giá hiển thị<input name="priceLabel" defaultValue={location?.price_label || "Từ 350K/tháng"} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Thứ tự<input name="sortOrder" type="number" defaultValue={location?.sort_order || 1} className={inputClass} /></label>
      </div>
      <label className="block text-sm font-semibold">Trạng thái<select name="status" defaultValue={location?.status || "draft"} className={inputClass}><option value="draft">Bản nháp</option><option value="published">Xuất bản</option></select></label>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked={location?.visible ?? false} /> Hiển thị ngoài website</label>
      <div className="flex flex-wrap gap-3">
        <button className={buttonClass}>Lưu địa điểm</button>
        {location ? <button formAction={deleteOfficeLocation} className={secondaryButtonClass}>Xóa mềm</button> : null}
      </div>
    </form>
  );
}
