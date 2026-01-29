import prisma from "@/lib/prisma";
import { NotificationType, Prisma } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      metadata: metadata,
    },
  });
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
    })),
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const { unreadOnly = false, limit = 20, offset = 0 } = options ?? {};

  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Delete old read notifications (cleanup)
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.notification.deleteMany({
    where: {
      isRead: true,
      createdAt: { lt: cutoffDate },
    },
  });
}

// Notification helpers for specific events

/**
 * Create notification for new lead
 */
export async function notifyNewLead(
  dealerUserIds: string[],
  leadName: string,
  vehicleTitle: string | null,
  leadId: string
) {
  const title = "Nuevo Lead";
  const message = vehicleTitle
    ? `${leadName} consultó sobre ${vehicleTitle}`
    : `${leadName} envió una consulta general`;

  return createNotificationsForUsers(dealerUserIds, {
    type: "NEW_LEAD",
    title,
    message,
    link: `/dealer/leads?leadId=${leadId}`,
    metadata: { leadId },
  });
}

/**
 * Create notification for lead assignment
 */
export async function notifyLeadAssignment(
  assignedUserId: string,
  leadName: string,
  assignedByName: string,
  leadId: string
) {
  return createNotification({
    userId: assignedUserId,
    type: "LEAD_ASSIGNED",
    title: "Lead Asignado",
    message: `${assignedByName} te asignó el lead de ${leadName}`,
    link: `/dealer/leads?leadId=${leadId}`,
    metadata: { leadId },
  });
}

/**
 * Create notification for lead status change
 */
export async function notifyLeadStatusChange(
  userId: string,
  leadName: string,
  newStatus: string,
  leadId: string
) {
  const statusLabels: Record<string, string> = {
    NEW: "Nuevo",
    CONTACTED: "Contactado",
    QUALIFIED: "Calificado",
    CONVERTED: "Convertido",
    LOST: "Perdido",
  };

  return createNotification({
    userId,
    type: "LEAD_STATUS_CHANGE",
    title: "Cambio de Estado",
    message: `El lead de ${leadName} cambió a ${statusLabels[newStatus] || newStatus}`,
    link: `/dealer/leads?leadId=${leadId}`,
    metadata: { leadId, newStatus },
  });
}

/**
 * Create notification for follow-up reminder
 */
export async function notifyFollowUpReminder(
  userId: string,
  leadName: string,
  taskTitle: string,
  leadId: string,
  taskId: string
) {
  return createNotification({
    userId,
    type: "FOLLOW_UP_REMINDER",
    title: "Recordatorio de Seguimiento",
    message: `Tarea pendiente: ${taskTitle} - ${leadName}`,
    link: `/dealer/leads?leadId=${leadId}`,
    metadata: { leadId, taskId },
  });
}

/**
 * Create notification for test drive reminder
 */
export async function notifyTestDriveReminder(
  userId: string,
  leadName: string,
  vehicleTitle: string,
  scheduledAt: Date,
  leadId: string,
  testDriveId: string
) {
  const timeStr = scheduledAt.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return createNotification({
    userId,
    type: "TEST_DRIVE_REMINDER",
    title: "Recordatorio de Test Drive",
    message: `Test drive de ${vehicleTitle} con ${leadName} a las ${timeStr}`,
    link: `/dealer/leads/test-drives?testDriveId=${testDriveId}`,
    metadata: { leadId, testDriveId },
  });
}
