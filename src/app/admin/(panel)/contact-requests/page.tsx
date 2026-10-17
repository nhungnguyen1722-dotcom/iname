import Link from "next/link";
import { buttonClass, inputClass } from "@/components/admin/AdminShell";
import { sql } from "@/lib/db";

export default async function ContactsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page || 1));
  const params: unknown[] = [];
  const where = ["TRUE"];
  if (query.q) { params.push(`%${query.q}%`); where.push(`(full_name ILIKE $${params.length} OR phone ILIKE $${params.length} OR COALESCE(email,'') ILIKE $${params.length})`); }
  if (query.status) { params.push(query.status); where.push(`status = $${params.length}`); }
  params.push(20, (page - 1) * 20);
  const rows = await sql<{ id: number; full_name: string; phone: string; email: string | null; service: string | null; status: string; created_at: string }>(
    `SELECT id, full_name, phone, email, service, status, created_at::text FROM contact_requests WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Yêu cầu liên hệ</h1>
      <form className="mt-4 flex gap-2">
        <input name="q" defaultValue={query.q || ""} className={inputClass} placeholder="Tìm tên, điện thoại, email" />
        <select name="status" defaultValue={query.status || ""} className={inputClass}><option value="">Tất cả</option><option value="new">Mới</option><option value="contacted">Đã liên hệ</option><option value="won">Đã chốt</option><option value="lost">Không phù hợp</option></select>
        <button className={buttonClass}>Lọc</button>
      </form>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border bg-card p-4">
            <Link href={`/admin/contact-requests/${row.id}`} className="font-semibold text-primary">{row.full_name}</Link>
            <p className="text-sm text-muted-foreground">{row.phone} · {row.email || "Không email"} · {row.service} · {row.status} · {new Date(row.created_at).toLocaleString("vi-VN")}</p>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-sm text-muted-foreground">Chưa có yêu cầu.</li> : null}
      </ul>
    </div>
  );
}

