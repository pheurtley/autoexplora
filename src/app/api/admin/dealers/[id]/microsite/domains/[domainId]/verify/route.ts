import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/admin";
import dns from "dns/promises";

const EXPECTED_CNAME_TARGET = "autoexplora.cl";

interface RouteParams {
  params: Promise<{ id: string; domainId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    await requireAdmin(session);
    const { id: dealerId, domainId } = await params;

    const domain = await prisma.dealerDomain.findFirst({
      where: {
        id: domainId,
        siteConfig: { dealerId },
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Dominio no encontrado" }, { status: 404 });
    }

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

    const updatedDomain = await prisma.dealerDomain.update({
      where: { id: domainId },
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
    console.error("Error verifying domain:", error);
    return NextResponse.json({ error: "Error al verificar dominio" }, { status: 500 });
  }
}
