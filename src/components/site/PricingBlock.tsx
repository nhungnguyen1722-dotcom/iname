"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { ConsultButton } from "./ConsultProvider";
import type { PricingPlan } from "@/lib/content";
import Link from "next/link";

const groups = [
  { key: "office", label: "Văn phòng ảo" },
  { key: "accounting", label: "Dịch vụ kế toán" },
];

const PlanCard = memo(function PlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <article className={`hover-lift relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-card ${plan.highlighted ? "border-accent/45 ring-1 ring-accent/20" : "border-border"}`}>
      {plan.badge ? <div className="absolute -top-3 left-6 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{plan.badge}</div> : null}
      <h3 className="font-display text-xl font-bold">{plan.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
      <div className="mt-5 flex items-end gap-1">
        <span className="font-display text-3xl font-extrabold">{plan.price_label}</span>
        <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2"><span className="mt-0.5 text-accent">✓</span><span>{feature}</span></li>
        ))}
      </ul>
      {plan.button_url === "#tu-van" || !plan.button_url ? (
        <ConsultButton label={plan.button_label || "Nhận tư vấn miễn phí"} className={`mt-7 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold ${plan.highlighted ? "bg-accent text-accent-foreground" : "border border-primary/25 bg-card"}`} />
      ) : (
        <Link href={plan.button_url} className="mt-7 inline-flex h-10 w-full items-center justify-center rounded-md border border-primary/25 text-sm font-semibold">{plan.button_label}</Link>
      )}
    </article>
  );
});

export const PricingBlock = memo(function PricingBlock({
  plans,
  mode,
  note,
}: {
  plans: PricingPlan[];
  mode: string;
  note?: string;
}) {
  const [active, setActive] = useState(groups[0].key);
  const plansByCategory = useMemo(() => {
    const map = new Map<string, PricingPlan[]>();
    for (const plan of plans) {
      const list = map.get(plan.category);
      if (list) list.push(plan);
      else map.set(plan.category, [plan]);
    }
    return map;
  }, [plans]);
  const selectTab = useCallback((key: string) => setActive(key), []);
  const visibleGroups = mode === "tabs" ? groups.filter((group) => group.key === active) : groups;
  return (
    <div>
      {mode === "tabs" ? (
        <div className="inline-flex rounded-md bg-card p-1 text-sm" role="tablist">
          {groups.map((group) => (
            <button key={group.key} type="button" role="tab" aria-selected={active === group.key} className={`rounded-sm px-3 py-1.5 font-medium ${active === group.key ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => selectTab(group.key)}>
              {group.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-8 space-y-12">
        {visibleGroups.map((group) => {
          const groupPlans = plansByCategory.get(group.key) ?? [];
          if (!groupPlans.length) return null;
          return (
            <div key={group.key}>
              {mode !== "tabs" ? <h3 className="font-display text-2xl font-extrabold">{group.label}</h3> : null}
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {note ? <p className="mt-8 max-w-2xl text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
});
