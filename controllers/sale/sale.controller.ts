/**
 * Controller: Sale
 * Server Actions para vendas
 */

"use server";

import { saleService, type CreateSaleData } from "@/services/sale/sale.service";

/**
 * Action: Criar nova venda
 */
export async function createSaleAction(data: CreateSaleData) {
  try {
    return await saleService.createSale(data);
  } catch (error) {
    console.error("Erro no controller de vendas:", error);
    throw error;
  }
}

/**
 * Action: Buscar venda por ID
 */
export async function getSaleByIdAction(id: string) {
  try {
    return await saleService.getSaleById(id);
  } catch (error) {
    console.error("Erro ao buscar venda:", error);
    throw error;
  }
}

/**
 * Action: Listar vendas do usuário
 */
export async function getUserSalesAction(usuarioId: string) {
  try {
    return await saleService.getUserSales(usuarioId);
  } catch (error) {
    console.error("Erro ao listar vendas:", error);
    throw error;
  }
}

/**
 * Action: Atualizar status da venda
 */
export async function updateSaleStatusAction(id: string, status: string) {
  try {
    return await saleService.updateSaleStatus(id, status);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}

/**
 * Action: Listar todas as vendas (Admin)
 */
export async function getAllSalesAction() {
  try {
    return await saleService.getAllSales();
  } catch (error) {
    console.error("Erro ao listar todas as vendas:", error);
    throw error;
  }
}

/**
 * Action: Buscar vendas recentes (Admin Dashboard)
 */
export async function getRecentSalesAction(limit: number = 10) {
  try {
    return await saleService.getRecentSales(limit);
  } catch (error) {
    console.error("Erro ao buscar vendas recentes:", error);
    throw error;
  }
}
