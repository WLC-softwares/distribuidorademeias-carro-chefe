/**
 * Auth Configuration
 * Main NextAuth configuration
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
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Validate email format
        if (!isValidEmail(email)) {
          throw new Error("Invalid email");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Check if user is active
        if (!user.active) {
          throw new Error("Inactive user");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        // Return user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar ?? undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Extend callbacks from authConfig
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // First login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
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

      // If logged in and tries to access login, redirect
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/admin/dashboard", nextUrl));
      }

      // If not logged in and tries to access protected area
      if (!isLoggedIn && !isOnLoginPage && !isOnPublicPage) {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

export const { GET, POST } = handlers;
