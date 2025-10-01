import { registerAction } from '@/controllers';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type RegisterStep = 'personal' | 'document' | 'address';

export interface RegisterData {
    // Informações Pessoais
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    // Documentos
    cpf: string;
    phone: string;
    // Endereço
    cep: string;
    address: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
}

export function useRegister() {
    const router = useRouter();
    const [step, setStep] = useState<RegisterStep>('personal');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<RegisterData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        cpf: '',
        phone: '',
        cep: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });

    const updateFormData = (field: keyof RegisterData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError('');
    };

    const validatePersonalInfo = () => {
        if (!formData.firstName.trim()) {
            setError('Nome é obrigatório');
            return false;
        }
        if (!formData.lastName.trim()) {
            setError('Sobrenome é obrigatório');
            return false;
        }
        if (!formData.email.trim()) {
            setError('E-mail é obrigatório');
            return false;
        }
        if (!formData.password) {
            setError('Senha é obrigatória');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Senha deve ter no mínimo 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return false;
        }
        return true;
    };

    const validateDocument = () => {
        if (!formData.cpf.trim()) {
            setError('CPF é obrigatório');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Telefone é obrigatório');
            return false;
        }
        return true;
    };

    const validateAddress = () => {
        if (!formData.cep.trim()) {
            setError('CEP é obrigatório');
            return false;
        }
        if (!formData.address.trim()) {
            setError('Endereço é obrigatório');
            return false;
        }
        if (!formData.number.trim()) {
            setError('Número é obrigatório');
            return false;
        }
        if (!formData.neighborhood.trim()) {
            setError('Bairro é obrigatório');
            return false;
        }
        if (!formData.city.trim()) {
            setError('Cidade é obrigatória');
            return false;
        }
        if (!formData.state.trim()) {
            setError('Estado é obrigatório');
            return false;
        }
        return true;
    };

    const handlePersonalInfoNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePersonalInfo()) {
            setStep('document');
        }
    };

    const handleDocumentNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateDocument()) {
            setStep('address');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAddress()) return;

        setIsLoading(true);
        setError('');

        try {
            // Preparar dados do usuário
            const userData = {
                nome: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                senha: formData.password,
                telefone: formData.phone,
                cpf: formData.cpf,
                enderecos: [
                    {
                        cep: formData.cep,
                        logradouro: formData.address,
                        numero: formData.number,
                        complemento: formData.complement || undefined,
                        bairro: formData.neighborhood,
                        cidade: formData.city,
                        estado: formData.state,
                        principal: true,
                    },
                ],
            };

            // Registrar usuário
            const result = await registerAction(userData);

            if (result.success) {
                // Fazer login automático após registro
                const loginResult = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (loginResult?.error) {
                    // Se houver erro no login, redirecionar para página de login
                    router.push('/login');
                } else {
                    // Login bem-sucedido, redirecionar para home
                    router.push('/');
                }
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setError('');
        if (step === 'document') {
            setStep('personal');
        } else if (step === 'address') {
            setStep('document');
        }
    };

    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

    return {
        // Estado
        step,
        formData,
        isPasswordVisible,
        isConfirmPasswordVisible,
        error,
        isLoading,
        // Funções
        updateFormData,
        handlePersonalInfoNext,
        handleDocumentNext,
        handleRegister,
        handleBack,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
    };
}


