import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const isAdminLoginPage = pathname === "/admin/login";
    const isAdminRoute = pathname.startsWith("/admin");
    const isMemberLoginPage = pathname === "/login";
    const isMemberRoute = pathname.startsWith("/dashboard");

    if (isAdminLoginPage) {
      if (token?.userType === "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (isMemberLoginPage) {
      if (token?.userType === "member") {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // userType (not just token presence) gates both areas -- a Member
    // session is a valid, truthy token and must not grant /admin access,
    // same for an admin session against /dashboard.
    if (isAdminRoute && token?.userType !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && token?.role === "viewer") {
      const isReadOnly =
        pathname === "/admin" || pathname.startsWith("/admin/episodes");
      if (!isReadOnly) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }

    if (isMemberRoute && token?.userType !== "member") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
