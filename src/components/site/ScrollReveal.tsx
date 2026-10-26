"use client";

import { memo, useEffect } from "react";
import { usePathname } from "next/navigation";

export const ScrollReveal = memo(function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      const revealTargets = document.querySelectorAll<HTMLElement>("main section, main > header.page-banner, main > .section-shell");
      if (!revealTargets.length) return;
      if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealTargets.forEach((target) => target.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -32px 0px", threshold: 0.04 });

      revealTargets.forEach((target) => {
        target.classList.add("scroll-reveal");
        observer?.observe(target);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
});
