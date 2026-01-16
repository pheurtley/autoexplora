"use client";

import Link from "next/link";
import {
  MoreVertical,
  Edit,
  Trash2,
  Car,
  MapPin,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Region {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count: {
    comunas: number;
    vehicles: number;
  };
}

interface RegionTableProps {
  regions: Region[];
  onRefresh: () => void;
}

export function RegionTable({ regions, onRefresh }: RegionTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (regionId: string, regionName: string, vehicleCount: number) => {
    if (vehicleCount > 0) {
      alert(`No se puede eliminar "${regionName}" porque tiene ${vehicleCount} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la región "${regionName}"? Esta acción eliminará también todas sus comunas.`)) {
      return;
    }

    setLoading(regionId);
    try {
      const response = await fetch(`/api/admin/regiones/${regionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la región");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la región");
    } finally {
      setLoading(null);
      setOpenMenu(null);
    }
  };

  if (regions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">No hay regiones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600 w-16">
                Orden
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Nombre
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Slug
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                Comunas
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                Vehículos
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-neutral-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr
                key={region.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">
                    {region.order}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/regiones/${region.id}`}
                    className="font-medium text-neutral-900 hover:text-andino-600"
                  >
                    {region.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-neutral-500 font-mono">
                    {region.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                    <MapPin className="w-4 h-4" />
                    {region._count.comunas}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                    <Car className="w-4 h-4" />
                    {region._count.vehicles}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/regiones/${region.id}`}
                      className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                      title="Editar región"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <div className="relative" ref={openMenu === region.id ? menuRef : null}>
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === region.id ? null : region.id
                          )
                        }
                        disabled={loading === region.id}
                        className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === region.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                          <Link
                            href={`/admin/regiones/${region.id}`}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          <hr className="my-1 border-neutral-100" />
                          <button
                            onClick={() => handleDelete(region.id, region.name, region._count.vehicles)}
                            disabled={region._count.vehicles > 0}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={region._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : ""}
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
