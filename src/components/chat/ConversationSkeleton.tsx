"use client";

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      {/* Image skeleton */}
      <div className="w-16 h-16 rounded-lg bg-neutral-200 shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="h-5 bg-neutral-200 rounded w-32 mb-2" />
            <div className="h-4 bg-neutral-100 rounded w-48" />
          </div>
          <div className="h-3 bg-neutral-100 rounded w-16" />
        </div>
        <div className="h-4 bg-neutral-100 rounded w-40 mt-2" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-neutral-100">
      {Array.from({ length: count }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}
