import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);
    const { id: leadId } = await params;

    const body = await request.json();

    // Verify lead belongs to this dealer
    const lead = await prisma.dealerLead.findFirst({
      where: { id: leadId, dealerId: dealer.id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.status === "CONTACTED") {
      updateData.status = "CONTACTED";
      updateData.readAt = new Date();
    } else if (body.status === "QUALIFIED") {
      updateData.status = "QUALIFIED";
      updateData.respondedAt = new Date();
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const updated = await prisma.dealerLead.update({
      where: { id: leadId },
      data: updateData,
    });

    return NextResponse.json({ lead: updated });
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
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Error al actualizar lead" }, { status: 500 });
  }
}
