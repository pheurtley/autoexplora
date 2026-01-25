"use client";

import { useEffect, useRef } from "react";
import { useTracking } from "@/hooks";

type PageType = "PAGE_VIEW" | "VEHICLE_VIEW" | "DEALER_PROFILE_VIEW" | "MICROSITE_HOME_VIEW";

interface PageViewTrackerProps {
  pageType: PageType;
  vehicleId?: string;
  dealerId?: string;
  source?: "marketplace" | "microsite";
}

/**
 * Component to track page views
 * Use this in server components by embedding it
 *
 * Usage:
 * ```tsx
 * <PageViewTracker
 *   pageType="VEHICLE_VIEW"
 *   vehicleId={vehicle.id}
 *   dealerId={vehicle.dealerId}
 * />
 * ```
 */
export function PageViewTracker({
  pageType,
  vehicleId,
  dealerId,
  source = "marketplace",
}: PageViewTrackerProps) {
  const { trackPageView } = useTracking();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    trackPageView(pageType, { vehicleId, dealerId, source });
  }, [pageType, vehicleId, dealerId, source, trackPageView]);

  return null;
}
