import { Session } from "next-auth";
import prisma from "./prisma";
import { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message: string = "No autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Sin permisos suficientes") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Verifies that the user is authenticated
 */
export async function requireAuth(session: Session | null) {
  if (!session?.user?.id) {
    throw new UnauthorizedError("Debes iniciar sesión");
  }
  return session.user;
}

/**
 * Verifies that the user has admin or moderator role
 */
export async function requireAdmin(session: Session | null) {
  if (!session?.user?.id) {
    throw new UnauthorizedError("Debes iniciar sesión");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      bannedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("Usuario no encontrado");
  }

  if (user.bannedAt) {
    throw new ForbiddenError("Tu cuenta ha sido suspendida");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
    throw new ForbiddenError("No tienes permisos de administrador");
  }

  return { ...session.user, role: user.role };
}

/**
 * Verifies that the user has admin role (not just moderator)
 */
export async function requireSuperAdmin(session: Session | null) {
  if (!session?.user?.id) {
    throw new UnauthorizedError("Debes iniciar sesión");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      bannedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("Usuario no encontrado");
  }

  if (user.bannedAt) {
    throw new ForbiddenError("Tu cuenta ha sido suspendida");
  }

  if (user.role !== Role.ADMIN) {
    throw new ForbiddenError("Solo los administradores pueden realizar esta acción");
  }

  return { ...session.user, role: user.role };
}

/**
 * Checks if user is admin or moderator (returns boolean, doesn't throw)
 */
export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, bannedAt: true },
  });

  if (!user || user.bannedAt) {
    return false;
  }

  return user.role === Role.ADMIN || user.role === Role.MODERATOR;
}

/**
 * Gets user role from session
 */
export async function getUserRole(session: Session | null): Promise<Role | null> {
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role ?? null;
}
