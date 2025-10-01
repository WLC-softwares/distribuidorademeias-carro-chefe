import type { TipoNotificacao } from "@prisma/client";

export interface Notification {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  usuarioId: string;
}

export type NotificationType = TipoNotificacao;

export interface CreateNotificationDTO {
  usuarioId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link?: string;
  metadata?: Record<string, any>;
}
