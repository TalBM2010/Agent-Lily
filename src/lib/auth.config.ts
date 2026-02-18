import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Edge-compatible auth config (no Prisma, no bcrypt)
// Used by middleware for session checks
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // Credentials provider placeholder - actual validation in auth.ts
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This won't be called from middleware, only from auth.ts
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const protectedRoutes = ["/children", "/topics", "/lesson", "/admin"];
      const authRoutes = ["/login", "/signup"];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        nextUrl.pathname.startsWith(route)
      );
      const isAuthRoute = authRoutes.some(route => 
        nextUrl.pathname.startsWith(route)
      );

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/children", nextUrl));
      }

      // Redirect non-logged-in users to login
      if (isProtectedRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error - role exists on our user
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error - role added to session
        session.user.role = token.role;
      }
      return session;
    },
  },
};
