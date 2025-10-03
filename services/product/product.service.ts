/**
 * Service: Product
 * Business logic layer for products
 */

import type { CreateProductDTO, Product, UpdateProductDTO } from "@/models";

import { productRepository } from "@/repositories";

/**
 * Helper to serialize products and remove Decimal objects
 */
function serializeProduct(product: any): Product {
  return JSON.parse(
    JSON.stringify({
      id: product.id,
      name: product.name,
      description: product.description,
      retailPrice: Number(product.retailPrice),
      wholesalePrice: Number(product.wholesalePrice),
      quantity: product.quantity,
      status: product.status,
      category: product.category,
      sku: product.sku,
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
        primary: img.primary,
        productId: img.productId,
        createdAt: img.createdAt,
      })),
    }),
  );
}

export class ProductService {
  /**
   * Lista todos os produtos ativos
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const products = await productRepository.findAll();

      return products.map(serializeProduct);
    } catch (error) {
      console.error("Error loading products:", error);
      throw new Error("Unable to load products");
    }
  }

  /**
   * Busca produto por ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await productRepository.findById(id);

      if (!product) return null;

      return serializeProduct(product);
    } catch (error) {
      console.error("Error loading product:", error);
      throw new Error("Unable to load product");
    }
  }

  /**
   * Cria novo produto
   */
  async createProduct(data: CreateProductDTO): Promise<Product> {
    try {
      const product = await productRepository.create({
        name: data.name,
        description: data.description,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        quantity: data.quantity,
        category: data.category,
        sku: data.sku,
        images: data.images
          ? {
            create: data.images.map((img, index) => ({
              url: img.url,
              alt: img.alt,
              order: img.order ?? index,
              primary: img.primary ?? index === 0,
            })),
          }
          : undefined,
      });

      return serializeProduct(product);
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Unable to create product");
    }
  }

  /**
   * Atualiza produto
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    try {
      const { images, ...productData } = data as any;

      let product;

      if (images && images.length > 0) {
        product = await productRepository.update(id, {
          ...productData,
          images: {
            deleteMany: {},
            create: images.map((img: any, index: number) => ({
              url: img.url,
              alt: img.alt,
              order: img.order ?? index,
              primary: img.primary ?? index === 0,
            })),
          },
        });
      } else {
        product = await productRepository.update(id, productData);
      }

      return serializeProduct(product);
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Unable to update product");
    }
  }

  /**
   * Deleta produto
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await productRepository.delete(id);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Unable to delete product");
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await productRepository.findByCategory(category);

      return products.map(serializeProduct);
    } catch (error) {
      console.error("Error loading products:", error);
      throw new Error("Unable to load products");
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<{ total: number; active: number; stockValue: number }> {
    try {
      const [total, active, products] = await Promise.all([
        productRepository.count(),
        productRepository.countActive(),
        productRepository.findAll(),
      ]);

      // Calculate total stock value
      const stockValue = products.reduce((acc, product) => {
        return acc + Number(product.retailPrice) * product.quantity;
      }, 0);

      return { total, active, stockValue };
    } catch (error) {
      console.error("Error fetching product stats:", error);
      throw new Error("Unable to fetch product stats");
    }
  }
}

export const productService = new ProductService();
