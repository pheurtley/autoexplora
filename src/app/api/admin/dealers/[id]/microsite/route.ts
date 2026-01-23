import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId } = await params;

    // Verify dealer exists
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { id: true, tradeName: true, slug: true },
    });

    if (!dealer) {
      return NextResponse.json({ error: "Dealer no encontrado" }, { status: 404 });
    }

    // Get or create site config
    let config = await prisma.dealerSiteConfig.findUnique({
      where: { dealerId },
      include: {
        domains: { orderBy: { createdAt: "asc" } },
        pages: { orderBy: { order: "asc" } },
      },
    });

    if (!config) {
      config = await prisma.dealerSiteConfig.create({
        data: { dealerId },
        include: {
          domains: { orderBy: { createdAt: "asc" } },
          pages: { orderBy: { order: "asc" } },
        },
      });
    }

    return NextResponse.json({ config, dealer });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching dealer microsite config:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId } = await params;

    const body = await request.json();

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
      "showPhoneInHeader",
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
      "heroImage",
      "heroImagePublicId",
      "showFeaturedVehicles",
      "featuredVehiclesLimit",
      "socialInstagram",
      "socialFacebook",
      "socialTiktok",
      "socialYoutube",
      "whyUsTitle",
      "whyUsSubtitle",
      "whyUsFeatures",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    if (data.isActive === true) {
      data.activatedAt = new Date();
    }

    const config = await prisma.dealerSiteConfig.upsert({
      where: { dealerId },
      update: data,
      create: { dealerId, ...data },
      include: {
        domains: { orderBy: { createdAt: "asc" } },
        pages: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ message: "Configuración actualizada", config });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error updating dealer microsite config:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}
