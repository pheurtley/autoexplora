import { NextRequest, NextResponse } from "next/server";

const MAIN_DOMAINS = [
  "autoexplora.cl",
  "www.autoexplora.cl",
  "localhost",
  "localhost:3000",
  "localhost:3001",
];

const SUBDOMAIN_PATTERN = /^(.+)\.autoexplora\.cl$/;

// Paths that should not be rewritten even on dealer domains
const INTERNAL_PATHS = [
  "/_next",
  "/api",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const path = url.pathname;

  // Skip internal paths (static files, API routes)
  if (INTERNAL_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if this is a main domain request (normal site)
  const isMainDomain = MAIN_DOMAINS.some(
    (d) => hostname === d || hostname.startsWith(`${d}:`)
  );

  if (isMainDomain) {
    return NextResponse.next();
  }

  // Detect dealer subdomain (e.g., webcars.autoexplora.cl)
  const subdomainMatch = hostname.match(SUBDOMAIN_PATTERN);
  let dealerDomain = "";

  if (subdomainMatch) {
    dealerDomain = subdomainMatch[1]; // e.g., "webcars"
  } else {
    // Custom domain (e.g., webcars.cl)
    dealerDomain = hostname.replace(/:\d+$/, ""); // Remove port if present
  }

  if (!dealerDomain) {
    return NextResponse.next();
  }

  // Rewrite to microsite route
  const micrositePath = path === "/" ? "" : path;
  url.pathname = `/microsite/${dealerDomain}${micrositePath}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-microsite", "1");
  requestHeaders.set("x-dealer-domain", dealerDomain);

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
