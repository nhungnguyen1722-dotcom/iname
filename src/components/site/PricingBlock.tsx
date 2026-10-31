"use client";

import { memo, useCallback, useMemo, useState, type CSSProperties } from "react";
import { ConsultButton } from "./ConsultProvider";
import type { PricingPlan } from "@/lib/content";
import Link from "next/link";
import { ActionLabel } from "./ActionLabel";

const groups = [
  { key: "office", label: "Văn phòng ảo", color: "#094690" },
  { key: "accounting", label: "Kế toán - Thuế", color: "#f26321" },
  { key: "technology", label: "Giải pháp Công nghệ", color: "#129ff8" },
];

const PlanCard = memo(function PlanCard({ plan, color }: { plan: PricingPlan; color: string }) {
  return (
    <article className={`pricing-plan-card hover-lift relative flex h-full min-w-0 flex-col rounded-2xl border bg-card p-6 shadow-card ${plan.highlighted ? "border-accent/45 ring-1 ring-accent/20" : "border-border"}`} style={{ "--pricing-color": color } as CSSProperties}>
      {plan.badge ? <div className="absolute -top-3 left-6 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{plan.badge}</div> : null}
      <h3 className="font-display text-xl font-bold">{plan.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
      <div className="mt-5 flex items-end gap-1">
        <span className="font-display text-3xl font-extrabold">{plan.price_label}</span>
        <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2"><span className="pricing-plan-check mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">✓</span><span>{feature}</span></li>
        ))}
      </ul>
      {plan.button_url === "#tu-van" || !plan.button_url ? (
        <ConsultButton label={plan.button_label || "Nhận tư vấn miễn phí"} className={`pricing-plan-button mt-7 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold ${plan.highlighted ? "bg-accent text-accent-foreground" : "border border-primary/25 bg-card"}`} />
      ) : (
        <Link href={plan.button_url} className="pricing-plan-button mt-7 inline-flex h-10 w-full items-center justify-center rounded-md border border-primary/25 text-sm font-semibold"><ActionLabel label={plan.button_label || "Nhận tư vấn miễn phí"} /></Link>
      )}
    </article>
  );
});

export const PricingBlock = memo(function PricingBlock({
  plans,
  mode,
  note,
  subtitles,
}: {
  plans: PricingPlan[];
  mode: string;
  note?: string;
  subtitles?: Record<string, string>;
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
  const visibleGroups = useMemo(
    () => (mode === "tabs" ? groups.filter((group) => group.key === active) : groups),
    [mode, active],
  );
  return (
    <div>
      {mode === "tabs" ? (
        <div className="flex w-full flex-wrap rounded-md bg-card p-1 text-sm sm:inline-flex sm:w-auto" role="tablist">
          {groups.map((group) => (
            <button key={group.key} type="button" role="tab" aria-selected={active === group.key} className={`rounded-sm px-2 py-1.5 font-medium transition-colors sm:px-3 ${active === group.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`} style={active === group.key ? { color: group.color } : undefined} onClick={() => selectTab(group.key)}>
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
              {mode !== "tabs" ? <><h3 className="font-display text-3xl font-extrabold">{group.label}</h3>{subtitles?.[group.key] ? <p className="mt-2 text-lg text-muted-foreground">{subtitles[group.key]}</p> : null}</> : null}
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} color={group.color} />
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
