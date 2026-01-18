// ==================== Site Configuration ====================

export const SITE_NAME = "AutoExplora.cl";
export const SITE_DESCRIPTION =
  "El marketplace de vehículos más grande de Chile. Compra y vende autos, motos y vehículos comerciales.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://autoexplora.cl";

// ==================== Vehicle Constants ====================

export const VEHICLE_TYPES = {
  AUTO: { label: "Autos", icon: "Car" },
  MOTO: { label: "Motos", icon: "Bike" },
  COMERCIAL: { label: "Comerciales", icon: "Truck" },
} as const;

export const VEHICLE_CATEGORIES = {
  // Autos
  SEDAN: { label: "Sedán", type: "AUTO" },
  HATCHBACK: { label: "Hatchback", type: "AUTO" },
  SUV: { label: "SUV", type: "AUTO" },
  STATION_WAGON: { label: "Station Wagon", type: "AUTO" },
  COUPE: { label: "Coupé", type: "AUTO" },
  DEPORTIVO: { label: "Deportivo", type: "AUTO" },
  VAN: { label: "Van", type: "AUTO" },
  PICKUP: { label: "Pickup", type: "AUTO" },
  // Motos
  MOTO_CALLE: { label: "Calle", type: "MOTO" },
  MOTO_TOURING: { label: "Touring", type: "MOTO" },
  MOTO_DEPORTIVA: { label: "Deportiva", type: "MOTO" },
  MOTO_CROSS: { label: "Cross/Enduro", type: "MOTO" },
  SCOOTER: { label: "Scooter", type: "MOTO" },
  CUATRIMOTO: { label: "Cuatrimoto", type: "MOTO" },
  // Comerciales
  CAMION: { label: "Camión", type: "COMERCIAL" },
  FURGON: { label: "Furgón", type: "COMERCIAL" },
  BUS: { label: "Bus", type: "COMERCIAL" },
  MINIBUS: { label: "Minibús", type: "COMERCIAL" },
} as const;

export const FUEL_TYPES = {
  BENCINA: { label: "Bencina" },
  DIESEL: { label: "Diésel" },
  HIBRIDO: { label: "Híbrido" },
  ELECTRICO: { label: "Eléctrico" },
  GAS: { label: "Gas" },
  OTRO: { label: "Otro" },
} as const;

export const TRANSMISSIONS = {
  MANUAL: { label: "Manual" },
  AUTOMATICA: { label: "Automática" },
  SEMIAUTOMATICA: { label: "Semiautomática" },
} as const;

export const CONDITIONS = {
  NUEVO: { label: "Nuevo" },
  USADO: { label: "Usado" },
} as const;

export const LISTING_STATUS = {
  DRAFT: { label: "Borrador", color: "gray" },
  ACTIVE: { label: "Activo", color: "green" },
  PAUSED: { label: "Pausado", color: "yellow" },
  SOLD: { label: "Vendido", color: "blue" },
  EXPIRED: { label: "Expirado", color: "red" },
  REJECTED: { label: "Rechazado", color: "red" },
} as const;

// ==================== Pagination ====================

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

// ==================== Images ====================

export const MAX_IMAGES_PER_VEHICLE = 15;
export const MIN_IMAGES_PER_VEHICLE = 3;
export const MAX_IMAGE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ==================== Cloudinary ====================

export const CLOUDINARY_FOLDER = "autoexplora";
export const CLOUDINARY_TRANSFORMATIONS = {
  thumbnail: "w_400,h_300,c_fill,q_auto,f_auto",
  card: "w_600,h_400,c_fill,q_auto,f_auto",
  gallery: "w_1200,h_800,c_fill,q_auto,f_auto",
  full: "w_1920,h_1080,c_fit,q_auto,f_auto",
} as const;

// ==================== Price Ranges ====================

export const PRICE_RANGES = [
  { min: 0, max: 5000000, label: "Hasta $5.000.000" },
  { min: 5000000, max: 10000000, label: "$5.000.000 - $10.000.000" },
  { min: 10000000, max: 15000000, label: "$10.000.000 - $15.000.000" },
  { min: 15000000, max: 20000000, label: "$15.000.000 - $20.000.000" },
  { min: 20000000, max: 30000000, label: "$20.000.000 - $30.000.000" },
  { min: 30000000, max: 50000000, label: "$30.000.000 - $50.000.000" },
  { min: 50000000, max: null, label: "Más de $50.000.000" },
] as const;

// ==================== Year Ranges ====================

export const MIN_YEAR = 1990;
export const MAX_YEAR = new Date().getFullYear() + 1;

// ==================== Mileage Ranges ====================

export const MILEAGE_RANGES = [
  { max: 10000, label: "Hasta 10.000 km" },
  { max: 30000, label: "Hasta 30.000 km" },
  { max: 50000, label: "Hasta 50.000 km" },
  { max: 100000, label: "Hasta 100.000 km" },
  { max: 150000, label: "Hasta 150.000 km" },
  { max: 200000, label: "Hasta 200.000 km" },
  { max: null, label: "Cualquier kilometraje" },
] as const;

// ==================== Colors ====================

export const COLORS = {
  BLANCO: { label: "Blanco", hex: "#FFFFFF" },
  NEGRO: { label: "Negro", hex: "#000000" },
  GRIS: { label: "Gris", hex: "#808080" },
  PLATA: { label: "Plata", hex: "#C0C0C0" },
  ROJO: { label: "Rojo", hex: "#FF0000" },
  AZUL: { label: "Azul", hex: "#0000FF" },
  VERDE: { label: "Verde", hex: "#008000" },
  AMARILLO: { label: "Amarillo", hex: "#FFFF00" },
  NARANJA: { label: "Naranja", hex: "#FFA500" },
  CAFE: { label: "Café", hex: "#8B4513" },
  BEIGE: { label: "Beige", hex: "#F5F5DC" },
  DORADO: { label: "Dorado", hex: "#FFD700" },
  OTRO: { label: "Otro", hex: "#CCCCCC" },
} as const;

// ==================== Dealer Constants ====================

export const DEALER_TYPES = {
  AUTOMOTORA: { label: "Automotora", description: "Vehículos nuevos y usados" },
  RENT_A_CAR: { label: "Rent a Car", description: "Arriendo de vehículos" },
} as const;

export const DEALER_SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "name", label: "Nombre A-Z" },
  { value: "vehicles", label: "Más vehículos" },
] as const;
