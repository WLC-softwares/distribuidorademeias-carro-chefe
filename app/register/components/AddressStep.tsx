import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Spinner } from '@heroui/spinner';
import { CheckCircle, ChevronLeft, XCircle } from 'lucide-react';
import { useState } from 'react';
import { RegisterData } from '../hooks/useRegister';

interface AddressStepProps {
    formData: RegisterData;
    updateFormData: (field: keyof RegisterData, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
    isLoading: boolean;
}

interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export function AddressStep({
    formData,
    updateFormData,
    onSubmit,
    onBack,
    isLoading,
}: AddressStepProps) {
    const [cepLoading, setCepLoading] = useState(false);
    const [cepStatus, setCepStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [cepError, setCepError] = useState('');

    const formatCEP = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const limited = numbers.slice(0, 8);
        return limited.replace(/(\d{5})(\d)/, '$1-$2');
    };

    const searchCEP = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');

        // Só busca se o CEP tiver 8 dígitos
        if (cleanCep.length !== 8) {
            return;
        }

        setCepLoading(true);
        setCepStatus('idle');
        setCepError('');

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data: ViaCEPResponse = await response.json();

            if (data.erro) {
                setCepStatus('error');
                setCepError('CEP não encontrado');
                return;
            }

            // Preencher os campos com os dados da API
            updateFormData('address', data.logradouro || '');
            updateFormData('neighborhood', data.bairro || '');
            updateFormData('city', data.localidade || '');
            updateFormData('state', data.uf || '');

            setCepStatus('success');
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            setCepStatus('error');
            setCepError('Erro ao buscar CEP. Tente novamente.');
        } finally {
            setCepLoading(false);
        }
    };

    const handleCepChange = (value: string) => {
        const formatted = formatCEP(value);
        updateFormData('cep', formatted);

        // Resetar status quando o usuário editar o CEP
        if (cepStatus !== 'idle') {
            setCepStatus('idle');
            setCepError('');
        }

        // Buscar automaticamente quando o CEP estiver completo
        const cleanCep = formatted.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            searchCEP(formatted);
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Indicador de progresso */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>

            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Endereço</h2>
                <p className="text-sm text-gray-600">Última etapa do cadastro</p>
            </div>

            <div className="space-y-2">
                <Input
                    type="text"
                    label="CEP"
                    placeholder="00000-000"
                    value={formData.cep}
                    onValueChange={handleCepChange}
                    variant="bordered"
                    size="lg"
                    isRequired
                    isDisabled={cepLoading}
                    classNames={{
                        input: 'text-base',
                        inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                        label: 'text-gray-600',
                    }}
                    endContent={
                        cepLoading ? (
                            <Spinner size="sm" />
                        ) : cepStatus === 'success' ? (
                            <CheckCircle size={20} className="text-green-500" />
                        ) : cepStatus === 'error' ? (
                            <XCircle size={20} className="text-red-500" />
                        ) : null
                    }
                />
                {cepStatus === 'success' && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Endereço encontrado! Confira os dados abaixo.
                    </p>
                )}
                {cepStatus === 'error' && cepError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle size={14} />
                        {cepError}
                    </p>
                )}
            </div>

            <Input
                type="text"
                label="Endereço"
                placeholder="Rua, avenida, etc."
                value={formData.address}
                onValueChange={(value) => updateFormData('address', value)}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                    input: 'text-base',
                    inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                    label: 'text-gray-600',
                }}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    type="text"
                    label="Número"
                    placeholder="123"
                    value={formData.number}
                    onValueChange={(value) => updateFormData('number', value)}
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
                    label="Complemento"
                    placeholder="Apto, bloco, etc."
                    value={formData.complement}
                    onValueChange={(value) => updateFormData('complement', value)}
                    variant="bordered"
                    size="lg"
                    classNames={{
                        input: 'text-base',
                        inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                        label: 'text-gray-600',
                    }}
                />
            </div>

            <Input
                type="text"
                label="Bairro"
                placeholder="Nome do bairro"
                value={formData.neighborhood}
                onValueChange={(value) => updateFormData('neighborhood', value)}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                    input: 'text-base',
                    inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                    label: 'text-gray-600',
                }}
            />

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <Input
                        type="text"
                        label="Cidade"
                        placeholder="Nome da cidade"
                        value={formData.city}
                        onValueChange={(value) => updateFormData('city', value)}
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
                    type="text"
                    label="Estado"
                    placeholder="UF"
                    value={formData.state}
                    onValueChange={(value) => updateFormData('state', value.toUpperCase())}
                    variant="bordered"
                    size="lg"
                    maxLength={2}
                    isRequired
                    classNames={{
                        input: 'text-base uppercase',
                        inputWrapper: 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500',
                        label: 'text-gray-600',
                    }}
                />
            </div>

            <div className="flex gap-3 mt-2">
                <Button
                    type="button"
                    variant="bordered"
                    size="lg"
                    onClick={onBack}
                    isDisabled={isLoading}
                    className="font-medium border-gray-300 hover:bg-gray-50"
                    startContent={<ChevronLeft size={20} />}
                >
                    Voltar
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    className="flex-1 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>
            </div>
        </form>
    );
}


