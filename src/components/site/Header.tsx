"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, memo, useCallback, useMemo, useState } from "react";
import { CmsImage } from "./CmsImage";
import type { NavItem } from "@/lib/content";

function isCurrent(pathname: string, href: string) {
  if (!href || href.startsWith("#")) return false;
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => {
    setOpen(false);
    setOpenGroup(null);
  }, []);
  const visible = useMemo(
    () => navigation.filter((item) => item.visible !== false),
    [navigation],
  );
  const desktop = useMemo(() => visible.filter((item) => item.show_desktop), [visible]);
  const mobile = useMemo(() => visible.filter((item) => item.show_mobile), [visible]);
  const tree = useCallback((items: NavItem[]) => {
    const children = new Map<number, NavItem[]>();
    for (const item of items) {
      if (!item.parent_id) continue;
      const list = children.get(item.parent_id) || [];
      list.push(item);
      children.set(item.parent_id, list);
    }
    return items
      .filter((item) => !item.parent_id)
      .map((item) => ({ item, children: children.get(item.id) || [] }));
  }, []);
  const desktopTree = useMemo(() => tree(desktop), [desktop, tree]);
  const mobileTree = useMemo(() => tree(mobile), [mobile, tree]);
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
          <Link href="/" aria-label={settings.brand_name || "iName"} className="flex shrink-0 items-center">
            {settings.logo_url ? (
              <span className="relative block h-10 w-32 lg:h-11 lg:w-36">
                <CmsImage src={settings.logo_url} alt={settings.logo_alt || settings.brand_name} className="object-contain object-left" sizes="144px" />
              </span>
            ) : (
              <span className="bg-primary-gradient flex size-10 items-center justify-center rounded-xl text-primary-foreground shadow-card lg:size-11" aria-hidden="true">
                <BuildingIcon />
              </span>
            )}
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Chính">
            {desktopTree.map(({ item, children }) => {
              const active = isCurrent(pathname, item.href) || children.some((child) => isCurrent(pathname, child.href));
              if (!children.length) {
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
              }
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                    aria-expanded={false}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronIcon />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 rounded-xl border border-border bg-card p-2 opacity-0 shadow-elegant transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`block rounded-md px-3 py-2 text-sm ${isCurrent(pathname, child.href) ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-secondary"}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground hover:bg-secondary" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </button>
            {settings.header_show_phone !== "false" ? (
              <a href={settings.hotline_href} className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold xl:flex">
                <PhoneIcon />
                {settings.hotline}
              </a>
            ) : null}
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
              <p className="font-display text-lg font-extrabold">{settings.brand_name || "iName"}</p>
              <button type="button" className="rounded-md border border-border px-3 py-1 text-sm" onClick={closeMenu}>Đóng</button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Di động">
              {mobileTree.map(({ item, children }) => children.length ? (
                <div key={item.id}>
                  <button type="button" className="flex w-full items-center justify-between rounded-md px-3 py-3 text-base font-semibold hover:bg-secondary" onClick={() => setOpenGroup((current) => current === item.id ? null : item.id)}>
                    {item.label}
                    <ChevronIcon />
                  </button>
                  {openGroup === item.id ? children.map((child) => (
                    <Link key={child.id} href={child.href} className="ml-3 block rounded-md px-3 py-2 text-sm hover:bg-secondary" onClick={closeMenu}>
                      {child.label}
                    </Link>
                  )) : null}
                </div>
              ) : (
                <Link key={item.id} href={item.href} className="rounded-md px-3 py-3 text-base font-semibold hover:bg-secondary" onClick={closeMenu}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <button type="button" className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold" onClick={() => { closeMenu(); setSearchOpen(true); }}>
              <SearchIcon /> Tìm kiếm
            </button>
            <a href={settings.hotline_href} className="mt-3 inline-flex items-center justify-center gap-2 text-center text-sm font-semibold">
              <PhoneIcon /> {settings.hotline}
            </a>
          </div>
        </div>
      ) : null}
      {searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
});

const SearchDialog = memo(function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") || "").trim();
    onClose();
    router.push(value ? `/tin-tuc?q=${encodeURIComponent(value)}` : "/tin-tuc");
  }, [onClose, router]);
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-foreground/40 p-4 pt-24" onClick={onClose}>
      <form role="search" onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-elegant">
        <label className="block text-sm font-semibold">Tìm kiếm
          <input name="q" autoFocus placeholder="Nhập từ khóa..." className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" className="rounded-md border border-border px-3 py-2 text-sm" onClick={onClose}>Đóng</button>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Tìm</button>
        </div>
      </form>
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.16a2 2 0 0 1 2.11-.45c.83.27 1.7.47 2.6.59A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
