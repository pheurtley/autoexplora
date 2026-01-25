import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";

/**
 * GET /api/admin/analytics
 * Get platform-wide analytics for admin dashboard
 * Query params: period (7, 30, 90 days)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

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

    // Get tracking events for current period
    const trackingEvents = await prisma.trackingEvent.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        eventType: true,
        ipHash: true,
        device: true,
        source: true,
        createdAt: true,
        dealerId: true,
        vehicleId: true,
        regionId: true,
      },
    });

    // Get tracking events for previous period
    const prevTrackingEvents = await prisma.trackingEvent.findMany({
      where: {
        createdAt: { gte: prevStartDate, lt: startDate },
      },
      select: { id: true, ipHash: true },
    });

    // Get contact events for current period
    const contactEvents = await prisma.contactEvent.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        eventType: true,
        ipHash: true,
        source: true,
        createdAt: true,
        dealerId: true,
        vehicleId: true,
      },
    });

    // Get contact events for previous period
    const prevContactEvents = await prisma.contactEvent.findMany({
      where: {
        createdAt: { gte: prevStartDate, lt: startDate },
      },
      select: { id: true },
    });

    // Get leads count
    const leadsCount = await prisma.dealerLead.count({
      where: { createdAt: { gte: startDate } },
    });

    const prevLeadsCount = await prisma.dealerLead.count({
      where: { createdAt: { gte: prevStartDate, lt: startDate } },
    });

    // Calculate metrics
    const viewEventTypes = ["PAGE_VIEW", "VEHICLE_VIEW", "DEALER_PROFILE_VIEW", "MICROSITE_HOME_VIEW"];
    const viewEvents = trackingEvents.filter((e) => viewEventTypes.includes(e.eventType));
    const totalPageViews = viewEvents.length;
    const uniqueVisitors = new Set(trackingEvents.map((e) => e.ipHash).filter(Boolean)).size;

    const prevTotalPageViews = prevTrackingEvents.length;
    const prevUniqueVisitors = new Set(prevTrackingEvents.map((e) => e.ipHash).filter(Boolean)).size;

    // Device breakdown
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    viewEvents.forEach((e) => {
      const device = e.device || "desktop";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    // Source breakdown (marketplace vs microsite)
    const sourceCounts: Record<string, number> = { marketplace: 0, microsite: 0 };
    viewEvents.forEach((e) => {
      const source = e.source || "marketplace";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    // Contact events breakdown
    const contactTypes = ["WHATSAPP_CLICK", "PHONE_REVEAL", "PHONE_CALL", "CHAT_START", "CONTACT_FORM"];
    const contactEventTypes: Record<string, number> = {};
    contactTypes.forEach((type) => {
      contactEventTypes[type] = 0;
    });

    // Count from tracking events
    trackingEvents.forEach((e) => {
      if (contactTypes.includes(e.eventType)) {
        contactEventTypes[e.eventType]++;
      }
    });

    // Count from legacy contact events
    contactEvents.forEach((e) => {
      if (contactTypes.includes(e.eventType)) {
        contactEventTypes[e.eventType]++;
      }
    });

    const totalContacts = Object.values(contactEventTypes).reduce((a, b) => a + b, 0);

    // Views by day
    const byDay: Record<string, { views: number; contacts: number; visitors: Set<string> }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      byDay[dateStr] = { views: 0, contacts: 0, visitors: new Set() };
    }

    viewEvents.forEach((event) => {
      const dateStr = event.createdAt.toISOString().split("T")[0];
      if (byDay[dateStr]) {
        byDay[dateStr].views++;
        if (event.ipHash) {
          byDay[dateStr].visitors.add(event.ipHash);
        }
      }
    });

    [...trackingEvents, ...contactEvents].forEach((event) => {
      if (contactTypes.includes(event.eventType)) {
        const dateStr = event.createdAt.toISOString().split("T")[0];
        if (byDay[dateStr]) {
          byDay[dateStr].contacts++;
        }
      }
    });

    const byDayArray = Object.entries(byDay)
      .map(([date, data]) => ({
        date,
        views: data.views,
        contacts: data.contacts,
        visitors: data.visitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top dealers by contacts
    const dealerContacts: Record<string, number> = {};
    [...trackingEvents, ...contactEvents].forEach((e) => {
      if (contactTypes.includes(e.eventType) && e.dealerId) {
        dealerContacts[e.dealerId] = (dealerContacts[e.dealerId] || 0) + 1;
      }
    });

    const topDealerIds = Object.entries(dealerContacts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topDealers = topDealerIds.length > 0
      ? await prisma.dealer.findMany({
          where: { id: { in: topDealerIds } },
          select: { id: true, tradeName: true, slug: true },
        })
      : [];

    const topDealersWithContacts = topDealerIds.map((id) => {
      const dealer = topDealers.find((d) => d.id === id);
      return {
        id,
        tradeName: dealer?.tradeName || "Desconocido",
        slug: dealer?.slug || null,
        contacts: dealerContacts[id],
      };
    });

    // Top vehicles by views
    const vehicleViews: Record<string, number> = {};
    trackingEvents.forEach((e) => {
      if (e.eventType === "VEHICLE_VIEW" && e.vehicleId) {
        vehicleViews[e.vehicleId] = (vehicleViews[e.vehicleId] || 0) + 1;
      }
    });

    const topVehicleIds = Object.entries(vehicleViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topVehicles = topVehicleIds.length > 0
      ? await prisma.vehicle.findMany({
          where: { id: { in: topVehicleIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            brand: { select: { name: true } },
            model: { select: { name: true } },
          },
        })
      : [];

    const topVehiclesWithViews = topVehicleIds.map((id) => {
      const vehicle = topVehicles.find((v) => v.id === id);
      return {
        id,
        title: vehicle?.title || "Desconocido",
        slug: vehicle?.slug || null,
        brand: vehicle?.brand?.name || "",
        model: vehicle?.model?.name || "",
        views: vehicleViews[id],
      };
    });

    // Search tracking
    const searchEvents = trackingEvents.filter((e) => e.eventType === "SEARCH_PERFORMED");
    const totalSearches = searchEvents.length;

    // Favorites and shares
    const favoriteEvents = trackingEvents.filter((e) =>
      e.eventType === "FAVORITE_ADDED" || e.eventType === "FAVORITE_REMOVED"
    );
    const shareEvents = trackingEvents.filter((e) => e.eventType === "SHARE_CLICK");
    const totalFavorites = favoriteEvents.filter((e) => e.eventType === "FAVORITE_ADDED").length;
    const totalShares = shareEvents.length;

    // Calculate percentage changes
    const pageViewsChange = prevTotalPageViews > 0
      ? Math.round(((totalPageViews - prevTotalPageViews) / prevTotalPageViews) * 100)
      : 0;
    const visitorsChange = prevUniqueVisitors > 0
      ? Math.round(((uniqueVisitors - prevUniqueVisitors) / prevUniqueVisitors) * 100)
      : 0;
    const contactsChange = prevContactEvents.length > 0
      ? Math.round(((totalContacts - prevContactEvents.length) / prevContactEvents.length) * 100)
      : 0;
    const leadsChange = prevLeadsCount > 0
      ? Math.round(((leadsCount - prevLeadsCount) / prevLeadsCount) * 100)
      : 0;

    // Funnel calculation
    const allViewers = new Set<string>();
    const vehicleViewers = new Set<string>();
    const contactors = new Set<string>();

    trackingEvents.forEach((e) => {
      if (e.ipHash) {
        if (viewEventTypes.includes(e.eventType)) {
          allViewers.add(e.ipHash);
        }
        if (e.eventType === "VEHICLE_VIEW") {
          vehicleViewers.add(e.ipHash);
        }
        if (contactTypes.includes(e.eventType)) {
          contactors.add(e.ipHash);
        }
      }
    });

    contactEvents.forEach((e) => {
      if (e.ipHash && contactTypes.includes(e.eventType)) {
        contactors.add(e.ipHash);
      }
    });

    const funnel = [
      { stage: "Visitantes", count: allViewers.size, percentage: 100 },
      {
        stage: "Vieron vehículos",
        count: vehicleViewers.size,
        percentage: allViewers.size > 0 ? Math.round((vehicleViewers.size / allViewers.size) * 100) : 0,
      },
      {
        stage: "Contactaron",
        count: contactors.size,
        percentage: allViewers.size > 0 ? Math.round((contactors.size / allViewers.size) * 100) : 0,
      },
      {
        stage: "Leads",
        count: leadsCount,
        percentage: allViewers.size > 0 ? Math.round((leadsCount / allViewers.size) * 100) : 0,
      },
    ];

    return NextResponse.json({
      period: days,
      overview: {
        totalPageViews,
        uniqueVisitors,
        totalContacts,
        totalLeads: leadsCount,
        totalSearches,
        totalFavorites,
        totalShares,
        comparison: {
          pageViewsChange,
          visitorsChange,
          contactsChange,
          leadsChange,
        },
      },
      byDevice: deviceCounts,
      bySource: sourceCounts,
      byContactType: contactEventTypes,
      byDay: byDayArray,
      funnel,
      topDealers: topDealersWithContacts,
      topVehicles: topVehiclesWithViews,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
