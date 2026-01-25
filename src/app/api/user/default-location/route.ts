import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET: Get user's default location (region and comuna)
 * Priority:
 * 1. If user belongs to a dealer, use dealer's location
 * 2. If user has published vehicles, use the most recent one's location
 * 3. Also returns user's phone if available
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user with dealer info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        phone: true,
        dealerId: true,
        dealer: {
          select: {
            regionId: true,
            comunaId: true,
            phone: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // If user belongs to a dealer, use dealer's location
    if (user.dealer) {
      return NextResponse.json({
        regionId: user.dealer.regionId,
        comunaId: user.dealer.comunaId || "",
        contactPhone: user.dealer.phone || user.phone || "",
        contactWhatsApp: user.dealer.whatsapp || "",
      });
    }

    // Otherwise, try to get location from user's most recent vehicle
    const recentVehicle = await prisma.vehicle.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        regionId: true,
        comunaId: true,
        contactPhone: true,
        contactWhatsApp: true,
      },
    });

    if (recentVehicle) {
      return NextResponse.json({
        regionId: recentVehicle.regionId,
        comunaId: recentVehicle.comunaId || "",
        contactPhone: recentVehicle.contactPhone || user.phone || "",
        contactWhatsApp: recentVehicle.contactWhatsApp || "",
      });
    }

    // No previous data, return user's phone if available
    return NextResponse.json({
      regionId: "",
      comunaId: "",
      contactPhone: user.phone || "",
      contactWhatsApp: "",
    });
  } catch (error) {
    console.error("Error fetching default location:", error);
    return NextResponse.json(
      { error: "Error al obtener ubicación" },
      { status: 500 }
    );
  }
}
