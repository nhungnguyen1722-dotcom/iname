const productionOrigin = "https://iname-omega.vercel.app";

export function absoluteSiteUrl(path: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const url = new URL(configured || productionOrigin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return new URL(path, productionOrigin).toString();
    }
    return new URL(path, url.origin).toString();
  } catch {
    return new URL(path, productionOrigin).toString();
  }
}
