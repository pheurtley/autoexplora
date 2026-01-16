import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealer, getDealerStats } from "@/lib/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";

export async function GET() {
  try {
    const session = await auth();
    const { dealer } = await requireDealer(session);

    const stats = await getDealerStats(dealer.id);

    // Get recent activity
    const recentVehicles = await prisma.vehicle.findMany({
      where: { dealerId: dealer.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        views: true,
        createdAt: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    // Get views trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const vehiclesWithRecentViews = await prisma.vehicle.findMany({
      where: {
        dealerId: dealer.id,
        updatedAt: { gte: sevenDaysAgo },
      },
      select: {
        views: true,
      },
    });

    return NextResponse.json({
      stats,
      recentVehicles,
      totalRecentViews: vehiclesWithRecentViews.reduce((acc, v) => acc + v.views, 0),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof DealerPendingError || error instanceof DealerInactiveError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Error fetching dealer stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
