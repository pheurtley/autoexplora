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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Tag,
  Search,
} from "lucide-react";

interface Version {
  id: string;
  name: string;
  slug: string;
  engineSize: string | null;
  horsePower: number | null;
  transmission: string | null;
  drivetrain: string | null;
  trimLevel: string | null;
  _count: {
    vehicles: number;
  };
}

interface Model {
  id: string;
  name: string;
  slug: string;
  versions: Version[];
  _count: {
    vehicles: number;
    versions: number;
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

  // Search state
  const [modelSearch, setModelSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Expanded models state
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

  // Model modal state
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [modelName, setModelName] = useState("");
  const [modelSaving, setModelSaving] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Version modal state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [versionModelId, setVersionModelId] = useState<string | null>(null);
  const [versionName, setVersionName] = useState("");
  const [versionEngineSize, setVersionEngineSize] = useState("");
  const [versionHorsePower, setVersionHorsePower] = useState("");
  const [versionTransmission, setVersionTransmission] = useState("");
  const [versionDrivetrain, setVersionDrivetrain] = useState("");
  const [versionTrimLevel, setVersionTrimLevel] = useState("");
  const [versionSaving, setVersionSaving] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);

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

  // Filter models by search
  const filteredModels = brand?.models.filter(
    (model) =>
      model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.slug.toLowerCase().includes(modelSearch.toLowerCase())
  ) || [];

  // Pagination
  const totalFilteredModels = filteredModels.length;
  const totalPages = Math.ceil(totalFilteredModels / pageSize);
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [modelSearch]);

  // Toggle model expansion
  const toggleModelExpanded = (modelId: string) => {
    setExpandedModels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

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

    if (!confirm(`¿Estás seguro de eliminar la marca "${brand.name}"? Esta acción eliminará también todos sus modelos y versiones.`)) {
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

    if (!confirm(`¿Estás seguro de eliminar el modelo "${model.name}"? Esta acción eliminará también todas sus versiones.`)) {
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

  // Version handlers
  const openNewVersionModal = (modelId: string) => {
    setEditingVersion(null);
    setVersionModelId(modelId);
    setVersionName("");
    setVersionEngineSize("");
    setVersionHorsePower("");
    setVersionTransmission("");
    setVersionDrivetrain("");
    setVersionTrimLevel("");
    setVersionError(null);
    setShowVersionModal(true);
  };

  const openEditVersionModal = (version: Version, modelId: string) => {
    setEditingVersion(version);
    setVersionModelId(modelId);
    setVersionName(version.name);
    setVersionEngineSize(version.engineSize || "");
    setVersionHorsePower(version.horsePower?.toString() || "");
    setVersionTransmission(version.transmission || "");
    setVersionDrivetrain(version.drivetrain || "");
    setVersionTrimLevel(version.trimLevel || "");
    setVersionError(null);
    setShowVersionModal(true);
  };

  const closeVersionModal = () => {
    setShowVersionModal(false);
    setEditingVersion(null);
    setVersionModelId(null);
    setVersionName("");
    setVersionEngineSize("");
    setVersionHorsePower("");
    setVersionTransmission("");
    setVersionDrivetrain("");
    setVersionTrimLevel("");
    setVersionError(null);
  };

  const handleSaveVersion = async () => {
    setVersionError(null);
    if (!versionName.trim()) {
      setVersionError("El nombre es requerido");
      return;
    }

    setVersionSaving(true);
    try {
      const url = editingVersion
        ? `/api/admin/versiones/${editingVersion.id}`
        : "/api/admin/versiones";
      const method = editingVersion ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: versionName.trim(),
          modelId: versionModelId,
          engineSize: versionEngineSize.trim() || null,
          horsePower: versionHorsePower || null,
          transmission: versionTransmission.trim() || null,
          drivetrain: versionDrivetrain.trim() || null,
          trimLevel: versionTrimLevel.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVersionError(data.error || "Error al guardar la versión");
        return;
      }

      await fetchBrand();
      closeVersionModal();
    } catch (err) {
      console.error("Error:", err);
      setVersionError("Error al guardar la versión");
    } finally {
      setVersionSaving(false);
    }
  };

  const handleDeleteVersion = async (version: Version) => {
    if (version._count.vehicles > 0) {
      alert(`No se puede eliminar "${version.name}" porque tiene ${version._count.vehicles} vehículo(s) asociado(s)`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la versión "${version.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/versiones/${version.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBrand();
      } else {
        const data = await response.json();
        alert(data.error || "Error al eliminar la versión");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la versión");
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
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
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
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full max-w-sm pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            />
          </div>
        </div>

        {paginatedModels.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500">
            {modelSearch ? "No se encontraron modelos" : "No hay modelos para esta marca"}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {paginatedModels.map((model) => (
              <div key={model.id}>
                {/* Model Row */}
                <div className="px-6 py-3 flex items-center gap-4 hover:bg-neutral-50">
                  <button
                    onClick={() => toggleModelExpanded(model.id)}
                    className="p-1 hover:bg-neutral-200 rounded"
                  >
                    {expandedModels.has(model.id) ? (
                      <ChevronDown className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900">{model.name}</p>
                    <p className="text-sm text-neutral-500 font-mono">{model.slug}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {model._count.versions} {model._count.versions === 1 ? "versión" : "versiones"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {model._count.vehicles}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openNewVersionModal(model.id)}
                      className="p-2 text-andino-600 hover:bg-andino-50 rounded-lg"
                      title="Agregar versión"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
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
                </div>

                {/* Versions (expanded) */}
                {expandedModels.has(model.id) && (
                  <div className="bg-neutral-50 border-t border-neutral-100">
                    {model.versions.length === 0 ? (
                      <div className="px-14 py-4 text-sm text-neutral-500">
                        No hay versiones para este modelo
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {model.versions.map((version) => (
                          <div key={version.id} className="px-14 py-2 flex items-center gap-4 hover:bg-neutral-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-800">{version.name}</p>
                              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                                {version.engineSize && <span>Motor: {version.engineSize}</span>}
                                {version.horsePower && <span>{version.horsePower} HP</span>}
                                {version.transmission && <span>{version.transmission}</span>}
                                {version.drivetrain && <span>{version.drivetrain}</span>}
                                {version.trimLevel && <span>{version.trimLevel}</span>}
                              </div>
                            </div>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {version._count.vehicles}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditVersionModal(version, model.id)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded hover:bg-neutral-200"
                                title="Editar versión"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVersion(version)}
                                disabled={version._count.vehicles > 0}
                                className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={version._count.vehicles > 0 ? "No se puede eliminar porque tiene vehículos asociados" : "Eliminar versión"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalFilteredModels > pageSize && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span>Mostrando {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalFilteredModels)} de {totalFilteredModels}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 px-2 py-1 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-andino-500"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Primera página"
              >
                <ChevronLeft className="w-4 h-4" />
                <ChevronLeft className="w-4 h-4 -ml-3" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-neutral-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Última página"
              >
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -ml-3" />
              </button>
            </div>
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

      {/* Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingVersion ? "Editar versión" : "Nueva versión"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {versionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {versionError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre de la versión *
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="Ej: 1.8 CVT XLE"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={versionSaving}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Motor
                  </label>
                  <input
                    type="text"
                    value={versionEngineSize}
                    onChange={(e) => setVersionEngineSize(e.target.value)}
                    placeholder="Ej: 1.8, 2.0, V6"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={versionSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Potencia (HP)
                  </label>
                  <input
                    type="number"
                    value={versionHorsePower}
                    onChange={(e) => setVersionHorsePower(e.target.value)}
                    placeholder="Ej: 140"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={versionSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Transmisión
                  </label>
                  <input
                    type="text"
                    value={versionTransmission}
                    onChange={(e) => setVersionTransmission(e.target.value)}
                    placeholder="Ej: automatica, manual"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={versionSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tracción
                  </label>
                  <input
                    type="text"
                    value={versionDrivetrain}
                    onChange={(e) => setVersionDrivetrain(e.target.value)}
                    placeholder="Ej: 4x4, 2wd"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                    disabled={versionSaving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nivel de equipamiento
                </label>
                <input
                  type="text"
                  value={versionTrimLevel}
                  onChange={(e) => setVersionTrimLevel(e.target.value)}
                  placeholder="Ej: Sport, S Line, Limited"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  disabled={versionSaving}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={closeVersionModal}
                disabled={versionSaving}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={versionSaving}
                className="px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
              >
                {versionSaving ? "Guardando..." : editingVersion ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
