import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function contentSecurityPolicy(nonce: string) {
  const isProd = process.env.NODE_ENV === "production";
  return [
    "default-src 'self'",
    isProd
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "media-src 'self' blob: https:",
    isProd
      ? "connect-src 'self' https://*.public.blob.vercel-storage.com https://vercel.live"
      : "connect-src 'self' ws: wss: http: https:",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function withSecurityHeaders(response: NextResponse, policy: string) {
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createNonce();
  const policy = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  if (pathname === "/tin-tuc") {
    const { searchParams } = request.nextUrl;
    if (searchParams.has("q") || searchParams.has("category") || searchParams.has("page")) {
      const url = request.nextUrl.clone();
      url.pathname = "/tin-tuc/bo-loc";
      return withSecurityHeaders(NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      }), policy);
    }
  }
  if (!pathname.startsWith("/admin")) {
    return withSecurityHeaders(NextResponse.next({
      request: { headers: requestHeaders },
    }), policy);
  }
  if (pathname === "/admin/login") {
    return withSecurityHeaders(NextResponse.next({
      request: { headers: requestHeaders },
    }), policy);
  }
  const token = request.cookies.get("iname_session")?.value;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(url), policy);
  }
  return withSecurityHeaders(NextResponse.next({
    request: { headers: requestHeaders },
  }), policy);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
