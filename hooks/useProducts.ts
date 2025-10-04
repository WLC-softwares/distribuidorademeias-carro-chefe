"use client";

import { useEffect, useMemo, useState } from "react";

import { getProductsAction } from "@/controllers";
import { Product, ProductCategory } from "@/models";

export type SaleType = "varejo" | "atacado";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saleType, setSaleType] = useState<SaleType>("varejo");
  const [categoryFilter, setCategoryFilter] = useState<
    ProductCategory | "TODOS"
  >("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductsAction();

        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Unable to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter only active products
      if (!product.active) return false;

      // Filter by category
      if (categoryFilter !== "TODOS" && product.category !== categoryFilter) {
        return false;
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();

        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [products, categoryFilter, searchTerm]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    saleType,
    setSaleType,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
  };
}
