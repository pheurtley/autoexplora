import prisma from "./prisma";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

export interface SiteConfig {
  id: string;
  siteName: string;
  siteTagline: string | null;
  logo: string | null;
  favicon: string | null;
  // Logo appearance
  headerLogoSize: LogoSize;
  footerLogoSize: LogoSize;
  showSiteNameInHeader: boolean;
  showSiteNameInFooter: boolean;
  // Theme colors
  primaryColor: string;
  accentColor: string;
  // Contact
  contactEmail: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  address: string | null;
  // Social
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  // Texts
  heroTitle: string | null;
  heroSubtitle: string | null;
  footerText: string | null;
  // SEO
  metaDescription: string | null;
  googleAnalyticsId: string | null;
  // Features
  maxImagesPerVehicle: number;
  showWhatsAppButton: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  updatedAt: Date;
}

const DEFAULT_CONFIG: SiteConfig = {
  id: "default",
  siteName: "AutoExplora.cl",
  siteTagline: "Tu marketplace de vehículos en Chile",
  logo: null,
  favicon: null,
  headerLogoSize: "md",
  footerLogoSize: "md",
  showSiteNameInHeader: true,
  showSiteNameInFooter: true,
  primaryColor: "#2563eb",
  accentColor: "#f97316",
  contactEmail: null,
  contactPhone: null,
  whatsapp: null,
  address: null,
  facebook: null,
  instagram: null,
  twitter: null,
  youtube: null,
  heroTitle: "Encuentra tu vehículo ideal",
  heroSubtitle: "Miles de autos, motos y comerciales te esperan en Chile",
  footerText: null,
  metaDescription: null,
  googleAnalyticsId: null,
  maxImagesPerVehicle: 10,
  showWhatsAppButton: true,
  maintenanceMode: false,
  maintenanceMessage: null,
  updatedAt: new Date(),
};

/**
 * Get site configuration
 * Creates default config if it doesn't exist
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  let config = await prisma.siteConfig.findUnique({
    where: { id: "default" },
  });

  if (!config) {
    // Create default config if it doesn't exist
    config = await prisma.siteConfig.create({
      data: {
        id: "default",
        siteName: DEFAULT_CONFIG.siteName,
        siteTagline: DEFAULT_CONFIG.siteTagline,
        heroTitle: DEFAULT_CONFIG.heroTitle,
        heroSubtitle: DEFAULT_CONFIG.heroSubtitle,
      },
    });
  }

  return {
    ...DEFAULT_CONFIG,
    ...config,
    headerLogoSize: (config.headerLogoSize as LogoSize) || DEFAULT_CONFIG.headerLogoSize,
    footerLogoSize: (config.footerLogoSize as LogoSize) || DEFAULT_CONFIG.footerLogoSize,
  };
}

/**
 * Update site configuration
 */
export async function updateSiteConfig(
  data: Partial<Omit<SiteConfig, "id" | "updatedAt">>
): Promise<SiteConfig> {
  const config = await prisma.siteConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...data,
    },
    update: data,
  });

  return {
    ...DEFAULT_CONFIG,
    ...config,
    headerLogoSize: (config.headerLogoSize as LogoSize) || DEFAULT_CONFIG.headerLogoSize,
    footerLogoSize: (config.footerLogoSize as LogoSize) || DEFAULT_CONFIG.footerLogoSize,
  };
}
