import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TestDriveStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    // Build where clause
    const where: Prisma.TestDriveWhereInput = {
      lead: { dealerId: session.user.dealerId },
    };

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    if (status && Object.values(TestDriveStatus).includes(status as TestDriveStatus)) {
      where.status = status as TestDriveStatus;
    }

    const testDrives = await prisma.testDrive.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
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
