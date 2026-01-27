import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://autoexplora.cl";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=Token de verificación no proporcionado`
      );
    }

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=Token de verificación inválido`
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(
        `${APP_URL}/login?error=El enlace de verificación ha expirado`
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=Usuario no encontrado`
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      // Delete the token since it's no longer needed
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(
        `${APP_URL}/login?success=Tu email ya estaba verificado. Inicia sesión.`
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.redirect(
      `${APP_URL}/login?success=Email verificado exitosamente. Ya puedes iniciar sesión.`
    );
  } catch (error) {
    console.error("Error in verify-email:", error);
    return NextResponse.redirect(
      `${APP_URL}/login?error=Error al verificar email`
    );
  }
}
