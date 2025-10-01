/**
 * Controller: Password Reset
 * Server Actions para recuperação de senha
 */

'use server';

import { requestPasswordReset, resetPassword, verifyResetToken } from '@/services/auth/password-reset.service';

/**
 * Action: Solicitar recuperação de senha
 */
export async function requestPasswordResetAction(email: string) {
    try {
        return await requestPasswordReset(email);
    } catch (error) {
        console.error('Erro no controller de reset:', error);
        throw new Error('Erro ao processar solicitação');
    }
}

/**
 * Action: Verificar token de reset
 */
export async function verifyResetTokenAction(email: string, token: string) {
    try {
        return await verifyResetToken(email, token);
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        throw new Error('Erro ao verificar token');
    }
}

/**
 * Action: Redefinir senha
 */
export async function resetPasswordAction(email: string, token: string, newPassword: string) {
    try {
        return await resetPassword(email, token, newPassword);
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        throw error;
    }
}

