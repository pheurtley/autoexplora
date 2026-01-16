import type {
  Vehicle,
  VehicleImage,
  Brand,
  Model,
  Region,
  Comuna,
  User,
  VehicleType,
  VehicleCategory,
  VehicleCondition,
  FuelType,
  Transmission,
  ListingStatus,
  Conversation,
  Message,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Vehicle,
  VehicleImage,
  Brand,
  Model,
  Region,
  Comuna,
  User,
  VehicleType,
  VehicleCategory,
  VehicleCondition,
  FuelType,
  Transmission,
  ListingStatus,
  Conversation,
  Message,
};

// Re-export chat types
export * from "./chat";

// ==================== Vehicle with Relations ====================

export type VehicleWithRelations = Vehicle & {
  brand: Brand;
  model: Model;
  region: Region;
  comuna: Comuna | null;
  images: VehicleImage[];
  user: Pick<User, "id" | "name" | "image">;
};

export type VehicleCard = Pick<
  Vehicle,
  | "id"
  | "slug"
  | "title"
  | "price"
  | "year"
  | "mileage"
  | "fuelType"
  | "transmission"
  | "condition"
  | "featured"
  | "contactWhatsApp"
  | "publishedAt"
> & {
  dealerId?: string | null;
  brand: Pick<Brand, "name" | "slug">;
  model: Pick<Model, "name" | "slug">;
  region: Pick<Region, "name" | "slug">;
  images: Pick<VehicleImage, "url" | "isPrimary">[];
  dealer?: {
    slug: string;
    tradeName: string;
    logo: string | null;
    type: string;
  } | null;
};

// ==================== Search & Filters ====================

export interface VehicleFilters {
  vehicleType?: VehicleType;
  category?: VehicleCategory;
  brandId?: string;
  modelId?: string;
  regionId?: string;
  condition?: VehicleCondition;
  fuelType?: FuelType;
  transmission?: Transmission;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  search?: string;
}

export interface SearchParams extends VehicleFilters {
  page?: number;
  limit?: number;
  sort?: "date" | "price_asc" | "price_desc" | "year" | "mileage";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ==================== Form Types ====================

export interface PublishVehicleInput {
  vehicleType: VehicleType;
  category: VehicleCategory;
  brandId: string;
  modelId: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  fuelType: FuelType;
  transmission: Transmission;
  engineSize?: string;
  color?: string;
  doors?: number;
  seats?: number;
  title: string;
  description?: string;
  price: number;
  negotiable: boolean;
  regionId: string;
  comunaId?: string;
  contactPhone: string;
  contactWhatsApp?: string;
  showPhone: boolean;
  images: ImageUpload[];
}

export interface ImageUpload {
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
}

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== Select Options ====================

export interface SelectOption {
  value: string;
  label: string;
}

export interface BrandWithModels extends Brand {
  models: Model[];
}

export interface RegionWithComunas extends Region {
  comunas: Comuna[];
}
