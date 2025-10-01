import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { ChevronLeft } from 'lucide-react';
import { RegisterData } from '../hooks/useRegister';

interface DocumentStepProps {
    formData: RegisterData;
    updateFormData: (field: keyof RegisterData, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

export function DocumentStep({
    formData,
    updateFormData,
    onSubmit,
    onBack,
}: DocumentStepProps) {
    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const limited = numbers.slice(0, 11);
        return limited
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const limited = numbers.slice(0, 11);
        if (limited.length <= 10) {
            return limited.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3');
        }
        return limited.replace(/(\d{2})(\d{5})(\d)/, '($1) $2-$3');
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Indicador de progresso */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            </div>

            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Documentos</h2>
                <p className="text-sm text-gray-600">Precisamos de algumas informações adicionais</p>
            </div>

            <Input
                type="text"
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onValueChange={(value) => updateFormData('cpf', formatCPF(value))}
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
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onValueChange={(value) => updateFormData('phone', formatPhone(value))}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                    input: 'text-base',
                    inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                    label: 'text-gray-600',
                }}
            />

            <div className="flex gap-3 mt-2">
                <Button
                    type="button"
                    variant="bordered"
                    size="lg"
                    onClick={onBack}
                    className="font-medium border-gray-300 hover:bg-gray-50"
                    startContent={<ChevronLeft size={20} />}
                >
                    Voltar
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    className="flex-1 font-semibold bg-blue-500 hover:bg-blue-600 text-white"
                >
                    Continuar
                </Button>
            </div>
        </form>
    );
}


