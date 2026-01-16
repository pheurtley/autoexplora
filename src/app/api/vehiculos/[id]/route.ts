import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { publishVehicleSchema } from "@/lib/validations";
import { VehicleType, VehicleCategory, VehicleCondition, FuelType, Transmission } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/vehiculos/[id] - Obtener un vehículo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: true,
        model: true,
        region: true,
        comuna: true,
        images: { orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, image: true } },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Error al obtener el vehículo" },
      { status: 500 }
    );
  }
}

// PATCH /api/vehiculos/[id] - Actualizar vehículo (status, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que el vehículo pertenece al usuario
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para editar este vehículo" },
        { status: 403 }
      );
    }

    // Campos permitidos para actualizar
    const allowedFields = ["status", "title", "description", "price", "negotiable"];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ vehicle: updatedVehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Error al actualizar el vehículo" },
      { status: 500 }
    );
  }
}

// PUT /api/vehiculos/[id] - Actualizar vehículo completo
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que el vehículo pertenece al usuario
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (existingVehicle.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para editar este vehículo" },
        { status: 403 }
      );
    }

    // Validar datos con Zod
    const validation = publishVehicleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verificar que la marca existe
    const brand = await prisma.brand.findUnique({
      where: { id: data.brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Marca no válida" },
        { status: 400 }
      );
    }

    // Verificar que el modelo pertenece a la marca
    const model = await prisma.model.findFirst({
      where: {
        id: data.modelId,
        brandId: data.brandId,
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Modelo no válido para esta marca" },
        { status: 400 }
      );
    }

    // Verificar que la región existe
    const region = await prisma.region.findUnique({
      where: { id: data.regionId },
    });

    if (!region) {
      return NextResponse.json(
        { error: "Región no válida" },
        { status: 400 }
      );
    }

    // Verificar comuna si se proporciona
    if (data.comunaId) {
      const comuna = await prisma.comuna.findFirst({
        where: {
          id: data.comunaId,
          regionId: data.regionId,
        },
      });

      if (!comuna) {
        return NextResponse.json(
          { error: "Comuna no válida para esta región" },
          { status: 400 }
        );
      }
    }

    // Actualizar vehículo e imágenes en una transacción
    const updatedVehicle = await prisma.$transaction(async (tx) => {
      // Actualizar datos del vehículo
      const vehicle = await tx.vehicle.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          negotiable: data.negotiable,
          vehicleType: data.vehicleType as VehicleType,
          category: data.category as VehicleCategory,
          condition: data.condition as VehicleCondition,
          brandId: data.brandId,
          modelId: data.modelId,
          year: data.year,
          mileage: data.mileage,
          fuelType: data.fuelType as FuelType,
          transmission: data.transmission as Transmission,
          engineSize: data.engineSize,
          color: data.color,
          doors: data.doors,
          regionId: data.regionId,
          comunaId: data.comunaId || null,
          contactPhone: data.contactPhone,
          contactWhatsApp: data.contactWhatsApp,
          showPhone: data.showPhone,
        },
      });

      // Manejar imágenes: obtener IDs actuales
      const currentImages = await tx.vehicleImage.findMany({
        where: { vehicleId: id },
        select: { id: true, publicId: true },
      });

      const currentImageIds = currentImages.map((img) => img.id);
      const newImageIds = data.images
        .filter((img) => img.id && !img.id.startsWith("temp-"))
        .map((img) => img.id);

      // Eliminar imágenes que ya no están
      const imagesToDelete = currentImageIds.filter(
        (imgId) => !newImageIds.includes(imgId)
      );

      if (imagesToDelete.length > 0) {
        await tx.vehicleImage.deleteMany({
          where: { id: { in: imagesToDelete } },
        });
      }

      // Actualizar o crear imágenes
      for (const img of data.images) {
        if (img.id && currentImageIds.includes(img.id)) {
          // Actualizar imagen existente
          await tx.vehicleImage.update({
            where: { id: img.id },
            data: {
              isPrimary: img.isPrimary,
              order: img.order,
            },
          });
        } else {
          // Crear nueva imagen
          await tx.vehicleImage.create({
            data: {
              url: img.url,
              publicId: img.publicId,
              isPrimary: img.isPrimary,
              order: img.order,
              vehicleId: id,
            },
          });
        }
      }

      return vehicle;
    });

    // Obtener vehículo actualizado con relaciones
    const vehicleWithRelations = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true, slug: true } },
        model: { select: { name: true, slug: true } },
        region: { select: { name: true } },
        images: {
          select: { id: true, url: true, isPrimary: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      vehicle: vehicleWithRelations,
      message: "Vehículo actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Error al actualizar el vehículo" },
      { status: 500 }
    );
  }
}

// DELETE /api/vehiculos/[id] - Eliminar vehículo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que el vehículo pertenece al usuario
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este vehículo" },
        { status: 403 }
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Vehículo eliminado" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Error al eliminar el vehículo" },
      { status: 500 }
    );
  }
}
