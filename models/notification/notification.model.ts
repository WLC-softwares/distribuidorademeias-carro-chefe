export interface Notification {
    id: string;
    tipo: NotificationType;
    titulo: string;
    mensagem: string;
    lida: boolean;
    link?: string | null;
    metadata?: Record<string, any> | null;
    createdAt: Date;
    usuarioId: string;
}

export enum NotificationType {
    PEDIDO_CRIADO = 'PEDIDO_CRIADO',
    PEDIDO_PROCESSANDO = 'PEDIDO_PROCESSANDO',
    PEDIDO_PAGO = 'PEDIDO_PAGO',
    PEDIDO_ENVIADO = 'PEDIDO_ENVIADO',
    PEDIDO_ENTREGUE = 'PEDIDO_ENTREGUE',
    PEDIDO_CANCELADO = 'PEDIDO_CANCELADO',
    SISTEMA = 'SISTEMA',
}

export interface CreateNotificationDTO {
    usuarioId: string;
    tipo: NotificationType;
    titulo: string;
    mensagem: string;
    link?: string;
    metadata?: Record<string, any>;
}

