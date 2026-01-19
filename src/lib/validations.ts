import { z } from "zod";

// ==================== Enums ====================

export const vehicleTypeEnum = z.enum(["AUTO", "MOTO", "COMERCIAL"]);

export const vehicleCategoryEnum = z.enum([
  // Autos
  "SEDAN",
  "HATCHBACK",
  "SUV",
  "STATION_WAGON",
  "COUPE",
  "DEPORTIVO",
  "VAN",
  "PICKUP",
  // Motos
  "MOTO_CALLE",
  "MOTO_TOURING",
  "MOTO_DEPORTIVA",
  "MOTO_CROSS",
  "SCOOTER",
  "CUATRIMOTO",
  // Comerciales
  "CAMION",
  "FURGON",
  "BUS",
  "MINIBUS",
]);

export const vehicleConditionEnum = z.enum(["NUEVO", "USADO"]);

export const fuelTypeEnum = z.enum([
  "BENCINA",
  "DIESEL",
  "HIBRIDO",
  "ELECTRICO",
  "GAS",
  "OTRO",
]);

export const transmissionEnum = z.enum([
  "MANUAL",
  "AUTOMATICA",
]);

export const tractionEnum = z.enum(["2WD", "4WD", "AWD"]);

// ==================== Image Schema ====================

export const imageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  publicId: z.string(),
  isPrimary: z.boolean(),
  order: z.number(),
});

export const imagesSchema = z
  .array(imageSchema)
  .min(3, "Debes subir al menos 3 imágenes")
  .max(15, "Máximo 15 imágenes");

export type ImageData = z.infer<typeof imageSchema>;

// ==================== Step Schemas ====================

// Paso 1: Tipo de Vehículo
export const step1Schema = z.object({
  vehicleType: vehicleTypeEnum,
  category: vehicleCategoryEnum,
});

// Paso 2: Detalles del Vehículo
export const step2Schema = z.object({
  brandId: z.string().min(1, "Selecciona una marca"),
  modelId: z.string().min(1, "Selecciona un modelo"),
  year: z
    .number()
    .min(1990, "El año debe ser 1990 o posterior")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  condition: vehicleConditionEnum,
  mileage: z
    .number({ error: "Ingresa el kilometraje" })
    .min(0, "El kilometraje no puede ser negativo")
    .max(1000000, "Kilometraje inválido"),
});

// Paso 3: Especificaciones
export const step3Schema = z.object({
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  color: z.string().min(1, "Selecciona un color"),
  doors: z.number().min(2).max(6).optional(),
  engineSize: z.string().optional(),
  traction: z.union([tractionEnum, z.literal("")]).optional(),
});

// Paso 4: Precio y Descripción
export const step4Schema = z.object({
  title: z
    .string()
    .min(10, "El título debe tener al menos 10 caracteres")
    .max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().max(2000, "La descripción es muy larga").optional(),
  price: z
    .number()
    .min(100000, "El precio mínimo es $100.000")
    .max(500000000, "El precio máximo es $500.000.000"),
  negotiable: z.boolean().default(false),
});

// Paso 5: Contacto y Ubicación
// Chilean phone regex: +56 9 XXXX XXXX or 9 XXXX XXXX or similar formats
const chileanPhoneRegex = /^(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}$/;

export const step5Schema = z.object({
  regionId: z.string().min(1, "Selecciona una región"),
  comunaId: z.string().optional(),
  contactPhone: z
    .string()
    .min(9, "El teléfono debe tener al menos 9 dígitos")
    .regex(chileanPhoneRegex, "Formato inválido. Ej: +56 9 1234 5678"),
  contactWhatsApp: z
    .string()
    .regex(/^((\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4})?$/, "Formato inválido. Ej: +56 9 1234 5678")
    .optional()
    .or(z.literal("")),
  showPhone: z.boolean().default(true),
});

// ==================== Complete Schema ====================

export const publishVehicleSchema = z.object({
  // Paso 1
  vehicleType: vehicleTypeEnum,
  category: vehicleCategoryEnum,
  // Paso 2
  brandId: z.string().min(1),
  modelId: z.string().min(1),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  condition: vehicleConditionEnum,
  mileage: z.number().min(0).max(1000000),
  // Paso 3 (Imágenes)
  images: z
    .array(
      z.object({
        id: z.string().optional(), // Optional for new images, present for existing
        url: z.string().url(),
        publicId: z.string(),
        isPrimary: z.boolean(),
        order: z.number(),
      })
    )
    .min(3, "Debes subir al menos 3 imágenes")
    .max(15, "Máximo 15 imágenes"),
  // Paso 4
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  color: z.string().min(1),
  doors: z.number().min(2).max(6).optional(),
  engineSize: z.string().optional(),
  traction: z.union([tractionEnum, z.literal("")]).optional(),
  // Paso 5
  title: z.string().min(10).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().min(100000).max(500000000),
  negotiable: z.boolean().default(false),
  // Paso 6
  regionId: z.string().min(1),
  comunaId: z.string().optional(),
  contactPhone: z.string().min(9),
  contactWhatsApp: z.string().optional(),
  showPhone: z.boolean().default(true),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type PublishVehicleData = z.infer<typeof publishVehicleSchema>;

// ==================== Form Data Type ====================

export interface PublishFormImage {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
}

export interface PublishFormData {
  // Paso 1
  vehicleType: string;
  category: string;
  // Paso 2
  brandId: string;
  modelId: string;
  year: number;
  condition: string;
  mileage: number | undefined;
  // Paso 3 (Imágenes)
  images: PublishFormImage[];
  // Paso 4
  fuelType: string;
  transmission: string;
  color: string;
  doors: number | undefined;
  engineSize: string;
  traction: string;
  // Paso 5
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  // Paso 6
  regionId: string;
  comunaId: string;
  contactPhone: string;
  contactWhatsApp: string;
  showPhone: boolean;
}

export const initialFormData: PublishFormData = {
  vehicleType: "",
  category: "",
  brandId: "",
  modelId: "",
  year: new Date().getFullYear(),
  condition: "USADO",
  mileage: undefined,
  images: [],
  fuelType: "BENCINA",
  transmission: "MANUAL",
  color: "",
  doors: undefined,
  engineSize: "",
  traction: "",
  title: "",
  description: "",
  price: 0,
  negotiable: false,
  regionId: "",
  comunaId: "",
  contactPhone: "",
  contactWhatsApp: "",
  showPhone: true,
};

// ==================== Chat Schemas ====================

export const createConversationSchema = z.object({
  vehicleId: z.string().min(1, "El ID del vehículo es requerido"),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(2000, "El mensaje no puede exceder 2000 caracteres"),
});

export type CreateConversationData = z.infer<typeof createConversationSchema>;
export type SendMessageData = z.infer<typeof sendMessageSchema>;
