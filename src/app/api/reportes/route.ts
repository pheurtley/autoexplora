import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReportReason } from "@prisma/client";
import { z } from "zod";

const reportSchema = z.object({
  vehicleId: z.string().min(1, "ID de vehículo requerido"),
  reason: z.nativeEnum(ReportReason, {
    message: "Razón inválida",
  }),
  description: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para reportar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = reportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { vehicleId, reason, description } = validationResult.data;

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, userId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Prevent users from reporting their own vehicles
    if (vehicle.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes reportar tu propio vehículo" },
        { status: 400 }
      );
    }

    // Check if user already reported this vehicle
    const existingReport = await prisma.report.findFirst({
      where: {
        vehicleId,
        reporterId: session.user.id,
        status: { in: ["PENDING", "UNDER_REVIEW"] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "Ya has reportado este vehículo" },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        vehicleId,
        reporterId: session.user.id,
        reason,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Error al crear el reporte" },
      { status: 500 }
    );
  }
}
