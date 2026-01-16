import { z } from "zod";
import { validateRut } from "../rut";

// ==================== Enums ====================

export const dealerTypeEnum = z.enum(["CONCESIONARIO", "AUTOMOTORA", "RENT_A_CAR"]);
export const dealerStatusEnum = z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]);
export const dealerRoleEnum = z.enum(["OWNER", "MANAGER", "SALES"]);

export type DealerType = z.infer<typeof dealerTypeEnum>;
export type DealerStatus = z.infer<typeof dealerStatusEnum>;
export type DealerRole = z.infer<typeof dealerRoleEnum>;

// ==================== RUT Custom Validation ====================

export const rutSchema = z
  .string()
  .min(8, "RUT inválido")
  .max(12, "RUT inválido")
  .refine((val) => validateRut(val), {
    message: "RUT inválido. Verifica el dígito verificador.",
  });

// ==================== Step Schemas for Registration ====================

// Paso 1: Tipo de negocio
export const dealerStep1Schema = z.object({
  type: dealerTypeEnum,
});

// Paso 2: Datos de la empresa
export const dealerStep2Schema = z.object({
  businessName: z
    .string()
    .min(3, "La razón social debe tener al menos 3 caracteres")
    .max(100, "La razón social no puede exceder 100 caracteres"),
  tradeName: z
    .string()
    .min(2, "El nombre de fantasía debe tener al menos 2 caracteres")
    .max(80, "El nombre de fantasía no puede exceder 80 caracteres"),
  rut: rutSchema,
});

// Paso 3: Ubicación y contacto
export const dealerStep3Schema = z.object({
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  regionId: z.string().min(1, "Selecciona una región"),
  comunaId: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(9, "El teléfono debe tener al menos 9 dígitos")
    .regex(/^[\d\s+()-]+$/, "Formato de teléfono inválido"),
  whatsapp: z
    .string()
    .regex(/^[\d\s+()-]*$/, "Formato de WhatsApp inválido")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
});

// Paso 4: Branding
export const dealerStep4Schema = z.object({
  logo: z.string().url().optional().or(z.literal("")),
  logoPublicId: z.string().optional(),
  description: z
    .string()
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional()
    .or(z.literal("")),
});

// Paso 5: Cuenta de administrador
export const dealerStep5Schema = z.object({
  userName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  userEmail: z.string().email("Email inválido"),
  userPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  userPasswordConfirm: z.string(),
}).refine((data) => data.userPassword === data.userPasswordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["userPasswordConfirm"],
});

// ==================== Complete Registration Schema ====================

export const dealerRegistrationSchema = z.object({
  // Paso 1
  type: dealerTypeEnum,
  // Paso 2
  businessName: z.string().min(3).max(100),
  tradeName: z.string().min(2).max(80),
  rut: rutSchema,
  // Paso 3
  address: z.string().min(5).max(200),
  regionId: z.string().min(1),
  comunaId: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(9),
  whatsapp: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  // Paso 4
  logo: z.string().url().optional().or(z.literal("")),
  logoPublicId: z.string().optional(),
  description: z.string().max(2000).optional(),
  // Paso 5 - Usuario admin
  userName: z.string().min(2).max(50),
  userEmail: z.string().email(),
  userPassword: z.string().min(8),
});

export type DealerRegistrationData = z.infer<typeof dealerRegistrationSchema>;

// ==================== Profile Update Schema ====================

export const dealerProfileSchema = z.object({
  tradeName: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(9).optional(),
  whatsapp: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(5).max(200).optional(),
  regionId: z.string().optional(),
  comunaId: z.string().optional(),
  logo: z.string().url().optional().or(z.literal("")),
  logoPublicId: z.string().optional(),
  banner: z.string().url().optional().or(z.literal("")),
  bannerPublicId: z.string().optional(),
  description: z.string().max(2000).optional(),
  schedule: z.record(z.string(), z.unknown()).optional(),
});

export type DealerProfileData = z.infer<typeof dealerProfileSchema>;

// ==================== Team Invite Schema ====================

export const teamInviteSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: dealerRoleEnum.exclude(["OWNER"]), // Can't invite owners
});

export type TeamInviteData = z.infer<typeof teamInviteSchema>;

// ==================== Admin Action Schemas ====================

export const dealerApproveSchema = z.object({
  status: z.enum(["ACTIVE", "REJECTED", "SUSPENDED"]),
  rejectionReason: z.string().optional(),
});

export type DealerApproveData = z.infer<typeof dealerApproveSchema>;

// ==================== Form Data Types ====================

export interface DealerRegistrationFormData {
  // Paso 1
  type: string;
  // Paso 2
  businessName: string;
  tradeName: string;
  rut: string;
  // Paso 3
  address: string;
  regionId: string;
  comunaId: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  // Paso 4
  logo: string;
  logoPublicId: string;
  description: string;
  // Paso 5
  userName: string;
  userEmail: string;
  userPassword: string;
  userPasswordConfirm: string;
}

export const initialDealerFormData: DealerRegistrationFormData = {
  type: "",
  businessName: "",
  tradeName: "",
  rut: "",
  address: "",
  regionId: "",
  comunaId: "",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  logo: "",
  logoPublicId: "",
  description: "",
  userName: "",
  userEmail: "",
  userPassword: "",
  userPasswordConfirm: "",
};

// ==================== Display Labels ====================

export const dealerTypeLabels: Record<DealerType, string> = {
  CONCESIONARIO: "Concesionario",
  AUTOMOTORA: "Automotora",
  RENT_A_CAR: "Rent a Car",
};

export const dealerTypeDescriptions: Record<DealerType, string> = {
  CONCESIONARIO: "Venta de vehículos nuevos de marca",
  AUTOMOTORA: "Venta de vehículos usados",
  RENT_A_CAR: "Arriendo y venta de vehículos",
};

export const dealerStatusLabels: Record<DealerStatus, string> = {
  PENDING: "Pendiente",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  REJECTED: "Rechazado",
};

export const dealerRoleLabels: Record<DealerRole, string> = {
  OWNER: "Propietario",
  MANAGER: "Gerente",
  SALES: "Vendedor",
};
