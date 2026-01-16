import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerOwner } from "@/lib/dealer";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { dealer, user: currentUser } = await requireDealerOwner(session);
    const { userId } = await params;

    // Can't remove yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo del equipo" },
        { status: 400 }
      );
    }

    // Find the user to remove
    const userToRemove = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dealerId: true,
        dealerRole: true,
      },
    });

    if (!userToRemove) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check user belongs to this dealer
    if (userToRemove.dealerId !== dealer.id) {
      return NextResponse.json(
        { error: "Este usuario no pertenece a tu equipo" },
        { status: 400 }
      );
    }

    // Can't remove another owner
    if (userToRemove.dealerRole === DealerRole.OWNER) {
      return NextResponse.json(
        { error: "No puedes eliminar a otro propietario" },
        { status: 400 }
      );
    }

    // Remove user from dealer
    await prisma.user.update({
      where: { id: userId },
      data: {
        dealerId: null,
        dealerRole: null,
      },
    });

    return NextResponse.json({
      message: "Usuario eliminado del equipo",
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

    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Error al eliminar al usuario" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { dealer, user: currentUser } = await requireDealerOwner(session);
    const { userId } = await params;

    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !["MANAGER", "SALES"].includes(role)) {
      return NextResponse.json(
        { error: "Rol inválido" },
        { status: 400 }
      );
    }

    // Can't change your own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol" },
        { status: 400 }
      );
    }

    // Find the user to update
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dealerId: true,
        dealerRole: true,
      },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check user belongs to this dealer
    if (userToUpdate.dealerId !== dealer.id) {
      return NextResponse.json(
        { error: "Este usuario no pertenece a tu equipo" },
        { status: 400 }
      );
    }

    // Can't change another owner's role
    if (userToUpdate.dealerRole === DealerRole.OWNER) {
      return NextResponse.json(
        { error: "No puedes cambiar el rol de otro propietario" },
        { status: 400 }
      );
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { dealerRole: role },
      select: {
        id: true,
        name: true,
        email: true,
        dealerRole: true,
      },
    });

    return NextResponse.json({
      message: "Rol actualizado correctamente",
      user: updatedUser,
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

    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}
