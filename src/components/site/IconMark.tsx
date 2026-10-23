import { memo } from "react";

const paths: Record<string, React.ReactNode> = {
  building: <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h4M8 11h4M8 15h4M18 9h2v12" /><path d="M9 21v-3h3v3" /></>,
  calculator: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2" /></>,
  monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
  website: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M7 8h10M7 11h4M8 21h8m-4-4v4" /></>,
  code: <path d="m16 18 6-6-6-6M8 6l-6 6 6 6M14 4l-4 16" />,
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  cpu: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2" /></>,
  chip: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 11h8m-8 3h5" /></>,
  file: <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M13 2v7h7M8 14h8m-8 4h8" /></>,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  piggy: <><path d="M19 8h2v5h-2l-2 3h-3v4h-4v-4H8l-2 2H4v-4l-2-2V9l3-3h8l3 2h3Z" /><path d="M10 9h.01M16 5l2-2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 5 2 2 4-4" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  receipt: <><path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2Z" /><path d="M9 9h6m-6 4h6" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6m-3 0v3" /></>,
  badge: <><path d="m12 3 2.4 1.5 2.8-.1 1.2 2.5 2.3 1.6-.7 2.7.7 2.7-2.3 1.6-1.2 2.5-2.8-.1L12 20l-2.4-1.5-2.8.1-1.2-2.5-2.3-1.6.7-2.7-.7-2.7 2.3-1.6 1.2-2.5 2.8.1Z" /><path d="m9 12 2 2 4-4" /></>,
  handshake: <><path d="m8 12 3-3 4 1 3-2 4 4-5 6-4-1-3 1-6-6 3-3 4 3" /><path d="m2 11 3-3 4 4m13-1 1-1-4-4-4 2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5m-13-11 2 2 3-3" /></>,
  scale: <><path d="M12 3v18m-7 0h14M5 6h14M7 6l-4 8h8L7 6Zm10 0-4 8h8l-4-8Z" /></>,
  lock: <><rect x="4" y="10" width="16" height="12" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v12H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h13" /><path d="M16 13h5m-5 0a2 2 0 1 0 0 4h5v-4Z" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" /></>,
};

export const IconMark = memo(function IconMark({
  name,
  className = "",
  color,
  solid = false,
}: {
  name?: string;
  className?: string;
  color?: string;
  solid?: boolean;
}) {
  const key = name && paths[name] ? name : "building";
  if (solid && color) {
    return (
      <span
        className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${className}`}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {paths[key]}
        </svg>
      </span>
    );
  }
  return (
    <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary ${className}`} style={color ? { backgroundColor: `${color}1a`, color } : undefined} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[key]}</svg>
    </span>
  );
});

export const iconOptions = ["building", "calculator", "monitor", "website", "code", "cloud", "cpu", "mail", "message", "file", "pin", "piggy", "calendar", "shield", "receipt", "timer", "badge", "handshake", "search", "scale", "lock", "wallet", "briefcase"];
