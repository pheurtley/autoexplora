import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { extractVariables } from "@/lib/template-interpolation";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const templates = await prisma.messageTemplate.findMany({
      where: { dealerId: session.user.dealerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Error al obtener plantillas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, channel, subject, content } = body;

    // Validate required fields
    if (!name || !channel || !content) {
      return NextResponse.json(
        { error: "Nombre, canal y contenido son requeridos" },
        { status: 400 }
      );
    }

    // Validate channel
    if (!["EMAIL", "WHATSAPP"].includes(channel)) {
      return NextResponse.json(
        { error: "Canal inválido" },
        { status: 400 }
      );
    }

    // Extract variables from content
    const variables = [
      ...extractVariables(content),
      ...(subject ? extractVariables(subject) : []),
    ];

    const template = await prisma.messageTemplate.create({
      data: {
        dealerId: session.user.dealerId,
        name: name.trim(),
        channel,
        subject: subject?.trim() || null,
        content: content.trim(),
        variables: [...new Set(variables)],
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Error al crear plantilla" },
      { status: 500 }
    );
  }
}
