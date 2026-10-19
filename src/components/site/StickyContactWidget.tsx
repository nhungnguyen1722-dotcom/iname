type Settings = Record<string, string>;

function QuickLink({ href, label, kind }: { href: string; label: string; kind: "phone" | "zalo" | "chat" | "social" }) {
  if (!href) return null;
  const icon = kind === "phone" ? <path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-6-6l3-2-2-5H7Z" />
    : kind === "zalo" ? <><circle cx="12" cy="12" r="9" /><path d="M7 9h10l-7 6h7" /></>
    : kind === "chat" ? <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h8m-8 3h5" /></>
    : <><circle cx="12" cy="12" r="9" /><path d="M14 8h-2a2 2 0 0 0-2 2v8m-2-6h6" /></>;
  return (
    <a href={href} aria-label={label} title={label} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className={`flex size-12 items-center justify-center rounded-full text-white shadow-elegant transition hover:-translate-y-0.5 ${kind === "phone" ? "bg-red-500" : kind === "zalo" ? "bg-blue-600" : "bg-sky-500"}`}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
    </a>
  );
}

export function StickyContactWidget({ settings }: { settings: Settings }) {
  if (settings.sticky_contacts_visible === "false") return null;
  const phone = settings.sticky_phone_visible !== "false";
  const zalo = settings.sticky_zalo_visible !== "false";
  const messenger = settings.sticky_messenger_visible === "true";
  const facebook = settings.sticky_facebook_visible === "true";
  const links = [
    phone ? { href: settings.sticky_phone_href || settings.hotline_href || "tel:0981988357", label: settings.sticky_phone_label || "Gọi 0981988357", kind: "phone" as const } : null,
    zalo ? { href: settings.sticky_zalo_url || "https://zalo.me/0981988357", label: "Chat qua Zalo", kind: "zalo" as const } : null,
    messenger && settings.sticky_messenger_url ? { href: settings.sticky_messenger_url, label: "Chat Messenger", kind: "chat" as const } : null,
    facebook && settings.sticky_facebook_url ? { href: settings.sticky_facebook_url, label: "Facebook", kind: "social" as const } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item?.href));
  return <nav aria-label="Liên hệ nhanh" className="fixed bottom-5 right-4 z-30 flex flex-col gap-2 sm:bottom-7 sm:right-6">{links.map((link) => <QuickLink key={link.kind} {...link} />)}</nav>;
}
