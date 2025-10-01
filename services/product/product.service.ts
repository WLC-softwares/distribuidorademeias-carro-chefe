/**
 * Service: Product
 * Camada de lógica de negócios para produtos
 */

import type { CreateProductDTO, Product, UpdateProductDTO } from '@/models';
import { productRepository } from '@/repositories';

export class ProductService {
    /**
     * Busca todos os produtos
     */
    async getAllProducts(): Promise<Product[]> {
        try {
            const produtos = await productRepository.findAll();
            return produtos.map((p) => ({
                id: p.id,
                nome: p.nome,
                descricao: p.descricao,
                preco: Number(p.preco), // Converter Decimal para number
                quantidade: p.quantidade,
                status: p.status,
                categoria: p.categoria,
                sku: p.sku,
                ativo: p.ativo,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                imagens: p.imagens?.map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt,
                    ordem: img.ordem,
                    principal: img.principal,
                    produtoId: img.produtoId,
                    createdAt: img.createdAt,
                })),
            }));
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            throw new Error('Não foi possível buscar os produtos');
        }
    }

    /**
     * Busca produto por ID
     */
    async getProductById(id: string): Promise<Product | null> {
        try {
            const produto = await productRepository.findById(id);
            if (!produto) return null;

            return {
                id: produto.id,
                nome: produto.nome,
                descricao: produto.descricao,
                preco: Number(produto.preco), // Converter Decimal para number
                quantidade: produto.quantidade,
                status: produto.status,
                categoria: produto.categoria,
                sku: produto.sku,
                ativo: produto.ativo,
                createdAt: produto.createdAt,
                updatedAt: produto.updatedAt,
                imagens: produto.imagens?.map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt,
                    ordem: img.ordem,
                    principal: img.principal,
                    produtoId: img.produtoId,
                    createdAt: img.createdAt,
                })),
            };
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
    }

    /**
     * Cria novo produto
     */
    async createProduct(data: CreateProductDTO): Promise<Product> {
        try {
            const produto = await productRepository.create({
                nome: data.nome,
                descricao: data.descricao,
                preco: data.preco,
                quantidade: data.quantidade,
                categoria: data.categoria,
                sku: data.sku,
                imagens: data.imagens
                    ? {
                        create: data.imagens.map((img, index) => ({
                            url: img.url,
                            alt: img.alt,
                            ordem: img.ordem ?? index,
                            principal: img.principal ?? index === 0,
                        })),
                    }
                    : undefined,
            });

            return {
                id: produto.id,
                nome: produto.nome,
                descricao: produto.descricao,
                preco: Number(produto.preco), // Converter Decimal para number
                quantidade: produto.quantidade,
                status: produto.status,
                categoria: produto.categoria,
                sku: produto.sku,
                ativo: produto.ativo,
                createdAt: produto.createdAt,
                updatedAt: produto.updatedAt,
                imagens: produto.imagens?.map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt,
                    ordem: img.ordem,
                    principal: img.principal,
                    produtoId: img.produtoId,
                    createdAt: img.createdAt,
                })),
            };
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw new Error('Não foi possível criar o produto');
        }
    }

    /**
     * Atualiza produto
     */
    async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
        try {
            const { imagens, ...productData } = data as any;

            let produto;

            if (imagens && imagens.length > 0) {
                produto = await productRepository.update(id, {
                    ...productData,
                    imagens: {
                        deleteMany: {},
                        create: imagens,
                    },
                });
            } else {
                produto = await productRepository.update(id, productData);
            }

            return {
                id: produto.id,
                nome: produto.nome,
                descricao: produto.descricao,
                preco: Number(produto.preco), // Converter Decimal para number
                quantidade: produto.quantidade,
                status: produto.status,
                categoria: produto.categoria,
                sku: produto.sku,
                ativo: produto.ativo,
                createdAt: produto.createdAt,
                updatedAt: produto.updatedAt,
                imagens: produto.imagens?.map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt,
                    ordem: img.ordem,
                    principal: img.principal,
                    produtoId: img.produtoId,
                    createdAt: img.createdAt,
                })),
            };
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw new Error('Não foi possível atualizar o produto');
        }
    }

    /**
     * Deleta produto
     */
    async deleteProduct(id: string): Promise<void> {
        try {
            await productRepository.delete(id);
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            throw new Error('Não foi possível deletar o produto');
        }
    }

    /**
     * Obtém estatísticas de produtos
     */
    async getProductStats() {
        try {
            const [total, ativos, valorEstoque] = await Promise.all([
                productRepository.findAll().then((products) => products.length),
                productRepository.countByStatus('ATIVO'),
                productRepository.getTotalStockValue(),
            ]);

            return { total, ativos, valorEstoque };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw new Error('Não foi possível buscar as estatísticas');
        }
    }
}

export const productService = new ProductService();