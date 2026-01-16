"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Car,
  Layers,
  ImageIcon,
} from "lucide-react";

interface Model {
  id: string;
  name: string;
  slug: string;
  _count: {
    vehicles: number;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  models: Model[];
  _count: {
    models: number;
    vehicles: number;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BrandDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Model modal state
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelName, setModelName] = useState("");
  const [modelSaving, setModelSaving] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const fetchBrand = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/marcas/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBrand(data);
        setEditName(data.name);
        setEditLogo(data.logo || "");
      } else if (response.status === 404) {
        router.push("/admin/marcas");
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const handleSave = async () => {
    setError(null);
    if (!editName.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/marcas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          logo: editLogo.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al guardar");
        return;
      }

      setBrand(prev => prev ? { ...prev, name: data.name, slug: data.slug, logo: data.logo } : null);
      setIsEditing(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(brand?.name || "");
    setEditLogo(brand?.logo || "");
    setIsEditing(false);
    setError(null);
  };

  const handleDeleteBrand = async () => {
    if (!brand) return;

    if (brand._count.vehicles > 0) {
      alert(`No se puede eliminar porque tiene ${brand._count.vehicles} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la marca "${brand.name}"? Esta acción eliminará también todos sus modelos.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/marcas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/marcas");
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  // Model handlers
  const openNewModelModal = () => {
    setEditingModel(null);
    setModelName("");
    setModelError(null);
    setShowModelModal(true);
  };

  const openEditModelModal = (model: Model) => {
    setEditingModel(model);
    setModelName(model.name);
    setModelError(null);
    setShowModelModal(true);
  };

  const closeModelModal = () => {
    setShowModelModal(false);
    setEditingModel(null);
    setModelName("");
    setModelError(null);
  };

  const handleSaveModel = async () => {
    setModelError(null);
    if (!modelName.trim()) {
      setModelError("El nombre es requerido");
      return;
    }

    setModelSaving(true);
    try {
      const url = editingModel
        ? `/api/admin/modelos/${editingModel.id}`
        : "/api/admin/modelos";
      const method = editingModel ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName.trim(),
          brandId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModelError(data.error || "Error al guardar el modelo");
        return;
      }

      await fetchBrand();
      closeModelModal();
    } catch (err) {
      console.error("Error:", err);
      setModelError("Error al guardar el modelo");
    } finally {
      setModelSaving(false);
    }
  };

  const handleDeleteModel = async (model: Model) => {
    if (model._count.vehicles > 0) {
      alert(`No se puede eliminar "${model.name}" porque tiene ${model._count.vehicles} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el modelo "${model.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/modelos/${model.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBrand();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar el modelo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el modelo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-andino-600"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Marca no encontrada</p>
        <Link href="/admin/marcas" className="text-andino-600 hover:underline mt-2 inline-block">
          Volver a marcas
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
            href="/admin/marcas"
            className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a marcas
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">{brand.name}</h1>
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
              onClick={handleDeleteBrand}
              disabled={brand._count.vehicles > 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={brand._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : ""}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Brand Info */}
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
                Nombre de la marca *
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
                URL del logo (opcional)
              </label>
              <input
                type="url"
                value={editLogo}
                onChange={(e) => setEditLogo(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                disabled={saving}
              />
            </div>

            {editLogo && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vista previa
                </label>
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                  <Image
                    src={editLogo}
                    alt="Logo preview"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
            )}

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
          <div className="flex items-start gap-6">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-neutral-400" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-neutral-500">Slug</span>
                <p className="font-mono text-neutral-900">{brand.slug}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    {brand._count.models} {brand._count.models === 1 ? "modelo" : "modelos"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    {brand._count.vehicles} {brand._count.vehicles === 1 ? "vehículo" : "vehículos"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Models */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Modelos ({brand.models.length})
          </h2>
          <button
            onClick={openNewModelModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-andino-600 text-white text-sm font-medium rounded-lg hover:bg-andino-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo modelo
          </button>
        </div>

        {brand.models.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500">
            No hay modelos para esta marca
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
                {brand.models.map((model) => (
                  <tr key={model.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-6 py-3 font-medium text-neutral-900">
                      {model.name}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-neutral-500 font-mono">
                        {model.slug}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
                        <Car className="w-4 h-4" />
                        {model._count.vehicles}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModelModal(model)}
                          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
                          title="Editar modelo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model)}
                          disabled={model._count.vehicles > 0}
                          className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={model._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : "Eliminar modelo"}
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

      {/* Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingModel ? "Editar modelo" : "Nuevo modelo"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {modelError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {modelError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre del modelo *
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Ej: Corolla"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={modelSaving}
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-1">
                  El slug se generará automáticamente
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={closeModelModal}
                disabled={modelSaving}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModel}
                disabled={modelSaving}
                className="px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
              >
                {modelSaving ? "Guardando..." : editingModel ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
