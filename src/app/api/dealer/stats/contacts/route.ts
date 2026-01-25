import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealer } from "@/lib/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";

/**
 * GET /api/dealer/stats/contacts
 * Get contact event statistics for the dealer
 * Query params: period (7, 30, 90 days)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { dealer } = await requireDealer(session);

    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get("period") || "30", 10);
    const validPeriods = [7, 30, 90];
    const days = validPeriods.includes(period) ? period : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all contact events for this dealer in the period
    const events = await prisma.contactEvent.findMany({
      where: {
        OR: [
          { dealerId: dealer.id },
          { vehicle: { dealerId: dealer.id } },
        ],
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        eventType: true,
        vehicleId: true,
        source: true,
        createdAt: true,
        vehicle: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Total contacts
    const totalContacts = events.length;

    // Breakdown by type
    const byType = {
      whatsapp: events.filter((e) => e.eventType === "WHATSAPP_CLICK").length,
      phoneReveal: events.filter((e) => e.eventType === "PHONE_REVEAL").length,
      phoneCall: events.filter((e) => e.eventType === "PHONE_CALL").length,
      chat: events.filter((e) => e.eventType === "CHAT_START").length,
      form: events.filter((e) => e.eventType === "CONTACT_FORM").length,
    };

    // Breakdown by source
    const bySource = {
      marketplace: events.filter((e) => e.source === "marketplace").length,
      microsite: events.filter((e) => e.source === "microsite").length,
    };

    // Contacts by day (for chart)
    const byDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      byDay[dateStr] = 0;
    }

    events.forEach((event) => {
      const dateStr = event.createdAt.toISOString().split("T")[0];
      if (byDay[dateStr] !== undefined) {
        byDay[dateStr]++;
      }
    });

    // Convert to sorted array (oldest first for charts)
    const byDayArray = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top vehicles by contacts
    const vehicleContactCounts: Record<string, { count: number; vehicle: { id: string; title: string; slug: string } | null }> = {};
    events.forEach((event) => {
      if (event.vehicleId && event.vehicle) {
        if (!vehicleContactCounts[event.vehicleId]) {
          vehicleContactCounts[event.vehicleId] = { count: 0, vehicle: event.vehicle };
        }
        vehicleContactCounts[event.vehicleId].count++;
      }
    });

    const topVehicles = Object.values(vehicleContactCounts)
      .filter((v) => v.vehicle !== null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((v) => ({
        vehicleId: v.vehicle!.id,
        title: v.vehicle!.title,
        slug: v.vehicle!.slug,
        count: v.count,
      }));

    // Calculate conversion rate (contacts / views)
    const totalViews = await prisma.vehicle.aggregate({
      where: { dealerId: dealer.id },
      _sum: { views: true },
    });

    const views = totalViews._sum.views || 0;
    const conversionRate = views > 0 ? (totalContacts / views) * 100 : 0;

    return NextResponse.json({
      period: days,
      totalContacts,
      byType,
      bySource,
      byDay: byDayArray,
      topVehicles,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalViews: views,
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

    console.error("Error fetching contact stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas de contactos" },
      { status: 500 }
    );
  }
}
