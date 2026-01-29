import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadSource } from "@prisma/client";
import { notifyNewLead } from "@/lib/notifications";
import { sendNewLeadNotification } from "@/lib/lead-notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealerId, vehicleId, name, email, phone, message } = body;

    // Validate required fields
    if (!dealerId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (dealerId, name, email, message)" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Verify dealer exists and get users for notifications
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: {
        id: true,
        status: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            dealerRole: true,
          },
        },
      },
    });

    if (!dealer || dealer.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Dealer no encontrado" },
        { status: 404 }
      );
    }

    // Verify vehicle belongs to dealer if provided
    let vehicleTitle: string | null = null;
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, dealerId },
        select: { id: true, title: true },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehículo no encontrado" },
          { status: 404 }
        );
      }
      vehicleTitle = vehicle.title;
    }

    // Check for potential duplicates (same email or phone in last 30 days)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim() || null;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const duplicateCheck = await prisma.dealerLead.findFirst({
      where: {
        dealerId,
        createdAt: { gte: thirtyDaysAgo },
        OR: [
          { email: normalizedEmail },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
      select: { id: true },
    });

    const isDuplicate = !!duplicateCheck;

    // Create lead
    const lead = await prisma.dealerLead.create({
      data: {
        dealerId,
        vehicleId: vehicleId || null,
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        message: message.trim(),
        source: LeadSource.MICROSITE,
        isDuplicate,
      },
    });

    // Send notifications to dealer team (in background, don't block response)
    const notifyTeam = async () => {
      try {
        // Get team member IDs for in-app notifications
        const userIds = dealer.users.map((u) => u.id);
        if (userIds.length > 0) {
          await notifyNewLead(userIds, name.trim(), vehicleTitle, lead.id);
        }

        // Send email to owners and managers
        const ownersAndManagers = dealer.users.filter(
          (u) => u.dealerRole === "OWNER" || u.dealerRole === "MANAGER"
        );

        for (const user of ownersAndManagers) {
          if (user.email) {
            await sendNewLeadNotification(
              user.email,
              user.name || "Usuario",
              {
                id: lead.id,
                name: name.trim(),
                email: normalizedEmail,
                phone: normalizedPhone,
                message: message.trim(),
                vehicleTitle,
              }
            );
          }
        }
      } catch (error) {
        console.error("Error sending lead notifications:", error);
      }
    };

    // Don't await - run in background
    notifyTeam();

    return NextResponse.json(
      { success: true, id: lead.id, isDuplicate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Error al enviar la consulta" },
      { status: 500 }
    );
  }
}
