import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Si el email existe y no está verificado, recibirás un enlace de verificación",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "Este email ya está verificado",
      });
    }

    // Delete any existing verification tokens for this email
    await prisma.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Generate secure token
    const token = randomBytes(32).toString("hex");

    // Token expires in 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create verification token
    await prisma.emailVerificationToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
      },
    });

    // Send verification email
    const result = await sendVerificationEmail(
      normalizedEmail,
      token,
      user.name || undefined
    );

    if (!result.success) {
      console.error("Failed to send verification email:", result.error);
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      message: "Si el email existe y no está verificado, recibirás un enlace de verificación",
    });
  } catch (error) {
    console.error("Error in resend-verification:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
