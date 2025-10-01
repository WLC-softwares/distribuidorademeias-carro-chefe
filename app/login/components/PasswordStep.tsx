import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import { ChevronRight, Eye, EyeOff, Shield } from 'lucide-react';
import NextLink from 'next/link';

interface PasswordStepProps {
    email: string;
    password: string;
    isVisible: boolean;
    loading?: boolean;
    setPassword: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    onToggleVisibility: () => void;
}

export function PasswordStep({
    email,
    password,
    isVisible,
    loading = false,
    setPassword,
    onSubmit,
    onBack,
    onToggleVisibility,
}: PasswordStepProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {/* Exibição do e-mail */}
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <Avatar name={email} size="sm" className="bg-blue-500 text-white" showFallback />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{email}</p>
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-xs text-blue-500 hover:text-blue-600"
                    >
                        Trocar conta
                    </button>
                </div>
            </div>

            {/* Campo de Senha */}
            <Input
                type={isVisible ? 'text' : 'password'}
                label="Senha"
                placeholder=""
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                size="lg"
                isRequired
                isDisabled={loading}
                endContent={
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={onToggleVisibility}
                        disabled={loading}
                    >
                        {isVisible ? (
                            <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                        ) : (
                            <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                        )}
                    </button>
                }
                classNames={{
                    input: 'text-base',
                    inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                    label: 'text-gray-600',
                }}
            />

            {/* Botões */}
            <div className="space-y-3">
                <Button
                    type="submit"
                    size="lg"
                    isLoading={loading}
                    className="w-full font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                >
                    Iniciar sessão
                </Button>
                <Link
                    as={NextLink}
                    href="/esqueci-senha"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700"
                >
                    Esqueceu sua senha?
                </Link>
            </div>

            <Link
                as={NextLink}
                href="/seguranca"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
                <Shield size={18} />
                Tenho um problema de segurança
                <ChevronRight size={16} />
            </Link>
        </form>
    );
}

