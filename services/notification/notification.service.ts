import type { Notification, NotificationType } from "@/models";

import { NotificationRepository } from "@/repositories";

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  /**
   * Criar notificação de pedido criado
   */
  async createOrderNotification(
    usuarioId: string,
    orderNumber: string,
    vendaId: string,
  ): Promise<Notification> {
    return this.repository.create({
      usuarioId,
      tipo: "PEDIDO_CRIADO" as NotificationType,
      titulo: "🎉 Pedido realizado com sucesso!",
      mensagem: `Seu pedido #${orderNumber} foi recebido e está sendo processado.`,
      link: `/user/pedidos`,
      metadata: { vendaId, orderNumber },
    });
  }

  /**
   * Criar notificação de mudança de status do pedido
   */
  async createOrderStatusNotification(
    usuarioId: string,
    orderNumber: string,
    vendaId: string,
    newStatus: string,
    oldStatus?: string,
  ): Promise<Notification> {
    const statusMessages: Record<
      string,
      {
        tipo: NotificationType;
        titulo: string;
        mensagem: string;
        emoji: string;
      }
    > = {
      PROCESSANDO: {
        tipo: "PEDIDO_PROCESSANDO" as NotificationType,
        titulo: "⏳ Pedido em processamento",
        mensagem: `Seu pedido #${orderNumber} está sendo preparado.`,
        emoji: "⏳",
      },
      PAGA: {
        tipo: "PEDIDO_PAGO" as NotificationType,
        titulo: "💰 Pagamento confirmado",
        mensagem: `O pagamento do pedido #${orderNumber} foi confirmado!`,
        emoji: "💰",
      },
      ENVIADA: {
        tipo: "PEDIDO_ENVIADO" as NotificationType,
        titulo: "🚚 Pedido enviado",
        mensagem: `Seu pedido #${orderNumber} foi enviado e está a caminho!`,
        emoji: "🚚",
      },
      ENTREGUE: {
        tipo: "PEDIDO_ENTREGUE" as NotificationType,
        titulo: "✅ Pedido entregue",
        mensagem: `Seu pedido #${orderNumber} foi entregue com sucesso!`,
        emoji: "✅",
      },
      CANCELADA: {
        tipo: "PEDIDO_CANCELADO" as NotificationType,
        titulo: "❌ Pedido cancelado",
        mensagem: `Seu pedido #${orderNumber} foi cancelado.`,
        emoji: "❌",
      },
    };

    const statusInfo = statusMessages[newStatus] || {
      tipo: "SISTEMA" as NotificationType,
      titulo: "📦 Atualização de pedido",
      mensagem: `O status do seu pedido #${orderNumber} foi atualizado.`,
      emoji: "📦",
    };

    return this.repository.create({
      usuarioId,
      tipo: statusInfo.tipo,
      titulo: statusInfo.titulo,
      mensagem: statusInfo.mensagem,
      link: `/user/pedidos`,
      metadata: { vendaId, orderNumber, newStatus, oldStatus },
    });
  }

  /**
   * Buscar notificações do usuário
   */
  async getUserNotifications(
    usuarioId: string,
    limit?: number,
  ): Promise<Notification[]> {
    return this.repository.getByUserId(usuarioId, { limit });
  }

  /**
   * Buscar notificações não lidas
   */
  async getUnreadNotifications(usuarioId: string): Promise<Notification[]> {
    return this.repository.getByUserId(usuarioId, { onlyUnread: true });
  }

  /**
   * Contar notificações não lidas
   */
  async countUnread(usuarioId: string): Promise<number> {
    return this.repository.countUnread(usuarioId);
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    return this.repository.markAsRead(id);
  }

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead(usuarioId: string): Promise<void> {
    return this.repository.markAllAsRead(usuarioId);
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  /**
   * Deletar todas lidas
   */
  async deleteAllRead(usuarioId: string): Promise<void> {
    return this.repository.deleteAllRead(usuarioId);
  }
}
