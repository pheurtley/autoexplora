"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

// Routes where footer should be hidden on mobile (conversation detail pages)
const HIDE_FOOTER_MOBILE_PATTERNS = [
  /^\/cuenta\/mensajes\/[^/]+$/, // /cuenta/mensajes/[conversationId]
  /^\/dealer\/mensajes\/[^/]+$/, // /dealer/mensajes/[conversationId]
];

export function ConditionalFooter() {
  const pathname = usePathname();

  // Check if current path matches any pattern where footer should be hidden on mobile
  const shouldHideOnMobile = HIDE_FOOTER_MOBILE_PATTERNS.some((pattern) =>
    pattern.test(pathname)
  );

  if (shouldHideOnMobile) {
    // Hide on mobile, show on desktop (md and up)
    return (
      <div className="hidden md:block">
        <Footer />
      </div>
    );
  }

  return <Footer />;
}
