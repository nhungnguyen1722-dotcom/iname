"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { ConsultButton } from "./ConsultProvider";
import { CmsImage } from "./CmsImage";
import type { NavItem } from "@/lib/content";

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export const Header = memo(function Header({
  settings,
  navigation,
}: {
  settings: Record<string, string>;
  navigation: NavItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);
  const desktop = useMemo(() => navigation.filter((item) => item.show_desktop), [navigation]);
  const mobile = useMemo(() => navigation.filter((item) => item.show_mobile), [navigation]);
  if (settings.header_visible === "false") return null;

  return (
    <div className="sticky top-0 z-40">
      {settings.topbar_visible !== "false" ? (
        <div className="border-b border-border bg-secondary/80 text-xs text-muted-foreground">
          <div className="section-shell flex flex-wrap items-center justify-between gap-2 py-2">
            <p>Hotline: {settings.hotline} · {settings.hours_weekday_label} {settings.hours_weekday}</p>
            <a href={settings.email_href} className="hover:text-foreground">{settings.email}</a>
          </div>
        </div>
      ) : null}
      <header className="border-b border-border/70 bg-background/90 shadow-card backdrop-blur-md">
        <div className="section-shell flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="/" aria-label={settings.brand_name || "Iname"} className="flex shrink-0 items-center">
            {settings.logo_url ? (
              <span className="relative block h-10 w-10 overflow-hidden rounded-xl lg:h-11 lg:w-11">
                <CmsImage src={settings.logo_url} alt={settings.logo_alt || settings.brand_name} className="object-contain" sizes="44px" />
              </span>
            ) : (
              <span className="bg-primary-gradient flex size-10 items-center justify-center rounded-xl text-primary-foreground shadow-card lg:size-11" aria-hidden="true">
                <BuildingIcon />
              </span>
            )}
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Chính">
            {desktop.map((item) => {
              const active = isCurrent(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.open_in_new_tab ? "_blank" : undefined}
                  rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            {settings.header_show_phone !== "false" ? (
              <a href={settings.hotline_href} className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold xl:flex">
                {settings.hotline}
              </a>
            ) : null}
            <ConsultButton label={settings.header_cta_label || "Nhận tư vấn miễn phí"} className="hidden h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-card hover:bg-accent/90 sm:inline-flex" />
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/25 bg-card shadow-card lg:hidden" aria-label="Mở menu" aria-expanded={open} onClick={openMenu}>
              <span className="sr-only">Mở menu</span>
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-50 bg-foreground/40 lg:hidden" onClick={closeMenu}>
          <div className="ml-auto flex h-full w-[min(100%,20rem)] flex-col bg-card p-5 shadow-elegant" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-extrabold">{settings.brand_name}</p>
              <button type="button" className="rounded-md border border-border px-3 py-1 text-sm" onClick={closeMenu}>Đóng</button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Di động">
              {mobile.map((item) => (
                <Link key={item.id} href={item.href} className="rounded-md px-3 py-3 text-base font-semibold hover:bg-secondary" onClick={closeMenu}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <ConsultButton label={settings.header_cta_label || "Nhận tư vấn miễn phí"} className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground" />
            <a href={settings.hotline_href} className="mt-3 text-center text-sm font-semibold">{settings.hotline}</a>
          </div>
        </div>
      ) : null}
    </div>
  );
});

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 lg:size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
