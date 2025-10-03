import type { CreateNotificationDTO, Notification } from "@/models";

import { prisma } from "@/lib";

export class NotificationRepository {
  /**
   * Create a new notification
   */
  async create(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata as any,
      },
    });

    return {
      ...notification,
      metadata: notification.metadata as Record<string, any> | null,
    };
  }

  /**
   * Get notifications by user ID
   */
  async getByUserId(
    userId: string,
    options?: { limit?: number; onlyUnread?: boolean },
  ): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(options?.onlyUnread && { read: false }),
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit,
    });

    return notifications.map((n) => ({
      ...n,
      metadata: n.metadata as Record<string, any> | null,
    }));
  }

  /**
   * Count unread notifications
   */
  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<void> {
    await prisma.notification.delete({ where: { id } });
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { userId, read: true },
    });
  }
}
