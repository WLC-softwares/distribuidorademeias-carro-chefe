import type { CreateNotificationDTO, Notification } from "@/models";

import { prisma } from "@/lib";

export class NotificationRepository {
  /**
   * Criar uma nova notificação
   */
  async create(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await prisma.notificacao.create({
      data: {
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
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
   * Buscar notificações de um usuário
   */
  async getByUserId(
    usuarioId: string,
    options?: { limit?: number; onlyUnread?: boolean },
  ): Promise<Notification[]> {
    const notifications = await prisma.notificacao.findMany({
      where: {
        usuarioId,
        ...(options?.onlyUnread && { lida: false }),
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
   * Contar notificações não lidas
   */
  async countUnread(usuarioId: string): Promise<number> {
    return prisma.notificacao.count({
      where: {
        usuarioId,
        lida: false,
      },
    });
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    await prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  }

  /**
   * Marcar todas as notificações de um usuário como lidas
   */
  async markAllAsRead(usuarioId: string): Promise<void> {
    await prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });
  }

  /**
   * Deletar notificação
   */
  async delete(id: string): Promise<void> {
    await prisma.notificacao.delete({ where: { id } });
  }

  /**
   * Deletar todas as notificações lidas de um usuário
   */
  async deleteAllRead(usuarioId: string): Promise<void> {
    await prisma.notificacao.deleteMany({
      where: { usuarioId, lida: true },
    });
  }
}
