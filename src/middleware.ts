import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/children", "/topics", "/lesson", "/admin"];

// Routes that are only for non-authenticated users
const authRoutes = ["/login", "/signup"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/children", nextUrl));
  }

  // Redirect non-logged-in users to login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Check admin access
  if (isAdminRoute && isLoggedIn) {
    // @ts-expect-error - role exists on session
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/children", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
