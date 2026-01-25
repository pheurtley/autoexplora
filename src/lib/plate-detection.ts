import type { PlateRegion } from "./cloudinary";
import { detectPlatesWithYolo } from "./yolo-plate-detector";

/**
 * Plate detection methods available
 * - none: No plate detection, only watermark
 * - plate-recognizer: Use Plate Recognizer API (requires API token)
 * - yolo: Use YOLO ONNX model for local detection (no API needed)
 */
export type PlateDetectionMethod = "none" | "plate-recognizer" | "yolo";

/**
 * Get the configured plate detection method from environment
 */
export function getPlateDetectionMethod(): PlateDetectionMethod {
  const method = process.env.PLATE_DETECTION_METHOD as PlateDetectionMethod;
  const validMethods: PlateDetectionMethod[] = ["none", "plate-recognizer", "yolo"];

  if (method && validMethods.includes(method)) {
    return method;
  }

  // Default to plate-recognizer (works in serverless), fallback to yolo for local dev
  if (process.env.PLATE_RECOGNIZER_API_TOKEN) {
    return "plate-recognizer";
  }
  return "yolo";
}

/**
 * Main function to detect license plates using the configured method
 * Falls back to plate-recognizer if YOLO fails (e.g., in serverless environments)
 */
export async function detectLicensePlates(
  imageBuffer: Buffer,
  imageWidth?: number,
  imageHeight?: number
): Promise<PlateRegion[]> {
  const method = getPlateDetectionMethod();
  console.log("[PlateDetection] Using method:", method, "Image:", imageWidth, "x", imageHeight);

  let regions: PlateRegion[];

  switch (method) {
    case "none":
      regions = [];
      break;

    case "plate-recognizer":
      regions = await detectWithPlateRecognizer(imageBuffer);
      break;

    case "yolo":
      regions = await detectPlatesWithYolo(imageBuffer);
      // Fallback to plate-recognizer if YOLO returned empty (serverless environment)
      if (regions.length === 0 && process.env.PLATE_RECOGNIZER_API_TOKEN) {
        console.log("[PlateDetection] YOLO returned empty, trying plate-recognizer fallback");
        regions = await detectWithPlateRecognizer(imageBuffer);
      }
      break;

    default:
      regions = [];
  }

  console.log("[PlateDetection] Regions found:", regions.length, regions);
  return regions;
}

// ============================================================================
// Method 1: Plate Recognizer API (Paid, very accurate)
// ============================================================================

interface PlateRecognizerResult {
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
  plate: string;
  score: number;
}

interface PlateRecognizerResponse {
  results: PlateRecognizerResult[];
}

/**
 * Detect license plates using Plate Recognizer API
 * https://platerecognizer.com/
 * Free tier: 2,500 lookups/month
 * Includes retry logic for rate limiting (429 errors)
 */
async function detectWithPlateRecognizer(
  imageBuffer: Buffer,
  retryCount = 0
): Promise<PlateRegion[]> {
  const MAX_RETRIES = 3;
  const apiToken = process.env.PLATE_RECOGNIZER_API_TOKEN;

  if (!apiToken) {
    console.warn("[PlateRecognizer] API token not configured");
    return [];
  }

  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upload: base64Image,
        regions: ["cl"], // Chile
        config: {
          mode: "fast",
        },
      }),
    });

    // Handle rate limiting with retry
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.log(`[PlateRecognizer] Rate limited, retrying in ${waitTime}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return detectWithPlateRecognizer(imageBuffer, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PlateRecognizer] API error:", response.status, errorText);
      return [];
    }

    const data: PlateRecognizerResponse = await response.json();

    const plateRegions: PlateRegion[] = data.results
      .filter((result) => result.score > 0.5)
      .map((result) => {
        const padding = 10;
        return {
          xmin: Math.max(0, result.box.xmin - padding),
          ymin: Math.max(0, result.box.ymin - padding),
          xmax: result.box.xmax + padding,
          ymax: result.box.ymax + padding,
        };
      });

    console.log("[PlateRecognizer] Detected", plateRegions.length, "plates");
    return plateRegions;
  } catch (error) {
    console.error("[PlateRecognizer] Error:", error);
    return [];
  }
}
