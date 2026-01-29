import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { getSiteConfig, updateSiteConfig } from "@/lib/config";

// GET: Get site configuration
export async function GET() {
  try {
    const session = await auth();
    await requireAdmin(session);

    const config = await getSiteConfig();

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching site config:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener la configuración" },
      { status: 500 }
    );
  }
}

// PATCH: Update site configuration
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const body = await request.json();

    // Validate and sanitize input - only allow specific fields
    const stringFields = [
      "siteName",
      "siteTagline",
      "logo",
      "favicon",
      "headerLogoSize",
      "footerLogoSize",
      "primaryColor",
      "accentColor",
      "contactEmail",
      "contactPhone",
      "whatsapp",
      "address",
      "facebook",
      "instagram",
      "twitter",
      "youtube",
      "heroTitle",
      "heroSubtitle",
      "footerText",
      // Home Sections Texts
      "whyChooseUsTitle",
      "whyChooseUsSubtitle",
      "ctaTitle",
      "ctaSubtitle",
      "ctaButtonText",
      // Why Us Features
      "whyUsFeature1Icon",
      "whyUsFeature1Title",
      "whyUsFeature1Desc",
      "whyUsFeature2Icon",
      "whyUsFeature2Title",
      "whyUsFeature2Desc",
      "whyUsFeature3Icon",
      "whyUsFeature3Title",
      "whyUsFeature3Desc",
      // SEO
      "metaDescription",
      "ogImage",
      "googleAnalyticsId",
      "maintenanceMessage",
    ];

    const booleanFields = [
      "showSiteNameInHeader",
      "showSiteNameInFooter",
      "showWhatsAppButton",
      "maintenanceMode",
      // Home Section Visibility
      "showFeaturedVehicles",
      "showRecentVehicles",
      "showPopularBrands",
      "showWhyChooseUs",
      "showCTASection",
      "showTopDealers",
    ];

    const numberFields = [
      "maxImagesPerVehicle",
      // Home Section Limits
      "featuredVehiclesLimit",
      "recentVehiclesLimit",
      "popularBrandsLimit",
      "topDealersLimit",
    ];

    const updateData: Record<string, string | boolean | number | null> = {};

    // Handle string fields
    for (const field of stringFields) {
      if (field in body) {
        const value = body[field];
        // Convert empty strings to null, trim strings
        if (value === "" || value === null || value === undefined) {
          updateData[field] = null;
        } else if (typeof value === "string") {
          updateData[field] = value.trim();
        }
      }
    }

    // Handle boolean fields
    for (const field of booleanFields) {
      if (field in body) {
        updateData[field] = Boolean(body[field]);
      }
    }

    // Handle number fields
    for (const field of numberFields) {
      if (field in body) {
        const value = parseInt(body[field], 10);
        if (!isNaN(value)) {
          updateData[field] = value;
        }
      }
    }

    // Validate siteName if provided
    if (updateData.siteName !== undefined && !updateData.siteName) {
      return NextResponse.json(
        { error: "El nombre del sitio es requerido" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    const contactEmail = updateData.contactEmail;
    if (contactEmail && typeof contactEmail === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { error: "El email de contacto no es válido" },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    const urlFields = ["logo", "favicon", "ogImage", "facebook", "instagram", "twitter", "youtube"];
    for (const field of urlFields) {
      const value = updateData[field];
      if (value && typeof value === "string") {
        try {
          new URL(value);
        } catch {
          return NextResponse.json(
            { error: `La URL de ${field} no es válida` },
            { status: 400 }
          );
        }
      }
    }

    const config = await updateSiteConfig(updateData);

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating site config:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar la configuración" },
      { status: 500 }
    );
  }
}
