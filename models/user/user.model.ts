/**
 * Model: User
 * Definições de tipos e interfaces para o módulo de Usuário
 */

import type { Role } from "@prisma/client";

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  role: Role;
  avatar?: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = Role;

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginStep {
  step: "email" | "password";
  email?: string;
}

export interface CreateUserDTO {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
  role?: Role;
}

export interface UpdateUserDTO {
  nome?: string;
  telefone?: string;
  avatar?: string;
}
