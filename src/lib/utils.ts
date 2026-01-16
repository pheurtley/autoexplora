import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Chilean Pesos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format number with dots as thousand separator (Chilean format)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CL").format(num);
}

/**
 * Format kilometers
 */
export function formatKilometers(km: number): string {
  return `${formatNumber(km)} km`;
}

/**
 * Create slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Generate WhatsApp link
 */
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Get relative time string (e.g., "hace 2 días")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  return `Hace ${Math.floor(diffInDays / 365)} años`;
}

/**
 * Generate SEO-friendly slug for vehicle URLs
 * Format: {year}-{brand}-{model}-{title-words}-{short-id}
 * Example: 2024-toyota-corolla-xei-automatico-blanco-a1b2c3d4
 */
export function generateVehicleSlug(
  year: number,
  brandSlug: string,
  modelSlug: string,
  title: string,
  id: string
): string {
  // Remove brand and model from title if they appear (avoid duplication)
  const titleWithoutBrandModel = title
    .toLowerCase()
    .replace(new RegExp(brandSlug, "gi"), "")
    .replace(new RegExp(modelSlug, "gi"), "")
    .replace(String(year), "")
    .trim();

  const titleSlug = slugify(titleWithoutBrandModel);
  const shortId = id.slice(-8); // Last 8 characters of CUID

  // Build slug parts, filtering empty strings
  const parts = [
    String(year),
    brandSlug,
    modelSlug,
    titleSlug,
    shortId,
  ].filter(Boolean);

  return parts.join("-");
}

/**
 * Check if a string looks like a CUID (no hyphens, alphanumeric, ~25 chars)
 */
export function isCuid(str: string): boolean {
  return /^[a-z0-9]{20,30}$/i.test(str);
}
