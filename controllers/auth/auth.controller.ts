/**
 * Controller: Auth
 * Server Actions para autenticação
 */

'use server';

import type { AuthCredentials, AuthResponse, CreateUserDTO } from '@/models';
import { authService, userService } from '@/services';

/**
 * Action: Login
 */
export async function loginAction(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
        const response = await authService.login(credentials);
        return response;
    } catch (error) {
        console.error('Erro no controller de login:', error);
        throw error;
    }
}

/**
 * Action: Logout
 */
export async function logoutAction(): Promise<void> {
    try {
        await authService.logout();
    } catch (error) {
        console.error('Erro no controller de logout:', error);
        throw error;
    }
}

/**
 * Action: Verificar email
 */
export async function checkEmailAction(email: string): Promise<boolean> {
    try {
        return await authService.checkEmailExists(email);
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return false;
    }
}

/**
 * Action: Registrar novo usuário
 */
export async function registerAction(data: CreateUserDTO & {
    enderecos?: Array<{
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
        principal: boolean;
    }>;
}) {
    try {
        // Criar usuário
        const user = await userService.createUser({
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            telefone: data.telefone,
            cpf: data.cpf,
        });

        // Se houver endereços, adicionar ao usuário
        if (data.enderecos && data.enderecos.length > 0 && user.id) {
            const { prisma } = await import('@/lib/prisma');

            for (const endereco of data.enderecos) {
                await prisma.endereco.create({
                    data: {
                        ...endereco,
                        usuarioId: user.id,
                    },
                });
            }
        }

        return { success: true, user };
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        throw error;
    }
}