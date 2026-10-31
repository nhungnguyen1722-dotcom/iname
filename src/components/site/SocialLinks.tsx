"use client";

import { useState } from "react";

type SocialNetwork = "facebook" | "youtube" | "x" | "telegram";

function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "facebook") {
    return <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H7.7v3h2.7v8h3.1Z" /></svg>;
  }
  if (network === "youtube") {
    return <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.7V8.3l6.3 3.7-6.3 3.7Z" /></svg>;
  }
  if (network === "x") {
    return <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.3-8.4L1.8 2h6.5l4.4 6.8L18.9 2Zm-1.1 17.9h1.7L7.3 4H5.5l12.3 15.9Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M21.8 3.2 18.5 20c-.2 1.2-.9 1.5-1.9.9l-5.2-3.8-2.5 2.4c-.3.3-.5.5-1 .5l.4-5.3 9.7-8.8c.4-.4-.1-.6-.6-.2L5.4 13.3.3 11.7c-1.1-.4-1.1-1.1.2-1.6L20.3 2.5c.9-.3 1.7.2 1.5.7Z" /></svg>;
}

const networkNames: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X",
  telegram: "Telegram",
};

const iconClassName = "inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function SocialShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  async function copyForYouTube() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chia sẻ trang này">
      <a className={iconClassName} href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên Facebook" title="Facebook"><SocialIcon network="facebook" /></a>
      <button className={iconClassName} type="button" onClick={copyForYouTube} aria-label="Sao chép liên kết để chia sẻ trên YouTube" title="Sao chép liên kết cho YouTube"><SocialIcon network="youtube" /></button>
      <a className={iconClassName} href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên X" title="X"><SocialIcon network="x" /></a>
      <a className={iconClassName} href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Chia sẻ lên Telegram" title="Telegram"><SocialIcon network="telegram" /></a>
      {copied ? <span className="text-xs text-muted-foreground" role="status">Đã sao chép liên kết để chia sẻ trên YouTube.</span> : null}
    </div>
  );
}

export function FooterSocialLinks({ settings }: { settings: Partial<Record<`${SocialNetwork}_url`, string>> }) {
  const defaults: Record<SocialNetwork, string> = {
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    x: "https://x.com/",
    telegram: "https://t.me/",
  };

  return (
    <nav className="mt-3 flex items-center gap-2" aria-label="Mạng xã hội iName">
      {(Object.keys(networkNames) as SocialNetwork[]).map((network) => (
        <a key={network} className={iconClassName} href={settings[`${network}_url`] || defaults[network]} target="_blank" rel="noopener noreferrer" aria-label={`iName trên ${networkNames[network]}`} title={networkNames[network]}>
          <SocialIcon network={network} />
        </a>
      ))}
    </nav>
  );
}
