"use server";

import type { Notification } from "@/models";

import { NotificationService } from "@/services";

const notificationService = new NotificationService();

/**
 * Get user notifications
 */
export async function getUserNotificationsAction(
  userId: string,
  limit?: number,
): Promise<Notification[]> {
  try {
    return await notificationService.getUserNotifications(userId, limit);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Get unread notifications
 */
export async function getUnreadNotificationsAction(
  userId: string,
): Promise<Notification[]> {
  try {
    return await notificationService.getUnreadNotifications(userId);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
}

/**
 * Count unread notifications
 */
export async function countUnreadNotificationsAction(
  userId: string,
): Promise<number> {
  try {
    return await notificationService.countUnread(userId);
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsReadAction(id: string): Promise<void> {
  try {
    await notificationService.markAsRead(id);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadAction(
  userId: string,
): Promise<void> {
  try {
    await notificationService.markAllAsRead(userId);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotificationAction(id: string): Promise<void> {
  try {
    await notificationService.deleteNotification(id);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllReadNotificationsAction(
  userId: string,
): Promise<void> {
  try {
    await notificationService.deleteAllRead(userId);
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    throw error;
  }
}
