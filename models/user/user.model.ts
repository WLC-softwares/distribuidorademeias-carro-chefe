/**
 * Model: User
 * Type definitions and interfaces for the User module
 */

import type { Role } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  role: Role;
  avatar?: string | null;
  active: boolean;
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
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  role?: Role;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  avatar?: string;
}
