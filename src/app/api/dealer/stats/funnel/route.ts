import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealer } from "@/lib/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";

/**
 * GET /api/dealer/stats/funnel
 * Get conversion funnel statistics (views -> vehicle views -> contacts -> leads)
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

    // Get all tracking events for this dealer
    const events = await prisma.trackingEvent.findMany({
      where: {
        OR: [
          { dealerId: dealer.id },
          { vehicle: { dealerId: dealer.id } },
        ],
        createdAt: { gte: startDate },
      },
      select: {
        eventType: true,
        ipHash: true,
      },
    });

    // Also get legacy contact events
    const contactEvents = await prisma.contactEvent.findMany({
      where: {
        OR: [
          { dealerId: dealer.id },
          { vehicle: { dealerId: dealer.id } },
        ],
        createdAt: { gte: startDate },
      },
      select: {
        eventType: true,
        ipHash: true,
      },
    });

    // Get leads count
    const leadsCount = await prisma.dealerLead.count({
      where: {
        dealerId: dealer.id,
        createdAt: { gte: startDate },
      },
    });

    // Calculate funnel stages
    const viewTypes = ["PAGE_VIEW", "DEALER_PROFILE_VIEW", "MICROSITE_HOME_VIEW"];
    const vehicleViewTypes = ["VEHICLE_VIEW"];
    const contactTypes = ["WHATSAPP_CLICK", "PHONE_REVEAL", "PHONE_CALL", "CHAT_START", "CONTACT_FORM"];

    // Count unique visitors at each stage
    const allViewers = new Set<string>();
    const vehicleViewers = new Set<string>();
    const contactors = new Set<string>();

    events.forEach((e) => {
      if (e.ipHash) {
        if (viewTypes.includes(e.eventType) || vehicleViewTypes.includes(e.eventType)) {
          allViewers.add(e.ipHash);
        }
        if (vehicleViewTypes.includes(e.eventType)) {
          vehicleViewers.add(e.ipHash);
        }
        if (contactTypes.includes(e.eventType)) {
          contactors.add(e.ipHash);
        }
      }
    });

    // Also count from legacy contact events
    contactEvents.forEach((e) => {
      if (e.ipHash && contactTypes.includes(e.eventType)) {
        contactors.add(e.ipHash);
      }
    });

    const totalVisitors = allViewers.size;
    const vehicleViewersCount = vehicleViewers.size;
    const contactorsCount = contactors.size;

    // Calculate conversion rates
    const viewToVehicleRate = totalVisitors > 0
      ? Math.round((vehicleViewersCount / totalVisitors) * 100)
      : 0;
    const vehicleToContactRate = vehicleViewersCount > 0
      ? Math.round((contactorsCount / vehicleViewersCount) * 100)
      : 0;
    const contactToLeadRate = contactorsCount > 0
      ? Math.round((leadsCount / contactorsCount) * 100)
      : 0;
    const overallConversionRate = totalVisitors > 0
      ? Math.round((leadsCount / totalVisitors) * 1000) / 10
      : 0;

    // Funnel stages
    const funnel = [
      {
        stage: "Visitantes",
        count: totalVisitors,
        percentage: 100,
      },
      {
        stage: "Vieron vehículos",
        count: vehicleViewersCount,
        percentage: viewToVehicleRate,
      },
      {
        stage: "Contactaron",
        count: contactorsCount,
        percentage: totalVisitors > 0 ? Math.round((contactorsCount / totalVisitors) * 100) : 0,
      },
      {
        stage: "Leads",
        count: leadsCount,
        percentage: totalVisitors > 0 ? Math.round((leadsCount / totalVisitors) * 100) : 0,
      },
    ];

    return NextResponse.json({
      period: days,
      funnel,
      conversionRates: {
        viewToVehicle: viewToVehicleRate,
        vehicleToContact: vehicleToContactRate,
        contactToLead: contactToLeadRate,
        overall: overallConversionRate,
      },
      totals: {
        visitors: totalVisitors,
        vehicleViews: vehicleViewersCount,
        contacts: contactorsCount,
        leads: leadsCount,
      },
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

    console.error("Error fetching funnel stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas del funnel" },
      { status: 500 }
    );
  }
}
