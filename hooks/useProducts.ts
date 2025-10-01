"use client";

import { useState, useEffect, useMemo } from "react";

import { Product, CategoriaProduto } from "@/models";
import { getProductsAction } from "@/controllers";

export type TipoVenda = "varejo" | "atacado";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoVenda, setTipoVenda] = useState<TipoVenda>("varejo");
  const [categoriaFiltro, setCategoriaFiltro] = useState<
    CategoriaProduto | "TODOS"
  >("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar produtos
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductsAction();

        setProducts(data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setError("Não foi possível carregar os produtos");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtrar apenas produtos ativos
      if (!product.ativo) return false;

      // Filtrar por categoria
      if (
        categoriaFiltro !== "TODOS" &&
        product.categoria !== categoriaFiltro
      ) {
        return false;
      }

      // Filtrar por termo de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();

        return (
          product.nome.toLowerCase().includes(searchLower) ||
          product.descricao?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [products, categoriaFiltro, searchTerm]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    tipoVenda,
    setTipoVenda,
    categoriaFiltro,
    setCategoriaFiltro,
    searchTerm,
    setSearchTerm,
  };
}
