/**
 * Service: Auth
 * Camada de lógica de negócios para autenticação
 */

import type { AuthCredentials, AuthResponse, User } from '@/models';
import { authRepository } from '@/repositories';

export class AuthService {
    /**
     * Realiza login do usuário
     */
    async login(credentials: AuthCredentials): Promise<AuthResponse> {
        try {
            // Validações básicas
            if (!credentials.email || !credentials.password) {
                throw new Error('Email e senha são obrigatórios');
            }

            // Validação de formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(credentials.email)) {
                throw new Error('Email inválido');
            }

            // Chamada ao repositório
            const response = await authRepository.login(credentials);

            // Salvar token no localStorage (ou cookie)
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('refresh_token', response.refreshToken);
            }

            return response;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    /**
     * Realiza logout do usuário
     */
    async logout(): Promise<void> {
        try {
            await authRepository.logout();

            // Limpar tokens
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            throw error;
        }
    }

    /**
     * Obtém usuário atual
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            return await authRepository.getCurrentUser();
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return null;
        }
    }

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('auth_token');
    }

    /**
     * Verifica se o email existe
     */
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            return await authRepository.checkEmailExists(email);
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            return false;
        }
    }
}

// Singleton para reutilização
export const authService = new AuthService();