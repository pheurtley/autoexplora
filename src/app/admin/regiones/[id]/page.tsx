"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Car,
  MapPin,
} from "lucide-react";

interface Comuna {
  id: string;
  name: string;
  slug: string;
  _count: {
    vehicles: number;
  };
}

interface Region {
  id: string;
  name: string;
  slug: string;
  order: number;
  comunas: Comuna[];
  _count: {
    comunas: number;
    vehicles: number;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RegionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Comuna modal state
  const [showComunaModal, setShowComunaModal] = useState(false);
  const [editingComuna, setEditingComuna] = useState<Comuna | null>(null);
  const [comunaName, setComunaName] = useState("");
  const [comunaSaving, setComunaSaving] = useState(false);
  const [comunaError, setComunaError] = useState<string | null>(null);

  const fetchRegion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/regiones/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRegion(data);
        setEditName(data.name);
        setEditOrder(data.order);
      } else if (response.status === 404) {
        router.push("/admin/regiones");
      }
    } catch (error) {
      console.error("Error fetching region:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchRegion();
  }, [fetchRegion]);

  const handleSave = async () => {
    setError(null);
    if (!editName.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/regiones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          order: editOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al guardar");
        return;
      }

      setRegion(prev => prev ? { ...prev, name: data.name, slug: data.slug, order: data.order } : null);
      setIsEditing(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(region?.name || "");
    setEditOrder(region?.order || 1);
    setIsEditing(false);
    setError(null);
  };

  const handleDeleteRegion = async () => {
    if (!region) return;

    if (region._count.vehicles > 0) {
      alert(`No se puede eliminar porque tiene ${region._count.vehicles} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la región "${region.name}"? Esta acción eliminará también todas sus comunas.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/regiones/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/regiones");
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  // Comuna handlers
  const openNewComunaModal = () => {
    setEditingComuna(null);
    setComunaName("");
    setComunaError(null);
    setShowComunaModal(true);
  };

  const openEditComunaModal = (comuna: Comuna) => {
    setEditingComuna(comuna);
    setComunaName(comuna.name);
    setComunaError(null);
    setShowComunaModal(true);
  };

  const closeComunaModal = () => {
    setShowComunaModal(false);
    setEditingComuna(null);
    setComunaName("");
    setComunaError(null);
  };

  const handleSaveComuna = async () => {
    setComunaError(null);
    if (!comunaName.trim()) {
      setComunaError("El nombre es requerido");
      return;
    }

    setComunaSaving(true);
    try {
      const url = editingComuna
        ? `/api/admin/comunas/${editingComuna.id}`
        : "/api/admin/comunas";
      const method = editingComuna ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: comunaName.trim(),
          regionId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setComunaError(data.error || "Error al guardar la comuna");
        return;
      }

      await fetchRegion();
      closeComunaModal();
    } catch (err) {
      console.error("Error:", err);
      setComunaError("Error al guardar la comuna");
    } finally {
      setComunaSaving(false);
    }
  };

  const handleDeleteComuna = async (comuna: Comuna) => {
    if (comuna._count.vehicles > 0) {
      alert(`No se puede eliminar "${comuna.name}" porque tiene ${comuna._count.vehicles} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la comuna "${comuna.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comunas/${comuna.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRegion();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la comuna");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la comuna");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Región no encontrada</p>
        <Link href="/admin/regiones" className="text-andino-600 hover:underline mt-2 inline-block">
          Volver a regiones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/regiones"
            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a regiones
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">{region.name}</h1>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDeleteRegion}
              disabled={region._count.vehicles > 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={region._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : ""}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Region Info */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre de la región *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Orden de visualización *
              </label>
              <input
                type="number"
                value={editOrder}
                onChange={(e) => setEditOrder(parseInt(e.target.value) || 1)}
                min={1}
                className="w-full max-w-xs px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                disabled={saving}
              />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-sm text-neutral-500">Slug</span>
                <p className="font-mono text-neutral-900">{region.slug}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Orden</span>
                <p className="text-neutral-900">{region.order}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <div>
                  <span className="text-sm text-neutral-500">Comunas</span>
                  <p className="text-neutral-900">{region._count.comunas}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-neutral-400" />
                <div>
                  <span className="text-sm text-neutral-500">Vehículos</span>
                  <p className="text-neutral-900">{region._count.vehicles}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comunas */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Comunas ({region.comunas.length})
          </h2>
          <button
            onClick={openNewComunaModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-andino-600 text-white text-sm font-medium rounded-lg hover:bg-andino-700"
          >
            <Plus className="w-4 h-4" />
            Nueva comuna
          </button>
        </div>

        {region.comunas.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500">
            No hay comunas para esta región
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">
                    Nombre
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-neutral-600">
                    Slug
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-neutral-600">
                    Vehículos
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-neutral-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {region.comunas.map((comuna) => (
                  <tr key={comuna.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-6 py-3 font-medium text-neutral-900">
                      {comuna.name}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-neutral-500 font-mono">
                        {comuna.slug}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                        <Car className="w-4 h-4" />
                        {comuna._count.vehicles}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditComunaModal(comuna)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                          title="Editar comuna"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComuna(comuna)}
                          disabled={comuna._count.vehicles > 0}
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={comuna._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : "Eliminar comuna"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comuna Modal */}
      {showComunaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingComuna ? "Editar comuna" : "Nueva comuna"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {comunaError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {comunaError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre de la comuna *
                </label>
                <input
                  type="text"
                  value={comunaName}
                  onChange={(e) => setComunaName(e.target.value)}
                  placeholder="Ej: Santiago Centro"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={comunaSaving}
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-1">
                  El slug se generará automáticamente
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={closeComunaModal}
                disabled={comunaSaving}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveComuna}
                disabled={comunaSaving}
                className="px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
              >
                {comunaSaving ? "Guardando..." : editingComuna ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
