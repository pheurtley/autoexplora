import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { dealerRegistrationSchema } from "@/lib/validations/dealer";
import { generateDealerSlug } from "@/lib/dealer";
import { cleanRut } from "@/lib/rut";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = dealerRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const cleanedRut = cleanRut(data.rut);

    // Check if RUT already exists
    const existingDealer = await prisma.dealer.findUnique({
      where: { rut: cleanedRut },
    });

    if (existingDealer) {
      return NextResponse.json(
        { error: "Ya existe una automotora registrada con este RUT" },
        { status: 400 }
      );
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.userEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = await generateDealerSlug(data.tradeName);

    // Hash password
    const hashedPassword = await bcrypt.hash(data.userPassword, 12);

    // Create dealer and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create dealer
      const dealer = await tx.dealer.create({
        data: {
          slug,
          businessName: data.businessName,
          tradeName: data.tradeName,
          rut: cleanedRut,
          type: data.type,
          email: data.email,
          phone: data.phone,
          whatsapp: data.whatsapp || null,
          website: data.website || null,
          address: data.address,
          regionId: data.regionId,
          comunaId: data.comunaId || null,
          logo: data.logo || null,
          logoPublicId: data.logoPublicId || null,
          banner: data.banner || null,
          bannerPublicId: data.bannerPublicId || null,
          description: data.description || null,
          status: "PENDING",
        },
      });

      // Create admin user linked to dealer
      const user = await tx.user.create({
        data: {
          name: data.userName,
          email: data.userEmail,
          password: hashedPassword,
          dealerId: dealer.id,
          dealerRole: "OWNER",
        },
      });

      return { dealer, user };
    });

    return NextResponse.json(
      {
        message: "Registro exitoso. Tu cuenta está pendiente de aprobación.",
        dealerId: result.dealer.id,
        dealerSlug: result.dealer.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in dealer registration:", error);
    return NextResponse.json(
      { error: "Error al registrar la automotora" },
      { status: 500 }
    );
  }
}
