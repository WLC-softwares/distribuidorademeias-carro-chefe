'use client';

import { Product } from '@/models';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Image } from '@heroui/image';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: Product;
    tipoVenda: 'varejo' | 'atacado';
}

export function ProductCard({ product, tipoVenda }: ProductCardProps) {
    const router = useRouter();
    const imagemPrincipal = product.imagens?.find((img) => img.principal)?.url || '/placeholder-product.png';

    // Preço sem desconto (checkout via WhatsApp)
    const preco = product.preco;

    const categoriaLabels: Record<string, string> = {
        MEIAS_MASCULINAS: 'Masculinas',
        MEIAS_FEMININAS: 'Femininas',
        MEIAS_INFANTIS: 'Infantis',
        MEIAS_ESPORTIVAS: 'Esportivas',
        MEIAS_SOCIAIS: 'Sociais',
        MEIAS_TERMICAS: 'Térmicas',
        ACESSORIOS: 'Acessórios',
        OUTROS: 'Outros',
    };

    const temEstoque = product.quantidade > 0 && product.status === 'ATIVO';

    return (
        <Card
            className="group relative hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-white"
            isPressable
            shadow="sm"
            onPress={() => router.push(`/produto/${product.id}`)}
        >
            <CardBody className="p-0">
                {/* Imagem do Produto */}
                <div className="relative w-full aspect-square overflow-hidden bg-white">
                    <Image
                        src={imagemPrincipal}
                        alt={product.nome}
                        className="w-full h-full object-contain p-4 z-0"
                        fallbackSrc="/placeholder-product.png"
                        removeWrapper
                    />

                    {/* Badge de Tipo de Venda - Sempre Visível */}
                    <div className="absolute top-2 left-2">
                        <Chip
                            size="sm"
                            variant="solid"
                            className={`text-xs font-semibold ${tipoVenda === 'atacado'
                                ? 'bg-purple-600 text-white'
                                : 'bg-green-600 text-white'
                                }`}
                        >
                            {tipoVenda === 'atacado' ? 'Atacado' : 'Varejo'}
                        </Chip>
                    </div>
                </div>

                {/* Informações do Produto */}
                <div className="p-3 space-y-1">
                    {/* Preço */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-normal">
                                R$
                            </span>
                            <span className="text-3xl font-light">
                                {Math.floor(preco)}
                            </span>
                            <span className="text-xl font-light">
                                {(preco % 1).toFixed(2).substring(1)}
                            </span>
                        </div>
                    </div>

                    {/* Nome do Produto */}
                    <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight mt-2" style={{ minHeight: '2.5rem' }}>
                        {product.nome}
                    </h3>

                    {/* Categoria */}
                    <p className="text-xs text-gray-500">
                        {categoriaLabels[product.categoria]}
                    </p>

                    {/* Status de Estoque */}
                    {!temEstoque && (
                        <div className="mt-2">
                            <Chip
                                size="sm"
                                variant="flat"
                                color="danger"
                                className="text-xs"
                            >
                                {product.status === 'ESGOTADO' ? 'Esgotado' : 'Indisponível'}
                            </Chip>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

