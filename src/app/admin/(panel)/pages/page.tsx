import Link from "next/link";
import { Notice } from "@/components/admin/AdminShell";
import { sql } from "@/lib/db";

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const pages = await sql<{ id: number; slug: string; title: string; path: string; status: string; updated_at: string }>(
    `SELECT p.id, p.slug, p.title, p.path, p.status, p.updated_at::text
     FROM pages p WHERE p.deleted_at IS NULL ORDER BY p.sort_order, p.id`,
  );
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Trang</h1>
      <Notice saved={query.saved} error={query.error} />
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/70 text-left">
            <tr>
              <th className="px-4 py-3">Tên</th><th>URL</th><th>Trạng thái</th><th>Cập nhật</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{page.title}</td>
                <td>{page.path}</td>
                <td>{page.status === "published" ? "Xuất bản" : "Nháp"}</td>
                <td>{new Date(page.updated_at).toLocaleString("vi-VN")}</td>
                <td className="space-x-3 px-4 py-3">
                  <Link className="font-semibold text-primary" href={`/admin/pages/${page.slug}`}>Sửa</Link>
                  <Link className="font-semibold text-primary" href={`${page.path}?preview=1`}>Xem trước</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
