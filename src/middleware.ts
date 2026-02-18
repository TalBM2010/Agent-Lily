import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use Edge-compatible config (no Prisma)
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
