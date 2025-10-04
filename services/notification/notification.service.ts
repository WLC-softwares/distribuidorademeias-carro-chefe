import type { Notification, NotificationType } from "@/models";

import { NotificationRepository } from "@/repositories";

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  /**
   * Create order notification
   */
  async createOrderNotification(
    userId: string,
    orderNumber: string,
    saleId: string,
  ): Promise<Notification> {
    return this.repository.create({
      userId,
      type: "ORDER_CREATED" as NotificationType,
      title: "🎉 Pedido recebido!",
      message: `Seu pedido #${orderNumber} foi recebido e está sendo processado.`,
      link: `/user/orders`,
      metadata: { saleId, orderNumber },
    });
  }

  /**
   * Create order status notification
   */
  async createOrderStatusNotification(
    userId: string,
    orderNumber: string,
    saleId: string,
    newStatus: string,
    oldStatus?: string,
  ): Promise<Notification> {
    const statusMessages: Record<
      string,
      {
        type: NotificationType;
        title: string;
        message: string;
        emoji: string;
      }
    > = {
      PROCESSING: {
        type: "ORDER_PROCESSING" as NotificationType,
        title: "⏳ Pedido em processamento",
        message: `Seu pedido #${orderNumber} está sendo preparado.`,
        emoji: "⏳",
      },
      PAID: {
        type: "ORDER_PAID" as NotificationType,
        title: "💰 Pagamento confirmado",
        message: `O pagamento do seu pedido #${orderNumber} foi confirmado!`,
        emoji: "💰",
      },
      SHIPPED: {
        type: "ORDER_SHIPPED" as NotificationType,
        title: "🚚 Pedido enviado",
        message: `Seu pedido #${orderNumber} foi enviado e está em sua rota!`,
        emoji: "🚚",
      },
      DELIVERED: {
        type: "ORDER_DELIVERED" as NotificationType,
        title: "✅ Pedido entregue",
        message: `Seu pedido #${orderNumber} foi entregue com sucesso!`,
        emoji: "✅",
      },
      CANCELED: {
        type: "ORDER_CANCELED" as NotificationType,
        title: "❌ Pedido cancelado",
        message: `Seu pedido #${orderNumber} foi cancelado.`,
        emoji: "❌",
      },
    };

    const statusInfo = statusMessages[newStatus] || {
      type: "SYSTEM" as NotificationType,
      title: "📦 Pedido atualizado",
      message: `O status do seu pedido #${orderNumber} foi atualizado.`,
      emoji: "📦",
    };

    return this.repository.create({
      userId,
      type: statusInfo.type,
      title: statusInfo.title,
      message: statusInfo.message,
      link: `/user/orders`,
      metadata: { saleId, orderNumber, newStatus, oldStatus },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit?: number,
  ): Promise<Notification[]> {
    return this.repository.getByUserId(userId, { limit });
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.repository.getByUserId(userId, { onlyUnread: true });
  }

  /**
   * Count unread notifications
   */
  async countUnread(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    return this.repository.markAsRead(id);
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    return this.repository.markAllAsRead(userId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: string): Promise<void> {
    return this.repository.deleteAllRead(userId);
  }
}
