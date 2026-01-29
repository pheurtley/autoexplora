import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get("pageType");

    if (!pageType || !["brand", "model", "region"].includes(pageType)) {
      return NextResponse.json(
        { error: "pageType es requerido (brand, model, region)" },
        { status: 400 }
      );
    }

    const templates = await prisma.faqTemplate.findMany({
      where: { pageType },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching FAQ templates:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al obtener plantillas FAQ" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    await requireAdmin(session);

    const body = await request.json();
    const { pageType, question, answer, order } = body;

    if (!pageType || !["brand", "model", "region"].includes(pageType)) {
      return NextResponse.json(
        { error: "pageType es requerido (brand, model, region)" },
        { status: 400 }
      );
    }

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "question y answer son requeridos" },
        { status: 400 }
      );
    }

    const template = await prisma.faqTemplate.create({
      data: {
        pageType,
        question: question.trim(),
        answer: answer.trim(),
        order: typeof order === "number" ? order : 0,
      },
    });

    revalidateTag("faq-templates", "default");

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ template:", error);
    if (error instanceof Error) {
      if (
        error.name === "UnauthorizedError" ||
        error.name === "ForbiddenError"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Error al crear plantilla FAQ" },
      { status: 500 }
    );
  }
}
