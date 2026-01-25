import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TrackingEventType } from "@prisma/client";
import crypto from "crypto";

/**
 * POST /api/events/track
 * Register a tracking event (page views, searches, interactions, contacts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventType,
      vehicleId,
      dealerId,
      source = "marketplace",
      sessionId,
      metadata,
    } = body;

    // Validate eventType
    const validEventTypes = Object.values(TrackingEventType);
    if (!eventType || !validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid eventType" },
        { status: 400 }
      );
    }

    // Get and hash IP for privacy
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Get user agent and detect device
    const userAgent = request.headers.get("user-agent") || "";
    const device = detectDevice(userAgent);

    // Get referrer
    const referrer = request.headers.get("referer") || undefined;

    // Create the event
    const event = await prisma.trackingEvent.create({
      data: {
        eventType: eventType as TrackingEventType,
        vehicleId: vehicleId || null,
        dealerId: dealerId || null,
        source,
        ipHash,
        userAgent: userAgent || null,
        device,
        referrer: referrer || null,
        sessionId: sessionId || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json(
      { success: true, eventId: event.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[TrackingEvent] Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

/**
 * Detect device type from user agent
 */
function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "tablet";
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
}
