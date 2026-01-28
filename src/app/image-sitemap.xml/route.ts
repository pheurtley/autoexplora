import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

export async function GET() {
  try {
    // Fetch active vehicles with their images
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        title: true,
        year: true,
        brand: { select: { name: true } },
        model: { select: { name: true } },
        color: true,
        region: { select: { name: true } },
        images: {
          select: { url: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    for (const vehicle of vehicles) {
      if (vehicle.images.length === 0) continue;

      const vehicleTitle = `${vehicle.year} ${vehicle.brand.name} ${vehicle.model.name}`;
      const caption = vehicle.color
        ? `${vehicleTitle} ${vehicle.color}`
        : vehicleTitle;
      const geoLocation = vehicle.region?.name
        ? `${vehicle.region.name}, Chile`
        : "Chile";

      xml += `
  <url>
    <loc>${SITE_URL}/vehiculos/${vehicle.slug}</loc>`;

      for (let i = 0; i < vehicle.images.length; i++) {
        const image = vehicle.images[i];
        const imageTitle = i === 0
          ? `${vehicleTitle} - Imagen principal`
          : `${vehicleTitle} - Imagen ${i + 1}`;

        xml += `
    <image:image>
      <image:loc>${escapeXml(image.url)}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
      <image:geo_location>${escapeXml(geoLocation)}</image:geo_location>
    </image:image>`;
      }

      xml += `
  </url>`;
    }

    xml += `
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
