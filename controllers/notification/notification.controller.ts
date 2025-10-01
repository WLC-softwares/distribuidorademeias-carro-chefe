"use server";

import type { Notification } from "@/models";

import { NotificationService } from "@/services";

const notificationService = new NotificationService();

/**
 * Buscar notificações do usuário
 */
export async function getUserNotificationsAction(
  usuarioId: string,
  limit?: number,
): Promise<Notification[]> {
  try {
    return await notificationService.getUserNotifications(usuarioId, limit);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    throw error;
  }
}

/**
 * Buscar notificações não lidas
 */
export async function getUnreadNotificationsAction(
  usuarioId: string,
): Promise<Notification[]> {
  try {
    return await notificationService.getUnreadNotifications(usuarioId);
  } catch (error) {
    console.error("Erro ao buscar notificações não lidas:", error);
    throw error;
  }
}

/**
 * Contar notificações não lidas
 */
export async function countUnreadNotificationsAction(
  usuarioId: string,
): Promise<number> {
  try {
    return await notificationService.countUnread(usuarioId);
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error);
    throw error;
  }
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsReadAction(id: string): Promise<void> {
  try {
    await notificationService.markAsRead(id);
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    throw error;
  }
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsReadAction(
  usuarioId: string,
): Promise<void> {
  try {
    await notificationService.markAllAsRead(usuarioId);
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    throw error;
  }
}

/**
 * Deletar notificação
 */
export async function deleteNotificationAction(id: string): Promise<void> {
  try {
    await notificationService.deleteNotification(id);
  } catch (error) {
    console.error("Erro ao deletar notificação:", error);
    throw error;
  }
}

/**
 * Deletar todas as notificações lidas
 */
export async function deleteAllReadNotificationsAction(
  usuarioId: string,
): Promise<void> {
  try {
    await notificationService.deleteAllRead(usuarioId);
  } catch (error) {
    console.error("Erro ao deletar notificações lidas:", error);
    throw error;
  }
}
