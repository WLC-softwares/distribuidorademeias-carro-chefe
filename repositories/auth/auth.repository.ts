/**
 * Repository: Auth
 * Responsável pelo acesso direto aos dados de autenticação
 */

import type { AuthCredentials, AuthResponse, User } from "@/models";

export class AuthRepository {
  /**
   * Realiza login do usuário
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    // Simulação de chamada API
    // Em produção, aqui seria uma chamada real para o backend
    return {
      user: {
        id: "1",
        name: "Usuário Teste",
        email: credentials.email,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: "fake-jwt-token",
      refreshToken: "fake-refresh-token",
    };
  }

  /**
   * Busca usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    // Simulação
    return null;
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    // Simulação
    return;
  }

  /**
   * Verifica se o email existe
   */
  async checkEmailExists(email: string): Promise<boolean> {
    // Simulação
    return true;
  }
}

// Singleton para reutilização
export const authRepository = new AuthRepository();
