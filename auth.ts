/**
 * Auth Configuration
 * Configuração principal do NextAuth
 */

import type { UserRole } from "@/models";

import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import authConfig from "./auth.config";
import { prisma } from "./lib/prisma";
import { isValidEmail } from "./utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Validar formato de email
        if (!isValidEmail(email)) {
          throw new Error("Email inválido");
        }

        // Buscar usuário no banco de dados
        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario) {
          throw new Error("Credenciais inválidas");
        }

        // Verificar se o usuário está ativo
        if (!usuario.ativo) {
          throw new Error("Usuário inativo");
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, usuario.senha);

        if (!isValidPassword) {
          throw new Error("Credenciais inválidas");
        }

        // Retornar usuário
        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          avatar: usuario.avatar ?? undefined,
        };
      },
    }),
  ],
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
