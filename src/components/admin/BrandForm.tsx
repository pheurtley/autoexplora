"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, X, ImageIcon } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface BrandFormProps {
  brand?: Brand;
  onSuccess?: () => void;
}

export function BrandForm({ brand, onSuccess }: BrandFormProps) {
  const router = useRouter();
  const isEditing = !!brand;

  const [name, setName] = useState(brand?.name || "");
  const [logo, setLogo] = useState(brand?.logo || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/admin/marcas/${brand.id}`
        : "/api/admin/marcas";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logo: logo.trim() || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al guardar la marca");
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/admin/marcas/${data.id}`);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al guardar la marca");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
            Nombre de la marca *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Toyota"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            disabled={loading}
          />
          <p className="text-xs text-neutral-500 mt-1">
            El slug se generará automáticamente a partir del nombre
          </p>
        </div>

        {/* Logo URL */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-neutral-700 mb-2">
            URL del logo (opcional)
          </label>
          <input
            id="logo"
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://ejemplo.com/logo.png"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
            disabled={loading}
          />
        </div>

        {/* Logo Preview */}
        {logo && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Vista previa
            </label>
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
              <Image
                src={logo}
                alt="Logo preview"
                fill
                className="object-contain p-2"
                onError={() => setLogo("")}
              />
            </div>
          </div>
        )}

        {!logo && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Vista previa
            </label>
            <div className="w-24 h-24 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-neutral-400" />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear marca"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </form>
  );
}
