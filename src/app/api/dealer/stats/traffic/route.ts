import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealer } from "@/lib/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";

/**
 * GET /api/dealer/stats/traffic
 * Get traffic statistics for the dealer (page views, unique visitors, devices)
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

    // Previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    // Get view events for current period
    const viewEvents = await prisma.trackingEvent.findMany({
      where: {
        OR: [
          { dealerId: dealer.id },
          { vehicle: { dealerId: dealer.id } },
        ],
        eventType: {
          in: ["PAGE_VIEW", "VEHICLE_VIEW", "DEALER_PROFILE_VIEW", "MICROSITE_HOME_VIEW"],
        },
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        eventType: true,
        ipHash: true,
        device: true,
        source: true,
        createdAt: true,
        referrer: true,
      },
    });

    // Get view events for previous period (for comparison)
    const prevViewEvents = await prisma.trackingEvent.findMany({
      where: {
        OR: [
          { dealerId: dealer.id },
          { vehicle: { dealerId: dealer.id } },
        ],
        eventType: {
          in: ["PAGE_VIEW", "VEHICLE_VIEW", "DEALER_PROFILE_VIEW", "MICROSITE_HOME_VIEW"],
        },
        createdAt: { gte: prevStartDate, lt: startDate },
      },
      select: { id: true, ipHash: true },
    });

    // Calculate metrics
    const totalPageViews = viewEvents.length;
    const uniqueVisitors = new Set(viewEvents.map((e) => e.ipHash).filter(Boolean)).size;

    const prevTotalPageViews = prevViewEvents.length;
    const prevUniqueVisitors = new Set(prevViewEvents.map((e) => e.ipHash).filter(Boolean)).size;

    // Device breakdown
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    viewEvents.forEach((e) => {
      const device = e.device || "desktop";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    // Source breakdown
    const sourceCounts: Record<string, number> = { marketplace: 0, microsite: 0 };
    viewEvents.forEach((e) => {
      const source = e.source || "marketplace";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    // Page type breakdown
    const pageTypeCounts: Record<string, number> = {};
    viewEvents.forEach((e) => {
      pageTypeCounts[e.eventType] = (pageTypeCounts[e.eventType] || 0) + 1;
    });

    // Views by day
    const byDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      byDay[dateStr] = 0;
    }

    viewEvents.forEach((event) => {
      const dateStr = event.createdAt.toISOString().split("T")[0];
      if (byDay[dateStr] !== undefined) {
        byDay[dateStr]++;
      }
    });

    const byDayArray = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top referrers
    const referrerCounts: Record<string, number> = {};
    viewEvents.forEach((e) => {
      if (e.referrer) {
        try {
          const url = new URL(e.referrer);
          const domain = url.hostname;
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
        } catch {
          // Invalid URL, skip
        }
      }
    });

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));

    // Calculate percentage changes
    const pageViewsChange = prevTotalPageViews > 0
      ? Math.round(((totalPageViews - prevTotalPageViews) / prevTotalPageViews) * 100)
      : 0;
    const visitorsChange = prevUniqueVisitors > 0
      ? Math.round(((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100)
      : 0;

    return NextResponse.json({
      period: days,
      totalPageViews,
      uniqueVisitors,
      avgPagesPerVisitor: uniqueVisitors > 0 ? Math.round((totalPageViews / uniqueVisitors) * 10) / 10 : 0,
      comparison: {
        pageViewsChange,
        visitorsChange,
        prevTotalPageViews,
        prevUniqueVisitors,
      },
      byDevice: deviceCounts,
      bySource: sourceCounts,
      byPageType: pageTypeCounts,
      byDay: byDayArray,
      topReferrers,
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

    console.error("Error fetching traffic stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas de tráfico" },
      { status: 500 }
    );
  }
}
