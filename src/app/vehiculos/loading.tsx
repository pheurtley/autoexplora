import { Container } from "@/components/layout";
import { Skeleton, SkeletonVehicleCard } from "@/components/ui/Skeleton";

export default function VehiculosLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Container className="py-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-36" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar Skeleton */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
              <Skeleton className="h-6 w-24 mb-4" />

              {/* Search skeleton */}
              <div className="pb-4 border-b border-neutral-200 mb-4">
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Filter sections */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-neutral-200">
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 min-w-0">
            {/* Sort and Active Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-48" />
            </div>

            {/* Vehicle Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonVehicleCard key={i} />
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-8 flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-9 rounded-lg" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}
