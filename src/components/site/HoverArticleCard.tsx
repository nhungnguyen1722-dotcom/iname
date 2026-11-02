import { memo } from "react";
import Link from "next/link";
import { CmsImage } from "./CmsImage";

export const HoverArticleCard = memo(function HoverArticleCard({
  href,
  title,
  excerpt,
  coverUrl,
  coverAlt,
  category,
  meta,
  cta = "Đọc thêm",
  titleAs = "h3",
}: {
  href: string;
  title: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  coverAlt?: string | null;
  category?: string | null;
  meta?: string | null;
  cta?: string;
  titleAs?: "h2" | "h3";
}) {
  const Title = titleAs;
  return (
    <article className="iname-hover-card group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <Link href={href} aria-label={title} className="iname-zoom relative block aspect-[16/9] bg-secondary">
        {coverUrl ? (
          <CmsImage src={coverUrl} alt={coverAlt || title} className="object-cover" sizes="(min-width: 1024px) 30vw, 90vw" />
        ) : (
          <span className="absolute inset-0 bg-mesh" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category ? <p className="text-xs font-semibold uppercase tracking-wide text-accent">{category}</p> : null}
        <Title className="mt-2 font-display text-lg font-bold"><Link href={href}>{title}</Link></Title>
        {excerpt ? <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{excerpt}</p> : null}
        {meta ? <p className="mt-4 text-xs text-muted-foreground">{meta}</p> : null}
        <Link href={href} className="mt-3 text-sm font-semibold text-primary">{cta} →</Link>
      </div>
    </article>
  );
});
