import { notFound } from "next/navigation";
import { buttonClass, inputClass } from "@/components/admin/AdminShell";
import { deletePlan, savePlan } from "@/server/admin";
import { sql } from "@/lib/db";

export async function PlanForm({ id }: { id: string }) {
  const rows = id === "new" ? [] : await sql<{ id: number; name: string; slug: string; category: string; summary: string | null; price_label: string; period: string | null; features_json: string; highlighted: boolean; badge: string | null; button_label: string | null; button_url: string | null; visible: boolean; sort_order: number }>(
    "SELECT id, name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order FROM pricing_plans WHERE id = $1 AND deleted_at IS NULL",
    [Number(id)],
  );
  const plan = rows[0];
  if (id !== "new" && !plan) notFound();
  const features = plan ? JSON.parse(plan.features_json || "[]").join("\n") : "";
  return (
    <form action={savePlan} className="mt-6 max-w-2xl space-y-3 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="id" value={plan?.id || ""} />
      <input name="name" required defaultValue={plan?.name || ""} className={inputClass} placeholder="Tên gói" />
      <input name="slug" defaultValue={plan?.slug || ""} className={inputClass} placeholder="Slug" />
      <select name="category" defaultValue={plan?.category || "office"} className={inputClass}><option value="office">Văn phòng ảo</option><option value="accounting">Kế toán</option></select>
      <textarea name="summary" defaultValue={plan?.summary || ""} className={inputClass} />
      <input name="priceLabel" required defaultValue={plan?.price_label || ""} className={inputClass} placeholder="Giá" />
      <input name="period" defaultValue={plan?.period || "/tháng"} className={inputClass} />
      <textarea name="features" defaultValue={features} className={inputClass} rows={6} placeholder="Mỗi dòng một quyền lợi" />
      <input name="badge" defaultValue={plan?.badge || ""} className={inputClass} placeholder="Nhãn nổi bật" />
      <input name="buttonLabel" defaultValue={plan?.button_label || "Nhận tư vấn miễn phí"} className={inputClass} />
      <input name="buttonUrl" defaultValue={plan?.button_url || "#tu-van"} className={inputClass} />
      <input name="sortOrder" type="number" defaultValue={plan?.sort_order || 0} className={inputClass} />
      <label className="text-sm"><input type="checkbox" name="highlighted" defaultChecked={plan?.highlighted || false} /> Gói nổi bật</label>
      <label className="ml-4 text-sm"><input type="checkbox" name="visible" defaultChecked={plan?.visible ?? true} /> Hiển thị</label>
      <div><button className={buttonClass}>Lưu gói giá</button>{plan ? <button className="ml-3 text-sm text-destructive" formAction={deletePlan}>Xóa mềm</button> : null}</div>
    </form>
  );
}
