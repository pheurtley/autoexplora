"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, RefreshCw, Car, ExternalLink, Star } from "lucide-react";
import { Button, Badge } from "@/components/ui";

interface MatchedVehicle {
  id: string;
  title: string;
  slug: string;
  price: number;
  year: number;
  mileage: number;
  brand: { name: string };
  model: { name: string };
  images: { url: string; isPrimary: boolean }[];
  matchScore: number;
  matchReasons: string[];
}

interface InventoryMatcherProps {
  leadId: string;
  hasPreferences: boolean;
  onEditPreferences: () => void;
}

export function InventoryMatcher({
  leadId,
  hasPreferences,
  onEditPreferences,
}: InventoryMatcherProps) {
  const [matches, setMatches] = useState<MatchedVehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = useCallback(async () => {
    if (!hasPreferences) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/match`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  }, [leadId, hasPreferences]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (!hasPreferences) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center">
        <Search className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
        <h4 className="font-medium text-neutral-900 mb-1">
          Sin preferencias registradas
        </h4>
        <p className="text-sm text-neutral-500 mb-4">
          Agrega las preferencias del cliente para ver vehículos sugeridos.
        </p>
        <Button variant="outline" onClick={onEditPreferences}>
          Agregar Preferencias
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <h4 className="font-medium text-neutral-900">Vehículos Sugeridos</h4>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEditPreferences}>
            Editar Preferencias
          </Button>
          <Button variant="outline" size="sm" onClick={fetchMatches} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-andino-600 border-t-transparent rounded-full" />
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 text-center">
          <Car className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">
            No hay vehículos que coincidan con las preferencias.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((vehicle) => {
            const imageUrl = vehicle.images[0]?.url;

            return (
              <div
                key={vehicle.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200 hover:border-andino-300 transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={vehicle.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-neutral-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/vehiculos/${vehicle.slug}`}
                    target="_blank"
                    className="font-medium text-neutral-900 hover:text-andino-600 truncate block"
                  >
                    {vehicle.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-green-600">
                      ${vehicle.price.toLocaleString("es-CL")}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {vehicle.year} · {vehicle.mileage.toLocaleString("es-CL")} km
                    </span>
                  </div>
                  {/* Match reasons */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vehicle.matchReasons.slice(0, 3).map((reason, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score and Link */}
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="success" className="text-xs">
                    {vehicle.matchScore}% match
                  </Badge>
                  <Link
                    href={`/vehiculos/${vehicle.slug}`}
                    target="_blank"
                    className="text-andino-600 hover:text-andino-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
