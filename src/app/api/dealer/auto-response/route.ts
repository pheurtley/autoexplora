import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const config = await prisma.autoResponseConfig.findUnique({
      where: { dealerId: session.user.dealerId },
    });

    return NextResponse.json({
      config: config || {
        enabled: false,
        emailTemplateId: null,
        whatsappMessage: null,
        delayMinutes: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching auto-response config:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, emailTemplateId, whatsappMessage, delayMinutes } = body;

    // Verify email template belongs to dealer if provided
    if (emailTemplateId) {
      const template = await prisma.messageTemplate.findFirst({
        where: {
          id: emailTemplateId,
          dealerId: session.user.dealerId,
          channel: "EMAIL",
        },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Plantilla no encontrada" },
          { status: 400 }
        );
      }
    }

    // Upsert config
    const config = await prisma.autoResponseConfig.upsert({
      where: { dealerId: session.user.dealerId },
      update: {
        enabled: enabled ?? false,
        emailTemplateId: emailTemplateId || null,
        whatsappMessage: whatsappMessage?.trim() || null,
        delayMinutes: Math.max(0, delayMinutes ?? 0),
      },
      create: {
        dealerId: session.user.dealerId,
        enabled: enabled ?? false,
        emailTemplateId: emailTemplateId || null,
        whatsappMessage: whatsappMessage?.trim() || null,
        delayMinutes: Math.max(0, delayMinutes ?? 0),
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error updating auto-response config:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
