import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notifyTestDriveReminder } from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

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

    const testDrives = await prisma.testDrive.findMany({
      where: { leadId: id },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ testDrives });
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return NextResponse.json(
      { error: "Error al obtener test drives" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { vehicleId, scheduledAt, duration, notes } = body;

    // Validate required fields
    if (!vehicleId || !scheduledAt) {
      return NextResponse.json(
        { error: "Vehículo y fecha son requeridos" },
        { status: 400 }
      );
    }

    // Verify lead belongs to dealer
    const lead = await prisma.dealerLead.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    // Verify vehicle belongs to dealer
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        dealerId: session.user.dealerId,
      },
      select: { id: true, title: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 400 }
      );
    }

    const testDrive = await prisma.testDrive.create({
      data: {
        leadId: id,
        vehicleId,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        notes: notes?.trim() || null,
      },
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

    // Create activity
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: session.user.id,
        type: "TEST_DRIVE",
        content: `Test drive programado para ${new Date(scheduledAt).toLocaleString("es-CL")}`,
        metadata: {
          testDriveId: testDrive.id,
          vehicleId,
          vehicleTitle: vehicle.title,
        },
      },
    });

    return NextResponse.json({ testDrive }, { status: 201 });
  } catch (error) {
    console.error("Error creating test drive:", error);
    return NextResponse.json(
      { error: "Error al crear test drive" },
      { status: 500 }
    );
  }
}
