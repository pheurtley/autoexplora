import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, brands, regions, dealers] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.brand.findMany({
      select: {
        slug: true,
        models: {
          select: { slug: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.region.findMany({
      select: { slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.dealer.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/vehiculos`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/automotoras`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Individual vehicle pages
  const vehiclePages: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
    url: `${SITE_URL}/vehiculos/${vehicle.slug}`,
    lastModified: vehicle.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Brand pages (SEO-friendly URLs)
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/vehiculos/marca/${brand.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Brand + Model pages (SEO-friendly URLs for major models)
  const brandModelPages: MetadataRoute.Sitemap = brands.flatMap((brand) =>
    brand.models.map((model) => ({
      url: `${SITE_URL}/vehiculos/marca/${brand.slug}/${model.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  // Region pages (SEO-friendly URLs)
  const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
    url: `${SITE_URL}/vehiculos/region/${region.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Dealer pages
  const dealerPages: MetadataRoute.Sitemap = dealers.map((dealer) => ({
    url: `${SITE_URL}/automotora/${dealer.slug}`,
    lastModified: dealer.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...vehiclePages,
    ...brandPages,
    ...brandModelPages,
    ...regionPages,
    ...dealerPages,
  ];
}
