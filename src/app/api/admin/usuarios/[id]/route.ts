import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get user details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
        bannedAt: true,
        banReason: true,
        suspendedUntil: true,
        createdAt: true,
        vehicles: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            price: true,
            createdAt: true,
            brand: { select: { name: true } },
            model: { select: { name: true } },
            images: {
              select: { url: true },
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
        reportsMade: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
            vehicle: {
              select: {
                id: true,
                brand: { select: { name: true } },
                model: { select: { name: true } },
              },
            },
          },
        },
        _count: {
          select: {
            vehicles: true,
            favorites: true,
            reportsMade: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// Update user (ban, change role, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();
    const { action, reason, role, suspendDays } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Build update data based on action
    const updateData: Record<string, unknown> = {};

    switch (action) {
      case "ban":
        await requireAdmin(session);
        if (!reason) {
          return NextResponse.json(
            { error: "Debes proporcionar una razón para el baneo" },
            { status: 400 }
          );
        }
        updateData.bannedAt = new Date();
        updateData.banReason = reason;
        break;

      case "unban":
        await requireAdmin(session);
        updateData.bannedAt = null;
        updateData.banReason = null;
        break;

      case "suspend":
        await requireAdmin(session);
        if (!suspendDays || suspendDays < 1) {
          return NextResponse.json(
            { error: "Debes especificar los días de suspensión" },
            { status: 400 }
          );
        }
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + suspendDays);
        updateData.suspendedUntil = suspendedUntil;
        break;

      case "unsuspend":
        await requireAdmin(session);
        updateData.suspendedUntil = null;
        break;

      case "changeRole":
        // Only super admins can change roles
        await requireSuperAdmin(session);
        if (!role || !Object.values(Role).includes(role)) {
          return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
        }
        // Prevent changing own role
        if (id === session?.user?.id) {
          return NextResponse.json(
            { error: "No puedes cambiar tu propio rol" },
            { status: 400 }
          );
        }
        updateData.role = role;
        break;

      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 }
        );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bannedAt: true,
        banReason: true,
        suspendedUntil: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
