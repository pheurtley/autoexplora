import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";

export async function GET() {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);

    // Get or create site config
    let config = await prisma.dealerSiteConfig.findUnique({
      where: { dealerId: dealer.id },
      include: {
        domains: { orderBy: { createdAt: "asc" } },
        pages: { orderBy: { order: "asc" } },
      },
    });

    if (!config) {
      config = await prisma.dealerSiteConfig.create({
        data: { dealerId: dealer.id },
        include: {
          domains: { orderBy: { createdAt: "asc" } },
          pages: { orderBy: { order: "asc" } },
        },
      });
    }

    return NextResponse.json({ config });
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
    console.error("Error fetching microsite config:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);

    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      "isActive",
      "primaryColor",
      "accentColor",
      "logo",
      "logoPublicId",
      "favicon",
      "faviconPublicId",
      "headerStyle",
      "footerStyle",
      "showWhatsAppButton",
      "metaTitle",
      "metaDescription",
      "ogImage",
      "ogImagePublicId",
      "googleAnalyticsId",
      "metaPixelId",
      "contactEmail",
      "contactPhone",
      "contactWhatsApp",
      "heroTitle",
      "heroSubtitle",
      "showFeaturedVehicles",
      "featuredVehiclesLimit",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    // Handle activation
    if (data.isActive === true) {
      data.activatedAt = new Date();
    }

    const config = await prisma.dealerSiteConfig.upsert({
      where: { dealerId: dealer.id },
      update: data,
      create: {
        dealerId: dealer.id,
        ...data,
      },
      include: {
        domains: { orderBy: { createdAt: "asc" } },
        pages: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({
      message: "Configuración actualizada",
      config,
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
    console.error("Error updating microsite config:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
