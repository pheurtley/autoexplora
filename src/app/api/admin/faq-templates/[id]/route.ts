import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.faqTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    const updateData: Record<string, string | number | boolean> = {};

    if (typeof body.question === "string" && body.question.trim()) {
      updateData.question = body.question.trim();
    }
    if (typeof body.answer === "string" && body.answer.trim()) {
      updateData.answer = body.answer.trim();
    }
    if (typeof body.order === "number") {
      updateData.order = body.order;
    }
    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const template = await prisma.faqTemplate.update({
      where: { id },
      data: updateData,
    });

    revalidateTag("faq-templates", "default");

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating FAQ template:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al actualizar plantilla FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { id } = await params;

    const existing = await prisma.faqTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    await prisma.faqTemplate.delete({ where: { id } });

    revalidateTag("faq-templates", "default");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ template:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al eliminar plantilla FAQ" },
      { status: 500 }
    );
  }
}
