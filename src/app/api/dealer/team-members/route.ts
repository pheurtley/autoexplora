import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Get team members for assignment purposes
 * Any dealer team member can access this
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.dealerId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const members = await prisma.user.findMany({
      where: { dealerId: session.user.dealerId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        dealerRole: true,
      },
      orderBy: [
        { dealerRole: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros del equipo" },
      { status: 500 }
    );
  }
}
