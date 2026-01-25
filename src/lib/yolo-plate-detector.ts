import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import path from 'path';
import type { PlateRegion } from './cloudinary';

// Model configuration
const MODEL_INPUT_SIZE = 640;
const CONFIDENCE_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;

let session: ort.InferenceSession | null = null;
let sessionInitialized = false;

/**
 * Initialize ONNX Runtime session with the YOLO model
 */
async function initializeModel(): Promise<ort.InferenceSession | null> {
  if (sessionInitialized) {
    return session;
  }

  try {
    const modelPath = path.join(process.cwd(), 'models', 'license-plate-detection.onnx');
    console.log('[YOLO] Loading model from:', modelPath);

    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpu'],
    });

    sessionInitialized = true;
    console.log('[YOLO] Model loaded successfully');
    console.log('[YOLO] Input names:', session.inputNames);
    console.log('[YOLO] Output names:', session.outputNames);

    return session;
  } catch (error) {
    console.error('[YOLO] Failed to load model:', error);
    sessionInitialized = true; // Mark as initialized to avoid retrying
    return null;
  }
}

/**
 * Preprocess image for YOLO model
 * - Resize to 640x640 with letterboxing
 * - Convert to RGB float32 normalized [0-1]
 * - Convert to NCHW format (batch, channels, height, width)
 */
async function preprocessImage(imageBuffer: Buffer): Promise<{
  tensor: ort.Tensor;
  originalWidth: number;
  originalHeight: number;
  scale: number;
  padX: number;
  padY: number;
}> {
  // Get original dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const originalWidth = metadata.width || 640;
  const originalHeight = metadata.height || 640;

  // Calculate scaling and padding for letterbox
  const scale = Math.min(MODEL_INPUT_SIZE / originalWidth, MODEL_INPUT_SIZE / originalHeight);
  const newWidth = Math.round(originalWidth * scale);
  const newHeight = Math.round(originalHeight * scale);
  const padX = Math.round((MODEL_INPUT_SIZE - newWidth) / 2);
  const padY = Math.round((MODEL_INPUT_SIZE - newHeight) / 2);

  // Resize with letterboxing (gray padding)
  const resizedBuffer = await sharp(imageBuffer)
    .resize(newWidth, newHeight, { fit: 'fill' })
    .extend({
      top: padY,
      bottom: MODEL_INPUT_SIZE - newHeight - padY,
      left: padX,
      right: MODEL_INPUT_SIZE - newWidth - padX,
      background: { r: 114, g: 114, b: 114 }, // Gray padding (YOLO standard)
    })
    .removeAlpha()
    .raw()
    .toBuffer();

  // Convert to float32 normalized [0-1] in NCHW format
  const float32Data = new Float32Array(3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);

  for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
    // RGB values normalized to 0-1
    float32Data[i] = resizedBuffer[i * 3] / 255.0; // R channel
    float32Data[MODEL_INPUT_SIZE * MODEL_INPUT_SIZE + i] = resizedBuffer[i * 3 + 1] / 255.0; // G channel
    float32Data[2 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE + i] = resizedBuffer[i * 3 + 2] / 255.0; // B channel
  }

  const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);

  return { tensor, originalWidth, originalHeight, scale, padX, padY };
}

/**
 * Apply Non-Maximum Suppression to filter overlapping boxes
 */
function nonMaxSuppression(
  boxes: Array<{ x: number; y: number; w: number; h: number; confidence: number }>,
  iouThreshold: number
): Array<{ x: number; y: number; w: number; h: number; confidence: number }> {
  if (boxes.length === 0) return [];

  // Sort by confidence (descending)
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const selected: typeof boxes = [];

  while (sorted.length > 0) {
    const current = sorted.shift()!;
    selected.push(current);

    // Remove boxes with high IoU
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (calculateIoU(current, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return selected;
}

/**
 * Calculate Intersection over Union between two boxes
 */
function calculateIoU(
  box1: { x: number; y: number; w: number; h: number },
  box2: { x: number; y: number; w: number; h: number }
): number {
  const x1 = Math.max(box1.x - box1.w / 2, box2.x - box2.w / 2);
  const y1 = Math.max(box1.y - box1.h / 2, box2.y - box2.h / 2);
  const x2 = Math.min(box1.x + box1.w / 2, box2.x + box2.w / 2);
  const y2 = Math.min(box1.y + box1.h / 2, box2.y + box2.h / 2);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.w * box1.h;
  const area2 = box2.w * box2.h;
  const union = area1 + area2 - intersection;

  return intersection / union;
}

/**
 * Parse YOLO output tensor to get bounding boxes
 * YOLOv8/v11 output format: [1, 5, 8400] where 5 = [x, y, w, h, confidence]
 */
function parseYoloOutput(
  output: ort.Tensor,
  scale: number,
  padX: number,
  padY: number,
  originalWidth: number,
  originalHeight: number
): PlateRegion[] {
  const data = output.data as Float32Array;
  const [, numFeatures, numBoxes] = output.dims;

  console.log('[YOLO] Output shape:', output.dims);

  const boxes: Array<{ x: number; y: number; w: number; h: number; confidence: number }> = [];

  // YOLOv8/v11 output is transposed: [1, 5, 8400]
  // Features: x, y, w, h, class_confidence
  for (let i = 0; i < numBoxes; i++) {
    const x = data[0 * numBoxes + i];
    const y = data[1 * numBoxes + i];
    const w = data[2 * numBoxes + i];
    const h = data[3 * numBoxes + i];
    const confidence = data[4 * numBoxes + i];

    if (confidence > CONFIDENCE_THRESHOLD) {
      boxes.push({ x, y, w, h, confidence });
    }
  }

  console.log('[YOLO] Boxes before NMS:', boxes.length);

  // Apply NMS
  const filteredBoxes = nonMaxSuppression(boxes, IOU_THRESHOLD);
  console.log('[YOLO] Boxes after NMS:', filteredBoxes.length);

  // Convert to original image coordinates
  const plateRegions: PlateRegion[] = filteredBoxes.map((box) => {
    // Remove padding and scale back to original size
    const x = (box.x - padX) / scale;
    const y = (box.y - padY) / scale;
    const w = box.w / scale;
    const h = box.h / scale;

    // Convert from center format to corner format
    const xmin = Math.max(0, Math.floor(x - w / 2));
    const ymin = Math.max(0, Math.floor(y - h / 2));
    const xmax = Math.min(originalWidth, Math.floor(x + w / 2));
    const ymax = Math.min(originalHeight, Math.floor(y + h / 2));

    // Add padding for blur
    const padding = Math.max(5, Math.floor(w * 0.1));

    return {
      xmin: Math.max(0, xmin - padding),
      ymin: Math.max(0, ymin - padding),
      xmax: Math.min(originalWidth, xmax + padding),
      ymax: Math.min(originalHeight, ymax + padding),
    };
  });

  return plateRegions;
}

/**
 * Detect license plates in an image using YOLO ONNX model
 */
export async function detectPlatesWithYolo(imageBuffer: Buffer): Promise<PlateRegion[]> {
  try {
    const model = await initializeModel();
    if (!model) {
      console.warn('[YOLO] Model not available');
      return [];
    }

    // Preprocess image
    const { tensor, originalWidth, originalHeight, scale, padX, padY } = await preprocessImage(imageBuffer);
    console.log('[YOLO] Image preprocessed:', originalWidth, 'x', originalHeight, '-> 640x640');

    // Run inference
    const inputName = model.inputNames[0];
    const feeds: Record<string, ort.Tensor> = { [inputName]: tensor };

    const startTime = Date.now();
    const results = await model.run(feeds);
    const inferenceTime = Date.now() - startTime;
    console.log('[YOLO] Inference time:', inferenceTime, 'ms');

    // Get output tensor
    const outputName = model.outputNames[0];
    const output = results[outputName];

    // Parse results
    const plateRegions = parseYoloOutput(output, scale, padX, padY, originalWidth, originalHeight);
    console.log('[YOLO] Plates detected:', plateRegions.length);

    return plateRegions;
  } catch (error) {
    console.error('[YOLO] Detection error:', error);
    return [];
  }
}
