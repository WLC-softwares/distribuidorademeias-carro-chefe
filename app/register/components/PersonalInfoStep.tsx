import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import { Eye, EyeOff } from 'lucide-react';
import NextLink from 'next/link';
import { RegisterData } from '../hooks/useRegister';

interface PersonalInfoStepProps {
    formData: RegisterData;
    isPasswordVisible: boolean;
    isConfirmPasswordVisible: boolean;
    updateFormData: (field: keyof RegisterData, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onTogglePasswordVisibility: () => void;
    onToggleConfirmPasswordVisibility: () => void;
}

export function PersonalInfoStep({
    formData,
    isPasswordVisible,
    isConfirmPasswordVisible,
    updateFormData,
    onSubmit,
    onTogglePasswordVisibility,
    onToggleConfirmPasswordVisibility,
}: PersonalInfoStepProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="text"
                    label="Nome"
                    placeholder="Digite seu nome"
                    value={formData.firstName}
                    onValueChange={(value) => updateFormData('firstName', value)}
                    variant="bordered"
                    size="lg"
                    isRequired
                    classNames={{
                        input: 'text-base',
                        inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                        label: 'text-gray-600',
                    }}
                />

                <Input
                    type="text"
                    label="Sobrenome"
                    placeholder="Digite seu sobrenome"
                    value={formData.lastName}
                    onValueChange={(value) => updateFormData('lastName', value)}
                    variant="bordered"
                    size="lg"
                    isRequired
                    classNames={{
                        input: 'text-base',
                        inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                        label: 'text-gray-600',
                    }}
                />
            </div>

            <Input
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={formData.email}
                onValueChange={(value) => updateFormData('email', value)}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                    input: 'text-base',
                    inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                    label: 'text-gray-600',
                }}
            />

            <Input
                type={isPasswordVisible ? 'text' : 'password'}
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onValueChange={(value) => updateFormData('password', value)}
                variant="bordered"
                size="lg"
                isRequired
                endContent={
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={onTogglePasswordVisibility}
                    >
                        {isPasswordVisible ? (
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

            <Input
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                label="Confirmar Senha"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onValueChange={(value) => updateFormData('confirmPassword', value)}
                variant="bordered"
                size="lg"
                isRequired
                endContent={
                    <button
                        className="focus:outline-none"
                        type="button"
                        onClick={onToggleConfirmPasswordVisibility}
                    >
                        {isConfirmPasswordVisible ? (
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

            <Button
                type="submit"
                size="lg"
                className="w-full font-semibold bg-blue-500 hover:bg-blue-600 text-white mt-2"
            >
                Continuar
            </Button>

            <div className="text-center text-sm">
                <span className="text-gray-600">Já tem uma conta? </span>
                <Link
                    as={NextLink}
                    href="/login"
                    className="text-blue-500 hover:text-blue-600 font-medium"
                >
                    Fazer login
                </Link>
            </div>
        </form>
    );
}


