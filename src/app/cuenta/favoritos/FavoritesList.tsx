"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FavoriteCard } from "@/components/cuenta/FavoriteCard";

interface Favorite {
  id: string;
  vehicleId: string;
  vehicle: {
    id: string;
    slug: string;
    title: string;
    price: number;
    year: number;
    mileage: number;
    fuelType: string;
    condition: string;
    featured: boolean;
    brand: { name: string; slug: string };
    model: { name: string; slug: string };
    region: { name: string; slug: string };
    images: { url: string; isPrimary: boolean }[];
  };
}

interface FavoritesListProps {
  initialFavorites: Favorite[];
}

export function FavoritesList({ initialFavorites }: FavoritesListProps) {
  const router = useRouter();
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleRemove = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/favoritos/${vehicleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.vehicleId !== vehicleId));
        router.refresh();
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((favorite) => (
        <FavoriteCard
          key={favorite.id}
          vehicle={favorite.vehicle}
          onRemove={() => handleRemove(favorite.vehicleId)}
        />
      ))}
    </div>
  );
}
