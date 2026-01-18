import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/config";

// Public endpoint to get site configuration (cached)
export async function GET() {
  try {
    const config = await getSiteConfig();

    // Only expose public fields
    const publicConfig = {
      siteName: config.siteName,
      siteTagline: config.siteTagline,
      logo: config.logo,
      favicon: config.favicon,
      // Logo appearance
      headerLogoSize: config.headerLogoSize,
      footerLogoSize: config.footerLogoSize,
      showSiteNameInHeader: config.showSiteNameInHeader,
      showSiteNameInFooter: config.showSiteNameInFooter,
      // Theme
      primaryColor: config.primaryColor,
      accentColor: config.accentColor,
      // Contact
      contactEmail: config.contactEmail,
      contactPhone: config.contactPhone,
      whatsapp: config.whatsapp,
      address: config.address,
      // Social
      facebook: config.facebook,
      instagram: config.instagram,
      twitter: config.twitter,
      youtube: config.youtube,
      // Texts
      heroTitle: config.heroTitle,
      heroSubtitle: config.heroSubtitle,
      footerText: config.footerText,
      // Home Sections Texts
      whyChooseUsTitle: config.whyChooseUsTitle,
      whyChooseUsSubtitle: config.whyChooseUsSubtitle,
      ctaTitle: config.ctaTitle,
      ctaSubtitle: config.ctaSubtitle,
      ctaButtonText: config.ctaButtonText,
      // Visibility
      showFeaturedVehicles: config.showFeaturedVehicles,
      showRecentVehicles: config.showRecentVehicles,
      showPopularBrands: config.showPopularBrands,
      showWhyChooseUs: config.showWhyChooseUs,
      showCTASection: config.showCTASection,
      showTopDealers: config.showTopDealers,
      // Limits
      featuredVehiclesLimit: config.featuredVehiclesLimit,
      recentVehiclesLimit: config.recentVehiclesLimit,
      popularBrandsLimit: config.popularBrandsLimit,
      topDealersLimit: config.topDealersLimit,
      // Features
      showWhatsAppButton: config.showWhatsAppButton,
    };

    return NextResponse.json(publicConfig, {
      headers: {
        // Cache for 5 minutes, revalidate in background
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching site config:", error);
    // Return default values on error
    return NextResponse.json({
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
    });
  }
}
