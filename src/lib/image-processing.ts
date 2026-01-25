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

  // Get image metadata for positioning
  const metadata = await image.metadata();
  const width = metadata.width || 1920;
  const height = metadata.height || 1080;
  console.log("[ImageProcessing] Image size:", width, "x", height);

  // Resize if too large (max 1920x1080)
  if (width > 1920 || height > 1080) {
    image = image.resize(1920, 1080, { fit: "inside", withoutEnlargement: true });
  }

  // Apply blur to plate regions
  if (plateRegions.length > 0) {
    // Get the base image as buffer for compositing
    const baseBuffer = await image.toBuffer();
    image = sharp(baseBuffer);

    // Create blur overlays for each plate region
    const composites: sharp.OverlayOptions[] = [];

    for (const region of plateRegions) {
      const regionWidth = Math.max(1, region.xmax - region.xmin);
      const regionHeight = Math.max(1, region.ymax - region.ymin);

      // Ensure region is within bounds
      const left = Math.max(0, Math.min(region.xmin, width - regionWidth));
      const top = Math.max(0, Math.min(region.ymin, height - regionHeight));

      const extractWidth = Math.floor(Math.min(regionWidth, width - left));
      const extractHeight = Math.floor(Math.min(regionHeight, height - top));

      console.log("[ImageProcessing] Blurring region:", {
        original: region,
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

        console.log("[ImageProcessing] Blurred region size:", blurredRegion.length, "bytes, position:", left, top);

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
      // Apply blur composites and convert to buffer immediately
      const blurredBuffer = await image.composite(composites).toBuffer();
      image = sharp(blurredBuffer);
      console.log("[ImageProcessing] Blur applied, buffer size:", blurredBuffer.length);
    } else {
      console.log("[ImageProcessing] No blur composites created");
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
