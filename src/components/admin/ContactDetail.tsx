import { notFound } from "next/navigation";
import { buttonClass, inputClass } from "@/components/admin/AdminShell";
import { saveContactRequest } from "@/server/admin";
import { sql } from "@/lib/db";

export async function ContactDetail({ id }: { id: string }) {
  const rows = await sql<{ id: number; full_name: string; phone: string; email: string | null; company_name: string | null; service: string | null; package_name: string | null; message: string | null; status: string; internal_note: string | null; source_path: string | null; created_at: string }>(
    "SELECT id, full_name, phone, email, company_name, service, package_name, message, status, internal_note, source_path, created_at::text FROM contact_requests WHERE id = $1",
    [Number(id)],
  );
  const item = rows[0];
  if (!item) notFound();
  return (
    <div className="max-w-2xl space-y-3 rounded-xl border border-border bg-card p-5">
      <h1 className="font-display text-3xl font-extrabold">{item.full_name}</h1>
      <p>{item.phone}</p>
      <p>{item.email}</p>
      <p>{item.company_name}</p>
      <p>{item.service} · {item.package_name}</p>
      <p className="whitespace-pre-wrap">{item.message}</p>
      <p className="text-xs text-muted-foreground">Gửi từ {item.source_path} lúc {new Date(item.created_at).toLocaleString("vi-VN")}</p>
      <form action={saveContactRequest} className="space-y-3">
        <input type="hidden" name="id" value={item.id} />
        <select name="status" defaultValue={item.status} className={inputClass}><option value="new">Mới</option><option value="contacted">Đã liên hệ</option><option value="won">Đã chốt</option><option value="lost">Không phù hợp</option></select>
        <textarea name="internalNote" defaultValue={item.internal_note || ""} className={inputClass} rows={4} placeholder="Ghi chú nội bộ" />
        <button className={buttonClass}>Cập nhật</button>
      </form>
    </div>
  );
}
