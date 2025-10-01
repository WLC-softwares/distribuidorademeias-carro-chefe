'use client';

import type { Product } from '@/models';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
    product: Product;
    quantidade: number;
    tipoVenda: 'varejo' | 'atacado';
}

interface CartContextType {
    items: CartItem[];
    loading: boolean;
    isInitialized: boolean;
    addItem: (product: Product, quantidade: number, tipoVenda: 'varejo' | 'atacado') => void;
    removeItem: (productId: string, tipoVenda: 'varejo' | 'atacado') => void;
    updateQuantity: (productId: string, tipoVenda: 'varejo' | 'atacado', quantidade: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Carregar carrinho do localStorage ao iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (err) {
                console.error('Erro ao carregar carrinho:', err);
            }
        }
        setIsInitialized(true);
    }, []);

    // Salvar carrinho no localStorage sempre que mudar
    useEffect(() => {
        if (isInitialized) {
            if (items.length > 0) {
                localStorage.setItem('cart', JSON.stringify(items));
            } else {
                localStorage.removeItem('cart');
            }
        }
    }, [items, isInitialized]);

    const addItem = (product: Product, quantidade: number, tipoVenda: 'varejo' | 'atacado') => {
        setLoading(true);
        try {
            setItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(
                    item => item.product.id === product.id && item.tipoVenda === tipoVenda
                );

                if (existingItemIndex >= 0) {
                    const newItems = [...prevItems];
                    newItems[existingItemIndex].quantidade += quantidade;
                    return newItems;
                } else {
                    return [...prevItems, { product, quantidade, tipoVenda }];
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (productId: string, tipoVenda: 'varejo' | 'atacado') => {
        setItems(prevItems =>
            prevItems.filter(item => !(item.product.id === productId && item.tipoVenda === tipoVenda))
        );
    };

    const updateQuantity = (productId: string, tipoVenda: 'varejo' | 'atacado', quantidade: number) => {
        if (quantidade <= 0) {
            removeItem(productId, tipoVenda);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId && item.tipoVenda === tipoVenda
                    ? { ...item, quantidade }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart');
    };

    const getTotal = () => {
        return items.reduce((total, item) => {
            return total + (Number(item.product.preco) * item.quantidade);
        }, 0);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantidade, 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                loading,
                isInitialized,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getTotal,
                getTotalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

