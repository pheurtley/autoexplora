import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const preferences = await prisma.leadPreferences.findUnique({
      where: { leadId: id },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Error al obtener preferencias" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      brandIds,
      modelIds,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      vehicleType,
      condition,
    } = body;

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

    // Upsert preferences
    const preferences = await prisma.leadPreferences.upsert({
      where: { leadId: id },
      update: {
        brandIds: brandIds || [],
        modelIds: modelIds || [],
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minYear: minYear || null,
        maxYear: maxYear || null,
        vehicleType: vehicleType || null,
        condition: condition || null,
      },
      create: {
        leadId: id,
        brandIds: brandIds || [],
        modelIds: modelIds || [],
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minYear: minYear || null,
        maxYear: maxYear || null,
        vehicleType: vehicleType || null,
        condition: condition || null,
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Error al actualizar preferencias" },
      { status: 500 }
    );
  }
}
