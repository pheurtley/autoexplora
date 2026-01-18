import {
  HeroBanner,
  CategoryCarousel,
  FeaturedVehicles,
  RecentVehicles,
  PopularBrands,
  WhyChooseUs,
  CTASection,
} from "@/components/home";
import { Suspense } from "react";
import { Container } from "@/components/layout";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBanner />
      </Suspense>

      {/* Categories */}
      <CategoryCarousel />

      {/* Featured Vehicles */}
      <Suspense fallback={<VehiclesSkeleton title="Vehículos destacados" />}>
        <FeaturedVehicles />
      </Suspense>

      {/* Recent Vehicles */}
      <Suspense fallback={<VehiclesSkeleton title="Publicados recientemente" hasBg />}>
        <RecentVehicles />
      </Suspense>

      {/* Popular Brands */}
      <Suspense fallback={<BrandsSkeleton />}>
        <PopularBrands />
      </Suspense>

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* CTA Section */}
      <CTASection />
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
