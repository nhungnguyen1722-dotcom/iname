"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CmsImage } from "./CmsImage";
import type { GalleryImage } from "@/lib/content";

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="M15 6 9 12l6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

export const LocationGallery = memo(function LocationGallery({
  title,
  images,
  bleed = false,
  showHeading = false,
  embedded = false,
}: {
  title: string;
  images: GalleryImage[];
  bleed?: boolean;
  showHeading?: boolean;
  embedded?: boolean;
}) {
  const slides = useMemo(() => images.filter((image) => image.url).slice(0, 16), [images]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const current = slides[index] || slides[0];
  const go = useCallback((next: number) => {
    if (!slides.length) return;
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, [slides.length]);
  const thumbs = useMemo(() => {
    const size = Math.min(5, slides.length);
    const start = Math.min(Math.max(0, index - 2), Math.max(0, slides.length - size));
    return slides.slice(start, start + size).map((image, offset) => ({ image, imageIndex: start + offset }));
  }, [slides, index]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, index]);
  if (!current) return null;

  const frame = (
    <div className="relative">
      <button
        type="button"
        className={`relative block w-full overflow-hidden bg-secondary ${bleed || embedded ? "" : "rounded-2xl shadow-card"} ${embedded ? "rounded-2xl shadow-card" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Phóng to ảnh"
      >
        <span className={`relative block w-full ${embedded ? "aspect-[4/3] rounded-2xl" : bleed ? "aspect-[16/10] sm:aspect-[21/9]" : "aspect-[16/10] rounded-2xl sm:aspect-[21/9]"}`}>
          <CmsImage
            src={current.url}
            alt={current.alt || title}
            className="object-cover"
            sizes={embedded ? "(min-width: 1024px) 50vw, 100vw" : bleed ? "100vw" : "(min-width: 1280px) 1152px, 100vw"}
            priority
          />
        </span>
      </button>
      {slides.length > 1 ? (
        <>
          <button type="button" className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white" onClick={() => go(index - 1)} aria-label="Ảnh trước">
            <Arrow direction="left" />
          </button>
          <button type="button" className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white" onClick={() => go(index + 1)} aria-label="Ảnh sau">
            <Arrow direction="right" />
          </button>
        </>
      ) : null}
    </div>
  );

  const thumbRow = thumbs.length > 1 ? (
    <div className={`grid grid-cols-5 gap-2 ${embedded ? "mt-3" : "mt-3"}`}>
      {thumbs.map(({ image, imageIndex }) => (
        <button
          key={`${image.url}-${imageIndex}`}
          type="button"
          onClick={() => setIndex(imageIndex)}
          className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition ${
            index === imageIndex ? "border-primary ring-2 ring-primary/30" : "border-border opacity-75 hover:opacity-100"
          }`}
          aria-label={`Xem ảnh ${imageIndex + 1}`}
        >
          <CmsImage src={image.url} alt={image.alt || `${title} ${imageIndex + 1}`} className="object-cover" sizes="120px" />
        </button>
      ))}
    </div>
  ) : null;

  const lightbox = open ? (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/85 p-3 sm:p-4" onClick={() => setOpen(false)}>
      <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black">
          <CmsImage src={current.url} alt={current.alt || title} className="object-contain" sizes="100vw" />
          <button type="button" className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-[#094690] text-lg font-bold text-white shadow transition hover:bg-[#094690]/90" onClick={() => setOpen(false)} aria-label="Đóng">×</button>
          {slides.length > 1 ? (
            <>
              <button type="button" className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow transition hover:bg-slate-100" onClick={() => go(index - 1)} aria-label="Ảnh trước">
                <Arrow direction="left" />
              </button>
              <button type="button" className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow transition hover:bg-slate-100" onClick={() => go(index + 1)} aria-label="Ảnh sau">
                <Arrow direction="right" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  if (embedded) {
    return (
      <div className="min-w-0">
        {frame}
        {thumbRow}
        {lightbox}
      </div>
    );
  }

  return (
    <section className={bleed ? "bg-secondary/35" : "border-y border-border bg-secondary/35 py-6 lg:py-8"}>
      {bleed ? (
        <>
          {frame}
          {thumbRow ? <div className="section-shell">{thumbRow}</div> : null}
        </>
      ) : (
        <div className="section-shell">
          {showHeading ? (
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">Hình ảnh thực tế</p>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Không gian tại {title}</h2>
            </div>
          ) : null}
          {frame}
          {thumbRow}
        </div>
      )}
      {lightbox}
    </section>
  );
});
