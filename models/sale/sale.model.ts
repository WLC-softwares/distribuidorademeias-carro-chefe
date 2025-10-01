/**
 * Model: Sale (Venda)
 * Definições de tipos e interfaces para o módulo de Vendas
 */

import type { FormaPagamento, StatusVenda } from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

export interface Sale {
  id: string;
  numeroVenda: string;
  status: StatusVenda;
  subtotal: Decimal;
  desconto: Decimal;
  total: Decimal;
  formaPagamento: FormaPagamento;
  observacoes?: string | null;
  usuarioId: string;
  createdAt: Date;
  updatedAt: Date;
  finalizadaEm?: Date | null;
  canceladaEm?: Date | null;
}

export interface SaleItem {
  id: string;
  quantidade: number;
  precoUnit: Decimal;
  subtotal: Decimal;
  desconto: Decimal;
  total: Decimal;
  vendaId: string;
  produtoId: string;
  createdAt: Date;
}

export interface CreateSaleDTO {
  usuarioId: string;
  formaPagamento: FormaPagamento;
  observacoes?: string;
  itens: CreateSaleItemDTO[];
}

export interface CreateSaleItemDTO {
  produtoId: string;
  quantidade: number;
  precoUnit: number;
  desconto?: number;
}

export { FormaPagamento, StatusVenda };
