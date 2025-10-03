import type { NotificationType } from "@prisma/client";

export type { NotificationType };

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  userId: string;
}

export type NotificationTypeEnum = NotificationType;

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}
