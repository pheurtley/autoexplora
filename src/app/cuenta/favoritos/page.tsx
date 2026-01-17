import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FavoritesList } from "./FavoritesList";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Favoritos | AutoExplora.cl",
};

export default async function MisFavoritosPage() {
  const session = await auth();

  const favorites = await prisma.favorite.findMany({
    where: { userId: session!.user!.id },
    include: {
      vehicle: {
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          year: true,
          mileage: true,
          fuelType: true,
          condition: true,
          featured: true,
          brand: { select: { name: true, slug: true } },
          model: { select: { name: true, slug: true } },
          region: { select: { name: true, slug: true } },
          images: {
            select: { url: true, isPrimary: true },
            orderBy: { order: "asc" },
            take: 3,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out favorites where vehicle might be null (deleted vehicles)
  const validFavorites = favorites.filter((f) => f.vehicle !== null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mis Favoritos</h1>
        <span className="text-neutral-500">
          {validFavorites.length} vehículo{validFavorites.length !== 1 ? "s" : ""}
        </span>
      </div>

      {validFavorites.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Heart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            No tienes favoritos
          </h2>
          <p className="text-neutral-500 mb-6">
            Guarda vehículos que te interesen para verlos después
          </p>
          <Link href="/vehiculos">
            <Button>Explorar vehículos</Button>
          </Link>
        </div>
      ) : (
        <FavoritesList initialFavorites={validFavorites} />
      )}
    </div>
  );
}
