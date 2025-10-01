'use client';

import { getUserWithAddressesAction } from '@/controllers';
import { useSession } from '@/hooks';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Endereco {
    id: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    principal: boolean;
}

export default function EnderecosPage() {
    const { user, isLoading } = useSession();
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchEnderecos = async () => {
            if (!user?.id) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                if (mounted) setLoading(true);
                const userData = await getUserWithAddressesAction(user.id);

                if (mounted) {
                    if (userData && 'enderecos' in userData) {
                        setEnderecos(userData.enderecos as Endereco[]);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error('Erro ao buscar endereços:', error);
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchEnderecos();

        return () => {
            mounted = false;
        };
    }, [user?.id]);

    const handleDelete = async (id: string) => {
        // TODO: Implementar exclusão de endereço
        toast.info('Funcionalidade em desenvolvimento');
    };

    const handleSetPrincipal = async (id: string) => {
        // TODO: Implementar definir como principal
        toast.info('Funcionalidade em desenvolvimento');
    };

    if (isLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" color="warning" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Meus Endereços</h1>
                    <p className="text-gray-600 mt-2">
                        Gerencie seus endereços de entrega
                    </p>
                </div>
                <Button
                    color="warning"
                    startContent={<Plus size={20} />}
                    onPress={() => toast.info('Funcionalidade em desenvolvimento')}
                    className="font-semibold"
                >
                    Novo Endereço
                </Button>
            </div>

            {/* Lista de Endereços */}
            {enderecos.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <MapPin size={48} className="text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-700">
                                    Nenhum endereço cadastrado
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    Adicione um endereço para facilitar suas compras
                                </p>
                            </div>
                            <Button
                                color="warning"
                                startContent={<Plus size={20} />}
                                onPress={() => toast.info('Funcionalidade em desenvolvimento')}
                                className="mt-4 font-semibold"
                            >
                                Adicionar Endereço
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enderecos.map((endereco) => (
                        <Card
                            key={endereco.id}
                            className={`hover:shadow-lg transition-shadow ${endereco.principal ? 'border-2 border-yellow-400' : ''
                                }`}
                        >
                            <CardHeader className="flex justify-between items-start">
                                <div className="flex gap-3 items-start">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <MapPin size={20} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">
                                            {endereco.logradouro}, {endereco.numero}
                                        </h3>
                                        {endereco.principal && (
                                            <Chip
                                                color="warning"
                                                variant="flat"
                                                size="sm"
                                                className="mt-1"
                                            >
                                                Principal
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-4">
                                <div className="space-y-1 text-sm text-gray-600">
                                    {endereco.complemento && (
                                        <p>{endereco.complemento}</p>
                                    )}
                                    <p>{endereco.bairro}</p>
                                    <p>
                                        {endereco.cidade} - {endereco.estado}
                                    </p>
                                    <p className="font-semibold">CEP: {endereco.cep}</p>
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2 mt-4">
                                    {!endereco.principal && (
                                        <Button
                                            color="warning"
                                            variant="flat"
                                            size="sm"
                                            onPress={() => handleSetPrincipal(endereco.id)}
                                            className="flex-1"
                                        >
                                            Definir como Principal
                                        </Button>
                                    )}
                                    <Button
                                        color="danger"
                                        variant="light"
                                        size="sm"
                                        isIconOnly
                                        onPress={() => handleDelete(endereco.id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

