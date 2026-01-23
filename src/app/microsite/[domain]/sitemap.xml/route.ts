import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    return new NextResponse("<urlset />", {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const { dealer } = config;

  // Determine base URL
  const verifiedDomain = config.domains.find((d) => d.isPrimary && d.status === "VERIFIED");
  const baseUrl = verifiedDomain
    ? `https://${verifiedDomain.domain}`
    : `https://${domain}.autoexplora.cl`;

  // Fetch vehicles and pages
  const [vehicles, pages] = await Promise.all([
    prisma.vehicle.findMany({
      where: { dealerId: dealer.id, status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.dealerPage.findMany({
      where: { siteConfigId: config.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/vehiculos</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/contacto</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  // Vehicle URLs
  for (const vehicle of vehicles) {
    xml += `
  <url>
    <loc>${baseUrl}/vehiculos/${vehicle.slug}</loc>
    <lastmod>${vehicle.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Custom page URLs
  for (const page of pages) {
    xml += `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
