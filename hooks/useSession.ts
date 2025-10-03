/**
 * Hook: useSession
 * Hook customizado para gerenciar sessão do usuário
 */

"use client";

import type { User } from "@/models";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  const user: User | null = session?.user
    ? {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      role: session.user.role,
      avatar: session.user.avatar,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    : null;

  return {
    user,
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
    update,
  };
}
