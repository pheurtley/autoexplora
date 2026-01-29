import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TestDriveStatus, Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; testDriveId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, testDriveId } = await params;
    const body = await request.json();

    // Verify lead belongs to dealer
    const lead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    // Verify test drive exists
    const existingTestDrive = await prisma.testDrive.findFirst({
      where: {
        id: testDriveId,
        leadId: id,
      },
    });

    if (!existingTestDrive) {
      return NextResponse.json(
        { error: "Test drive no encontrado" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Prisma.TestDriveUpdateInput = {};

    if (body.vehicleId !== undefined) {
      // Verify vehicle belongs to dealer
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: body.vehicleId,
          dealerId: session.user.dealerId,
        },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehículo no encontrado" },
          { status: 400 }
        );
      }
      updateData.vehicle = { connect: { id: body.vehicleId } };
    }

    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = new Date(body.scheduledAt);
    }

    if (body.duration !== undefined) {
      updateData.duration = body.duration;
    }

    if (body.status !== undefined && Object.values(TestDriveStatus).includes(body.status as TestDriveStatus)) {
      updateData.status = body.status as TestDriveStatus;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null;
    }

    const testDrive = await prisma.testDrive.update({
      where: { id: testDriveId },
      data: updateData,
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ testDrive });
  } catch (error) {
    console.error("Error updating test drive:", error);
    return NextResponse.json(
      { error: "Error al actualizar test drive" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; testDriveId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, testDriveId } = await params;

    // Verify lead belongs to dealer
    const lead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    // Verify test drive exists
    const testDrive = await prisma.testDrive.findFirst({
      where: {
        id: testDriveId,
        leadId: id,
      },
    });

    if (!testDrive) {
      return NextResponse.json(
        { error: "Test drive no encontrado" },
        { status: 404 }
      );
    }

    await prisma.testDrive.delete({
      where: { id: testDriveId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting test drive:", error);
    return NextResponse.json(
      { error: "Error al eliminar test drive" },
      { status: 500 }
    );
  }
}
