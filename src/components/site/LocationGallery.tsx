"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { CmsImage } from "./CmsImage";
import type { GalleryImage } from "@/lib/content";

export const LocationGallery = memo(function LocationGallery({
  title,
  images,
}: {
  title: string;
  images: GalleryImage[];
}) {
  const slides = useMemo(() => images.filter((image) => image.url).slice(0, 16), [images]);
  const thumbs = slides.slice(0, 8);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const current = slides[index] || slides[0];
  const go = useCallback((next: number) => {
    setIndex((slides.length + next) % slides.length);
  }, [slides.length]);
  if (!current) return null;

  return (
    <section className="border-y border-border bg-secondary/35 py-8 lg:py-12">
      <div className="section-shell">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-accent">Hình ảnh thực tế</p>
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Không gian tại {title}</h2>
        <button type="button" className="relative mt-6 block w-full overflow-hidden rounded-2xl bg-secondary" onClick={() => setOpen(true)} aria-label="Phóng to ảnh">
          <span className="relative block aspect-[16/8] w-full">
            <CmsImage src={current.url} alt={current.alt || title} className="object-cover" sizes="100vw" priority />
          </span>
        </button>
        {thumbs.length > 1 ? (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {thumbs.map((image, imageIndex) => (
              <button
                key={`${image.url}-${imageIndex}`}
                type="button"
                onClick={() => setIndex(imageIndex)}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${index === imageIndex ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                aria-label={`Xem ảnh ${imageIndex + 1}`}
              >
                <CmsImage src={image.url} alt={image.alt || `${title} ${imageIndex + 1}`} className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/85 p-4" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-sm font-bold" onClick={() => setOpen(false)} aria-label="Đóng">X</button>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black">
              <CmsImage src={current.url} alt={current.alt || title} className="object-contain" sizes="100vw" />
            </div>
            {slides.length > 1 ? (
              <div className="mt-3 flex justify-between">
                <button type="button" className="rounded-md bg-white px-4 py-2 text-sm font-semibold" onClick={() => go(index - 1)}>Ảnh trước</button>
                <button type="button" className="rounded-md bg-white px-4 py-2 text-sm font-semibold" onClick={() => go(index + 1)}>Ảnh sau</button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
});
