"use client";

import { memo, useEffect } from "react";
import { usePathname } from "next/navigation";

export const ScrollReveal = memo(function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll<HTMLElement>("main section");
      if (!sections.length) return;
      if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sections.forEach((section) => section.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -32px 0px", threshold: 0.04 });

      sections.forEach((section) => {
        section.classList.add("scroll-reveal");
        observer?.observe(section);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
});
