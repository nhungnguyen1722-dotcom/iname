import Link from "next/link";
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
                <div className="flex items-center">
                  {settings.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.logo_url} alt={settings.logo_alt || settings.brand_name || "Iname"} className="h-14 w-36 object-contain object-left" />
                  ) : (
                    <span role="img" aria-label="Iname" className="bg-primary-gradient flex size-11 items-center justify-center rounded-xl text-primary-foreground shadow-card">
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
                  <a href={settings.hotline_href} className="flex items-center gap-2 font-semibold"><span aria-hidden="true">☎</span> Hotline: {settings.hotline}</a>
                  <a href={settings.email_href} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><span aria-hidden="true">✉</span> {settings.email}</a>
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
                    <Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border">
        <div className="section-shell py-5 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{settings.company_name}</p>
          <p className="mt-1">{settings.company_address}</p>
          <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{(settings.copyright || "").replace("{{year}}", String(year))}</p>
            <p>{settings.legal_note}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
