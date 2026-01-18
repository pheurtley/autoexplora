import { Session } from "next-auth";
import prisma from "./prisma";
import { DealerRole, DealerStatus } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "./admin";

/**
 * Error thrown when dealer is not approved
 */
export class DealerPendingError extends Error {
  constructor(message: string = "Tu cuenta de automotora está pendiente de aprobación") {
    super(message);
    this.name = "DealerPendingError";
  }
}

/**
 * Error thrown when dealer is suspended or rejected
 */
export class DealerInactiveError extends Error {
  status: DealerStatus;

  constructor(status: DealerStatus, message?: string) {
    super(message || `Tu cuenta de automotora está ${status.toLowerCase()}`);
    this.name = "DealerInactiveError";
    this.status = status;
  }
}

/**
 * Get dealer info by user ID
 */
export async function getDealerByUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
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

  return user;
}

/**
 * Verify that the current user belongs to a dealer
 * Throws if not authenticated or not part of a dealer
 */
export async function requireDealer(session: Session | null) {
  if (!session?.user?.id) {
    throw new UnauthorizedError("Debes iniciar sesión");
  }

  const user = await getDealerByUser(session.user.id);

  if (!user) {
    throw new UnauthorizedError("Usuario no encontrado");
  }

  if (!user.dealer) {
    throw new ForbiddenError("No tienes una cuenta de automotora");
  }

  // Check dealer status
  if (user.dealer.status === DealerStatus.PENDING) {
    throw new DealerPendingError();
  }

  if (
    user.dealer.status === DealerStatus.SUSPENDED ||
    user.dealer.status === DealerStatus.REJECTED
  ) {
    throw new DealerInactiveError(user.dealer.status);
  }

  return {
    user: {
      id: user.id,
      dealerRole: user.dealerRole,
    },
    dealer: user.dealer,
  };
}

/**
 * Verify that the current user has specific dealer role(s)
 */
export async function requireDealerRole(
  session: Session | null,
  allowedRoles: DealerRole[]
) {
  const { user, dealer } = await requireDealer(session);

  if (!user.dealerRole || !allowedRoles.includes(user.dealerRole)) {
    throw new ForbiddenError(
      "No tienes los permisos necesarios para realizar esta acción"
    );
  }

  return { user, dealer };
}

/**
 * Check if user is dealer owner or manager
 */
export async function requireDealerManager(session: Session | null) {
  return requireDealerRole(session, [DealerRole.OWNER, DealerRole.MANAGER]);
}

/**
 * Check if user is dealer owner only
 */
export async function requireDealerOwner(session: Session | null) {
  return requireDealerRole(session, [DealerRole.OWNER]);
}

/**
 * Check if user is part of a dealer (returns boolean, doesn't throw)
 */
export async function isDealer(session: Session | null): Promise<boolean> {
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      dealerId: true,
      dealer: {
        select: { status: true },
      },
    },
  });

  return !!user?.dealer && user.dealer.status === DealerStatus.ACTIVE;
}

/**
 * Get dealer by slug (for public profile)
 */
export async function getDealerBySlug(slug: string) {
  const dealer = await prisma.dealer.findFirst({
    where: {
      slug,
      status: DealerStatus.ACTIVE,
    },
    include: {
      region: true,
      comuna: true,
      vehicles: {
        where: {
          status: "ACTIVE",
        },
        take: 20,
        orderBy: { publishedAt: "desc" },
        include: {
          brand: true,
          model: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          region: true,
        },
      },
      _count: {
        select: {
          vehicles: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  });

  return dealer;
}

/**
 * Get dealer by ID (for admin)
 */
export async function getDealerById(id: string) {
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      region: true,
      comuna: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          dealerRole: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          vehicles: true,
          users: true,
        },
      },
    },
  });

  return dealer;
}

/**
 * Generate a unique slug from trade name
 */
export async function generateDealerSlug(tradeName: string): Promise<string> {
  const baseSlug = tradeName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes

  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists and add number if needed
  while (await prisma.dealer.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Get dealer stats
 */
export async function getDealerStats(dealerId: string) {
  const [
    totalVehicles,
    activeVehicles,
    soldVehicles,
    totalViews,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: { dealerId },
    }),
    prisma.vehicle.count({
      where: { dealerId, status: "ACTIVE" },
    }),
    prisma.vehicle.count({
      where: { dealerId, status: "SOLD" },
    }),
    prisma.vehicle.aggregate({
      where: { dealerId },
      _sum: { views: true },
    }),
  ]);

  return {
    totalVehicles,
    activeVehicles,
    soldVehicles,
    totalViews: totalViews._sum.views || 0,
  };
}
