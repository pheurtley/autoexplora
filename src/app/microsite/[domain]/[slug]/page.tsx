import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";
import { BlockRenderer } from "@/components/microsite/blocks/BlockRenderer";
import type { ContentBlock } from "@/components/microsite/blocks/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ domain: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain, slug } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) return {};

  const page = await prisma.dealerPage.findUnique({
    where: {
      siteConfigId_slug: {
        siteConfigId: config.id,
        slug,
      },
    },
    select: { title: true, metaTitle: true, metaDescription: true },
  });

  if (!page) return { title: "Página no encontrada" };

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function MicrositeCustomPage({ params }: PageProps) {
  const { domain, slug } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    notFound();
  }

  const page = await prisma.dealerPage.findUnique({
    where: {
      siteConfigId_slug: {
        siteConfigId: config.id,
        slug,
      },
      isPublished: true,
    },
  });

  if (!page) {
    notFound();
  }

  const blocks = (page.content as unknown as ContentBlock[]) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          {page.title}
        </h1>
        <BlockRenderer blocks={blocks} />
      </div>
    </div>
  );
}
