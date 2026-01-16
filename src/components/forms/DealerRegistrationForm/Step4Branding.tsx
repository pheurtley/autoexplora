"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { DealerRegistrationFormData } from "@/lib/validations/dealer";
import { cn } from "@/lib/utils";

interface Step4BrandingProps {
  formData: DealerRegistrationFormData;
  updateFormData: (data: Partial<DealerRegistrationFormData>) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
}

export function Step4Branding({
  formData,
  updateFormData,
  errors,
  clearError,
}: Step4BrandingProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten archivos de imagen");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 2MB");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "dealers/logos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      updateFormData({
        logo: data.url,
        logoPublicId: data.publicId,
      });
      clearError("logo");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Error al subir la imagen. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    updateFormData({ logo: "", logoPublicId: "" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Identidad Visual
        </h2>
        <p className="mt-2 text-neutral-600">
          Sube tu logo y describe tu negocio
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Logo de la Empresa (opcional)
          </label>

          {formData.logo ? (
            <div className="relative w-40 h-40 mx-auto">
              <img
                src={formData.logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg border border-neutral-200 bg-white p-2"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                "hover:border-andino-400 hover:bg-andino-50",
                uploading
                  ? "border-andino-400 bg-andino-50"
                  : "border-neutral-300 bg-neutral-50"
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-andino-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-neutral-400 mb-3" />
                    <p className="text-sm text-neutral-600">
                      <span className="font-semibold text-andino-600">
                        Click para subir
                      </span>{" "}
                      o arrastra y suelta
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      PNG, JPG o WEBP (máx. 2MB)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </label>
          )}

          {uploadError && (
            <p className="mt-2 text-sm text-error text-center">{uploadError}</p>
          )}
          {errors.logo && (
            <p className="mt-2 text-sm text-error text-center">{errors.logo}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Descripción del Negocio (opcional)
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Cuéntale a tus clientes sobre tu negocio: historia, especialidades, servicios adicionales, etc."
            value={formData.description}
            onChange={(e) => {
              updateFormData({ description: e.target.value });
              clearError("description");
            }}
            className={cn(
              "block w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 transition-colors",
              "focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20",
              "resize-none",
              errors.description &&
                "border-error focus:border-error focus:ring-error/20"
            )}
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            <p className="text-sm text-neutral-500">
              Una buena descripción genera más confianza
            </p>
            <span className="text-xs text-neutral-400">
              {formData.description.length}/2000
            </span>
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-error">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Consejo:</strong> Un logo profesional y una descripción
          detallada ayudan a generar confianza con tus potenciales clientes.
        </p>
      </div>
    </div>
  );
}
