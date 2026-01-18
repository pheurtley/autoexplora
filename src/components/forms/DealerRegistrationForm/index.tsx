"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import {
  DealerRegistrationFormData,
  initialDealerFormData,
  dealerStep1Schema,
  dealerStep2Schema,
  dealerStep3Schema,
  dealerStep4Schema,
  dealerStep5Schema,
} from "@/lib/validations/dealer";
import { StepIndicator } from "./StepIndicator";
import { Step1Type } from "./Step1Type";
import { Step2Business } from "./Step2Business";
import { Step3Location } from "./Step3Location";
import { Step4Branding } from "./Step4Branding";
import { Step5Account } from "./Step5Account";

const STEPS = [
  { number: 1, title: "Tipo" },
  { number: 2, title: "Empresa" },
  { number: 3, title: "Ubicación" },
  { number: 4, title: "Branding" },
  { number: 5, title: "Cuenta" },
];

export function DealerRegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DealerRegistrationFormData>(
    initialDealerFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const updateFormData = (data: Partial<DealerRegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    let schema;
    let dataToValidate;

    switch (step) {
      case 1:
        schema = dealerStep1Schema;
        dataToValidate = { type: formData.type };
        break;
      case 2:
        schema = dealerStep2Schema;
        dataToValidate = {
          businessName: formData.businessName,
          tradeName: formData.tradeName,
          rut: formData.rut,
        };
        break;
      case 3:
        schema = dealerStep3Schema;
        dataToValidate = {
          address: formData.address,
          regionId: formData.regionId,
          comunaId: formData.comunaId,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          website: formData.website,
        };
        break;
      case 4:
        schema = dealerStep4Schema;
        dataToValidate = {
          logo: formData.logo,
          logoPublicId: formData.logoPublicId,
          description: formData.description,
        };
        break;
      case 5:
        schema = dealerStep5Schema;
        dataToValidate = {
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPassword: formData.userPassword,
          userPasswordConfirm: formData.userPasswordConfirm,
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
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/dealers/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          businessName: formData.businessName,
          tradeName: formData.tradeName,
          rut: formData.rut,
          address: formData.address,
          regionId: formData.regionId,
          comunaId: formData.comunaId || undefined,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp || undefined,
          website: formData.website || undefined,
          logo: formData.logo || undefined,
          logoPublicId: formData.logoPublicId || undefined,
          description: formData.description || undefined,
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPassword: formData.userPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || "Error al registrar la automotora");
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError("Error al registrar la automotora. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          ¡Registro Exitoso!
        </h2>
        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
          Tu solicitud ha sido recibida. Revisaremos tu información y te
          notificaremos por email cuando tu cuenta sea aprobada.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push("/login")} className="w-full sm:w-auto">
            Ir a Iniciar Sesión
          </Button>
          <p className="text-sm text-neutral-500">
            Podrás acceder a tu panel una vez que tu cuenta sea aprobada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{submitError}</p>
        </div>
      )}

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <Step1Type
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2Business
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            clearError={clearError}
          />
        )}
        {currentStep === 3 && (
          <Step3Location
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            clearError={clearError}
          />
        )}
        {currentStep === 4 && (
          <Step4Branding
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            clearError={clearError}
          />
        )}
        {currentStep === 5 && (
          <Step5Account
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            clearError={clearError}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : currentStep === 5 ? (
            "Completar Registro"
          ) : (
            <>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export { StepIndicator } from "./StepIndicator";
