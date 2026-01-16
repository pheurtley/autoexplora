import prisma from "./prisma";

export interface SiteConfig {
  id: string;
  siteName: string;
  siteTagline: string | null;
  logo: string | null;
  favicon: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  footerText: string | null;
  updatedAt: Date;
}

const DEFAULT_CONFIG: SiteConfig = {
  id: "default",
  siteName: "PortalAndino",
  siteTagline: "Tu marketplace de vehículos en Chile",
  logo: null,
  favicon: null,
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
  };
}
