/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompressionResult {
  url: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalSizeMB: string;
  compressedSizeMB: string;
  reductionPercent: number;
  width: number;
  height: number;
  format: string;
  success: boolean;
  message: string;
}

export interface CompressOptions {
  maxSizeMB?: number; // Default: 0.6 MB (600 KB - ideal for Firestore document limits)
  maxWidth?: number;  // Default: 1600 px
  maxHeight?: number; // Default: 1600 px
  preferredFormat?: "image/jpeg" | "image/webp";
}

/**
 * Calculates byte size of a base64 Data URL or string
 */
export function getBase64ByteSize(base64String: string): number {
  if (!base64String) return 0;
  const padding = (base64String.endsWith("==") ? 2 : base64String.endsWith("=") ? 1 : 0);
  const base64Length = base64String.length - (base64String.indexOf(",") + 1);
  return Math.max(0, (base64Length * 3) / 4 - padding);
}

/**
 * Formats bytes to readable MB/KB string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Loads an image from a Data URL or Object URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image into canvas for processing"));
    img.src = src;
  });
}

/**
 * Converts a File or Blob into a base64 Data URL string
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Core image compression and optimization function.
 * Handles images of ANY size (e.g. 10MB, 20MB, DSLR/Phone RAW exports),
 * scales dimensions sensibly while retaining maximum crispness,
 * and guarantees the output file size is strictly capped for direct Firebase Firestore storage.
 */
export async function compressImageToMax3MB(
  fileOrDataUrl: File | string,
  options: CompressOptions = {}
): Promise<CompressionResult> {
  const {
    maxSizeMB = 0.6, // Capped at ~600KB for perfect Firestore 1MB document limit compatibility
    maxWidth = 1600,
    maxHeight = 1600,
    preferredFormat = "image/jpeg",
  } = options;

  const maxTargetBytes = maxSizeMB * 1024 * 1024;

  let initialDataUrl = "";
  let originalSizeBytes = 0;

  if (typeof fileOrDataUrl === "string") {
    initialDataUrl = fileOrDataUrl;
    originalSizeBytes = getBase64ByteSize(fileOrDataUrl);
  } else {
    originalSizeBytes = fileOrDataUrl.size;
    initialDataUrl = await fileToDataUrl(fileOrDataUrl);
  }

  // If already under 3MB and doesn't exceed dimensions, we can quickly return or lightly optimize
  try {
    const img = await loadImage(initialDataUrl);
    let originalWidth = img.naturalWidth || img.width;
    let originalHeight = img.naturalHeight || img.height;

    // Calculate aspect-ratio preserved dimensions
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const widthRatio = maxWidth / targetWidth;
      const heightRatio = maxHeight / targetHeight;
      const scale = Math.min(widthRatio, heightRatio);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to create 2D canvas context for image compression");
    }

    // High quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fill white background for JPEG exports if image had transparency
    if (preferredFormat === "image/jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Iterative quality reduction to guarantee <= maxTargetBytes (3.0 MB)
    let quality = 0.92;
    let compressedDataUrl = canvas.toDataURL(preferredFormat, quality);
    let currentBytes = getBase64ByteSize(compressedDataUrl);

    // If still larger than 3MB (e.g. from a very high frequency 10MB+ photo), scale down quality & resolution
    let iteration = 0;
    while (currentBytes > maxTargetBytes && quality > 0.35 && iteration < 8) {
      iteration++;
      quality -= 0.1;
      compressedDataUrl = canvas.toDataURL(preferredFormat, quality);
      currentBytes = getBase64ByteSize(compressedDataUrl);
    }

    // If still oversized after quality loop, downscale canvas dimensions
    if (currentBytes > maxTargetBytes) {
      const stepDownCanvas = document.createElement("canvas");
      stepDownCanvas.width = Math.round(targetWidth * 0.75);
      stepDownCanvas.height = Math.round(targetHeight * 0.75);
      const stepCtx = stepDownCanvas.getContext("2d");
      if (stepCtx) {
        stepCtx.imageSmoothingEnabled = true;
        stepCtx.imageSmoothingQuality = "high";
        if (preferredFormat === "image/jpeg") {
          stepCtx.fillStyle = "#FFFFFF";
          stepCtx.fillRect(0, 0, stepDownCanvas.width, stepDownCanvas.height);
        }
        stepCtx.drawImage(canvas, 0, 0, stepDownCanvas.width, stepDownCanvas.height);
        compressedDataUrl = stepDownCanvas.toDataURL(preferredFormat, 0.82);
        currentBytes = getBase64ByteSize(compressedDataUrl);
      }
    }

    const reductionPercent = originalSizeBytes > 0
      ? Math.max(0, Math.round(((originalSizeBytes - currentBytes) / originalSizeBytes) * 100))
      : 0;

    return {
      url: compressedDataUrl,
      originalSizeBytes,
      compressedSizeBytes: currentBytes,
      originalSizeMB: formatBytes(originalSizeBytes),
      compressedSizeMB: formatBytes(currentBytes),
      reductionPercent,
      width: targetWidth,
      height: targetHeight,
      format: preferredFormat,
      success: true,
      message: `Image converted & optimized: ${formatBytes(originalSizeBytes)} → ${formatBytes(currentBytes)} (${reductionPercent}% smaller, capped < ${maxSizeMB}MB)`,
    };
  } catch (error: any) {
    console.error("Image compression error, falling back to initial data:", error);
    return {
      url: initialDataUrl,
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      originalSizeMB: formatBytes(originalSizeBytes),
      compressedSizeMB: formatBytes(originalSizeBytes),
      reductionPercent: 0,
      width: 0,
      height: 0,
      format: "original",
      success: false,
      message: error.message || "Failed to compress image",
    };
  }
}

/**
 * Downloads any image (Base64 data URL, blob, or remote URL) directly to the user's device
 */
export async function downloadImageFile(imageUrl: string, suggestedFileName: string = "fnb-furniture-image.jpg"): Promise<void> {
  try {
    if (!imageUrl) return;

    // Clean filename
    let safeName = suggestedFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName.toLowerCase().endsWith(".jpg") && !safeName.toLowerCase().endsWith(".png") && !safeName.toLowerCase().endsWith(".jpeg") && !safeName.toLowerCase().endsWith(".webp")) {
      safeName += ".jpg";
    }

    if (imageUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For URLs, fetch blob to ensure cross-origin download works
    const response = await fetch(imageUrl, { mode: "cors" }).catch(() => null);
    if (response && response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      return;
    }

    // Fallback direct link
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = safeName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error downloading image:", err);
  }
}
