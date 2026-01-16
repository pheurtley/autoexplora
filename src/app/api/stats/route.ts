import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/stats - Obtener estadísticas generales
export async function GET() {
  try {
    // Fecha de inicio de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ejecutar consultas en paralelo para mejor performance
    const [totalVehicles, todayVehicles, regionsWithVehicles] = await Promise.all([
      // Total de vehículos activos
      prisma.vehicle.count({
        where: {
          status: "ACTIVE",
        },
      }),
      // Vehículos publicados hoy
      prisma.vehicle.count({
        where: {
          status: "ACTIVE",
          publishedAt: {
            gte: today,
          },
        },
      }),
      // Regiones con al menos un vehículo activo
      prisma.region.count({
        where: {
          vehicles: {
            some: {
              status: "ACTIVE",
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalVehicles,
      todayVehicles,
      regionsWithVehicles,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
