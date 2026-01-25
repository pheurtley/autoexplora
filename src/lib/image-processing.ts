import sharp from "sharp";
import type { PlateRegion } from "./cloudinary";

/**
 * Process image: blur license plate regions and add watermark
 */
export async function processVehicleImage(
  imageBuffer: Buffer,
  plateRegions: PlateRegion[] = []
): Promise<Buffer> {
  console.log("[ImageProcessing] Starting processing with", plateRegions.length, "plate regions");

  let image = sharp(imageBuffer);

  // Get original image metadata
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 1920;
  const originalHeight = metadata.height || 1080;
  console.log("[ImageProcessing] Original size:", originalWidth, "x", originalHeight);

  // Calculate resize dimensions (max 1920x1080)
  let width = originalWidth;
  let height = originalHeight;
  let scaleRatio = 1;

  if (originalWidth > 1920 || originalHeight > 1080) {
    scaleRatio = Math.min(1920 / originalWidth, 1080 / originalHeight);
    width = Math.round(originalWidth * scaleRatio);
    height = Math.round(originalHeight * scaleRatio);
    image = image.resize(width, height, { fit: "fill" });
    console.log("[ImageProcessing] Resized to:", width, "x", height, "scale:", scaleRatio);
  }

  // Get the base image as buffer for compositing
  const baseBuffer = await image.toBuffer();
  image = sharp(baseBuffer);

  // Apply blur to plate regions
  if (plateRegions.length > 0) {
    // Create blur overlays for each plate region
    const composites: sharp.OverlayOptions[] = [];

    for (const region of plateRegions) {
      // Scale region coordinates if image was resized
      const scaledRegion = {
        xmin: Math.floor(region.xmin * scaleRatio),
        ymin: Math.floor(region.ymin * scaleRatio),
        xmax: Math.floor(region.xmax * scaleRatio),
        ymax: Math.floor(region.ymax * scaleRatio),
      };

      const regionWidth = Math.max(1, scaledRegion.xmax - scaledRegion.xmin);
      const regionHeight = Math.max(1, scaledRegion.ymax - scaledRegion.ymin);

      // Ensure region is within bounds
      const left = Math.max(0, Math.min(scaledRegion.xmin, width - regionWidth));
      const top = Math.max(0, Math.min(scaledRegion.ymin, height - regionHeight));

      const extractWidth = Math.floor(Math.min(regionWidth, width - left));
      const extractHeight = Math.floor(Math.min(regionHeight, height - top));

      // Skip if region is too small or invalid
      if (extractWidth < 5 || extractHeight < 5) {
        console.log("[ImageProcessing] Skipping small region:", extractWidth, "x", extractHeight);
        continue;
      }

      console.log("[ImageProcessing] Blurring region:", {
        original: region,
        scaled: scaledRegion,
        adjusted: { left: Math.floor(left), top: Math.floor(top), width: extractWidth, height: extractHeight }
      });

      try {
        // Extract the region and apply heavy Gaussian blur
        const blurredRegion = await sharp(baseBuffer)
          .extract({
            left: Math.floor(left),
            top: Math.floor(top),
            width: extractWidth,
            height: extractHeight,
          })
          // Apply heavy Gaussian blur (sigma 15-20 is very strong)
          .blur(20)
          .toBuffer();

        console.log("[ImageProcessing] Blurred region size:", blurredRegion.length, "bytes");

        composites.push({
          input: blurredRegion,
          left: Math.floor(left),
          top: Math.floor(top),
        });
      } catch (e) {
        console.error("[ImageProcessing] Error creating region:", e);
        // Continue with other regions
      }
    }

    if (composites.length > 0) {
      console.log("[ImageProcessing] Applying", composites.length, "blur regions");
      const blurredBuffer = await image.composite(composites).toBuffer();
      image = sharp(blurredBuffer);
    }
  }

  // Add watermark
  const watermarkText = "AutoExplora.cl";
  const fontSize = Math.max(16, Math.floor(width / 60)); // Responsive font size
  const padding = Math.floor(width / 80);

  // Create watermark SVG with shadow effect
  const watermarkSvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
        </filter>
      </defs>
      <text
        x="${width - padding}"
        y="${height - padding}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
        fill-opacity="0.7"
        text-anchor="end"
        filter="url(#shadow)"
      >${watermarkText}</text>
    </svg>
  `;

  // Composite watermark onto the already-blurred image
  image = image.composite([
    {
      input: Buffer.from(watermarkSvg),
      gravity: "southeast",
    },
  ]);

  // Output as JPEG with good quality
  const finalBuffer = await image.jpeg({ quality: 85 }).toBuffer();
  console.log("[ImageProcessing] Final output buffer size:", finalBuffer.length);
  return finalBuffer;
}

/**
 * Get image dimensions from buffer
 */
export async function getImageDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width || 1920,
    height: metadata.height || 1080,
  };
}
