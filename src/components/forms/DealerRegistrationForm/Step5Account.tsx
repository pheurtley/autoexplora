"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { DealerRegistrationFormData } from "@/lib/validations/dealer";
import { cn } from "@/lib/utils";

interface Step5AccountProps {
  formData: DealerRegistrationFormData;
  updateFormData: (data: Partial<DealerRegistrationFormData>) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
}

export function Step5Account({
  formData,
  updateFormData,
  errors,
  clearError,
}: Step5AccountProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation states
  const hasMinLength = formData.userPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.userPassword);
  const hasLowercase = /[a-z]/.test(formData.userPassword);
  const hasNumber = /\d/.test(formData.userPassword);
  const passwordsMatch =
    formData.userPassword === formData.userPasswordConfirm &&
    formData.userPasswordConfirm.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          Cuenta de Administrador
        </h2>
        <p className="mt-2 text-neutral-600">
          Crea tu cuenta personal para administrar el concesionario
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Tu Nombre"
          placeholder="Juan Pérez"
          value={formData.userName}
          onChange={(e) => {
            updateFormData({ userName: e.target.value });
            clearError("userName");
          }}
          leftIcon={<User className="w-4 h-4" />}
          error={errors.userName}
          helperText="Este nombre aparecerá en tu perfil"
        />

        <Input
          label="Tu Email Personal"
          type="email"
          placeholder="tu@email.com"
          value={formData.userEmail}
          onChange={(e) => {
            updateFormData({ userEmail: e.target.value });
            clearError("userEmail");
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.userEmail}
          helperText="Usarás este email para iniciar sesión"
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.userPassword}
            onChange={(e) => {
              updateFormData({ userPassword: e.target.value });
              clearError("userPassword");
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.userPassword}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Password Requirements */}
        {formData.userPassword.length > 0 && (
          <div className="space-y-2 p-3 bg-neutral-50 rounded-lg">
            <p className="text-xs font-medium text-neutral-700">
              Requisitos de la contraseña:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <PasswordRequirement met={hasMinLength} text="Mínimo 8 caracteres" />
              <PasswordRequirement met={hasUppercase} text="Una mayúscula" />
              <PasswordRequirement met={hasLowercase} text="Una minúscula" />
              <PasswordRequirement met={hasNumber} text="Un número" />
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            label="Confirmar Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.userPasswordConfirm}
            onChange={(e) => {
              updateFormData({ userPasswordConfirm: e.target.value });
              clearError("userPasswordConfirm");
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.userPasswordConfirm}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {formData.userPasswordConfirm.length > 0 && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm",
              passwordsMatch ? "text-success" : "text-error"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {passwordsMatch
              ? "Las contraseñas coinciden"
              : "Las contraseñas no coinciden"}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          <strong>Nota:</strong> Tu cuenta quedará pendiente de aprobación.
          Recibirás un email cuando tu solicitud sea revisada.
        </p>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        met ? "text-success" : "text-neutral-500"
      )}
    >
      <div
        className={cn(
          "w-3 h-3 rounded-full flex items-center justify-center",
          met ? "bg-success" : "bg-neutral-300"
        )}
      >
        {met && <CheckCircle2 className="w-2 h-2 text-white" />}
      </div>
      {text}
    </div>
  );
}
