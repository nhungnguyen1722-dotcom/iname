"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CmsImage } from "./CmsImage";
import { ConsultButton } from "./ConsultProvider";
import { ActionLabel } from "./ActionLabel";

export type HeroSlide = {
  key?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badges?: string[];
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  floats?: { title?: string; value?: string; note?: string }[];
};

export type HeroStat = { value?: string; label?: string };

const lightButton = "inline-flex h-11 items-center justify-center rounded-md bg-background px-6 text-base font-semibold text-foreground shadow-elegant hover:bg-background/90";
const ghostButton = "inline-flex h-11 items-center justify-center rounded-md border border-primary-foreground/35 bg-primary-foreground/10 px-6 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/20";

function SlideLink({ label, href, className }: { label?: string; href?: string; className: string }) {
  if (!label) return null;
  if (!href || href === "#tu-van") return <ConsultButton label={label} className={className} />;
  return <Link href={href} className={className}><ActionLabel label={label} /></Link>;
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="M15 6 9 12l6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

export const HeroSlider = memo(function HeroSlider({
  slides,
  stats,
}: {
  slides: HeroSlide[];
  stats: HeroStat[];
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef({ x: 0, y: 0 });
  const step = useCallback((delta: number) => {
    setIndex((current) => (current + delta + count) % count);
  }, [count]);
  const select = useCallback((next: number) => setIndex(next), []);
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 6500);
    return () => window.clearInterval(timer);
  }, [paused, count]);
  const slide = slides[index] || slides[0];
  const floats = useMemo(() => (slide?.floats || []).filter((item) => item.value).slice(0, 2), [slide]);
  if (!slide) return null;

  return (
    <section
      className="bg-hero-gradient relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Dịch vụ iName"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        touch.current = { x: event.touches[0]?.clientX || 0, y: event.touches[0]?.clientY || 0 };
      }}
      onTouchEnd={(event) => {
        const dx = (event.changedTouches[0]?.clientX || 0) - touch.current.x;
        const dy = (event.changedTouches[0]?.clientY || 0) - touch.current.y;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        step(dx > 0 ? -1 : 1);
      }}
    >
      <div className="bg-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="section-shell relative py-12 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-7">
            {slide.eyebrow ? <div className="inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">{slide.eyebrow}</div> : null}
            <h1 className="banner-h1 mt-5 font-extrabold text-primary-foreground">{slide.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">{slide.description}</p>
            {slide.badges?.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {slide.badges.map((badge) => (
                  <li key={badge} className="rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">✓ {badge}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SlideLink label={slide.primaryLabel} href={slide.primaryHref} className={lightButton} />
              <SlideLink label={slide.secondaryLabel} href={slide.secondaryHref} className={ghostButton} />
            </div>
            {stats.length ? (
              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-8 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl">{stat.value}</dt>
                    <dd className="text-sm text-primary-foreground/70">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <div className="relative min-w-0 lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-glow lg:aspect-[5/4]">
              <CmsImage src={slide.image} alt={slide.imageAlt || slide.title || ""} priority sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            {floats[0] ? (
              <div className="absolute -left-3 top-6 hidden w-44 rounded-xl border border-border bg-card/95 p-3 shadow-elegant lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{floats[0].title}</p>
                <p className="font-display text-lg font-extrabold text-[#094690]">{floats[0].value}</p>
                <p className="text-[11px] text-muted-foreground">{floats[0].note}</p>
              </div>
            ) : null}
            {floats[1] ? (
              <div className="absolute -right-2 bottom-6 hidden w-44 rounded-xl border border-border bg-card/95 p-3 shadow-elegant lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{floats[1].title}</p>
                <p className="font-display text-lg font-extrabold text-primary">{floats[1].value}</p>
                <p className="text-[11px] text-muted-foreground">{floats[1].note}</p>
              </div>
            ) : null}
            {count > 1 ? (
              <>
                <button type="button" className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white" onClick={() => step(-1)} aria-label="Slide trước">
                  <Arrow direction="left" />
                </button>
                <button type="button" className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white" onClick={() => step(1)} aria-label="Slide sau">
                  <Arrow direction="right" />
                </button>
              </>
            ) : null}
          </div>
        </div>
        {count > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((item, itemIndex) => (
              <button
                key={item.key || item.title || itemIndex}
                type="button"
                aria-label={`Xem slide ${itemIndex + 1}`}
                aria-current={itemIndex === index ? "true" : undefined}
                onClick={() => select(itemIndex)}
                className={`h-2.5 rounded-full transition ${itemIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
});
