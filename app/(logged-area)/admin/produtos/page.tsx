'use client';

import { deleteProductAction, getProductsAction, getProductStatsAction } from '@/controllers';
import type { Product } from '@/models';
import { formatCurrency } from '@/utils';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Input } from '@heroui/input';
import { Pagination } from '@heroui/pagination';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { Edit, Package, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ProductDrawer } from './components';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({ total: 0, ativos: 0, valorEstoque: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, statsData] = await Promise.all([
                getProductsAction(),
                getProductStatsAction(),
            ]);
            setProducts(productsData);
            setStats(statsData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsDrawerOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este produto?')) return;

        try {
            await deleteProductAction(id);
            await loadData();
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            alert('Erro ao deletar produto');
        }
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedProduct(null);
    };

    const handleDrawerSuccess = () => {
        loadData();
    };

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            product.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getStatusInfo = (product: Product) => {
        if (product.quantidade === 0) {
            return { label: 'Sem estoque', color: 'danger' as const };
        } else if (product.quantidade < 20) {
            return { label: 'Estoque baixo', color: 'warning' as const };
        } else {
            return { label: 'Em estoque', color: 'success' as const };
        }
    };

    const getCategoriaLabel = (categoria: string) => {
        const labels: Record<string, string> = {
            MEIAS_MASCULINAS: 'Masculinas',
            MEIAS_FEMININAS: 'Femininas',
            MEIAS_INFANTIS: 'Infantis',
            MEIAS_ESPORTIVAS: 'Esportivas',
            MEIAS_SOCIAIS: 'Sociais',
            MEIAS_TERMICAS: 'Térmicas',
            ACESSORIOS: 'Acessórios',
            OUTROS: 'Outros',
        };
        return labels[categoria] || categoria;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 md:space-y-6 p-4 md:p-0">
                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Gerenciamento de Produtos
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Gerencie seu estoque e produtos
                        </p>
                    </div>
                    <Button
                        color="warning"
                        size="lg"
                        startContent={<Plus size={18} />}
                        className="bg-yellow-400 hover:bg-yellow-500 font-semibold w-full md:w-auto"
                        onClick={handleAddProduct}
                    >
                        Adicionar Produto
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="shadow-md">
                        <CardBody className="p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 font-medium">
                                        Total de Produtos
                                    </p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 md:mt-2">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="p-3 md:p-4 rounded-full bg-blue-100">
                                    <Package className="text-blue-600" size={20} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-md">
                        <CardBody className="p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 font-medium">
                                        Produtos Ativos
                                    </p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 md:mt-2">
                                        {stats.ativos}
                                    </p>
                                </div>
                                <div className="p-3 md:p-4 rounded-full bg-green-100">
                                    <Package className="text-green-600" size={20} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-md sm:col-span-2 lg:col-span-1">
                        <CardBody className="p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 font-medium">
                                        Valor em Estoque
                                    </p>
                                    <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 md:mt-2">
                                        {formatCurrency(stats.valorEstoque)}
                                    </p>
                                </div>
                                <div className="p-3 md:p-4 rounded-full bg-purple-100">
                                    <Package className="text-purple-600" size={20} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Search and Items per page */}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<Search size={18} className="text-gray-400" />}
                            size="lg"
                            classNames={{
                                inputWrapper: 'border-gray-300 shadow-sm',
                            }}
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <Select
                            label="Itens por página"
                            selectedKeys={[itemsPerPage.toString()]}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            size="sm"
                            classNames={{
                                base: 'w-full sm:w-[180px]',
                            }}
                        >
                            <SelectItem key="5">5</SelectItem>
                            <SelectItem key="10">10</SelectItem>
                            <SelectItem key="20">20</SelectItem>
                            <SelectItem key="50">50</SelectItem>
                        </Select>
                    </div>
                </div>

                {/* Products Table */}
                <Card className="shadow-md overflow-hidden">
                    <CardHeader className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            Produtos ({filteredProducts.length})
                        </h2>
                        <span className="text-xs md:text-sm text-gray-600">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}{' '}
                            de {filteredProducts.length}
                        </span>
                    </CardHeader>
                    <CardBody className="p-0 overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden lg:block w-full overflow-hidden">
                            <div className="w-full">
                                <table className="w-full table-fixed">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-[30%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Produto
                                            </th>
                                            <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Categoria
                                            </th>
                                            <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Preço
                                            </th>
                                            <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Estoque
                                            </th>
                                            <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentProducts.map((product) => {
                                            const statusInfo = getStatusInfo(product);
                                            const imagemPrincipal = product.imagens?.find(
                                                (img) => img.principal
                                            );

                                            return (
                                                <tr
                                                    key={product.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {imagemPrincipal ? (
                                                                <Image
                                                                    src={imagemPrincipal.url}
                                                                    alt={imagemPrincipal.alt || product.nome}
                                                                    width={48}
                                                                    height={48}
                                                                    className="rounded-lg object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <Package
                                                                        size={24}
                                                                        className="text-gray-400"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                                    {product.nome}
                                                                </p>
                                                                {product.descricao && (
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {product.descricao}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-gray-600 truncate block">
                                                            {getCategoriaLabel(product.categoria)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-gray-600 font-mono truncate block">
                                                            {product.sku || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm font-semibold text-gray-800 truncate block">
                                                            {formatCurrency(Number(product.preco))}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-gray-800 truncate block">
                                                            {product.quantidade} un.
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Chip
                                                            color={statusInfo.color}
                                                            size="sm"
                                                            variant="flat"
                                                        >
                                                            {statusInfo.label}
                                                        </Chip>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                className="text-blue-600 hover:bg-blue-50"
                                                                onClick={() => handleEditProduct(product)}
                                                            >
                                                                <Edit size={16} />
                                                            </Button>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDelete(product.id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile/Tablet Cards */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {currentProducts.map((product) => {
                                const statusInfo = getStatusInfo(product);
                                const imagemPrincipal = product.imagens?.find((img) => img.principal);

                                return (
                                    <div
                                        key={product.id}
                                        className="p-3 md:p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                {imagemPrincipal ? (
                                                    <Image
                                                        src={imagemPrincipal.url}
                                                        alt={imagemPrincipal.alt || product.nome}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Package size={28} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                                                            {product.nome}
                                                        </h3>
                                                        {product.descricao && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {product.descricao}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Chip
                                                        color={statusInfo.color}
                                                        size="sm"
                                                        variant="flat"
                                                        className="flex-shrink-0"
                                                    >
                                                        {statusInfo.label}
                                                    </Chip>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mb-2.5">
                                                    <div>
                                                        <span className="text-gray-500">Categoria:</span>
                                                        <p className="text-gray-800 font-medium truncate">
                                                            {getCategoriaLabel(product.categoria)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">SKU:</span>
                                                        <p className="text-gray-800 font-mono font-medium truncate">
                                                            {product.sku || '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Preço:</span>
                                                        <p className="text-gray-800 font-bold">
                                                            {formatCurrency(Number(product.preco))}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Estoque:</span>
                                                        <p className="text-gray-800 font-medium">
                                                            {product.quantidade} un.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        startContent={<Edit size={14} />}
                                                        onClick={() => handleEditProduct(product)}
                                                        className="flex-1 text-xs"
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="danger"
                                                        startContent={<Trash2 size={14} />}
                                                        onClick={() => handleDelete(product.id)}
                                                        className="flex-1 text-xs"
                                                    >
                                                        Deletar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <div className="py-12 text-center px-4">
                                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                                    Nenhum produto encontrado
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {searchTerm
                                        ? 'Tente ajustar sua busca'
                                        : 'Adicione seu primeiro produto'}
                                </p>
                            </div>
                        )}
                    </CardBody>

                    {/* Paginação */}
                    {filteredProducts.length > 0 && totalPages > 1 && (
                        <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex justify-center">
                            <Pagination
                                total={totalPages}
                                page={currentPage}
                                onChange={setCurrentPage}
                                showControls
                                size="sm"
                                color="warning"
                                classNames={{
                                    cursor: 'bg-yellow-400 text-black',
                                }}
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Product Drawer */}
            <ProductDrawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                onSuccess={handleDrawerSuccess}
                product={selectedProduct}
            />
        </>
    );
}