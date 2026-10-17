import Link from "next/link";
import { Notice, buttonClass } from "@/components/admin/AdminShell";
import { getPricingPlans } from "@/lib/content";

export default async function PricingAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const plans = await getPricingPlans(false);
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="font-display text-3xl font-extrabold">Bảng giá</h1><Link className={buttonClass} href="/admin/pricing/new">Tạo gói</Link></div>
      <Notice saved={query.saved} error={query.error} />
      <ul className="mt-6 space-y-3">
        {plans.map((plan) => (
          <li key={plan.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div><p className="font-semibold">{plan.name}</p><p className="text-sm text-muted-foreground">{plan.price_label} {plan.period} · {plan.visible ? "Hiện" : "Ẩn"}</p></div>
            <Link className="text-sm font-semibold text-primary" href={`/admin/pricing/${plan.id}`}>Sửa</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

