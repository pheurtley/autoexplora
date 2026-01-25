"use client";

import { useCallback, useRef } from "react";

export type ContactEventType =
  | "WHATSAPP_CLICK"
  | "PHONE_REVEAL"
  | "PHONE_CALL"
  | "CHAT_START"
  | "CONTACT_FORM";

interface TrackContactOptions {
  vehicleId?: string;
  dealerId?: string;
  source?: "marketplace" | "microsite";
}

/**
 * Hook for tracking contact events (WhatsApp clicks, phone calls, etc.)
 *
 * Usage:
 * ```tsx
 * const { trackContact } = useContactTracking();
 *
 * const handleWhatsAppClick = () => {
 *   trackContact("WHATSAPP_CLICK", { vehicleId: "123", dealerId: "456" });
 *   window.open(whatsappUrl);
 * };
 * ```
 */
export function useContactTracking() {
  // Generate or retrieve session ID for grouping events
  const sessionIdRef = useRef<string | null>(null);

  const getSessionId = useCallback(() => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    // Try to get from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("contact_session_id");
      if (stored) {
        sessionIdRef.current = stored;
        return stored;
      }

      // Generate new session ID
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("contact_session_id", newId);
      sessionIdRef.current = newId;
      return newId;
    }

    return null;
  }, []);

  /**
   * Track a contact event
   * Fire-and-forget - does not block UI
   */
  const trackContact = useCallback(
    (eventType: ContactEventType, options: TrackContactOptions) => {
      const { vehicleId, dealerId, source = "marketplace" } = options;

      // Fire-and-forget: don't await, don't block UI
      fetch("/api/events/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          vehicleId,
          dealerId,
          source,
          sessionId: getSessionId(),
        }),
      }).catch((error) => {
        // Silent fail - tracking should not affect user experience
        console.warn("[ContactTracking] Failed to track event:", error);
      });
    },
    [getSessionId]
  );

  return { trackContact };
}
