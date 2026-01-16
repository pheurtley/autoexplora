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
    const allowedFields = [
      "siteName",
      "siteTagline",
      "logo",
      "favicon",
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
    ];

    const updateData: Record<string, string | null> = {};

    for (const field of allowedFields) {
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

    // Validate siteName if provided
    if (updateData.siteName !== undefined && !updateData.siteName) {
      return NextResponse.json(
        { error: "El nombre del sitio es requerido" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (updateData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contactEmail)) {
      return NextResponse.json(
        { error: "El email de contacto no es válido" },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    const urlFields = ["logo", "favicon", "facebook", "instagram", "twitter", "youtube"];
    for (const field of urlFields) {
      if (updateData[field]) {
        try {
          new URL(updateData[field] as string);
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
