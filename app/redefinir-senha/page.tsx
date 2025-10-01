'use client';

import { resetPasswordAction, verifyResetTokenAction } from '@/controllers/auth/password-reset.controller';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { Spinner } from '@heroui/spinner';
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

function RedefinirSenhaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (!tokenParam || !emailParam) {
            toast.error('Link inválido');
            router.push('/login');
            return;
        }

        setToken(tokenParam);
        setEmail(emailParam);

        // Verificar token
        verifyResetTokenAction(emailParam, tokenParam)
            .then((result) => {
                if (result.valid) {
                    setTokenValid(true);
                } else {
                    toast.error(result.message || 'Token inválido ou expirado');
                    setTimeout(() => router.push('/esqueci-senha'), 2000);
                }
            })
            .catch(() => {
                toast.error('Erro ao verificar token');
                setTimeout(() => router.push('/esqueci-senha'), 2000);
            })
            .finally(() => {
                setVerifying(false);
            });
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('Por favor, preencha todos os campos');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);
            await resetPasswordAction(email, token, newPassword);
            setSuccess(true);
            toast.success('Senha redefinida com sucesso!');
            setTimeout(() => router.push('/login'), 3000);
        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error);
            toast.error(error.message || 'Erro ao redefinir senha');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-4 text-gray-600">Verificando link...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Redirecionando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            {/* Lado Esquerdo - Informações */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-center">
                <div className="max-w-lg">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <span className="text-2xl font-bold text-white">DM</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Distribuidora Carro Chefe</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Nova Senha
                        </h1>
                        <p className="text-xl text-white/90">
                            Crie uma senha forte e segura para proteger sua conta
                        </p>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-screen">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl border border-gray-100">
                        <CardBody className="gap-6 p-8">
                            {!success ? (
                                <>
                                    <div className="mb-2">
                                        <h2 className="text-3xl font-bold text-gray-800">Redefinir Senha</h2>
                                        <p className="text-gray-600 mt-2">
                                            Digite sua nova senha abaixo
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            label="Nova Senha"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onValueChange={setNewPassword}
                                            startContent={<Lock className="text-gray-400" size={20} />}
                                            endContent={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="focus:outline-none"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="text-gray-400" size={20} />
                                                    ) : (
                                                        <Eye className="text-gray-400" size={20} />
                                                    )}
                                                </button>
                                            }
                                            variant="bordered"
                                            isRequired
                                            classNames={{
                                                input: 'text-base',
                                                inputWrapper: 'border-gray-300',
                                            }}
                                        />

                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            label="Confirmar Senha"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onValueChange={setConfirmPassword}
                                            startContent={<Lock className="text-gray-400" size={20} />}
                                            endContent={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="focus:outline-none"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="text-gray-400" size={20} />
                                                    ) : (
                                                        <Eye className="text-gray-400" size={20} />
                                                    )}
                                                </button>
                                            }
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
                                            Redefinir Senha
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                                        <CheckCircle className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Senha Redefinida!</h3>
                                    <p className="text-gray-600">
                                        Sua senha foi alterada com sucesso. Redirecionando para o login...
                                    </p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

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

export default function RedefinirSenhaPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" color="primary" />
            </div>
        }>
            <RedefinirSenhaContent />
        </Suspense>
    );
}

