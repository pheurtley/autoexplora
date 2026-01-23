import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Verify dealer exists
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { id: true, status: true },
    });

    if (!dealer || dealer.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Dealer no encontrado" },
        { status: 404 }
      );
    }

    // Verify vehicle belongs to dealer if provided
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, dealerId },
        select: { id: true },
      });

      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehículo no encontrado" },
          { status: 404 }
        );
      }
    }

    // Create lead
    const lead = await prisma.dealerLead.create({
      data: {
        dealerId,
        vehicleId: vehicleId || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        source: "microsite",
      },
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al enviar la consulta" },
      { status: 500 }
    );
  }
}
