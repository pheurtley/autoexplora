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
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "El dominio es requerido" },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { error: "Formato de dominio inválido" },
        { status: 400 }
      );
    }

    // Don't allow autoexplora.cl subdomains as custom domains
    if (cleanDomain.endsWith(".autoexplora.cl")) {
      return NextResponse.json(
        { error: "No puedes agregar subdominios de autoexplora.cl" },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const existing = await prisma.dealerDomain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este dominio ya está registrado" },
        { status: 409 }
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

    const domainRecord = await prisma.dealerDomain.create({
      data: {
        siteConfigId: config.id,
        domain: cleanDomain,
        isCustom: true,
        status: "PENDING",
      },
    });

    return NextResponse.json({ domain: domainRecord }, { status: 201 });
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
    console.error("Error adding domain:", error);
    return NextResponse.json({ error: "Error al agregar dominio" }, { status: 500 });
  }
}
