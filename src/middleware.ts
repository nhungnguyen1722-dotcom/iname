import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

function withAdminHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return withAdminHeaders(NextResponse.next());
  const token = request.cookies.get("iname_session")?.value;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return withAdminHeaders(NextResponse.redirect(url));
  }
  return withAdminHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*"],
};
