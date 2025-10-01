/**
 * Hook: useAuth
 * Hook customizado para gerenciar autenticação com NextAuth
 */

'use client';

import type { AuthCredentials } from '@/models';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from './useSession';

export type LoginStep = 'email' | 'password';

export function useAuth() {
    const router = useRouter();
    const { user, isLoading: sessionLoading, isAuthenticated } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const login = async (credentials: AuthCredentials) => {
        try {
            setLoading(true);
            setError(null);

            const result = await signIn('credentials', {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });

            if (result?.error) {
                // Mapear erros do NextAuth para mensagens amigáveis
                let errorMessage = 'Erro ao fazer login';

                if (result.error === 'CredentialsSignin' || result.error.includes('Credenciais')) {
                    errorMessage = 'Email ou senha incorretos';
                } else if (result.error.includes('Email')) {
                    errorMessage = result.error;
                } else {
                    errorMessage = result.error;
                }

                setError(errorMessage);
                return;
            }

            // Redirecionar após login bem-sucedido
            // Verificar se há um parâmetro redirect na URL
            const searchParams = new URLSearchParams(window.location.search);
            const redirectUrl = searchParams.get('redirect');

            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/admin/dashboard');
            }
            router.refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await signOut({ redirect: false });
            router.push('/login');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            await signIn('google', { callbackUrl: '/admin/dashboard' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login com Google');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Limpar erro ao mudar de step
        setStep('password');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login({ email, password });
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    const handleChangeAccount = () => {
        setStep('email');
        setPassword('');
        setError(null); // Limpar erro ao voltar
    };

    const toggleVisibility = () => setIsVisible(!isVisible);

    return {
        // Estado
        user,
        loading: loading || sessionLoading,
        error,
        step,
        email,
        password,
        isVisible,
        isAuthenticated,
        // Setters
        setEmail,
        setPassword,
        setStep,
        // Métodos
        login,
        logout,
        loginWithGoogle,
        handleContinue,
        handleLogin,
        handleGoogleLogin,
        handleChangeAccount,
        toggleVisibility,
    };
}