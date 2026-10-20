import Link from "next/link";
import { CmsImage } from "@/components/site/CmsImage";
import { Notice, buttonClass } from "@/components/admin/AdminShell";
import { toggleOfficeLocation } from "@/server/admin";
import { sql } from "@/lib/db";

export default async function OfficeLocationsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [query, locations] = await Promise.all([
    searchParams,
    sql<{
      id: number;
      title: string;
      slug: string;
      address: string;
      price_label: string;
      cover_url: string | null;
      cover_alt: string | null;
      status: string;
      visible: boolean;
      sort_order: number;
    }>(
      `SELECT id, title, slug, address, price_label, cover_url, cover_alt, status, visible, sort_order
       FROM office_locations WHERE deleted_at IS NULL
       ORDER BY sort_order, id`,
    ),
  ]);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Văn phòng ảo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Quản lý địa chỉ, hình ảnh, tiện ích và trạng thái hiển thị của từng địa điểm.</p>
        </div>
        <Link className={buttonClass} href="/admin/office-locations/new">Thêm địa điểm</Link>
      </div>
      <Notice saved={query.saved} error={query.error} />
      <ul className="mt-5 space-y-3">
        {locations.map((location) => (
          <li key={location.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                {location.cover_url ? <CmsImage src={location.cover_url} alt={location.cover_alt || location.title} className="object-cover" sizes="80px" /> : <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">Chưa có ảnh</span>}
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{location.title}</p>
                <p className="text-sm text-muted-foreground">{location.address}</p>
                <p className="text-xs text-muted-foreground">{location.price_label} · {location.status === "published" && location.visible ? "Đang hiển thị" : "Đang ẩn"} · Thứ tự {location.sort_order}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <form action={toggleOfficeLocation}>
                <input type="hidden" name="id" value={location.id} />
                <button className="text-sm font-semibold text-primary">{location.status === "published" && location.visible ? "Tắt hiển thị" : "Bật hiển thị"}</button>
              </form>
              <Link className="text-sm font-semibold text-primary" href={`/admin/office-locations/${location.id}`}>Sửa</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
