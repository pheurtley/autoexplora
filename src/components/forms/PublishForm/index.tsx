"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { StepIndicator } from "./StepIndicator";
import { Step1Type } from "./Step1Type";
import { Step2Details } from "./Step2Details";
import { Step3Images } from "./Step3Images";
import { Step4Specs } from "./Step4Specs";
import { Step5Info } from "./Step5Info";
import { Step6Contact } from "./Step6Contact";
import { Step7Preview } from "./Step7Preview";
import {
  initialFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  imagesSchema,
  type PublishFormData,
  type PublishFormImage,
} from "@/lib/validations";
import { COLORS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Eye } from "lucide-react";

const STEPS = [
  { number: 1, title: "Tipo" },
  { number: 2, title: "Detalles" },
  { number: 3, title: "Fotos" },
  { number: 4, title: "Specs" },
  { number: 5, title: "Precio" },
  { number: 6, title: "Contacto" },
  { number: 7, title: "Preview" },
];

const DRAFT_STORAGE_KEY = "publishFormDraft";

export function PublishForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PublishFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Preview data names
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [comunaName, setComunaName] = useState("");

  // Compute color name from COLORS constant
  const colorName = formData.color
    ? COLORS[formData.color as keyof typeof COLORS]?.label || ""
    : "";

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Don't restore images as they are uploaded to cloud
        setFormData({ ...initialFormData, ...parsed, images: [] });
      } catch (e) {
        console.error("Error loading draft:", e);
      }
    }
    setDraftLoaded(true);
  }, []);

  // Save draft to localStorage on formData change
  useEffect(() => {
    if (!draftLoaded) return;
    // Don't save images (they're uploaded separately)
    const { images, ...dataToSave } = formData;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, draftLoaded]);

  // Clear draft on successful submit
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }, []);

  // Fetch brand name when brandId changes
  useEffect(() => {
    if (!formData.brandId) {
      setBrandName("");
      return;
    }
    async function fetchBrandName() {
      try {
        const response = await fetch("/api/marcas");
        const json = await response.json();
        const brand = json.brands?.find((b: { id: string; name: string }) => b.id === formData.brandId);
        setBrandName(brand?.name || "");
      } catch (e) {
        console.error("Error fetching brand:", e);
      }
    }
    fetchBrandName();
  }, [formData.brandId]);

  // Fetch model name when modelId changes
  useEffect(() => {
    if (!formData.modelId || !formData.brandId) {
      setModelName("");
      return;
    }
    async function fetchModelName() {
      try {
        const response = await fetch(`/api/marcas/${formData.brandId}/modelos`);
        const json = await response.json();
        const model = json.models?.find((m: { id: string; name: string }) => m.id === formData.modelId);
        setModelName(model?.name || "");
      } catch (e) {
        console.error("Error fetching model:", e);
      }
    }
    fetchModelName();
  }, [formData.modelId, formData.brandId]);

  // Fetch region name when regionId changes
  useEffect(() => {
    if (!formData.regionId) {
      setRegionName("");
      return;
    }
    async function fetchRegionName() {
      try {
        const response = await fetch("/api/regiones");
        const json = await response.json();
        const region = json.regions?.find((r: { id: string; name: string }) => r.id === formData.regionId);
        setRegionName(region?.name || "");
      } catch (e) {
        console.error("Error fetching region:", e);
      }
    }
    fetchRegionName();
  }, [formData.regionId]);

  // Fetch comuna name when comunaId changes
  useEffect(() => {
    if (!formData.comunaId || !formData.regionId) {
      setComunaName("");
      return;
    }
    async function fetchComunaName() {
      try {
        const response = await fetch(`/api/regiones/${formData.regionId}/comunas`);
        const json = await response.json();
        const comuna = json.comunas?.find((c: { id: string; name: string }) => c.id === formData.comunaId);
        setComunaName(comuna?.name || "");
      } catch (e) {
        console.error("Error fetching comuna:", e);
      }
    }
    fetchComunaName();
  }, [formData.comunaId, formData.regionId]);

  const handleChange = (
    field: keyof PublishFormData,
    value: string | number | boolean | undefined | PublishFormImage[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    let schema;
    let dataToValidate: Record<string, unknown> = {};

    switch (step) {
      case 1:
        schema = step1Schema;
        dataToValidate = {
          vehicleType: formData.vehicleType,
          category: formData.category,
        };
        break;
      case 2:
        schema = step2Schema;
        dataToValidate = {
          brandId: formData.brandId,
          modelId: formData.modelId,
          year: formData.year,
          condition: formData.condition,
          mileage: formData.mileage,
        };
        break;
      case 3:
        // Validate images
        const imageResult = imagesSchema.safeParse(formData.images);
        if (!imageResult.success) {
          setErrors({ images: imageResult.error.issues[0].message });
          return false;
        }
        setErrors({});
        return true;
      case 4:
        schema = step3Schema;
        dataToValidate = {
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          color: formData.color || undefined,
          doors: formData.doors,
          engineSize: formData.engineSize || undefined,
        };
        break;
      case 5:
        schema = step4Schema;
        dataToValidate = {
          title: formData.title,
          description: formData.description || undefined,
          price: formData.price,
          negotiable: formData.negotiable,
        };
        break;
      case 6:
        schema = step5Schema;
        dataToValidate = {
          regionId: formData.regionId,
          comunaId: formData.comunaId || undefined,
          contactPhone: formData.contactPhone,
          contactWhatsApp: formData.contactWhatsApp || undefined,
          showPhone: formData.showPhone,
        };
        break;
      default:
        return true;
    }

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare images data for API
      const imagesForApi = formData.images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        order: img.order,
      }));

      const response = await fetch("/api/vehiculos", {
        method: "POST",
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
          setErrors({ submit: data.error || "Error al publicar" });
        }
        return;
      }

      // Clear draft on successful publish
      clearDraft();
      setSubmitSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push(`/vehiculos/${data.vehicle.slug}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting:", error);
      setErrors({ submit: "Error de conexión. Intenta nuevamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          ¡Publicación exitosa!
        </h2>
        <p className="text-neutral-600">
          Tu vehículo ha sido publicado correctamente. Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
        {currentStep === 1 && (
          <Step1Type data={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 2 && (
          <Step2Details data={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 3 && (
          <Step3Images data={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 4 && (
          <Step4Specs data={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 5 && (
          <Step5Info
            data={formData}
            onChange={handleChange}
            errors={errors}
            brandName={brandName}
            modelName={modelName}
            colorName={colorName}
          />
        )}
        {currentStep === 6 && (
          <Step6Contact data={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 7 && (
          <Step7Preview
            data={formData}
            brandName={brandName}
            modelName={modelName}
            regionName={regionName}
            comunaName={comunaName}
          />
        )}

        {/* Error general */}
        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          {currentStep < 6 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : currentStep === 6 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Vista previa
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Publicar vehículo
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
