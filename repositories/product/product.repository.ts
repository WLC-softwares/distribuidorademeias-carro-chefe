/**
 * Repository: Product
 * Responsável pelo acesso direto aos dados de produtos
 */

import { prisma } from '@/lib/prisma';
import type { CategoriaProduto, Prisma, StatusProduto } from '@prisma/client';

export class ProductRepository {
    /**
     * Busca todos os produtos com imagens
     */
    async findAll() {
        return await prisma.produto.findMany({
            include: {
                imagens: {
                    orderBy: {
                        ordem: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Busca produto por ID com imagens
     */
    async findById(id: string) {
        return await prisma.produto.findUnique({
            where: { id },
            include: {
                imagens: {
                    orderBy: {
                        ordem: 'asc',
                    },
                },
            },
        });
    }

    /**
     * Cria novo produto
     */
    async create(data: Prisma.ProdutoCreateInput) {
        return await prisma.produto.create({
            data,
            include: {
                imagens: true,
            },
        });
    }

    /**
     * Atualiza produto
     */
    async update(id: string, data: Prisma.ProdutoUpdateInput) {
        return await prisma.produto.update({
            where: { id },
            data,
            include: {
                imagens: true,
            },
        });
    }

    /**
     * Deleta produto
     */
    async delete(id: string) {
        return await prisma.produto.delete({
            where: { id },
        });
    }

    /**
     * Conta produtos por categoria
     */
    async countByCategory(categoria: CategoriaProduto) {
        return await prisma.produto.count({
            where: { categoria },
        });
    }

    /**
     * Conta produtos por status
     */
    async countByStatus(status: StatusProduto) {
        return await prisma.produto.count({
            where: { status },
        });
    }

    /**
     * Calcula valor total do estoque
     */
    async getTotalStockValue() {
        const produtos = await prisma.produto.findMany({
            where: { ativo: true },
        });

        return produtos.reduce((total, produto) => {
            return total + Number(produto.preco) * produto.quantidade;
        }, 0);
    }
}

export const productRepository = new ProductRepository();