/**
 * Controller: Product
 * Server Actions para o módulo de produtos
 */

'use server';

import type { CreateProductDTO, UpdateProductDTO } from '@/models';
import { productService } from '@/services';

/**
 * Action: Obter todos os produtos
 */
export async function getProductsAction() {
    try {
        return await productService.getAllProducts();
    } catch (error) {
        console.error('Erro no controller de produtos:', error);
        throw error;
    }
}

/**
 * Action: Obter estatísticas de produtos
 */
export async function getProductStatsAction() {
    try {
        return await productService.getProductStats();
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
}

/**
 * Action: Obter produto por ID
 */
export async function getProductByIdAction(id: string) {
    try {
        return await productService.getProductById(id);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        throw error;
    }
}

/**
 * Action: Criar produto
 */
export async function createProductAction(data: CreateProductDTO) {
    try {
        return await productService.createProduct(data);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
    }
}

/**
 * Action: Atualizar produto
 */
export async function updateProductAction(id: string, data: UpdateProductDTO) {
    try {
        return await productService.updateProduct(id, data);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
    }
}

/**
 * Action: Deletar produto
 */
export async function deleteProductAction(id: string) {
    try {
        await productService.deleteProduct(id);
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
    }
}