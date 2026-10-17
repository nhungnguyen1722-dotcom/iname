import Link from "next/link";
import { Notice, buttonClass } from "@/components/admin/AdminShell";
import { getServices } from "@/lib/content";

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const services = await getServices(false);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Dịch vụ</h1>
        <Link href="/admin/services/new" className={buttonClass}>Tạo dịch vụ</Link>
      </div>
      <Notice saved={query.saved} error={query.error} />
      <ul className="mt-6 space-y-3">
        {services.map((service) => (
          <li key={service.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-xs text-muted-foreground">{service.category} · {service.visible ? "Hiện" : "Ẩn"}</p>
            </div>
            <Link className="text-sm font-semibold text-primary" href={`/admin/services/${service.id}`}>Sửa</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

