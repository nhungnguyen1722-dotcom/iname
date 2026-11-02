import { memo } from "react";
import Link from "next/link";
import { CmsImage } from "@/components/site/CmsImage";
import type { FooterGroup, Office } from "@/lib/content";
import { FooterSocialLinks } from "./SocialLinks";

export const Footer = memo(function Footer({
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
                    <span className="relative block h-14 w-36">
                      <CmsImage src={settings.logo_url} alt={settings.logo_alt || settings.brand_name || "iName"} className="object-contain object-left" sizes="144px" />
                    </span>
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
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 7 8 6 8-6" /><rect x="3" y="5" width="18" height="14" rx="2" /></svg>
                    <span><strong className="font-semibold text-foreground">Email:</strong> {settings.email}</span>
                  </a>
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span><strong className="font-semibold text-foreground">Địa chỉ:</strong> {settings.company_address}</span>
                  </p>
                </div>
                <div className="mt-5">
                  <FooterSocialLinks settings={settings} />
                </div>
              </div>
            );
          }
          return (
            <div key={group.id} className="lg:col-span-2">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{group.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {group.links.map((link) => (
                  <li key={`${group.id}-${link.label}-${link.href}`}>
                    <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="section-shell flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {year} {settings.brand_name || "iName"}. Bản quyền thuộc về iName.</p>
          <p className="text-muted-foreground/80">{settings.legal_note || "Dịch vụ văn phòng ảo và kế toán thuế chuyên nghiệp"}</p>
        </div>
      </div>
    </footer>
  );
});
