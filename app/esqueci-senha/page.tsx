'use client';

import { requestPasswordResetAction } from '@/controllers/auth/password-reset.controller';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Por favor, insira seu email');
            return;
        }

        try {
            setLoading(true);
            await requestPasswordResetAction(email);
            setSent(true);
            toast.success('Email enviado! Verifique sua caixa de entrada.');
        } catch (error) {
            console.error('Erro ao solicitar reset:', error);
            toast.error('Erro ao enviar email. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

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
                            Recupere seu acesso
                        </h1>
                        <p className="text-xl text-white/90">
                            Enviaremos instruções para redefinir sua senha por email
                        </p>
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
                            {!sent ? (
                                <>
                                    {/* Header do Card */}
                                    <div className="mb-2">
                                        <h2 className="text-3xl font-bold text-gray-800">Esqueceu sua senha?</h2>
                                        <p className="text-gray-600 mt-2">
                                            Sem problemas! Digite seu email e enviaremos um link para redefinir sua senha.
                                        </p>
                                    </div>

                                    {/* Formulário */}
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            type="email"
                                            label="Email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onValueChange={setEmail}
                                            startContent={<Mail className="text-gray-400" size={20} />}
                                            variant="bordered"
                                            isRequired
                                            classNames={{
                                                input: 'text-base',
                                                inputWrapper: 'border-gray-300',
                                            }}
                                        />

                                        <Button
                                            type="submit"
                                            color="primary"
                                            size="lg"
                                            className="w-full font-semibold"
                                            isLoading={loading}
                                        >
                                            Enviar Link de Recuperação
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                                        <Mail className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Email Enviado!</h3>
                                    <p className="text-gray-600 mb-6">
                                        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
                                    </p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            <ArrowLeft size={16} />
                            Voltar para o login
                        </Link>
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

