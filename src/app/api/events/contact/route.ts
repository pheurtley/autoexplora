import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactEventType } from "@prisma/client";
import crypto from "crypto";

/**
 * POST /api/events/contact
 * Register a contact event (WhatsApp click, phone call, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, vehicleId, dealerId, source, sessionId } = body;

    // Validate eventType
    const validEventTypes = Object.values(ContactEventType);
    if (!eventType || !validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid eventType" },
        { status: 400 }
      );
    }

    // At least one of vehicleId or dealerId should be provided
    if (!vehicleId && !dealerId) {
      return NextResponse.json(
        { error: "Either vehicleId or dealerId is required" },
        { status: 400 }
      );
    }

    // Get and hash IP for privacy
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined;

    // Create the event
    const event = await prisma.contactEvent.create({
      data: {
        eventType: eventType as ContactEventType,
        vehicleId: vehicleId || null,
        dealerId: dealerId || null,
        source: source || "marketplace",
        ipHash,
        userAgent,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json(
      { success: true, eventId: event.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ContactEvent] Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
