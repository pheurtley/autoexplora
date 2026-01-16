"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MoreVertical,
  Edit,
  Trash2,
  Car,
  Layers,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  _count: {
    models: number;
    vehicles: number;
  };
}

interface BrandTableProps {
  brands: Brand[];
  onRefresh: () => void;
}

export function BrandTable({ brands, onRefresh }: BrandTableProps) {
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

  const handleDelete = async (brandId: string, brandName: string, vehicleCount: number) => {
    if (vehicleCount > 0) {
      alert(`No se puede eliminar "${brandName}" porque tiene ${vehicleCount} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la marca "${brandName}"? Esta acción eliminará también todos sus modelos.`)) {
      return;
    }

    setLoading(brandId);
    try {
      const response = await fetch(`/api/admin/marcas/${brandId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la marca");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la marca");
    } finally {
      setLoading(null);
      setOpenMenu(null);
    }
  };

  if (brands.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <p className="text-neutral-500">No hay marcas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Logo
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Nombre
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">
                Slug
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-neutral-600">
                Modelos
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
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-lg font-bold">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/marcas/${brand.id}`}
                    className="font-medium text-neutral-900 hover:text-andino-600"
                  >
                    {brand.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-neutral-500 font-mono">
                    {brand.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                    <Layers className="w-4 h-4" />
                    {brand._count.models}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                    <Car className="w-4 h-4" />
                    {brand._count.vehicles}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/marcas/${brand.id}`}
                      className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                      title="Editar marca"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <div className="relative" ref={openMenu === brand.id ? menuRef : null}>
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === brand.id ? null : brand.id
                          )
                        }
                        disabled={loading === brand.id}
                        className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === brand.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                          <Link
                            href={`/admin/marcas/${brand.id}`}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-neutral-600 hover:bg-neutral-50"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Link>
                          <hr className="my-1 border-neutral-100" />
                          <button
                            onClick={() => handleDelete(brand.id, brand.name, brand._count.vehicles)}
                            disabled={brand._count.vehicles > 0}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={brand._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : ""}
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
