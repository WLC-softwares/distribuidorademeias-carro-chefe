/**
 * Model: Product
 * Type definitions and interfaces for the Product module
 */

import type { ProductCategory, ProductStatus } from "@prisma/client";

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  primary: boolean;
  productId: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  retailPrice: number;
  wholesalePrice: number;
  quantity: number;
  status: ProductStatus;
  category: ProductCategory;
  sku?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImage[];
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  retailPrice: number;
  wholesalePrice: number;
  quantity: number;
  category: ProductCategory;
  sku?: string;
  images?: CreateProductImageDTO[];
}

export interface CreateProductImageDTO {
  url: string;
  alt?: string;
  order?: number;
  primary?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  quantity?: number;
  status?: ProductStatus;
  category?: ProductCategory;
  active?: boolean;
  sku?: string;
  images?: CreateProductImageDTO[];
}

export interface UpdateProductImageDTO {
  url?: string;
  alt?: string;
  order?: number;
  primary?: boolean;
}

export { ProductCategory, ProductStatus };
