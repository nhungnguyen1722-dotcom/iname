"use client";

import { memo, useCallback, useRef, useState } from "react";

type Review = { quote?: string; author?: string; company?: string; avatar?: string; rating?: number };

export const TestimonialCarousel = memo(function TestimonialCarousel({ items }: { items: Review[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const move = useCallback((direction: number) => {
    const node = track.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-review]");
    node.scrollBy({ left: direction * ((card?.offsetWidth || node.clientWidth) + 20), behavior: "smooth" });
    setActive((current) => Math.min(items.length - 1, Math.max(0, current + direction)));
  }, [items.length]);
  const scrollTo = useCallback((index: number) => {
    const node = track.current;
    const card = node?.querySelector<HTMLElement>(`[data-review="${index}"]`);
    if (node && card) {
      node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: "smooth" });
      setActive(index);
    }
  }, []);
  const updateActive = useCallback(() => {
    const node = track.current;
    const card = node?.querySelector<HTMLElement>("[data-review]");
    if (!node || !card) return;
    setActive(Math.min(items.length - 1, Math.round(node.scrollLeft / (card.offsetWidth + 20))));
  }, [items.length]);

  return (
    <>
      <div ref={track} onScroll={updateActive} className="testimonial-track mt-9 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2">
        {items.map((item, index) => {
          const initials = item.avatar || item.author?.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase() || "IN";
          const rating = Math.min(5, Math.max(0, Number(item.rating ?? 5)));
          return (
            <figure data-review={index} key={`${item.author}-${index}`} className="flex w-full shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 shadow-card md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-extrabold leading-none text-primary-soft" aria-hidden="true">“</span>
                <span className="text-sm tracking-[0.16em] text-amber-500" aria-label={`${rating} trên 5 sao`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
              </div>
              <blockquote className="mt-3 min-h-24 flex-1 text-sm leading-relaxed">“{item.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-gradient text-sm font-bold text-primary-foreground">{initials}</span>
                <span className="min-w-0 text-sm"><span className="block font-bold">{item.author}</span><span className="block truncate text-xs text-muted-foreground">{item.company}</span></span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      {items.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button type="button" onClick={() => move(-1)} className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-lg shadow-card" aria-label="Đánh giá trước">‹</button>
          <div className="flex items-center gap-2" aria-label="Chọn đánh giá">
            {items.map((item, index) => <button key={`${item.author}-dot-${index}`} type="button" onClick={() => scrollTo(index)} className={`h-2 rounded-full transition ${active === index ? "w-5 bg-primary" : "w-2 bg-primary/15 hover:bg-primary/60"}`} aria-current={active === index ? "true" : undefined} aria-label={`Đến đánh giá ${index + 1}`} />)}
          </div>
          <button type="button" onClick={() => move(1)} className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-lg shadow-card" aria-label="Đánh giá tiếp theo">›</button>
        </div>
      ) : null}
    </>
  );
});
