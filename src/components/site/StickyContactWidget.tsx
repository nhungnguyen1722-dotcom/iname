import { memo, useMemo } from "react";
import { SITE_HOTLINE_LABEL, SITE_HOTLINE_TEL, SITE_ZALO_URL } from "@/lib/site-contact";

type Settings = Record<string, string>;

const QuickLink = memo(function QuickLink({ href, label, kind }: { href: string; label: string; kind: "phone" | "zalo" | "chat" | "social" }) {
  if (!href) return null;
  const isZalo = kind === "zalo";
  const id = kind === "phone" ? "contact-vr" : isZalo ? "zalo-vr" : kind === "social" ? "fanpage-vr" : "messenger-vr";
  const icon = kind === "phone" ? <path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-6-6l3-2-2-5H7Z" />
    : isZalo ? null
    : kind === "chat" ? <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h8m-8 3h5" /></>
    : <><circle cx="12" cy="12" r="9" /><path d="M14 8h-2a2 2 0 0 0-2 2v8m-2-6h6" /></>;
  return (
    <div id={id} className="button-contact">
      <div className="phone-vr">
        <div className="phone-vr-circle-fill" />
        <div className="phone-vr-img-circle">
          <a href={href} aria-label={label} title={label} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {isZalo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/images/zalo.png" alt="" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
            )}
          </a>
        </div>
      </div>
    </div>
  );
});

export const StickyContactWidget = memo(function StickyContactWidget({ settings }: { settings: Settings }) {
  const links = useMemo(() => {
    const phone = settings.sticky_phone_visible !== "false";
    const zalo = settings.sticky_zalo_visible !== "false";
    const messenger = settings.sticky_messenger_visible === "true";
    const facebook = settings.sticky_facebook_visible === "true";
    return [
      phone ? { href: settings.sticky_phone_href || settings.hotline_href || SITE_HOTLINE_TEL, label: settings.sticky_phone_label || SITE_HOTLINE_LABEL, kind: "phone" as const } : null,
      zalo ? { href: settings.sticky_zalo_url || SITE_ZALO_URL, label: "Chat qua Zalo", kind: "zalo" as const } : null,
      messenger && settings.sticky_messenger_url ? { href: settings.sticky_messenger_url, label: "Chat Messenger", kind: "chat" as const } : null,
      facebook && settings.sticky_facebook_url ? { href: settings.sticky_facebook_url, label: "Facebook", kind: "social" as const } : null,
    ].filter((item): item is NonNullable<typeof item> => Boolean(item?.href));
  }, [settings]);

  if (settings.sticky_contacts_visible === "false") return null;

  return (
    <nav id="button-contact-vr" aria-label="Liên hệ nhanh">
      <div id="gom-all-in-one">
        {links.map((link) => <QuickLink key={link.kind} {...link} />)}
      </div>
    </nav>
  );
});
