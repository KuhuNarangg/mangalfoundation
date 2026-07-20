import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtToken } from "@/lib/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (except /admin/login)
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  
  if (pathname === "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    if (token) {
      const payload = await verifyJwtToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    return NextResponse.next();
  }

  if (isAdminRoute || isApiAdminRoute) {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      if (isApiAdminRoute) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      // Delete invalid cookie and redirect
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
