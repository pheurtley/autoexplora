import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
  className,
  variant = "text",
  ...props
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton components
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4">
      <Skeleton variant="rectangular" className="mb-4 h-48 w-full" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function SkeletonVehicleCard() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="mb-2 h-5 w-3/4" />
        <Skeleton className="mb-3 h-6 w-1/2" />
        <div className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
