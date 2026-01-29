"use client";

import Link from "next/link";
import {
  Bell,
  UserPlus,
  ArrowRightLeft,
  MessageSquare,
  Clock,
  Car,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  NEW_LEAD: MessageSquare,
  LEAD_ASSIGNED: UserPlus,
  LEAD_STATUS_CHANGE: ArrowRightLeft,
  NEW_MESSAGE: MessageSquare,
  FOLLOW_UP_REMINDER: Clock,
  TEST_DRIVE_REMINDER: Car,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-600",
  LEAD_ASSIGNED: "bg-purple-100 text-purple-600",
  LEAD_STATUS_CHANGE: "bg-amber-100 text-amber-600",
  NEW_MESSAGE: "bg-green-100 text-green-600",
  FOLLOW_UP_REMINDER: "bg-orange-100 text-orange-600",
  TEST_DRIVE_REMINDER: "bg-teal-100 text-teal-600",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export function NotificationDropdown({
  notifications,
  loading,
  unreadCount,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <h3 className="font-semibold text-neutral-900">Notificaciones</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-andino-600 hover:text-andino-700 font-medium flex items-center gap-1"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-andino-600 border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <Bell className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No tienes notificaciones</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
              const iconColor =
                NOTIFICATION_COLORS[notification.type] ||
                "bg-neutral-100 text-neutral-600";

              return (
                <li key={notification.id}>
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors relative",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                        iconColor
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          onClick={() => {
                            if (!notification.isRead) {
                              onMarkAsRead(notification.id);
                            }
                            onClose();
                          }}
                          className="block"
                        >
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-neutral-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-neutral-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Mark as read button */}
                    {!notification.isRead && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="flex-shrink-0 p-1 text-neutral-400 hover:text-andino-600 transition-colors"
                        title="Marcar como leída"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50">
          <Link
            href="/dealer/leads"
            onClick={onClose}
            className="text-sm text-andino-600 hover:text-andino-700 font-medium"
          >
            Ver todos los leads
          </Link>
        </div>
      )}
    </div>
  );
}
