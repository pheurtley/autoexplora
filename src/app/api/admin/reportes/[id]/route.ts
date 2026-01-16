import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update report status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const admin = await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();
    const { status, resolution } = body;

    if (!status || !Object.values(ReportStatus).includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
    };

    // Set resolver info when marking as resolved or dismissed
    if (status === ReportStatus.RESOLVED || status === ReportStatus.DISMISSED) {
      updateData.resolvedById = admin.id;
      updateData.resolvedAt = new Date();
      if (resolution) {
        updateData.resolution = resolution;
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            brand: { select: { name: true } },
            model: { select: { name: true } },
          },
        },
        reporter: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar reporte" },
      { status: 500 }
    );
  }
}

// Delete report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar reporte" },
      { status: 500 }
    );
  }
}
