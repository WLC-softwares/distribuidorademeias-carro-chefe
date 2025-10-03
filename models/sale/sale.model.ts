/**
 * Model: Sale
 * Type definitions and interfaces for the Sale module
 */

import type { PaymentMethod, SaleStatus } from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

export interface Sale {
  id: string;
  saleNumber: string;
  status: SaleStatus;
  subtotal: Decimal;
  discount: Decimal;
  total: Decimal;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  canceledAt?: Date | null;
}

export interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: Decimal;
  subtotal: Decimal;
  discount: Decimal;
  total: Decimal;
  saleId: string;
  productId: string;
  createdAt: Date;
}

export interface CreateSaleDTO {
  userId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: CreateSaleItemDTO[];
}

export interface CreateSaleItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export { PaymentMethod, SaleStatus };
