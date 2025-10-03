/**
 * Repository: Product
 * Responsible for direct access to product data
 */

import type { Prisma, ProductCategory, ProductStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class ProductRepository {
  /**
   * Find all products with images
   */
  async findAll() {
    return await prisma.product.findMany({
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find product by ID with images
   */
  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string) {
    return await prisma.product.findMany({
      where: { category: category as ProductCategory },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Create new product
   */
  async create(data: Prisma.ProductCreateInput) {
    return await prisma.product.create({
      data,
      include: {
        images: true,
      },
    });
  }

  /**
   * Update product
   */
  async update(id: string, data: Prisma.ProductUpdateInput) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
      },
    });
  }

  /**
   * Delete product
   */
  async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Count all products
   */
  async count() {
    return await prisma.product.count();
  }

  /**
   * Count active products
   */
  async countActive() {
    return await prisma.product.count({
      where: { active: true },
    });
  }

  /**
   * Count products by category
   */
  async countByCategory(category: ProductCategory) {
    return await prisma.product.count({
      where: { category },
    });
  }

  /**
   * Count products by status
   */
  async countByStatus(status: ProductStatus) {
    return await prisma.product.count({
      where: { status },
    });
  }

  /**
   * Calculate total stock value (based on retail price)
   */
  async getTotalStockValue() {
    const products = await prisma.product.findMany({
      where: { active: true },
    });

    return products.reduce((total, product) => {
      return total + Number(product.retailPrice) * product.quantity;
    }, 0);
  }
}

export const productRepository = new ProductRepository();
