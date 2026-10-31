import Link from "next/link";
import type { FooterGroup, Office } from "@/lib/content";
import { FooterSocialLinks } from "./SocialLinks";

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
                <div className="flex items-center">
                  {settings.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.logo_url} alt={settings.logo_alt || settings.brand_name || "iName"} className="h-14 w-36 object-contain object-left" />
                  ) : (
                    <span role="img" aria-label="iName" className="bg-primary-gradient flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-card">
                      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                        <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{group.body || settings.footer_description}</p>
                <div className="mt-5 space-y-2 text-sm">
                  <p className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h4M8 11h4M8 15h4M18 9h2v12" />
                    </svg>
                    {settings.company_name}
                  </p>
                  <a href={settings.hotline_href} className="flex items-center gap-2 font-normal text-muted-foreground transition-colors hover:text-foreground">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 8.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" /></svg>
                    <span><strong className="font-semibold text-foreground">Hotline:</strong> {settings.hotline}</span>
                  </a>
                  <a href={settings.email_href} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
                    <span><strong className="font-semibold text-foreground">Email:</strong> {settings.email}</span>
                  </a>
                  <FooterSocialLinks settings={{
                    facebook_url: settings.facebook_url,
                    youtube_url: settings.youtube_url,
                    x_url: settings.x_url,
                    telegram_url: settings.telegram_url,
                  }} />
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
                      <p className="flex items-start gap-2 font-semibold"><span className="text-accent" aria-hidden="true">⌖</span>{office.label}</p>
                      <p className="text-muted-foreground">{office.address}</p>
                    </li>
                  ))}
                  <li>
                    <p className="flex items-center gap-2 font-semibold"><span className="text-accent" aria-hidden="true">◷</span>Giờ làm việc</p>
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
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span aria-hidden="true" className="text-xs font-semibold text-primary/70 transition-transform group-hover:translate-x-1 group-hover:text-primary">→</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border">
        <div className="section-shell py-5 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>{(settings.copyright || "").replace("{{year}}", String(year))}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
