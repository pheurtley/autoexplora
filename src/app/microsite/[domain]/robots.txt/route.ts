import { NextResponse } from "next/server";
import { getDealerConfigByDomain } from "@/lib/microsite/get-dealer-config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  const config = await getDealerConfigByDomain(domain);

  if (!config || !config.isActive) {
    return new NextResponse("User-agent: *\nDisallow: /", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Determine the site URL from verified domains or subdomain
  const verifiedDomain = config.domains.find((d) => d.isPrimary && d.status === "VERIFIED");
  const siteUrl = verifiedDomain
    ? `https://${verifiedDomain.domain}`
    : `https://${domain}.autoexplora.cl`;

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: { "Content-Type": "text/plain" },
  });
}
