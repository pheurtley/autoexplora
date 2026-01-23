import { cache } from "react";
import prisma from "@/lib/prisma";

export type DealerSiteConfigWithRelations = NonNullable<
  Awaited<ReturnType<typeof getDealerConfigByDomain>>
>;

/**
 * Fetch dealer site config by domain or slug.
 * Uses React cache() for request-level deduplication.
 *
 * Lookup order:
 * 1. Check DealerDomain table (custom domains, verified only)
 * 2. Check Dealer.slug (subdomain match)
 */
export const getDealerConfigByDomain = cache(async (domainOrSlug: string) => {
  // 1. Try to find by custom domain
  const domainRecord = await prisma.dealerDomain.findFirst({
    where: {
      domain: domainOrSlug,
      status: "VERIFIED",
    },
    include: {
      siteConfig: {
        include: {
          dealer: {
            include: {
              region: true,
              comuna: true,
            },
          },
          pages: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
          domains: {
            where: { status: "VERIFIED" },
          },
        },
      },
    },
  });

  if (domainRecord?.siteConfig) {
    return domainRecord.siteConfig;
  }

  // 2. Try as dealer slug (subdomain)
  const dealer = await prisma.dealer.findUnique({
    where: { slug: domainOrSlug, status: "ACTIVE" },
    include: {
      region: true,
      comuna: true,
      siteConfig: {
        include: {
          pages: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
          },
          domains: {
            where: { status: "VERIFIED" },
          },
        },
      },
    },
  });

  if (dealer?.siteConfig) {
    return {
      ...dealer.siteConfig,
      dealer: {
        ...dealer,
        siteConfig: undefined,
      },
    };
  }

  return null;
});
