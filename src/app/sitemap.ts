import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, brands, dealers] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.brand.findMany({
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

  const vehiclePages: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
    url: `${SITE_URL}/vehiculos/${vehicle.slug}`,
    lastModified: vehicle.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/vehiculos?brand=${brand.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const dealerPages: MetadataRoute.Sitemap = dealers.map((dealer) => ({
    url: `${SITE_URL}/automotora/${dealer.slug}`,
    lastModified: dealer.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...vehiclePages, ...brandPages, ...dealerPages];
}
