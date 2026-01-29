/**
 * Client-side image preprocessing for fast uploads:
 * - Resize to max width 2000px (keep aspect ratio)
 * - Compress to WebP or JPEG (quality ~0.8)
 * - Keep original if already small
 */

const MAX_WIDTH = 2000;
const QUALITY = 0.8;
const SMALL_EDGE_THRESHOLD = 2000; // skip resize if both dimensions <= this

export interface PreprocessResult {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  wasResized: boolean;
  mimeType: string;
}

/**
 * Load image from file into an Image element.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Draw image to canvas with optional resize (max width MAX_WIDTH, keep aspect ratio).
 */
function drawToCanvas(
  img: HTMLImageElement,
  maxWidth: number = MAX_WIDTH
): { canvas: HTMLCanvasElement; width: number; height: number; wasResized: boolean } {
  let { width, height } = img;
  const wasResized =
    width > maxWidth || height > maxWidth || width > SMALL_EDGE_THRESHOLD || height > SMALL_EDGE_THRESHOLD;

  if (width > maxWidth || height > maxWidth) {
    if (width >= height) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    } else {
      width = Math.round((width * maxWidth) / height);
      height = maxWidth;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d not available');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height, wasResized };
}

/**
 * Preprocess image: resize if large, compress to WebP or JPEG.
 * Returns blob suitable for upload (File can be created via new File([blob], name, { type })).
 */
export async function preprocessImage(file: File): Promise<PreprocessResult> {
  const img = await loadImage(file);
  const { canvas, width, height, wasResized } = drawToCanvas(img);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  // Prefer WebP for smaller size; fallback to JPEG
  const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, QUALITY);
  });

  if (!blob) throw new Error('Failed to compress image');

  return {
    blob,
    width,
    height,
    originalWidth,
    originalHeight,
    wasResized,
    mimeType,
  };
}

/**
 * Get file extension for mime type.
 */
export function getExtensionForMime(mime: string): string {
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/jpeg') return 'jpg';
  return 'jpg';
}
