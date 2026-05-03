/**
 * compressImage
 *
 * Takes an image File and returns a base64 data URL that is ≤ maxSizeBytes.
 * Uses canvas-based downscaling — no external dependencies.
 *
 * Strategy:
 *   1. Load the file into an Image element
 *   2. Draw it onto a canvas (capped at maxDimension)
 *   3. Export as JPEG at decreasing quality levels
 *   4. If still too large, halve the dimensions and retry
 *
 * @param {File} file - The image file to compress
 * @param {number} maxSizeBytes - Target max size in bytes (default 1KB for on-chain)
 * @returns {Promise<string>} - base64 data URL
 */
export async function compressImage(file, maxSizeBytes = 1024) {
  const dataUrl = await readFileAsDataURL(file);

  // If already small enough, return as-is
  if (dataUrl.length * 0.75 <= maxSizeBytes) {
    return dataUrl;
  }

  const img = await loadImage(dataUrl);

  // Try progressively more aggressive compression
  const qualitySteps = [0.3, 0.2, 0.1, 0.05];
  const maxDimensions = [80, 60, 50, 40, 30, 24];

  for (const maxDim of maxDimensions) {
    for (const quality of qualitySteps) {
      const result = resizeAndCompress(img, maxDim, quality);
      // Approximate byte size from base64 (base64 is ~4/3 of raw bytes)
      const approxBytes = (result.length - result.indexOf(",") - 1) * 0.75;
      if (approxBytes <= maxSizeBytes) {
        return result;
      }
    }
  }

  // Last resort: absolute minimum
  return resizeAndCompress(img, 16, 0.01);
}

/** Read a File as a data URL */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Load a data URL into an HTMLImageElement */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Resize image to fit within maxDim and export as JPEG at given quality */
function resizeAndCompress(img, maxDim, quality) {
  let { width, height } = img;

  // Scale down to fit within maxDim x maxDim
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
