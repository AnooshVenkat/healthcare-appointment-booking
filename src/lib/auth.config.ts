import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
      const isDashboard = path.startsWith("/dashboard");

      if (isDashboard) {
        if (!isLoggedIn) return false;
        const role = auth?.user?.role;
        if (path.startsWith("/dashboard/admin") && role !== "admin") {
          return Response.redirect(new URL(dashboardFor(role), nextUrl));
        }
        if (path.startsWith("/dashboard/clinician") && role !== "clinician" && role !== "admin") {
          return Response.redirect(new URL(dashboardFor(role), nextUrl));
        }
        if (path.startsWith("/dashboard/patient") && role !== "patient" && role !== "admin") {
          return Response.redirect(new URL(dashboardFor(role), nextUrl));
        }
        return true;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL(dashboardFor(auth?.user?.role), nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role as "patient" | "clinician" | "admin") || "patient";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export function dashboardFor(role?: string | null) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "clinician":
      return "/dashboard/clinician";
    default:
      return "/dashboard/patient";
  }
}
