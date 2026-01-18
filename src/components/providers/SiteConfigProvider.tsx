"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

export interface PublicSiteConfig {
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
  // Home Sections Texts
  whyChooseUsTitle: string;
  whyChooseUsSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  // Visibility
  showFeaturedVehicles: boolean;
  showRecentVehicles: boolean;
  showPopularBrands: boolean;
  showWhyChooseUs: boolean;
  showCTASection: boolean;
  showTopDealers: boolean;
  // Limits
  featuredVehiclesLimit: number;
  recentVehiclesLimit: number;
  popularBrandsLimit: number;
  topDealersLimit: number;
  // Features
  showWhatsAppButton: boolean;
}

const DEFAULT_CONFIG: PublicSiteConfig = {
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
  // Home Sections Texts
  whyChooseUsTitle: "¿Por qué elegir AutoExplora.cl?",
  whyChooseUsSubtitle: "Somos el marketplace de vehículos más confiable de Chile",
  ctaTitle: "¿Listo para vender tu vehículo?",
  ctaSubtitle: "Publica tu auto, moto o vehículo comercial en minutos y conecta con compradores interesados.",
  ctaButtonText: "Publicar mi vehículo",
  // Visibility
  showFeaturedVehicles: true,
  showRecentVehicles: true,
  showPopularBrands: true,
  showWhyChooseUs: true,
  showCTASection: true,
  showTopDealers: true,
  // Limits
  featuredVehiclesLimit: 8,
  recentVehiclesLimit: 8,
  popularBrandsLimit: 12,
  topDealersLimit: 6,
  // Features
  showWhatsAppButton: true,
};

interface SiteConfigContextType {
  config: PublicSiteConfig;
  isLoading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: DEFAULT_CONFIG,
  isLoading: true,
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublicSiteConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/site-config");
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Error fetching site config:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
}
