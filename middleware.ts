/**
 * Middleware
 * Proteção de rotas usando NextAuth
 */

import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/produto/");
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

  // Se está logado e tenta acessar página de login ou registro
  if (isAuthRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role;
    const redirectUrl =
      userRole === "ADMIN" ? "/admin/dashboard" : "/user/perfil";

    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // Se não está logado e tenta acessar rota protegida
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);

    return NextResponse.redirect(
      new URL(`/login?redirect=${callbackUrl}`, nextUrl),
    );
  }

  // Verificar se usuário tem permissão para acessar rotas de admin
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isLoggedIn && isAdminRoute) {
    const userRole = req.auth?.user?.role;

    if (userRole !== "ADMIN") {
      // Usuário não é admin, redirecionar para área do usuário
      return NextResponse.redirect(new URL("/user/perfil", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
