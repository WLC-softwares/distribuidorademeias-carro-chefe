/**
 * Middleware
 * Proteção de rotas usando NextAuth
 */

import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/product/");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  // Rotas que exigem autenticação
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/user") ||
    nextUrl.pathname === "/checkout";

  // Permitir rotas de API
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If logged in and trying to access login or register page
  if (isAuthRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role;
    const redirectUrl =
      userRole === "ADMIN" ? "/admin/dashboard" : "/user/profile";

    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // Se não está logado e tenta acessar rota protegida
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);

    return NextResponse.redirect(
      new URL(`/login?redirect=${callbackUrl}`, nextUrl),
    );
  }

  // Check if user has permission to access admin routes
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isLoggedIn && isAdminRoute) {
    const userRole = req.auth?.user?.role;

    if (userRole !== "ADMIN") {
      // User is not admin, redirect to user area
      return NextResponse.redirect(new URL("/user/profile", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
