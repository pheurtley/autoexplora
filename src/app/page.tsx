import {
  HeroBanner,
  CategoryCarousel,
  FeaturedVehicles,
  RecentVehicles,
  PopularBrands,
  TopDealers,
  WhyChooseUs,
  CTASection,
} from "@/components/home";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo";
import { Suspense } from "react";
import { Container } from "@/components/layout";
import { getSiteConfig } from "@/lib/config";
import { SITE_URL } from "@/lib/constants";

// Revalidate home page every 5 minutes
export const revalidate = 300;

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <>
      {/* Structured Data */}
      <OrganizationJsonLd
        name={config.siteName}
        url={SITE_URL}
        logo={config.logo}
        description={config.metaDescription || config.siteTagline}
        contactEmail={config.contactEmail}
        contactPhone={config.contactPhone}
        socialLinks={{
          facebook: config.facebook,
          instagram: config.instagram,
          twitter: config.twitter,
          youtube: config.youtube,
        }}
      />
      <WebSiteJsonLd
        name={config.siteName}
        url={SITE_URL}
        searchUrl={`${SITE_URL}/vehiculos`}
      />

      {/* Hero Section */}
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBanner />
      </Suspense>

      {/* Categories */}
      <CategoryCarousel />

      {/* Featured Vehicles */}
      {config.showFeaturedVehicles && (
        <Suspense fallback={<VehiclesSkeleton title="Vehículos destacados" />}>
          <FeaturedVehicles limit={config.featuredVehiclesLimit} />
        </Suspense>
      )}

      {/* Recent Vehicles */}
      {config.showRecentVehicles && (
        <Suspense fallback={<VehiclesSkeleton title="Publicados recientemente" hasBg />}>
          <RecentVehicles limit={config.recentVehiclesLimit} />
        </Suspense>
      )}

      {/* Popular Brands */}
      {config.showPopularBrands && (
        <Suspense fallback={<BrandsSkeleton />}>
          <PopularBrands limit={config.popularBrandsLimit} />
        </Suspense>
      )}

      {/* Top Dealers */}
      {config.showTopDealers && (
        <Suspense fallback={<DealersSkeleton />}>
          <TopDealers limit={config.topDealersLimit} />
        </Suspense>
      )}

      {/* Why Choose Us */}
      {config.showWhyChooseUs && (
        <WhyChooseUs
          title={config.whyChooseUsTitle}
          subtitle={config.whyChooseUsSubtitle}
          features={[
            {
              icon: config.whyUsFeature1Icon,
              title: config.whyUsFeature1Title,
              description: config.whyUsFeature1Desc,
            },
            {
              icon: config.whyUsFeature2Icon,
              title: config.whyUsFeature2Title,
              description: config.whyUsFeature2Desc,
            },
            {
              icon: config.whyUsFeature3Icon,
              title: config.whyUsFeature3Title,
              description: config.whyUsFeature3Desc,
            },
          ]}
        />
      )}

      {/* CTA Section */}
      {config.showCTASection && (
        <CTASection
          title={config.ctaTitle}
          subtitle={config.ctaSubtitle}
          buttonText={config.ctaButtonText}
        />
      )}
    </>
  );
}

// Skeleton components for loading states
function HeroBannerSkeleton() {
  return (
    <section className="relative bg-gradient-to-br from-andino-600 via-andino-700 to-andino-800 py-16 md:py-24">
      <Container className="relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="h-12 bg-white/20 rounded-lg max-w-md mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-white/20 rounded-lg max-w-2xl mx-auto animate-pulse" />
        </div>
        <div className="h-16 bg-white/10 rounded-xl max-w-4xl mx-auto animate-pulse" />
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-white/20 rounded mx-auto w-20 mb-2 animate-pulse" />
              <div className="h-4 bg-white/10 rounded mx-auto w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function VehiclesSkeleton({ title, hasBg }: { title: string; hasBg?: boolean }) {
  return (
    <section className={`py-12 ${hasBg ? "bg-neutral-50" : ""}`}>
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-200">
              <div className="aspect-[4/3] bg-neutral-200 animate-pulse" />
              <div className="p-4">
                <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-6 bg-neutral-200 rounded w-1/2 mb-3 animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 bg-neutral-100 rounded w-12 animate-pulse" />
                  <div className="h-4 bg-neutral-100 rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function BrandsSkeleton() {
  return (
    <section className="py-12">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Marcas populares</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center p-4 bg-white rounded-xl border border-neutral-200">
              <div className="w-16 h-16 mb-3 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-16 animate-pulse" />
              <div className="h-3 bg-neutral-100 rounded w-12 mt-1 animate-pulse" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function DealersSkeleton() {
  return (
    <section className="py-12 bg-neutral-50">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Dealers destacados</h2>
            <div className="h-5 bg-neutral-200 rounded w-64 mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-neutral-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-neutral-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="h-4 bg-neutral-100 rounded w-32 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
