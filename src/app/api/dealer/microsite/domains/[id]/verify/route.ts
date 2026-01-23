import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireDealerManager } from "@/lib/dealer";
import { UnauthorizedError, ForbiddenError } from "@/lib/admin";
import { DealerPendingError, DealerInactiveError } from "@/lib/dealer";
import dns from "dns/promises";

const EXPECTED_CNAME_TARGET = "autoexplora.cl";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { dealer } = await requireDealerManager(session);
    const { id } = await params;

    // Verify domain belongs to this dealer
    const domain = await prisma.dealerDomain.findFirst({
      where: {
        id,
        siteConfig: { dealerId: dealer.id },
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Dominio no encontrado" }, { status: 404 });
    }

    // Check DNS CNAME record
    let verified = false;
    let errorDetail = "";

    try {
      const records = await dns.resolveCname(domain.domain);
      verified = records.some((record) => {
        const normalized = record.replace(/\.$/, "").toLowerCase();
        return (
          normalized === EXPECTED_CNAME_TARGET ||
          normalized.endsWith(`.${EXPECTED_CNAME_TARGET}`)
        );
      });

      if (!verified) {
        errorDetail = `CNAME apunta a: ${records.join(", ")}. Debe apuntar a ${EXPECTED_CNAME_TARGET}`;
      }
    } catch (dnsError) {
      if (dnsError instanceof Error) {
        if (dnsError.message.includes("ENODATA") || dnsError.message.includes("ENOTFOUND")) {
          errorDetail = "No se encontró registro CNAME para este dominio";
        } else {
          errorDetail = `Error DNS: ${dnsError.message}`;
        }
      }
    }

    // Update domain status
    const updatedDomain = await prisma.dealerDomain.update({
      where: { id },
      data: {
        status: verified ? "VERIFIED" : "FAILED",
        verifiedAt: verified ? new Date() : null,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({
      domain: updatedDomain,
      verified,
      error: verified ? null : errorDetail,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof DealerPendingError || error instanceof DealerInactiveError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error verifying domain:", error);
    return NextResponse.json({ error: "Error al verificar dominio" }, { status: 500 });
  }
}
