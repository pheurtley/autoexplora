"use client";

import { useCallback, useRef, useEffect } from "react";

export type TrackingEventType =
  // Contact events
  | "WHATSAPP_CLICK"
  | "PHONE_REVEAL"
  | "PHONE_CALL"
  | "CHAT_START"
  | "CONTACT_FORM"
  // View events
  | "PAGE_VIEW"
  | "VEHICLE_VIEW"
  | "DEALER_PROFILE_VIEW"
  | "MICROSITE_HOME_VIEW"
  | "IMAGE_GALLERY_VIEW"
  // Interaction events
  | "SEARCH_PERFORMED"
  | "FILTER_APPLIED"
  | "FAVORITE_ADDED"
  | "FAVORITE_REMOVED"
  | "SHARE_CLICK";

interface TrackEventOptions {
  vehicleId?: string;
  dealerId?: string;
  source?: "marketplace" | "microsite";
  metadata?: Record<string, unknown>;
}

/**
 * Hook for tracking all types of events (views, contacts, interactions)
 *
 * Usage:
 * ```tsx
 * const { trackEvent, trackPageView, trackSearch, trackShare } = useTracking();
 *
 * // Track a page view
 * useEffect(() => {
 *   trackPageView({ dealerId: "123" });
 * }, []);
 *
 * // Track a search
 * trackSearch({ query: "toyota", filters: { brand: "toyota" } });
 *
 * // Track a share
 * trackShare("whatsapp", { vehicleId: "456" });
 * ```
 */
export function useTracking() {
  const sessionIdRef = useRef<string | null>(null);
  const trackedPageViews = useRef<Set<string>>(new Set());

  const getSessionId = useCallback(() => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("tracking_session_id");
      if (stored) {
        sessionIdRef.current = stored;
        return stored;
      }

      const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("tracking_session_id", newId);
      sessionIdRef.current = newId;
      return newId;
    }

    return null;
  }, []);

  /**
   * Generic event tracker
   */
  const trackEvent = useCallback(
    (eventType: TrackingEventType, options: TrackEventOptions = {}) => {
      const { vehicleId, dealerId, source = "marketplace", metadata } = options;

      fetch("/api/events/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          vehicleId,
          dealerId,
          source,
          sessionId: getSessionId(),
          metadata,
        }),
      }).catch((error) => {
        console.warn("[Tracking] Failed to track event:", error);
      });
    },
    [getSessionId]
  );

  /**
   * Track page view (prevents duplicate tracking for same page in session)
   */
  const trackPageView = useCallback(
    (
      pageType: "PAGE_VIEW" | "VEHICLE_VIEW" | "DEALER_PROFILE_VIEW" | "MICROSITE_HOME_VIEW",
      options: TrackEventOptions = {}
    ) => {
      const pageKey = `${pageType}-${options.vehicleId || ""}-${options.dealerId || ""}-${options.source || ""}`;

      // Prevent duplicate page views in same session
      if (trackedPageViews.current.has(pageKey)) {
        return;
      }
      trackedPageViews.current.add(pageKey);

      trackEvent(pageType, options);
    },
    [trackEvent]
  );

  /**
   * Track search performed
   */
  const trackSearch = useCallback(
    (searchData: { query?: string; filters?: Record<string, unknown> }, options: TrackEventOptions = {}) => {
      trackEvent("SEARCH_PERFORMED", {
        ...options,
        metadata: searchData,
      });
    },
    [trackEvent]
  );

  /**
   * Track filter applied
   */
  const trackFilter = useCallback(
    (filterData: Record<string, unknown>, options: TrackEventOptions = {}) => {
      trackEvent("FILTER_APPLIED", {
        ...options,
        metadata: filterData,
      });
    },
    [trackEvent]
  );

  /**
   * Track share click
   */
  const trackShare = useCallback(
    (platform: "whatsapp" | "facebook" | "twitter" | "copy" | "email", options: TrackEventOptions = {}) => {
      trackEvent("SHARE_CLICK", {
        ...options,
        metadata: { platform },
      });
    },
    [trackEvent]
  );

  /**
   * Track favorite action
   */
  const trackFavorite = useCallback(
    (action: "add" | "remove", options: TrackEventOptions = {}) => {
      trackEvent(action === "add" ? "FAVORITE_ADDED" : "FAVORITE_REMOVED", options);
    },
    [trackEvent]
  );

  /**
   * Track image gallery view
   */
  const trackGalleryView = useCallback(
    (imageIndex: number, options: TrackEventOptions = {}) => {
      trackEvent("IMAGE_GALLERY_VIEW", {
        ...options,
        metadata: { imageIndex },
      });
    },
    [trackEvent]
  );

  /**
   * Track contact events (WhatsApp, phone, chat, form)
   */
  const trackContact = useCallback(
    (
      contactType: "WHATSAPP_CLICK" | "PHONE_REVEAL" | "PHONE_CALL" | "CHAT_START" | "CONTACT_FORM",
      options: TrackEventOptions = {}
    ) => {
      trackEvent(contactType, options);
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackSearch,
    trackFilter,
    trackShare,
    trackFavorite,
    trackGalleryView,
    trackContact,
    getSessionId,
  };
}

/**
 * Hook to track page view on mount
 */
export function usePageViewTracking(
  pageType: "PAGE_VIEW" | "VEHICLE_VIEW" | "DEALER_PROFILE_VIEW" | "MICROSITE_HOME_VIEW",
  options: TrackEventOptions = {}
) {
  const { trackPageView } = useTracking();

  useEffect(() => {
    trackPageView(pageType, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageType, options.vehicleId, options.dealerId, options.source]);
}
