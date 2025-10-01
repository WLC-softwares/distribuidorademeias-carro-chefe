'use client';

import { getUserSalesAction } from '@/controllers';
import { useSession } from '@/hooks';
import { formatCurrency } from '@/utils';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Image } from '@heroui/image';
import { Spinner } from '@heroui/spinner';
import { Calendar, Package, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

// Simulação de pedidos - depois você pode conectar com a API real
interface Pedido {
    id: string;
    numeroVenda: string;
    status: string;
    total: number;
    createdAt: Date;
    itens: {
        id: string;
        quantidade: number;
        precoUnit: number;
        produto: {
            nome: string;
            imagens: { url: string }[];
        };
    }[];
}

const statusMap: Record<string, { color: 'default' | 'warning' | 'success' | 'danger', label: string }> = {
    PENDENTE: { color: 'warning', label: 'Pendente' },
    PROCESSANDO: { color: 'warning', label: 'Processando' },
    PAGA: { color: 'success', label: 'Paga' },
    ENVIADA: { color: 'success', label: 'Enviada' },
    ENTREGUE: { color: 'success', label: 'Entregue' },
    CANCELADA: { color: 'danger', label: 'Cancelada' },
    REEMBOLSADA: { color: 'default', label: 'Reembolsada' },
};

export default function PedidosPage() {
    const { user, isLoading } = useSession();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const vendas = await getUserSalesAction(user.id);
                setPedidos(vendas as any);
            } catch (error) {
                console.error('Erro ao buscar pedidos:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchPedidos();
        }
    }, [user?.id]);

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
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Meus Pedidos</h1>
                <p className="text-gray-600 mt-2">
                    Acompanhe o status dos seus pedidos
                </p>
            </div>

            {/* Lista de Pedidos */}
            {pedidos.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                                <ShoppingBag size={48} className="text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-700">
                                    Nenhum pedido encontrado
                                </h3>
                                <p className="text-gray-600 mt-2">
                                    Você ainda não fez nenhum pedido
                                </p>
                            </div>
                            <Button
                                color="warning"
                                as="a"
                                href="/"
                                className="mt-4 font-semibold"
                            >
                                Começar a Comprar
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pedidos.map((pedido) => (
                        <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex justify-between items-start">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-yellow-100 rounded-lg">
                                        <Package size={24} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Pedido #{pedido.numeroVenda}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(pedido.createdAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Chip
                                    color={statusMap[pedido.status]?.color || 'default'}
                                    variant="flat"
                                    size="lg"
                                >
                                    {statusMap[pedido.status]?.label || pedido.status}
                                </Chip>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6">
                                {/* Itens do Pedido */}
                                <div className="space-y-4 mb-4">
                                    {pedido.itens.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <Image
                                                src={item.produto.imagens[0]?.url || '/placeholder.png'}
                                                alt={item.produto.nome}
                                                width={80}
                                                height={80}
                                                className="rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">
                                                    {item.produto.nome}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Quantidade: {item.quantidade}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                                    {formatCurrency(Number(item.precoUnit))}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <Divider className="my-4" />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Total</span>
                                    <span className="text-2xl font-bold text-yellow-600">
                                        {formatCurrency(pedido.total)}
                                    </span>
                                </div>

                                {/* Ações */}
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        color="warning"
                                        variant="flat"
                                        size="sm"
                                    >
                                        Ver Detalhes
                                    </Button>
                                    {pedido.status === 'PENDENTE' && (
                                        <Button
                                            color="danger"
                                            variant="light"
                                            size="sm"
                                        >
                                            Cancelar Pedido
                                        </Button>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

