"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTracking } from "@/hooks";
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  vehicleId: string;
  vehicleSlug: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}

export function FavoriteButton({
  vehicleId,
  vehicleSlug,
  initialFavorited,
  isLoggedIn,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { trackFavorite } = useTracking();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/vehiculos/${vehicleSlug}`);
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favoritos/${vehicleId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsFavorited(false);
          trackFavorite("remove", { vehicleId });
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favoritos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId }),
        });

        if (response.ok) {
          setIsFavorited(true);
          trackFavorite("add", { vehicleId });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isFavorited
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
      }`}
      title={isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Heart
          className={`w-6 h-6 ${isFavorited ? "fill-red-500" : ""}`}
        />
      )}
    </button>
  );
}
