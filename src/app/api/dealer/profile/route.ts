import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireDealer, requireDealerManager } from "@/lib/dealer";
import { dealerProfileSchema } from "@/lib/validations/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get user with dealer info (allow pending status to view)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        dealerId: true,
        dealerRole: true,
        dealer: {
          include: {
            region: true,
            comuna: true,
            _count: {
              select: {
                vehicles: true,
                users: true,
              },
            },
          },
        },
      },
    });

    if (!user?.dealer) {
      return NextResponse.json(
        { error: "No tienes una cuenta de automotora" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dealerRole: user.dealerRole,
      },
      dealer: user.dealer,
    });
  } catch (error) {
    console.error("Error fetching dealer profile:", error);
    return NextResponse.json(
      { error: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);

    const body = await request.json();

    // Validate input
    const validationResult = dealerProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update dealer
    const updatedDealer = await prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        tradeName: data.tradeName,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        address: data.address,
        regionId: data.regionId,
        comunaId: data.comunaId || null,
        logo: data.logo || null,
        logoPublicId: data.logoPublicId || null,
        banner: data.banner || null,
        bannerPublicId: data.bannerPublicId || null,
        description: data.description || null,
        schedule: data.schedule as Prisma.InputJsonValue | undefined,
      },
      include: {
        region: true,
        comuna: true,
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado correctamente",
      dealer: updatedDealer,
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

    console.error("Error updating dealer profile:", error);
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}
