import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TemplateChannel, Prisma } from "@prisma/client";
import { extractVariables } from "@/lib/template-interpolation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Error al obtener plantilla" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, channel, subject, content, isActive } = body;

    // Verify template belongs to dealer
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Prisma.MessageTemplateUpdateInput = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (channel !== undefined) {
      if (!Object.values(TemplateChannel).includes(channel as TemplateChannel)) {
        return NextResponse.json(
          { error: "Canal inválido" },
          { status: 400 }
        );
      }
      updateData.channel = channel as TemplateChannel;
    }

    if (subject !== undefined) {
      updateData.subject = subject?.trim() || null;
    }

    if (content !== undefined) {
      updateData.content = content.trim();
      // Update variables
      const variables = [
        ...extractVariables(content),
        ...(subject ? extractVariables(subject) : []),
      ];
      updateData.variables = [...new Set(variables)];
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Error al actualizar plantilla" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verify template belongs to dealer
    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        dealerId: session.user.dealerId,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    // Check if template is used in auto-response
    const autoResponseConfig = await prisma.autoResponseConfig.findFirst({
      where: {
        dealerId: session.user.dealerId,
        emailTemplateId: id,
      },
    });

    if (autoResponseConfig) {
      // Remove from auto-response config
      await prisma.autoResponseConfig.update({
        where: { id: autoResponseConfig.id },
        data: { emailTemplateId: null },
      });
    }

    await prisma.messageTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Error al eliminar plantilla" },
      { status: 500 }
    );
  }
}
