import Link from "next/link";
import { logoutAdmin } from "@/server/admin";

const links = [
  ["Tổng quan", "/admin"],
  ["Trang", "/admin/pages"],
  ["Header", "/admin/header"],
  ["Menu", "/admin/navigation"],
  ["Logo", "/admin/logo"],
  ["Footer", "/admin/footer"],
  ["Dịch vụ", "/admin/services"],
  ["Bảng giá", "/admin/pricing"],
  ["Tin tức", ""],
  ["  Bài viết", "/admin/articles"],
  ["  Chuyên mục", "/admin/categories"],
  ["Bài viết kế toán", "/admin/accounting-articles"],
  ["Văn phòng ảo", "/admin/office-locations"],
  ["Yêu cầu liên hệ", "/admin/contact-requests"],
  ["Thiết lập", "/admin/settings"],
];

export function AdminShell({
  title,
  userName,
  children,
}: {
  title: string;
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/40 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-card lg:border-b-0 lg:border-r">
        <div className="px-4 py-5">
          <p className="font-display text-lg font-extrabold text-primary">INAME CMS</p>
          <p className="text-xs text-muted-foreground">{userName}</p>
        </div>
        <nav className="flex gap-2 overflow-auto px-3 pb-4 lg:block lg:space-y-1">
          {links.map(([label, href]) => href ? (
            <Link key={href} href={href} className={`block whitespace-nowrap rounded-md py-2 text-sm font-medium hover:bg-primary-soft hover:text-primary ${label.startsWith("  ") ? "pl-6 pr-3 text-muted-foreground" : "px-3"}`}>
              {label.trim()}
            </Link>
          ) : (
            <p key={label} className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          ))}
        </nav>
        <form action={logoutAdmin} className="px-3 pb-4">
          <button className="text-sm font-semibold text-muted-foreground" type="submit">Đăng xuất</button>
        </form>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <p className="font-display text-lg font-extrabold">{title}</p>
          <Link href="/" className="text-sm font-semibold text-primary">Xem website</Link>
        </header>
        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function Notice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>;
  if (saved) return <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">Đã lưu vào PostgreSQL.</p>;
  return null;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}

export const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
export const buttonClass = "inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground";
export const secondaryButtonClass = "inline-flex h-10 items-center rounded-md border border-border bg-card px-3 text-sm font-semibold";
