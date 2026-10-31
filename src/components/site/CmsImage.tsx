"use client";

import Image from "next/image";
import { memo, useCallback, useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const hostname = new URL(src).hostname;
    return hostname === "cdn.enter.pro"
      || hostname.endsWith(".public.blob.vercel-storage.com")
      || hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export const CmsImage = memo(function CmsImage({ src, alt, className = "object-cover", sizes = "(min-width: 1024px) 40vw, 100vw", priority = false }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  const markFailed = useCallback(() => {
    if (src) setFailedSrc(src);
  }, [src]);
  if (!src || failed) {
    return (
      <div className="flex h-full min-h-40 w-full items-center justify-center bg-secondary px-4 text-center text-sm text-muted-foreground">
        Không tải được ảnh
      </div>
    );
  }
  const optimized = canOptimize(src);
  if (!optimized) {
    return (
      // Native img keeps CMS image URLs on other HTTPS hosts working without widening next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`h-full w-full ${className}`} onError={markFailed} />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={70}
      className={className}
      onError={markFailed}
    />
  );
});
