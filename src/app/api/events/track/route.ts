import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Valid tracking event types (must match TrackingEventType enum in schema.prisma)
const VALID_EVENT_TYPES = [
  "WHATSAPP_CLICK",
  "PHONE_REVEAL",
  "PHONE_CALL",
  "CHAT_START",
  "CONTACT_FORM",
  "PAGE_VIEW",
  "VEHICLE_VIEW",
  "DEALER_PROFILE_VIEW",
  "MICROSITE_HOME_VIEW",
  "IMAGE_GALLERY_VIEW",
  "SEARCH_PERFORMED",
  "FILTER_APPLIED",
  "FAVORITE_ADDED",
  "FAVORITE_REMOVED",
  "SHARE_CLICK",
] as const;

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
    if (!eventType || !(VALID_EVENT_TYPES as readonly string[]).includes(eventType)) {
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
        eventType,
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
