import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin API routes er beskyttet via Firebase Auth session cookie
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = req.cookies.get("session")?.value;
    if (!session) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ success: false, error: "Ikke logget ind." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
