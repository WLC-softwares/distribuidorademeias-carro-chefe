"use client";

import type { Notification } from "@/models";

import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  countUnreadNotificationsAction,
  deleteNotificationAction,
  getUserNotificationsAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/controllers";

interface NotificationDropdownProps {
  usuarioId: string;
}

export function NotificationDropdown({ usuarioId }: NotificationDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!usuarioId) return;

    try {
      const [notifs, count] = await Promise.all([
        getUserNotificationsAction(usuarioId, 10),
        countUnreadNotificationsAction(usuarioId),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetchNotifications();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsReadAction(id);
      await fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsAsReadAction(usuarioId);
      await fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotificationAction(id);
      await fetchNotifications();
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida
    if (!notification.lida) {
      await handleMarkAsRead(notification.id);
    }

    // Navegar para o link se existir
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    const iconMap: Record<string, string> = {
      PEDIDO_CRIADO: "🎉",
      PEDIDO_PROCESSANDO: "⏳",
      PEDIDO_PAGO: "💰",
      PEDIDO_ENVIADO: "🚚",
      PEDIDO_ENTREGUE: "✅",
      PEDIDO_CANCELADO: "❌",
      SISTEMA: "📢",
    };

    return iconMap[tipo] || "🔔";
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays}d atrás`;

    return notifDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Dropdown
      classNames={{
        content: "p-0 min-w-[380px] max-w-[380px]",
      }}
      isOpen={isOpen}
      placement="bottom-end"
      onOpenChange={setIsOpen}
    >
      <Badge
        className={unreadCount === 0 ? "hidden" : ""}
        color="danger"
        content={
          unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : null
        }
        placement="top-right"
        size="sm"
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            aria-label="Notificações"
            className="text-gray-600 hover:text-gray-800"
            variant="light"
          >
            <Bell size={20} />
          </Button>
        </DropdownTrigger>
      </Badge>

      <DropdownMenu
        aria-label="Notificações"
        className="p-0"
        closeOnSelect={false}
        emptyContent={
          <div className="py-8 px-4 text-center text-gray-500">
            <Bell className="mx-auto mb-2 opacity-50" size={40} />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        }
      >
        <DropdownSection showDivider className="mb-0">
          <DropdownItem
            key="header"
            isReadOnly
            className="cursor-default py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100"
            textValue="header"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="text-blue-600" size={18} />
                <span className="font-semibold text-gray-800">
                  Notificações
                </span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  className="h-7 text-xs text-blue-600"
                  isLoading={loading}
                  size="sm"
                  startContent={!loading && <CheckCheck size={14} />}
                  variant="light"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todas
                </Button>
              )}
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection className="max-h-[400px] overflow-y-auto">
          {notifications?.map((notification) => (
            <DropdownItem
              key={notification.id}
              className={`py-3 px-4 cursor-pointer hover:bg-gray-50 ${
                !notification.lida ? "bg-blue-50/50" : ""
              }`}
              textValue={notification.titulo}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-800 line-clamp-1">
                      {notification.titulo}
                    </p>
                    {!notification.lida && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {notification.mensagem}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>
                    <div className="flex gap-1">
                      {!notification.lida && (
                        <Button
                          isIconOnly
                          aria-label="Marcar como lida"
                          className="h-6 w-6 min-w-6 text-gray-400 hover:text-green-600"
                          size="sm"
                          variant="light"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      <Button
                        isIconOnly
                        aria-label="Deletar"
                        className="h-6 w-6 min-w-6 text-gray-400 hover:text-red-600"
                        size="sm"
                        variant="light"
                        onClick={(e) => handleDelete(notification.id, e)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownItem>
          ))}
        </DropdownSection>

        {notifications && notifications.length > 0 && (
          <DropdownSection>
            <DropdownItem
              key="view-all"
              className="py-3 text-center text-blue-600 hover:text-blue-700 font-semibold"
              textValue="Ver todas"
              onClick={() => {
                setIsOpen(false);
                router.push("/user/notificacoes");
              }}
            >
              Ver todas as notificações
            </DropdownItem>
          </DropdownSection>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
