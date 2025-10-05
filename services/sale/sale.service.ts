/**
 * Service: Sale
 * Business logic for managing sales
 */

import type { CartItem } from "@/hooks/useCart";

import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notification/notification.service";

export interface CreateSaleData {
  usuarioId: string;
  items: CartItem[];
  observacoes?: string;
  shippingAddress?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country?: string;
  };
}

export interface SaleResponse {
  id: string;
  numeroVenda: string;
  total: number;
  status: string;
}

class SaleService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Create new sale
   */
  async createSale(data: CreateSaleData): Promise<SaleResponse> {
    try {
      // 📦 Validate available stock before creating the sale
      const insufficientProducts: string[] = [];

      for (const item of data.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.product.id },
          select: { quantity: true, name: true },
        });

        if (!product) {
          throw new Error(`Product ${item.product.name} not found`);
        }

        if (product.quantity < item.quantity) {
          insufficientProducts.push(
            `${product.name} (available: ${product.quantity}, requested: ${item.quantity})`,
          );
        }
      }

      if (insufficientProducts.length > 0) {
        throw new Error(
          `Insufficient stock for: ${insufficientProducts.join(", ")}`,
        );
      }

      // Calculate subtotal and total
      const subtotal = data.items.reduce((acc, item) => {
        const price =
          item.saleType === "atacado"
            ? item.product.wholesalePrice
            : item.product.retailPrice;

        return acc + Number(price) * item.quantity;
      }, 0);

      const total = subtotal; // No discount for now

      // Generate sale number (format: YYYYMMDD-XXXXX)
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();
      const saleNumber = `${dateStr}-${randomStr}`;

      // Use provided shipping address or get user's primary address as fallback
      let shippingData = data.shippingAddress;

      if (!shippingData) {
        const primaryAddress = await prisma.address.findFirst({
          where: {
            userId: data.usuarioId,
            primary: true,
          },
        });

        if (primaryAddress) {
          shippingData = {
            zipCode: primaryAddress.zipCode,
            street: primaryAddress.street,
            number: primaryAddress.number,
            complement: primaryAddress.complement || undefined,
            neighborhood: primaryAddress.neighborhood,
            city: primaryAddress.city,
            state: primaryAddress.state,
            country: primaryAddress.country,
          };
        }
      }

      // Create sale with items
      const sale = await prisma.sale.create({
        data: {
          saleNumber: saleNumber,
          userId: data.usuarioId,
          subtotal,
          discount: 0,
          total,
          paymentMethod: "PIX", // Default, will be confirmed via WhatsApp
          status: "PENDING",
          notes: data.observacoes || null,
          // Copy shipping address
          shippingZipCode: shippingData?.zipCode || null,
          shippingStreet: shippingData?.street || null,
          shippingNumber: shippingData?.number || null,
          shippingComplement: shippingData?.complement || null,
          shippingNeighborhood: shippingData?.neighborhood || null,
          shippingCity: shippingData?.city || null,
          shippingState: shippingData?.state || null,
          shippingCountry: shippingData?.country || "Brasil",
          items: {
            create: data.items.map((item) => {
              const price =
                item.saleType === "atacado"
                  ? item.product.wholesalePrice
                  : item.product.retailPrice;

              return {
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: price,
                subtotal: Number(price) * item.quantity,
                discount: 0,
                total: Number(price) * item.quantity,
                saleType: item.saleType === "atacado" ? "WHOLESALE" : "RETAIL",
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 🔔 Create notification for the user
      try {
        await this.notificationService.createOrderNotification(
          data.usuarioId,
          sale.saleNumber,
          sale.id,
        );
      } catch (_error) {
        // Don't block sale creation
      }

      // 📧 Email will be sent only after payment confirmation via webhook

      return {
        id: sale.id,
        numeroVenda: sale.saleNumber,
        total: Number(sale.total),
        status: sale.status,
      };
    } catch (_error) {
      throw new Error("Unable to create sale");
    }
  }

  /**
   * Get sale by ID
   */
  async getSaleById(id: string) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              cpf: true,
            },
          },
        },
      });

      if (!sale) return null;

      // Convert Decimals to numbers
      return {
        ...sale,
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount),
        total: Number(sale.total),
        shippingCost: sale.shippingCost ? Number(sale.shippingCost) : null,
        items: sale.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          discount: Number(item.discount),
          total: Number(item.total),
          product: {
            ...item.product,
            retailPrice: Number(item.product.retailPrice),
            wholesalePrice: Number(item.product.wholesalePrice),
          },
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * List user sales
   */
  async getUserSales(usuarioId: string) {
    try {
      const sales = await prisma.sale.findMany({
        where: { userId: usuarioId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Convert Decimals to numbers
      return sales.map((sale) => ({
        ...sale,
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount),
        total: Number(sale.total),
        shippingCost: sale.shippingCost ? Number(sale.shippingCost) : null,
        items: sale.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          discount: Number(item.discount),
          total: Number(item.total),
          product: {
            ...item.product,
            retailPrice: Number(item.product.retailPrice),
            wholesalePrice: Number(item.product.wholesalePrice),
          },
        })),
      }));
    } catch (error) {
      console.error("Error listing sales:", error);
      throw error;
    }
  }

  /**
   * Update sale status
   */
  async updateSaleStatus(id: string, status: string) {
    try {
      // Fetch current sale to get previous status
      const currentSale = await prisma.sale.findUnique({
        where: { id },
        select: { status: true, saleNumber: true, userId: true },
      });

      const oldStatus = currentSale?.status;

      const sale = await prisma.sale.update({
        where: { id },
        data: { status: status as any },
      });

      // 🔔 Create status change notification
      if (currentSale && oldStatus !== status) {
        try {
          await this.notificationService.createOrderStatusNotification(
            currentSale.userId,
            currentSale.saleNumber,
            id,
            status,
            oldStatus,
          );
        } catch (error) {
          console.error("Error creating status notification:", error);
          // Don't block the update
        }

        // 📧 Send status update email
        try {
          const user = await prisma.user.findUnique({
            where: { id: currentSale.userId },
          });

          if (user) {
            const statusMessages: Record<
              string,
              { emoji: string; title: string; description: string }
            > = {
              PROCESSANDO: {
                emoji: "⏳",
                title: "Pedido em processamento",
                description:
                  "Seu pedido está sendo preparado pela nossa equipe. Será enviado em breve!",
              },
              PAGA: {
                emoji: "💰",
                title: "Pagamento confirmado",
                description:
                  "Boas notícias! Seu pagamento foi confirmado com sucesso. Agora vamos preparar seu pedido.",
              },
              ENVIADA: {
                emoji: "🚚",
                title: "Pedido enviado",
                description:
                  "Seu pedido está em sua rota! Acompanhe seu envio para saber quando chegará.",
              },
              ENTREGUE: {
                emoji: "✅",
                title: "Pedido entregue",
                description:
                  "Seu pedido foi entregue com sucesso! Esperamos que você goste. Obrigado por comprar conosco!",
              },
              CANCELADA: {
                emoji: "❌",
                title: "Pedido cancelado",
                description:
                  "Seu pedido foi cancelado. Se você não solicitou o cancelamento, entre em contato conosco.",
              },
              REEMBOLSADA: {
                emoji: "💸",
                title: "Pedido reembolsado",
                description:
                  "Seu pedido foi reembolsado. O valor será retornado dentro de 7 dias úteis.",
              },
            };

            const statusInfo = statusMessages[status] || {
              emoji: "📦",
              title: "Pedido atualizado",
              description: `O status do seu pedido foi atualizado para ${status}.`,
            };

            const { generateOrderStatusUpdateEmail } = await import(
              "@/lib/email"
            );
            const emailHtml = generateOrderStatusUpdateEmail(
              user.name,
              currentSale.saleNumber,
              status,
              statusInfo,
            );

            await sendEmail({
              to: user.email,
              subject: `${statusInfo.emoji} ${statusInfo.title} - Pedido #${currentSale.saleNumber}`,
              html: emailHtml,
            });

            console.log(`📧 Update email sent to ${user.email}`);
          }
        } catch (error) {
          console.error("Error sending update email:", error);
          // Don't block the update
        }
      }

      // Convert Decimals to numbers
      return {
        ...sale,
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount),
        total: Number(sale.total),
      };
    } catch (error) {
      console.error("Error updating sale status:", error);
      throw error;
    }
  }

  /**
   * List all sales (Admin)
   */
  async getAllSales() {
    try {
      const sales = await prisma.sale.findMany({
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              cpf: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Convert Decimals to numbers
      return sales.map((sale) => ({
        ...sale,
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount),
        total: Number(sale.total),
        shippingCost: sale.shippingCost ? Number(sale.shippingCost) : null,
        items: sale.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          discount: Number(item.discount),
          total: Number(item.total),
          product: {
            ...item.product,
            retailPrice: Number(item.product.retailPrice),
            wholesalePrice: Number(item.product.wholesalePrice),
          },
        })),
      }));
    } catch (error) {
      console.error("Error listing all sales:", error);
      throw error;
    }
  }

  /**
   * Get recent sales (Dashboard)
   */
  async getRecentSales(limit: number = 10) {
    try {
      const sales = await prisma.sale.findMany({
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Convert Decimals to numbers
      return sales.map((sale) => ({
        ...sale,
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount),
        total: Number(sale.total),
      }));
    } catch (error) {
      console.error("Error fetching recent sales:", error);
      throw error;
    }
  }
}

export const saleService = new SaleService();
