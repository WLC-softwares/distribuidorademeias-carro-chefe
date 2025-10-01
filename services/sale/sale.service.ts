/**
 * Service: Sale
 * Lógica de negócio para gerenciar vendas
 */

import type { CartItem } from "@/hooks/useCart";

import { generateOrderConfirmationEmail, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notification/notification.service";

export interface CreateSaleData {
  usuarioId: string;
  items: CartItem[];
  observacoes?: string;
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
   * Criar nova venda
   */
  async createSale(data: CreateSaleData): Promise<SaleResponse> {
    try {
      // Calcular subtotal e total
      const subtotal = data.items.reduce((acc, item) => {
        return acc + Number(item.product.preco) * item.quantidade;
      }, 0);

      const total = subtotal; // Sem desconto por enquanto

      // Gerar número da venda (formato: YYYYMMDD-XXXXX)
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();
      const numeroVenda = `${dateStr}-${randomStr}`;

      // Criar venda com itens
      const venda = await prisma.venda.create({
        data: {
          numeroVenda,
          usuarioId: data.usuarioId,
          subtotal,
          desconto: 0,
          total,
          formaPagamento: "PIX", // Padrão, será confirmado via WhatsApp
          status: "PENDENTE",
          observacoes: data.observacoes || null,
          itens: {
            create: data.items.map((item) => ({
              produtoId: item.product.id,
              quantidade: item.quantidade,
              precoUnit: item.product.preco,
              subtotal: Number(item.product.preco) * item.quantidade,
              desconto: 0,
              total: Number(item.product.preco) * item.quantidade,
              tipoVenda: item.tipoVenda === "atacado" ? "ATACADO" : "VAREJO",
            })),
          },
        },
        include: {
          itens: {
            include: {
              produto: true,
            },
          },
        },
      });

      // 🔔 Criar notificação para o usuário
      try {
        await this.notificationService.createOrderNotification(
          data.usuarioId,
          venda.numeroVenda,
          venda.id,
        );
      } catch (error) {
        console.error("Erro ao criar notificação:", error);
        // Não bloqueia a criação da venda
      }

      // 📧 Enviar email de confirmação
      try {
        const usuario = await prisma.usuario.findUnique({
          where: { id: data.usuarioId },
        });

        if (usuario) {
          const formaPagamentoMap: Record<string, string> = {
            PIX: "PIX",
            DINHEIRO: "Dinheiro",
            CARTAO_CREDITO: "Cartão de Crédito",
            CARTAO_DEBITO: "Cartão de Débito",
            BOLETO: "Boleto",
            TRANSFERENCIA: "Transferência Bancária",
          };

          const emailHtml = generateOrderConfirmationEmail(
            usuario.nome,
            venda.numeroVenda,
            {
              items: venda.itens.map((item) => ({
                name: item.produto.nome,
                quantity: item.quantidade,
                price: Number(item.precoUnit),
                total: Number(item.total),
              })),
              subtotal: Number(venda.subtotal),
              discount: Number(venda.desconto),
              total: Number(venda.total),
              paymentMethod:
                formaPagamentoMap[venda.formaPagamento] || venda.formaPagamento,
            },
          );

          await sendEmail({
            to: usuario.email,
            subject: `Pedido Confirmado - #${venda.numeroVenda} - Distribuidora Carro Chefe`,
            html: emailHtml,
          });
        }
      } catch (error) {
        console.error("Erro ao enviar email de confirmação:", error);
        // Não bloqueia a criação da venda
      }

      return {
        id: venda.id,
        numeroVenda: venda.numeroVenda,
        total: Number(venda.total),
        status: venda.status,
      };
    } catch (error) {
      console.error("Erro ao criar venda:", error);
      throw new Error("Não foi possível criar a venda");
    }
  }

  /**
   * Buscar venda por ID
   */
  async getSaleById(id: string) {
    try {
      const venda = await prisma.venda.findUnique({
        where: { id },
        include: {
          itens: {
            include: {
              produto: {
                include: {
                  imagens: true,
                },
              },
            },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              cpf: true,
            },
          },
        },
      });

      if (!venda) return null;

      // Converter Decimals para números
      return {
        ...venda,
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        total: Number(venda.total),
        itens: venda.itens.map((item) => ({
          ...item,
          precoUnit: Number(item.precoUnit),
          subtotal: Number(item.subtotal),
          desconto: Number(item.desconto),
          total: Number(item.total),
          produto: {
            ...item.produto,
            preco: Number(item.produto.preco),
          },
        })),
      };
    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      throw error;
    }
  }

  /**
   * Listar vendas do usuário
   */
  async getUserSales(usuarioId: string) {
    try {
      const vendas = await prisma.venda.findMany({
        where: { usuarioId },
        include: {
          itens: {
            include: {
              produto: {
                include: {
                  imagens: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Converter Decimals para números
      return vendas.map((venda) => ({
        ...venda,
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        total: Number(venda.total),
        itens: venda.itens.map((item) => ({
          ...item,
          precoUnit: Number(item.precoUnit),
          subtotal: Number(item.subtotal),
          desconto: Number(item.desconto),
          total: Number(item.total),
          produto: {
            ...item.produto,
            preco: Number(item.produto.preco),
          },
        })),
      }));
    } catch (error) {
      console.error("Erro ao listar vendas:", error);
      throw error;
    }
  }

  /**
   * Atualizar status da venda
   */
  async updateSaleStatus(id: string, status: string) {
    try {
      // Buscar venda atual para pegar o status anterior
      const vendaAtual = await prisma.venda.findUnique({
        where: { id },
        select: { status: true, numeroVenda: true, usuarioId: true },
      });

      const oldStatus = vendaAtual?.status;

      const venda = await prisma.venda.update({
        where: { id },
        data: { status: status as any },
      });

      // 🔔 Criar notificação de mudança de status
      if (vendaAtual && oldStatus !== status) {
        try {
          await this.notificationService.createOrderStatusNotification(
            vendaAtual.usuarioId,
            vendaAtual.numeroVenda,
            id,
            status,
            oldStatus,
          );
        } catch (error) {
          console.error("Erro ao criar notificação de status:", error);
          // Não bloqueia a atualização
        }

        // 📧 Enviar email de atualização de status
        try {
          const usuario = await prisma.usuario.findUnique({
            where: { id: vendaAtual.usuarioId },
          });

          if (usuario) {
            const statusMessages: Record<
              string,
              { emoji: string; title: string; description: string }
            > = {
              PROCESSANDO: {
                emoji: "⏳",
                title: "Pedido em Processamento",
                description:
                  "Seu pedido está sendo preparado pela nossa equipe. Em breve ele será enviado!",
              },
              PAGA: {
                emoji: "💰",
                title: "Pagamento Confirmado",
                description:
                  "Ótima notícia! Seu pagamento foi confirmado com sucesso. Agora vamos preparar seu pedido.",
              },
              ENVIADA: {
                emoji: "🚚",
                title: "Pedido Enviado",
                description:
                  "Seu pedido saiu para entrega! Acompanhe o rastreamento para saber quando chegará.",
              },
              ENTREGUE: {
                emoji: "✅",
                title: "Pedido Entregue",
                description:
                  "Seu pedido foi entregue com sucesso! Esperamos que você goste. Obrigado por comprar conosco!",
              },
              CANCELADA: {
                emoji: "❌",
                title: "Pedido Cancelado",
                description:
                  "Seu pedido foi cancelado. Se você não solicitou o cancelamento, entre em contato conosco.",
              },
              REEMBOLSADA: {
                emoji: "💸",
                title: "Pedido Reembolsado",
                description:
                  "O reembolso do seu pedido foi processado. O valor será estornado em até 7 dias úteis.",
              },
            };

            const statusInfo = statusMessages[status] || {
              emoji: "📦",
              title: "Atualização de Pedido",
              description: `O status do seu pedido foi atualizado para ${status}.`,
            };

            const { generateOrderStatusUpdateEmail } = await import(
              "@/lib/email"
            );
            const emailHtml = generateOrderStatusUpdateEmail(
              usuario.nome,
              vendaAtual.numeroVenda,
              status,
              statusInfo,
            );

            await sendEmail({
              to: usuario.email,
              subject: `${statusInfo.emoji} ${statusInfo.title} - Pedido #${vendaAtual.numeroVenda}`,
              html: emailHtml,
            });

            console.log(
              `📧 Email de atualização enviado para ${usuario.email}`,
            );
          }
        } catch (error) {
          console.error("Erro ao enviar email de atualização:", error);
          // Não bloqueia a atualização
        }
      }

      // Converter Decimals para números
      return {
        ...venda,
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        total: Number(venda.total),
      };
    } catch (error) {
      console.error("Erro ao atualizar status da venda:", error);
      throw error;
    }
  }

  /**
   * Listar todas as vendas (Admin)
   */
  async getAllSales() {
    try {
      const vendas = await prisma.venda.findMany({
        include: {
          itens: {
            include: {
              produto: {
                include: {
                  imagens: true,
                },
              },
            },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              cpf: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Converter Decimals para números
      return vendas.map((venda) => ({
        ...venda,
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        total: Number(venda.total),
        itens: venda.itens.map((item) => ({
          ...item,
          precoUnit: Number(item.precoUnit),
          subtotal: Number(item.subtotal),
          desconto: Number(item.desconto),
          total: Number(item.total),
          produto: {
            ...item.produto,
            preco: Number(item.produto.preco),
          },
        })),
      }));
    } catch (error) {
      console.error("Erro ao listar todas as vendas:", error);
      throw error;
    }
  }

  /**
   * Buscar vendas recentes (Dashboard)
   */
  async getRecentSales(limit: number = 10) {
    try {
      const vendas = await prisma.venda.findMany({
        take: limit,
        include: {
          usuario: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Converter Decimals para números
      return vendas.map((venda) => ({
        ...venda,
        subtotal: Number(venda.subtotal),
        desconto: Number(venda.desconto),
        total: Number(venda.total),
      }));
    } catch (error) {
      console.error("Erro ao buscar vendas recentes:", error);
      throw error;
    }
  }
}

export const saleService = new SaleService();
