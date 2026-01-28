import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

// Map vehicle types to Google product type taxonomy
const VEHICLE_TYPE_MAP: Record<string, string> = {
  AUTO: "Vehicles & Parts > Vehicles > Motor Vehicles > Cars",
  MOTO: "Vehicles & Parts > Vehicles > Motor Vehicles > Motorcycles & Scooters",
  COMERCIAL: "Vehicles & Parts > Vehicles > Motor Vehicles > Commercial Vehicles",
};

// Map fuel types to Google-friendly labels
const FUEL_TYPE_MAP: Record<string, string> = {
  BENCINA: "Gasoline",
  DIESEL: "Diesel",
  HIBRIDO: "Hybrid",
  ELECTRICO: "Electric",
  GAS: "Natural Gas",
  OTRO: "Other",
};

// Map transmission to Google-friendly labels
const TRANSMISSION_MAP: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATICA: "Automatic",
  SEMIAUTOMATICA: "Semi-Automatic",
};

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Format price for Google (no thousands separator)
function formatPrice(price: number): string {
  return `${price} CLP`;
}

// Clean description for XML
function cleanDescription(text: string | null): string {
  if (!text) return "";
  // Remove excessive whitespace and limit length
  return escapeXml(
    text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000)
  );
}

export async function GET() {
  try {
    // Fetch active vehicles with images and price > 0
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: "ACTIVE",
        price: { gt: 0 },
        images: { some: {} }, // Has at least one image
      },
      include: {
        brand: { select: { name: true } },
        model: { select: { name: true } },
        region: { select: { name: true } },
        images: {
          orderBy: { order: "asc" },
          take: 10,
          select: { url: true },
        },
        dealer: {
          select: {
            tradeName: true,
            verifiedAt: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    // Build XML feed
    const items = vehicles.map((vehicle) => {
      const title = `${vehicle.year} ${vehicle.brand.name} ${vehicle.model.name}`;
      const productType = VEHICLE_TYPE_MAP[vehicle.vehicleType] || VEHICLE_TYPE_MAP.AUTO;
      const condition = vehicle.condition === "NUEVO" ? "new" : "used";
      const fuelType = FUEL_TYPE_MAP[vehicle.fuelType] || "Other";
      const transmission = TRANSMISSION_MAP[vehicle.transmission] || "Other";
      const availability = "in_stock";
      const sellerName = vehicle.dealer?.tradeName || "Vendedor particular";

      // Generate additional images (up to 10)
      const additionalImages = vehicle.images
        .slice(1, 10)
        .map((img) => `      <g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`)
        .join("\n");

      return `    <item>
      <g:id>${escapeXml(vehicle.slug)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${cleanDescription(vehicle.description) || escapeXml(`${title} - ${vehicle.mileage.toLocaleString("es-CL")} km - ${vehicle.region.name}`)}</g:description>
      <g:link>${SITE_URL}/vehiculos/${escapeXml(vehicle.slug)}</g:link>
      <g:image_link>${escapeXml(vehicle.images[0]?.url || "")}</g:image_link>
${additionalImages}
      <g:price>${formatPrice(vehicle.price)}</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${escapeXml(vehicle.brand.name)}</g:brand>
      <g:mpn>${escapeXml(vehicle.slug)}</g:mpn>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:google_product_category>916</g:google_product_category>
      <g:custom_label_0>${escapeXml(vehicle.vehicleType)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(vehicle.region.name)}</g:custom_label_1>
      <g:custom_label_2>${vehicle.dealer ? "dealer" : "particular"}</g:custom_label_2>
      <g:custom_label_3>${escapeXml(vehicle.category)}</g:custom_label_3>
      <g:custom_label_4>${vehicle.featured ? "featured" : "standard"}</g:custom_label_4>
      <g:identifier_exists>false</g:identifier_exists>
      <!-- Vehicle-specific attributes -->
      <g:vehicle_fulfillment type="store">
        <g:store_code>main</g:store_code>
        <g:availability>${availability}</g:availability>
      </g:vehicle_fulfillment>
      <c:year>${vehicle.year}</c:year>
      <c:mileage>${vehicle.mileage} km</c:mileage>
      <c:fuel_type>${escapeXml(fuelType)}</c:fuel_type>
      <c:transmission>${escapeXml(transmission)}</c:transmission>
      <c:model>${escapeXml(vehicle.model.name)}</c:model>
      <c:color>${vehicle.color ? escapeXml(vehicle.color) : ""}</c:color>
      <c:doors>${vehicle.doors || ""}</c:doors>
      <c:seller_name>${escapeXml(sellerName)}</c:seller_name>
      <c:location>${escapeXml(vehicle.region.name)}</c:location>
    </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:c="http://base.google.com/cns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} - Vehículos en Venta</title>
    <link>${SITE_URL}</link>
    <description>Feed de vehículos en venta en ${escapeXml(SITE_NAME)}</description>
${items.join("\n")}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating Google Merchant feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
