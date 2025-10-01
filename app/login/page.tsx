'use client';

import { useAuth } from '@/hooks';
import { Card, CardBody } from '@heroui/card';
import Link from 'next/link';
import { EmailStep } from './components/EmailStep';
import { PasswordStep } from './components/PasswordStep';

export default function LoginPage() {
    const authHook = useAuth();

    return (
        <div className="flex">
            {/* Lado Esquerdo - Informações */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center">
                <div className="max-w-lg">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <span className="text-2xl font-bold text-white">DM</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Distribuidora Carro Chefe</span>
                    </div>

                    {/* Frase Principal */}
                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Adquira já as melhores meias
                        </h1>
                        <p className="text-xl text-white/90">
                            Entre na sua conta e continue comprando com os melhores preços
                        </p>
                    </div>

                    {/* Features */}
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <p className="text-white text-lg">Segurança e privacidade garantidas</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-white text-lg">Rápido e fácil de usar</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-screen">
                <div className="w-full max-w-md">
                    {/* Logo Mobile */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-3">
                            <span className="text-2xl font-bold text-white">DM</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Distribuidora de Meias
                        </h1>
                    </div>

                    <Card className="shadow-xl border border-gray-100">
                        <CardBody className="gap-6 p-8">
                            {/* Header do Card */}
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold text-gray-800">Bem-vindo de volta!</h2>
                                <p className="text-gray-600 mt-2">Entre com sua conta para continuar comprando</p>
                            </div>

                            {/* Steps */}
                            {authHook.step === 'email' ? (
                                <EmailStep
                                    email={authHook.email}
                                    setEmail={authHook.setEmail}
                                    onSubmit={authHook.handleContinue}
                                    onGoogleLogin={authHook.handleGoogleLogin}
                                />
                            ) : (
                                <PasswordStep
                                    email={authHook.email}
                                    password={authHook.password}
                                    isVisible={authHook.isVisible}
                                    loading={authHook.loading}
                                    setPassword={authHook.setPassword}
                                    onSubmit={authHook.handleLogin}
                                    onBack={authHook.handleChangeAccount}
                                    onToggleVisibility={authHook.toggleVisibility}
                                />
                            )}

                            {/* Error Message */}
                            {authHook.error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                                    {authHook.error}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Copyright Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-gray-600">
                        © 2025 Distribuidora de Meias Carro Chefe - Todos os direitos reservados
                    </p>
                </div>
            </div>
        </div>
    );
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              