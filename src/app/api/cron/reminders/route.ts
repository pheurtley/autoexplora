import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyFollowUpReminder, notifyTestDriveReminder } from "@/lib/notifications";

// Vercel Cron secret validation
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find tasks due in the next hour that haven't been notified
    const pendingTasks = await prisma.leadTask.findMany({
      where: {
        completedAt: null,
        notifiedAt: null,
        dueAt: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notifications for tasks
    const taskNotifications = pendingTasks.map(async (task) => {
      try {
        await notifyFollowUpReminder(
          task.assignedToId,
          task.lead.name,
          task.title,
          task.leadId,
          task.id
        );

        // Mark as notified
        await prisma.leadTask.update({
          where: { id: task.id },
          data: { notifiedAt: now },
        });

        return { taskId: task.id, success: true };
      } catch (error) {
        console.error(`Error notifying task ${task.id}:`, error);
        return { taskId: task.id, success: false };
      }
    });

    // Find test drives in the next hour
    const pendingTestDrives = await prisma.testDrive.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            assignedToId: true,
          },
        },
        vehicle: {
          select: {
            title: true,
          },
        },
      },
    });

    // Send notifications for test drives
    const testDriveNotifications = pendingTestDrives.map(async (td) => {
      if (!td.lead.assignedToId) return { testDriveId: td.id, success: false };

      try {
        await notifyTestDriveReminder(
          td.lead.assignedToId,
          td.lead.name,
          td.vehicle.title,
          new Date(td.scheduledAt),
          td.leadId,
          td.id
        );

        return { testDriveId: td.id, success: true };
      } catch (error) {
        console.error(`Error notifying test drive ${td.id}:`, error);
        return { testDriveId: td.id, success: false };
      }
    });

    const taskResults = await Promise.all(taskNotifications);
    const testDriveResults = await Promise.all(testDriveNotifications);

    return NextResponse.json({
      success: true,
      tasks: {
        processed: taskResults.length,
        successful: taskResults.filter((r) => r.success).length,
      },
      testDrives: {
        processed: testDriveResults.length,
        successful: testDriveResults.filter((r) => r.success).length,
      },
    });
  } catch (error) {
    console.error("Error in reminders cron:", error);
    return NextResponse.json(
      { error: "Error en el proceso de recordatorios" },
      { status: 500 }
    );
  }
}
