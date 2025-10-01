/**
 * Auth Configuration
 * Configuração principal do NextAuth
 */

import type { UserRole } from "@/models";

import NextAuth from "next-auth";

import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Primeiro login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.avatar = (user as any).avatar;
      }

      // Update session
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.avatar = session.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatar = token.avatar as string | undefined;
      }

      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");
      const isOnPublicPage = nextUrl.pathname === "/";

      // Se está logado e tenta acessar login, redireciona
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      // Se não está logado e tenta acessar área protegida
      if (!isLoggedIn && !isOnLoginPage && !isOnPublicPage) {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

export const { GET, POST } = handlers;
