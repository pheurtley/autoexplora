import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { detectLicensePlates } from "@/lib/plate-detection";
import { processVehicleImage, getImageDimensions } from "@/lib/image-processing";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para subir imágenes" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;
    const skipProcessing = formData.get("skipProcessing") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de archivo no permitido. Usa: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSizeBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `El archivo excede el tamaño máximo de ${MAX_IMAGE_SIZE_MB}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    let platesDetected = 0;

    // Process vehicle images: detect plates and add watermark
    // Default folder is "vehicles", so process if folder is null/undefined or "vehicles"
    const isVehicleImage = !folder || folder === "vehicles";
    console.log("[Upload] Processing image:", { folder, isVehicleImage, skipProcessing });

    if (!skipProcessing && isVehicleImage) {
      // Get image dimensions for plate detection
      const dimensions = await getImageDimensions(buffer);
      console.log("[Upload] Image dimensions:", dimensions);

      // Detect license plates
      const plateRegions = await detectLicensePlates(
        buffer,
        dimensions.width,
        dimensions.height
      );
      platesDetected = plateRegions.length;
      console.log("[Upload] Plate regions detected:", plateRegions);

      // Process image: blur plates and add watermark
      const processedBuffer = await processVehicleImage(buffer, plateRegions);
      buffer = processedBuffer;
      console.log("[Upload] Image processed, buffer size:", buffer.length);
    }

    // Upload processed image to Cloudinary
    const result = await uploadToCloudinary(buffer, folder || "vehicles");

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      platesDetected,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
