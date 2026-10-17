import Link from "next/link";
import { Notice } from "@/components/admin/AdminShell";
import { sql } from "@/lib/db";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const [pages, sections, published, drafts, services, plans, requests, audits] = await Promise.all([
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM pages WHERE deleted_at IS NULL"),
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM page_sections WHERE deleted_at IS NULL"),
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM articles WHERE deleted_at IS NULL AND status = 'published'"),
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM articles WHERE deleted_at IS NULL AND status <> 'published'"),
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM services WHERE deleted_at IS NULL"),
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM pricing_plans WHERE deleted_at IS NULL"),
    sql<{ n: string }>("SELECT COUNT(*)::text AS n FROM contact_requests WHERE status = 'new'"),
    sql<{ id: number; action: string; entity: string; created_at: string }>(
      "SELECT id, action, entity, created_at::text FROM audit_logs ORDER BY id DESC LIMIT 8",
    ),
  ]);
  const cards = [
    ["Trang", pages[0]?.n, "/admin/pages"],
    ["Section", sections[0]?.n, "/admin/pages"],
    ["Bài đã xuất bản", published[0]?.n, "/admin/articles"],
    ["Bài nháp", drafts[0]?.n, "/admin/articles"],
    ["Dịch vụ", services[0]?.n, "/admin/services"],
    ["Gói giá", plans[0]?.n, "/admin/pricing"],
    ["Yêu cầu mới", requests[0]?.n, "/admin/contact-requests"],
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Tổng quan</h1>
      <Notice saved={query.saved} error={query.error} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{value || "0"}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-xl font-bold">Thao tác gần đây</h2>
        {audits.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Chưa có nhật ký.</p> : null}
        <ul className="mt-3 space-y-2 text-sm">
          {audits.map((item) => (
            <li key={item.id}>{new Date(item.created_at).toLocaleString("vi-VN")} — {item.action} {item.entity}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
