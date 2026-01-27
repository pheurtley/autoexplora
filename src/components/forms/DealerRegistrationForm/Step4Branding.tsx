"use client";

import { SingleImageUpload } from "@/components/ui";
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
          <p className="text-xs text-neutral-500 mb-3">
            Recomendado: 400×400px, formato cuadrado
          </p>

          <div className="max-w-[200px] mx-auto">
            <SingleImageUpload
              value={formData.logo}
              publicId={formData.logoPublicId}
              onChange={(url, publicId) => {
                updateFormData({ logo: url, logoPublicId: publicId });
                clearError("logo");
              }}
              onRemove={() => {
                updateFormData({ logo: "", logoPublicId: "" });
              }}
              folder="dealers/logos"
              aspectRatio="square"
            />
          </div>

          {errors.logo && (
            <p className="mt-2 text-sm text-error text-center">{errors.logo}</p>
          )}
        </div>

        {/* Banner Upload */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Banner de Portada (opcional)
          </label>
          <p className="text-xs text-neutral-500 mb-3">
            Recomendado: 1200×400px, formato horizontal
          </p>

          <div className="max-w-full mx-auto">
            <SingleImageUpload
              value={formData.banner}
              publicId={formData.bannerPublicId}
              onChange={(url, publicId) => {
                updateFormData({ banner: url, bannerPublicId: publicId });
                clearError("banner");
              }}
              onRemove={() => {
                updateFormData({ banner: "", bannerPublicId: "" });
              }}
              folder="dealers/banners"
              aspectRatio="banner"
            />
          </div>

          {errors.banner && (
            <p className="mt-2 text-sm text-error text-center">{errors.banner}</p>
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
