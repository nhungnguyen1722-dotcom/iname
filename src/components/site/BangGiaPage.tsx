"use client";

import { memo, useCallback, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { FaqList } from "./FaqList";
import { ActionLabel } from "./ActionLabel";
import type { PricingPlan, PublicSection } from "@/lib/content";

const tabs = [
  { key: "office", label: "Văn phòng ảo", hint: "Địa chỉ đăng ký, lễ tân, phòng họp", color: "#094690" },
  { key: "accounting", label: "Kế toán - Thuế", hint: "Sổ sách minh bạch, bàn giao hồ sơ mỗi tháng", color: "#f26321" },
  { key: "technology", label: "Giải pháp Công nghệ", hint: "Website, phần mềm, AI Agent", color: "#129ff8" },
] as const;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

const PriceCard = memo(function PriceCard({ plan, color }: { plan: PricingPlan; color: string }) {
  return (
    <article
      className="iname-hover-card group flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
      style={{ "--iname-hover": color } as CSSProperties}
    >
      {plan.badge ? <p className="mb-2 text-xs font-semibold" style={{ color }}>{plan.badge}</p> : null}
      <h3 className="font-display text-xl font-bold">{plan.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{plan.summary}</p>
      <p className="mt-5 font-display text-3xl font-extrabold">{plan.price_label} <span className="text-sm font-medium text-muted-foreground">{plan.period}</span></p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
      </ul>
      <Link href="/lien-he" className="iname-cta mt-6 inline-flex h-10 items-center justify-center rounded-md text-sm font-semibold text-white" style={{ backgroundColor: color }}><ActionLabel label="Liên hệ" /></Link>
    </article>
  );
});

export const BangGiaPage = memo(function BangGiaPage({
  hero,
  plans,
  compare,
  addons,
  notes,
  faq,
  cta,
}: {
  hero?: PublicSection;
  plans: PricingPlan[];
  compare?: PublicSection;
  addons?: PublicSection;
  notes?: PublicSection;
  faq?: PublicSection;
  cta?: PublicSection;
}) {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("office");
  const select = useCallback((key: (typeof tabs)[number]["key"]) => setActive(key), []);
  const tab = tabs.find((item) => item.key === active) || tabs[0];
  const visiblePlans = useMemo(() => plans.filter((plan) => plan.category === active), [plans, active]);
  const headers = compare && Array.isArray(compare.config.headers) ? compare.config.headers.map(String) : [];

  return (
    <main className="flex-1">
      {hero ? (
        <section className="page-banner relative isolate overflow-hidden bg-primary text-primary-foreground">
          {hero.image_url ? <div className="absolute inset-0 -z-20 opacity-30" style={{ backgroundImage: `url(${hero.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-primary/90 to-primary/60" />
          <div className="section-shell py-14 sm:py-16 lg:py-20">
            {hero.eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-200">{hero.eyebrow}</p> : null}
            <h1 className="banner-h1 max-w-4xl font-extrabold">{hero.title}</h1>
            {hero.description ? <p className="mt-4 max-w-3xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">{hero.description}</p> : null}
            <div className="mt-8">
              <Link href="/lien-he" className="inline-flex h-11 items-center justify-center rounded-md bg-background px-6 text-base font-semibold text-foreground"><ActionLabel label="Liên Hệ" /></Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-shell py-12 lg:py-16">
        <div className="grid gap-3 md:grid-cols-3">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => select(item.key)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${active === item.key ? "text-white shadow-card" : "border-border bg-card text-foreground hover:bg-secondary"}`}
              style={active === item.key ? { backgroundColor: item.color, borderColor: item.color } : undefined}
            >
              <span className="block text-sm font-bold">{item.label}</span>
              <span className={`mt-1 block text-xs ${active === item.key ? "text-white/80" : "text-muted-foreground"}`}>{item.hint}</span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: tab.color }}>Bảng giá</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
            {active === "office" ? "Gói văn phòng ảo & địa chỉ đăng ký kinh doanh" : active === "accounting" ? "Gói kế toán - thuế" : "Gói giải pháp công nghệ"}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visiblePlans.length ? null : <p className="text-sm text-muted-foreground md:col-span-2 lg:col-span-3">Bảng giá mảng này đang được cập nhật. Để lại yêu cầu tại trang Liên hệ để nhận báo giá.</p>}
            {visiblePlans.map((plan) => (
              <PriceCard key={plan.id} plan={plan} color={tab.color} />
            ))}
          </div>
        </div>

        {active === "office" && compare ? (
          <div className="mt-14 overflow-x-auto rounded-2xl border border-border">
            <h3 className="px-4 pt-5 font-display text-xl font-extrabold">{compare.title}</h3>
            <table className="mt-4 w-full min-w-[640px] text-sm">
              <thead>
                <tr style={{ backgroundColor: tab.color }} className="text-white">
                  {headers.map((header) => <th key={header} className="px-4 py-3 text-left">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {compare.items.map((row, index) => (
                  <tr key={text(row.label)} className={index % 2 ? "bg-secondary/50" : "bg-card"}>
                    <td className="px-4 py-3 font-medium">{text(row.label)}</td>
                    {(Array.isArray(row.values) ? row.values : []).map((value, col) => <td key={col} className="px-4 py-3">{String(value)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {active === "office" && addons ? (
          <div className="mt-14 overflow-hidden rounded-2xl border border-border">
            <div className="px-5 py-4" style={{ backgroundColor: tab.color }}>
              <h3 className="font-display text-xl font-extrabold text-white">{addons.title}</h3>
              {addons.description ? <p className="mt-1 text-sm text-white/80">{addons.description}</p> : null}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {addons.items.map((item, index) => (
                  <tr key={text(item.name)} className={index % 2 ? "bg-secondary/40" : ""}>
                    <td className="px-5 py-3">{text(item.name)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{text(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {notes ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-bold">{notes.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {notes.items.map((item, index) => <li key={`${index}-${text(item.text) || text(item.label)}`}>• {text(item.text) || text(item.label)}</li>)}
            </ul>
          </div>
        ) : null}
      </section>

      {faq ? (
        <section className="border-y border-border bg-secondary/30">
          <div className="section-shell grid gap-10 py-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl font-extrabold">{faq.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{faq.description}</p>
            </div>
            <div className="lg:col-span-8"><FaqList items={faq.items} /></div>
          </div>
        </section>
      ) : null}

      {cta ? (
        <section className="section-shell py-12">
          <div className="rounded-2xl px-6 py-10 text-white sm:px-10" style={{ backgroundColor: tab.color }}>
            <h2 className="font-display text-2xl font-extrabold">{cta.title}</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/85">{cta.description}</p>
            <Link href="/lien-he" className="mt-6 inline-flex h-11 items-center rounded-md bg-white px-5 text-sm font-semibold text-foreground"><ActionLabel label="Liên Hệ" /></Link>
          </div>
        </section>
      ) : null}
    </main>
  );
});
