import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  if (!session) {
    if (
      pathname.startsWith("/candidate") ||
      pathname.startsWith("/company") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
    return NextResponse.next();
  }

  const role = session.user.role;

  if (pathname.startsWith("/candidate") && role !== "CANDIDATE") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (pathname.startsWith("/company") && role !== "COMPANY") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/candidate/:path*", "/company/:path*", "/admin/:path*"],
};
