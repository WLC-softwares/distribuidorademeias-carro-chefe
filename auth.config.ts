/**
 * Auth Config
 * Configuração do NextAuth separada para uso no middleware
 * IMPORTANTE: Este arquivo é usado no Edge Runtime, então não pode importar
 * Prisma, bcrypt ou outras dependências pesadas de Node.js
 */

import type { NextAuthConfig } from "next-auth";

import Google from "next-auth/providers/google";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Adicionar role do usuário ao token
      if (user) {
        token.role = (user as any).role || "USER";
      }

      return token;
    },
    async session({ session, token }) {
      // Adicionar role à sessão
      if (session.user) {
        (session.user as any).role = token.role || "USER";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
