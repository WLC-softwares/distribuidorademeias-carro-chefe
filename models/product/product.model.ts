/**
 * Model: Product
 * Definições de tipos e interfaces para o módulo de Produto
 */

import type { CategoriaProduto, StatusProduto } from "@prisma/client";

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  ordem: number;
  principal: boolean;
  produtoId: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number; // Mudado de Decimal para number
  quantidade: number;
  status: StatusProduto;
  categoria: CategoriaProduto;
  sku?: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  imagens?: ProductImage[];
}

export interface CreateProductDTO {
  nome: string;
  descricao?: string;
  preco: number;
  quantidade: number;
  categoria: CategoriaProduto;
  sku?: string;
  imagens?: CreateProductImageDTO[];
}

export interface CreateProductImageDTO {
  url: string;
  alt?: string;
  ordem?: number;
  principal?: boolean;
}

export interface UpdateProductDTO {
  nome?: string;
  descricao?: string;
  preco?: number;
  quantidade?: number;
  status?: StatusProduto;
  categoria?: CategoriaProduto;
  ativo?: boolean;
  sku?: string;
  imagens?: CreateProductImageDTO[];
}

export interface UpdateProductImageDTO {
  url?: string;
  alt?: string;
  ordem?: number;
  principal?: boolean;
}

export { CategoriaProduto, StatusProduto };
