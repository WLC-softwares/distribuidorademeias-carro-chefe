/**
 * Provider: Auth
 * Provider para gerenciar sessão do NextAuth
 */

"use client";

import type { ReactNode } from "react";

import { SessionProvider } from "next-auth/react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
