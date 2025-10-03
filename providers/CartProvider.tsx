"use client";

import type { Product } from "@/models";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  product: Product;
  quantity: number;
  saleType: "varejo" | "atacado";
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  isInitialized: boolean;
  addItem: (
    product: Product,
    quantity: number,
    saleType: "varejo" | "atacado",
  ) => void;
  removeItem: (productId: string, saleType: "varejo" | "atacado") => void;
  updateQuantity: (
    productId: string,
    saleType: "varejo" | "atacado",
    quantity: number,
  ) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on init
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        // Check if products have the new structure (retailPrice and wholesalePrice)
        const hasOldStructure = parsedCart.some(
          (item: CartItem) =>
            item.product.hasOwnProperty("preco") ||
            item.product.hasOwnProperty("precoVarejo") ||
            !item.product.hasOwnProperty("retailPrice"),
        );

        if (hasOldStructure) {
          // Clear cart with old structure
          console.warn("Old cart structure detected. Clearing...");
          localStorage.removeItem("cart");
          setItems([]);
        } else {
          setItems(parsedCart);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        localStorage.removeItem("cart");
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      if (items.length > 0) {
        localStorage.setItem("cart", JSON.stringify(items));
      } else {
        localStorage.removeItem("cart");
      }
    }
  }, [items, isInitialized]);

  const addItem = (
    product: Product,
    quantity: number,
    saleType: "varejo" | "atacado",
  ) => {
    setLoading(true);
    try {
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) =>
            item.product.id === product.id && item.saleType === saleType,
        );

        if (existingItemIndex >= 0) {
          const newItems = [...prevItems];

          newItems[existingItemIndex].quantity += quantity;

          return newItems;
        } else {
          return [...prevItems, { product, quantity, saleType }];
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (productId: string, saleType: "varejo" | "atacado") => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.product.id === productId && item.saleType === saleType),
      ),
    );
  };

  const updateQuantity = (
    productId: string,
    saleType: "varejo" | "atacado",
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeItem(productId, saleType);

      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.saleType === saleType
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const price =
        item.saleType === "atacado"
          ? item.product.wholesalePrice
          : item.product.retailPrice;

      return total + Number(price) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
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
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
