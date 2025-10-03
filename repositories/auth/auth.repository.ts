/**
 * Repository: Auth
 * Responsible for direct access to authentication data
 */

import type { AuthCredentials, AuthResponse, User } from "@/models";

export class AuthRepository {
  /**
   * User login
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    // API call simulation
    // In production, this would be an actual backend call
    return {
      user: {
        id: "1",
        name: "Test User",
        email: credentials.email,
        role: "ADMIN",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: "fake-jwt-token",
      refreshToken: "fake-refresh-token",
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    // Simulation
    return null;
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    // Simulation
    return;
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    // Simulation
    return true;
  }
}

// Singleton for reuse
export const authRepository = new AuthRepository();
