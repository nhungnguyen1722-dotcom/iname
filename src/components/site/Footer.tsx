import Link from "next/link";
import { CmsImage } from "./CmsImage";
import type { FooterGroup, Office } from "@/lib/content";

export function Footer({
  settings,
  groups,
  offices,
}: {
  settings: Record<string, string>;
  groups: FooterGroup[];
  offices: Office[];
}) {
  const visible = groups.filter((group) => group.visible).sort((a, b) => a.sort_order - b.sort_order);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-subtle-gradient">
      <div className="section-shell grid gap-10 py-14 lg:grid-cols-12 lg:gap-8">
        {visible.map((group) => {
          if (group.group_key === "brand") {
            return (
              <div key={group.id} className="lg:col-span-4">
                <div className="flex items-center gap-3">
                  {settings.logo_url ? (
                    <span className="relative block size-11 overflow-hidden rounded-xl">
                      <CmsImage src={settings.logo_url} alt={settings.logo_alt || settings.brand_name} className="object-contain" sizes="44px" />
                    </span>
                  ) : (
                    <span className="bg-primary-gradient flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-card">
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                        <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
                      </svg>
                    </span>
                  )}
                  <span>
                    <span className="block font-display text-lg font-extrabold">{settings.brand_name}</span>
                    <span className="text-xs text-muted-foreground">{settings.brand_tagline}</span>
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{group.body || settings.footer_description}</p>
                <div className="mt-5 space-y-2 text-sm">
                  <a href={settings.hotline_href} className="block font-semibold">Hotline: {settings.hotline}</a>
                  <a href={settings.email_href} className="block text-muted-foreground hover:text-foreground">{settings.email}</a>
                </div>
              </div>
            );
          }
          if (group.group_key === "contact") {
            return (
              <div key={group.id} className="lg:col-span-3">
                <h2 className="text-sm font-bold uppercase tracking-wide">{group.title}</h2>
                <ul className="mt-4 space-y-4 text-sm">
                  {offices.map((office) => (
                    <li key={office.id}>
                      <p className="font-semibold">{office.label}</p>
                      <p className="text-muted-foreground">{office.address}</p>
                    </li>
                  ))}
                  <li>
                    <p className="font-semibold">Giờ làm việc</p>
                    <p className="text-muted-foreground">{settings.hours_summary}</p>
                    <p className="text-muted-foreground">{settings.hours_saturday_summary}</p>
                  </li>
                </ul>
              </div>
            );
          }
          const span = group.group_key === "services" ? "lg:col-span-3" : "lg:col-span-2";
          return (
            <div key={group.id} className={span}>
              <h2 className="text-sm font-bold uppercase tracking-wide">{group.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {group.links.map((link) => (
                  <li key={`${group.id}-${link.href}-${link.label}`}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border">
        <div className="section-shell flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{(settings.copyright || "").replace("{{year}}", String(year))}</p>
          <p>{settings.legal_note}</p>
        </div>
      </div>
    </footer>
  );
}
