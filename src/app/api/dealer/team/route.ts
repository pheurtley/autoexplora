import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireDealerOwner } from "@/lib/dealer";
import { teamInviteSchema } from "@/lib/validations/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";

export async function GET() {
  try {
    const session = await auth();
    const { dealer } = await requireDealerOwner(session);

    const team = await prisma.user.findMany({
      where: { dealerId: dealer.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        dealerRole: true,
        createdAt: true,
      },
      orderBy: [
        { dealerRole: "asc" }, // OWNER first
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ team });
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

    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Error al obtener el equipo" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerOwner(session);

    const body = await request.json();

    // Validate input
    const validationResult = teamInviteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // If user exists and is not part of any dealer, link them
      if (!existingUser.dealerId) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            dealerId: dealer.id,
            dealerRole: data.role,
          },
          select: {
            id: true,
            name: true,
            email: true,
            dealerRole: true,
          },
        });

        return NextResponse.json({
          message: "Usuario agregado al equipo",
          user: updatedUser,
        });
      }

      return NextResponse.json(
        { error: "Este correo ya está asociado a otra cuenta" },
        { status: 400 }
      );
    }

    // Create new user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        dealerId: dealer.id,
        dealerRole: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        dealerRole: true,
      },
    });

    // TODO: Send invitation email with temporary password

    return NextResponse.json({
      message: "Invitación enviada correctamente",
      user: newUser,
      // In production, don't return this - send via email
      tempPassword,
    }, { status: 201 });
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

    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Error al invitar al usuario" },
      { status: 500 }
    );
  }
}
