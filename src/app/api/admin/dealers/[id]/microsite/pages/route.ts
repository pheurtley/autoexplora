import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId } = await params;

    const body = await request.json();
    const { title, slug, content, isPublished, showInNav, metaTitle, metaDescription } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Título y slug son requeridos" }, { status: 400 });
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    const reserved = ["vehiculos", "contacto"];
    if (reserved.includes(slug)) {
      return NextResponse.json({ error: `El slug "${slug}" está reservado` }, { status: 400 });
    }

    let config = await prisma.dealerSiteConfig.findUnique({ where: { dealerId } });
    if (!config) {
      config = await prisma.dealerSiteConfig.create({ data: { dealerId } });
    }

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
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe una página con ese slug" }, { status: 409 });
    }
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Error al crear la página" }, { status: 500 });
  }
}
