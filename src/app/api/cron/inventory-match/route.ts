import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findMatchingLeadsForVehicle } from "@/lib/inventory-matcher";
import { createNotificationsForUsers } from "@/lib/notifications";

// Vercel Cron secret validation
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for automated calls
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleId } = body;

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId es requerido" },
        { status: 400 }
      );
    }

    // Get vehicle details
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        title: true,
        slug: true,
        brandId: true,
        modelId: true,
        price: true,
        year: true,
        vehicleType: true,
        condition: true,
        dealerId: true,
        dealer: {
          select: {
            users: {
              where: {
                OR: [{ dealerRole: "OWNER" }, { dealerRole: "MANAGER" }],
              },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!vehicle || !vehicle.dealerId) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    // Find matching leads
    const matchingLeadIds = await findMatchingLeadsForVehicle(vehicle.dealerId, {
      brandId: vehicle.brandId,
      modelId: vehicle.modelId,
      price: vehicle.price,
      year: vehicle.year,
      vehicleType: vehicle.vehicleType,
      condition: vehicle.condition,
    });

    if (matchingLeadIds.length === 0) {
      return NextResponse.json({
        success: true,
        matchesFound: 0,
      });
    }

    // Get leads with their assignees
    const leads = await prisma.dealerLead.findMany({
      where: { id: { in: matchingLeadIds } },
      select: {
        id: true,
        name: true,
        assignedToId: true,
      },
    });

    // Notify assignees about matching vehicle
    const notifyPromises = leads.map(async (lead) => {
      const userIds = lead.assignedToId
        ? [lead.assignedToId]
        : vehicle.dealer?.users.map((u) => u.id) || [];

      if (userIds.length === 0) return;

      await createNotificationsForUsers(userIds, {
        type: "NEW_MESSAGE",
        title: "Vehículo Compatible",
        message: `Nuevo vehículo que podría interesarle a ${lead.name}: ${vehicle.title}`,
        link: `/dealer/leads?leadId=${lead.id}`,
        metadata: {
          vehicleId: vehicle.id,
          leadId: lead.id,
        },
      });
    });

    await Promise.all(notifyPromises);

    return NextResponse.json({
      success: true,
      matchesFound: matchingLeadIds.length,
      notified: leads.length,
    });
  } catch (error) {
    console.error("Error in inventory match:", error);
    return NextResponse.json(
      { error: "Error en el proceso de matching" },
      { status: 500 }
    );
  }
}
