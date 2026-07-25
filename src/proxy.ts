import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The admin panel stays reachable even in maintenance mode, gated by its own login.
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authenticated = await verifySessionToken(token);
    if (!authenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (process.env.MAINTENANCE_MODE === "true" && pathname !== "/mantenimiento") {
    return NextResponse.redirect(new URL("/mantenimiento", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|sitemap.xml|robots.txt|favicon.ico|.*\\..*).*)"],
};
