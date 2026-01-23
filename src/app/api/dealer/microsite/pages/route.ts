import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);

    const body = await request.json();
    const { title, slug, content, isPublished, showInNav, metaTitle, metaDescription } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Título y slug son requeridos" },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "El slug solo puede contener letras minúsculas, números y guiones" },
        { status: 400 }
      );
    }

    // Reserved slugs
    const reserved = ["vehiculos", "contacto"];
    if (reserved.includes(slug)) {
      return NextResponse.json(
        { error: `El slug "${slug}" está reservado` },
        { status: 400 }
      );
    }

    // Get or create site config
    let config = await prisma.dealerSiteConfig.findUnique({
      where: { dealerId: dealer.id },
    });

    if (!config) {
      config = await prisma.dealerSiteConfig.create({
        data: { dealerId: dealer.id },
      });
    }

    // Get max order
    const maxOrder = await prisma.dealerPage.aggregate({
      where: { siteConfigId: config.id },
      _max: { order: true },
    });

    const page = await prisma.dealerPage.create({
      data: {
        siteConfigId: config.id,
        title,
        slug,
        content: content || [],
        isPublished: isPublished ?? false,
        showInNav: showInNav ?? true,
        order: (maxOrder._max.order ?? -1) + 1,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
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

    // Handle unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "Ya existe una página con ese slug" },
        { status: 409 }
      );
    }

    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Error al crear la página" }, { status: 500 });
  }
}
