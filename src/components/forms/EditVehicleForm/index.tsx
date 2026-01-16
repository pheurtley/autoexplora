"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";
import { ImageUpload, type UploadedImage } from "../PublishForm/ImageUpload";
import {
  VEHICLE_TYPES,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  COLORS,
  CONDITIONS,
} from "@/lib/constants";
import type { PublishFormData, PublishFormImage } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";
import {
  Car,
  Settings,
  Camera,
  DollarSign,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface EditVehicleFormProps {
  vehicleId: string;
  initialData: PublishFormData;
}

interface Brand {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

interface Region {
  id: string;
  name: string;
  comunas: { id: string; name: string }[];
}

export function EditVehicleForm({ vehicleId, initialData }: EditVehicleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PublishFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Data loading states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Load brands on mount
  useState(() => {
    async function fetchBrands() {
      setLoadingBrands(true);
      try {
        const response = await fetch("/api/marcas");
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    }
    fetchBrands();
  });

  // Load models when brand changes
  useState(() => {
    async function fetchModels() {
      if (!formData.brandId) {
        setModels([]);
        return;
      }
      setLoadingModels(true);
      try {
        const response = await fetch(`/api/marcas/${formData.brandId}/modelos`);
        const data = await response.json();
        setModels(data.models || []);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoadingModels(false);
      }
    }
    fetchModels();
  });

  // Load regions on mount
  useState(() => {
    async function fetchRegions() {
      setLoadingRegions(true);
      try {
        const response = await fetch("/api/regiones");
        const data = await response.json();
        setRegions(data.regions || []);
      } catch (error) {
        console.error("Error fetching regions:", error);
      } finally {
        setLoadingRegions(false);
      }
    }
    fetchRegions();
  });

  const handleChange = (
    field: keyof PublishFormData,
    value: string | number | boolean | undefined | PublishFormImage[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Handle brand change - reset model
    if (field === "brandId") {
      setFormData((prev) => ({ ...prev, modelId: "" }));
      // Fetch new models
      if (value) {
        setLoadingModels(true);
        fetch(`/api/marcas/${value}/modelos`)
          .then((res) => res.json())
          .then((data) => setModels(data.models || []))
          .finally(() => setLoadingModels(false));
      } else {
        setModels([]);
      }
    }

    // Handle region change - reset comuna
    if (field === "regionId") {
      setFormData((prev) => ({ ...prev, comunaId: "" }));
    }
  };

  const handleImagesChange = (images: UploadedImage[]) => {
    const validImages: PublishFormImage[] = images
      .filter((img) => !img.isUploading && img.publicId)
      .map((img) => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        order: img.order,
      }));
    handleChange("images", validImages);
  };

  const uploadedImages: UploadedImage[] = formData.images.map((img) => ({
    id: img.id,
    url: img.url,
    publicId: img.publicId,
    isPrimary: img.isPrimary,
    order: img.order,
    isUploading: false,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const imagesForApi = formData.images.map((img) => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        order: img.order,
      }));

      const response = await fetch(`/api/vehiculos/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: imagesForApi,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          setErrors(
            Object.entries(data.details.fieldErrors).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: Array.isArray(value) ? value[0] : value,
              }),
              {}
            )
          );
        } else {
          setErrors({ submit: data.error || "Error al guardar cambios" });
        }
        return;
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/cuenta/publicaciones");
      }, 1500);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setErrors({ submit: "Error de conexión. Intenta nuevamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vehicle type options
  const vehicleTypeOptions = Object.entries(VEHICLE_TYPES).map(([value, { label }]) => ({
    value,
    label,
  }));

  // Get categories for selected vehicle type
  const getCategoryOptions = () => {
    const type = formData.vehicleType;
    if (!type) return [];
    return Object.entries(VEHICLE_CATEGORIES)
      .filter(([, config]) => config.type === type)
      .map(([value, config]) => ({
        value,
        label: config.label,
      }));
  };

  const conditionOptions = Object.entries(CONDITIONS).map(([value, { label }]) => ({
    value,
    label,
  }));

  const fuelOptions = Object.entries(FUEL_TYPES).map(([value, { label }]) => ({
    value,
    label,
  }));

  const transmissionOptions = Object.entries(TRANSMISSIONS).map(([value, { label }]) => ({
    value,
    label,
  }));

  const colorOptions = Object.entries(COLORS).map(([value, { label }]) => ({
    value,
    label,
  }));

  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));
  const modelOptions = models.map((m) => ({ value: m.id, label: m.name }));
  const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));

  const selectedRegion = regions.find((r) => r.id === formData.regionId);
  const comunaOptions = selectedRegion?.comunas.map((c) => ({
    value: c.id,
    label: c.name,
  })) || [];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => ({
    value: String(currentYear + 1 - i),
    label: String(currentYear + 1 - i),
  }));

  const doorsOptions = [
    { value: "2", label: "2 puertas" },
    { value: "3", label: "3 puertas" },
    { value: "4", label: "4 puertas" },
    { value: "5", label: "5 puertas" },
  ];

  if (submitSuccess) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          ¡Cambios guardados!
        </h2>
        <p className="text-neutral-600">
          Tu vehículo ha sido actualizado correctamente. Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section: Vehicle Type */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
            <Car className="w-5 h-5 text-andino-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Tipo de Vehículo
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Tipo"
            value={formData.vehicleType}
            onChange={(e) => {
              handleChange("vehicleType", e.target.value);
              handleChange("category", "");
            }}
            options={vehicleTypeOptions}
            error={errors.vehicleType}
            required
          />
          <Select
            label="Categoría"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            options={getCategoryOptions()}
            disabled={!formData.vehicleType}
            error={errors.category}
            required
          />
          <Select
            label="Marca"
            value={formData.brandId}
            onChange={(e) => handleChange("brandId", e.target.value)}
            options={brandOptions}
            placeholder={loadingBrands ? "Cargando..." : "Selecciona"}
            disabled={loadingBrands}
            error={errors.brandId}
            required
          />
          <Select
            label="Modelo"
            value={formData.modelId}
            onChange={(e) => handleChange("modelId", e.target.value)}
            options={modelOptions}
            placeholder={loadingModels ? "Cargando..." : "Selecciona"}
            disabled={!formData.brandId || loadingModels}
            error={errors.modelId}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Select
            label="Año"
            value={String(formData.year)}
            onChange={(e) => handleChange("year", parseInt(e.target.value))}
            options={yearOptions}
            error={errors.year}
            required
          />
          <Select
            label="Condición"
            value={formData.condition}
            onChange={(e) => handleChange("condition", e.target.value)}
            options={conditionOptions}
            error={errors.condition}
            required
          />
          <Input
            type="number"
            label="Kilometraje"
            value={formData.mileage}
            onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
            placeholder="Ej: 50000"
            error={errors.mileage}
            required
          />
        </div>
      </section>

      {/* Section: Specifications */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-andino-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Especificaciones
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Combustible"
            value={formData.fuelType}
            onChange={(e) => handleChange("fuelType", e.target.value)}
            options={fuelOptions}
            error={errors.fuelType}
            required
          />
          <Select
            label="Transmisión"
            value={formData.transmission}
            onChange={(e) => handleChange("transmission", e.target.value)}
            options={transmissionOptions}
            error={errors.transmission}
            required
          />
          <Select
            label="Color"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            options={colorOptions}
            placeholder="Selecciona"
            error={errors.color}
          />
          <Select
            label="Puertas"
            value={formData.doors ? String(formData.doors) : ""}
            onChange={(e) =>
              handleChange("doors", e.target.value ? parseInt(e.target.value) : undefined)
            }
            options={doorsOptions}
            placeholder="Selecciona"
            error={errors.doors}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Motor / Cilindrada"
            value={formData.engineSize}
            onChange={(e) => handleChange("engineSize", e.target.value)}
            placeholder="Ej: 2.0L, 1600cc"
            error={errors.engineSize}
          />
        </div>
      </section>

      {/* Section: Images */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
            <Camera className="w-5 h-5 text-andino-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Fotos del Vehículo
          </h2>
        </div>

        <ImageUpload
          images={uploadedImages}
          onChange={handleImagesChange}
          error={errors.images}
        />
      </section>

      {/* Section: Price & Description */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-andino-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Precio y Descripción
          </h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Título del anuncio"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ej: Toyota Corolla 2020 Automático Full"
            error={errors.title}
            helperText={`${formData.title.length}/100 caracteres`}
            maxLength={100}
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe el estado del vehículo, equipamiento, historial..."
              rows={4}
              maxLength={2000}
              className={`
                w-full px-4 py-3 rounded-lg border text-neutral-900 placeholder:text-neutral-400
                focus:outline-none focus:ring-2 focus:ring-andino-500/20 focus:border-andino-500
                transition-colors resize-none
                ${errors.description ? "border-red-500" : "border-neutral-300"}
              `}
            />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-neutral-500">
                {errors.description || ""}
              </span>
              <span className="text-sm text-neutral-400">
                {formData.description.length}/2000
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                label="Precio (CLP)"
                value={formData.price || ""}
                onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                placeholder="Ej: 15000000"
                error={errors.price}
                required
              />
              {formData.price > 0 && (
                <p className="text-sm text-andino-600 mt-1 font-medium">
                  {formatPrice(formData.price)}
                </p>
              )}
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.negotiable}
                  onChange={(e) => handleChange("negotiable", e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500/20"
                />
                <span className="ml-3 text-neutral-700">Precio negociable</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Location & Contact */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-andino-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Ubicación y Contacto
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Región"
            value={formData.regionId}
            onChange={(e) => handleChange("regionId", e.target.value)}
            options={regionOptions}
            placeholder={loadingRegions ? "Cargando..." : "Selecciona"}
            disabled={loadingRegions}
            error={errors.regionId}
            required
          />
          <Select
            label="Comuna"
            value={formData.comunaId}
            onChange={(e) => handleChange("comunaId", e.target.value)}
            options={comunaOptions}
            placeholder="Selecciona"
            disabled={!formData.regionId}
            error={errors.comunaId}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            type="tel"
            label="Teléfono de contacto"
            value={formData.contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
            placeholder="Ej: +56 9 1234 5678"
            error={errors.contactPhone}
            required
          />
          <Input
            type="tel"
            label="WhatsApp"
            value={formData.contactWhatsApp}
            onChange={(e) => handleChange("contactWhatsApp", e.target.value)}
            placeholder="Ej: +56 9 1234 5678"
            error={errors.contactWhatsApp}
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showPhone}
              onChange={(e) => handleChange("showPhone", e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300 text-andino-600 focus:ring-andino-500/20"
            />
            <span className="ml-3 text-neutral-700">
              Mostrar teléfono en el anuncio
            </span>
          </label>
        </div>
      </section>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/cuenta/publicaciones")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
