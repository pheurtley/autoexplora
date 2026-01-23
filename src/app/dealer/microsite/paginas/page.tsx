"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui";

interface DealerPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  showInNav: boolean;
  order: number;
}

export default function DealerPagesPage() {
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<DealerPage | null>(null);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [showInNav, setShowInNav] = useState(true);

  const fetchPages = () => {
    fetch("/api/dealer/microsite")
      .then((res) => res.json())
      .then((data) => {
        if (data.config?.pages) {
          setPages(data.config.pages);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setIsPublished(false);
    setShowInNav(true);
    setEditingPage(null);
    setShowForm(false);
    setError("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (page: DealerPage) => {
    setTitle(page.title);
    setSlug(page.slug);
    setIsPublished(page.isPublished);
    setShowInNav(page.showInNav);
    setEditingPage(page);
    setShowForm(true);
    setError("");
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingPage) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    setError("");

    if (!title.trim() || !slug.trim()) {
      setError("Título y slug son requeridos");
      return;
    }

    try {
      if (editingPage) {
        const res = await fetch(`/api/dealer/microsite/pages/${editingPage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, slug, isPublished, showInNav }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al actualizar");
        }
      } else {
        const res = await fetch("/api/dealer/microsite/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            isPublished,
            showInNav,
            content: [],
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al crear");
        }
      }

      resetForm();
      fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const handleDelete = async (page: DealerPage) => {
    if (!confirm(`¿Eliminar la página "${page.title}"?`)) return;

    try {
      const res = await fetch(`/api/dealer/microsite/pages/${page.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const togglePublish = async (page: DealerPage) => {
    try {
      await fetch(`/api/dealer/microsite/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      });
      fetchPages();
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dealer/microsite"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">
            Páginas Personalizadas
          </h1>
          <p className="text-neutral-600 text-sm mt-0.5">
            Crea páginas como &quot;Nosotros&quot;, &quot;Servicios&quot; o
            &quot;Financiamiento&quot;
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Página
        </Button>
      </div>

      {error && !showForm && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">
              {editingPage ? "Editar Página" : "Nueva Página"}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-neutral-100 rounded"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nosotros"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Slug (URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="nosotros"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Solo letras minúsculas, números y guiones
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
              />
              <span className="text-sm text-neutral-700">Publicada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInNav}
                onChange={(e) => setShowInNav(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-andino-600 focus:ring-andino-500"
              />
              <span className="text-sm text-neutral-700">
                Mostrar en navegación
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingPage ? "Actualizar" : "Crear Página"}
            </Button>
          </div>
        </div>
      )}

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Sin páginas
          </h3>
          <p className="text-neutral-500 text-sm mb-4">
            Crea páginas personalizadas para tu sitio web
          </p>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera página
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
            >
              <GripVertical className="h-4 w-4 text-neutral-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 text-sm truncate">
                  {page.title}
                </p>
                <p className="text-xs text-neutral-500">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {page.isPublished ? (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    Publicada
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                    Borrador
                  </span>
                )}
                <button
                  onClick={() => togglePublish(page)}
                  className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"
                  title={page.isPublished ? "Despublicar" : "Publicar"}
                >
                  {page.isPublished ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openEditForm(page)}
                  className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"
                  title="Editar"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(page)}
                  className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
