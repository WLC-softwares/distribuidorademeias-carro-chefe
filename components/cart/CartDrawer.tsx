'use client';

import { useCart } from '@/hooks';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from '@heroui/drawer';
import { Image } from '@heroui/image';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getTotal, getTotalItems, clearCart } = useCart();

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    const handleClearCart = () => {
        if (confirm('Deseja realmente limpar o carrinho?')) {
            clearCart();
        }
    };

    const totalItems = getTotalItems();
    const total = getTotal();

    return (
        <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
            <DrawerContent>
                <DrawerHeader className="flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} />
                        <h2 className="text-xl font-semibold">Carrinho</h2>
                        {totalItems > 0 && (
                            <Chip size="sm" variant="flat" color="primary">
                                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                            </Chip>
                        )}
                    </div>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={onClose}
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </Button>
                </DrawerHeader>

                <DrawerBody className="p-0">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <ShoppingCart size={64} className="text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Carrinho vazio
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Adicione produtos ao carrinho para continuar
                            </p>
                            <Button color="primary" onPress={onClose}>
                                Continuar comprando
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {items.map((item) => {
                                const imagemPrincipal = item.product.imagens?.find((img) => img.principal)?.url || '/placeholder-product.png';
                                const precoTotal = item.product.preco * item.quantidade;

                                return (
                                    <div key={`${item.product.id}-${item.tipoVenda}`} className="p-4 hover:bg-gray-50 transition">
                                        <div className="flex gap-3">
                                            {/* Imagem */}
                                            <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                <Image
                                                    src={imagemPrincipal}
                                                    alt={item.product.nome}
                                                    className="w-full h-full object-contain"
                                                    removeWrapper
                                                />
                                            </div>

                                            {/* Informações */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                                    {item.product.nome}
                                                </h4>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className={`mb-2 ${item.tipoVenda === 'atacado'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    {item.tipoVenda === 'atacado' ? 'Atacado' : 'Varejo'}
                                                </Chip>

                                                <div className="flex items-center justify-between">
                                                    {/* Controles de Quantidade */}
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            onPress={() => updateQuantity(item.product.id, item.tipoVenda, item.quantidade - 1)}
                                                            isDisabled={item.quantidade <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </Button>
                                                        <span className="text-sm font-medium min-w-[20px] text-center">
                                                            {item.quantidade}
                                                        </span>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            onPress={() => updateQuantity(item.product.id, item.tipoVenda, item.quantidade + 1)}
                                                            isDisabled={item.quantidade >= item.product.quantidade}
                                                        >
                                                            <Plus size={14} />
                                                        </Button>
                                                    </div>

                                                    {/* Preço */}
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            R$ {precoTotal.toFixed(2)}
                                                        </p>
                                                        {item.quantidade > 1 && (
                                                            <p className="text-xs text-gray-500">
                                                                R$ {item.product.preco.toFixed(2)} cada
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botão Remover */}
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                onPress={() => removeItem(item.product.id, item.tipoVenda)}
                                                aria-label="Remover"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DrawerBody>

                {items.length > 0 && (
                    <DrawerFooter className="flex-col gap-3 border-t border-gray-200 p-4">
                        {/* Botão Limpar Carrinho */}
                        <Button
                            variant="light"
                            color="danger"
                            size="sm"
                            onPress={handleClearCart}
                            className="w-full"
                        >
                            Limpar carrinho
                        </Button>

                        <Divider />

                        {/* Total */}
                        <div className="flex justify-between items-center w-full">
                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                            <span className="text-2xl font-bold text-gray-900">
                                R$ {total.toFixed(2)}
                            </span>
                        </div>

                        {/* Botão Finalizar Compra */}
                        <Button
                            color="primary"
                            size="lg"
                            className="w-full font-semibold"
                            onPress={handleCheckout}
                        >
                            Finalizar compra
                        </Button>

                        {/* Botão Continuar Comprando */}
                        <Button
                            variant="bordered"
                            size="lg"
                            className="w-full"
                            onPress={onClose}
                        >
                            Continuar comprando
                        </Button>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
}

