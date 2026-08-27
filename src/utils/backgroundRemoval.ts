/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Removes the background of a standard e-commerce studio photo (usually solid white/grey/cream)
 * by analyzing pixel colors and generating an alpha mask.
 * 
 * @param imageUrl Src of the image
 * @param threshold Color distance threshold (0 to 255) for background detection
 * @returns Promise resolving to a transparent background base64 Data URI
 */
export async function removeProductBackground(imageUrl: string, threshold: number = 22): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get 2D context");
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample the background color from the four corners of the image
        const samples = [
          getPixelColor(data, 0, 0, canvas.width),
          getPixelColor(data, canvas.width - 1, 0, canvas.width),
          getPixelColor(data, 0, canvas.height - 1, canvas.width),
          getPixelColor(data, canvas.width - 1, canvas.height - 1, canvas.width),
        ];

        // Average background color
        const avgBg = {
          r: samples.reduce((acc, c) => acc + c.r, 0) / samples.length,
          g: samples.reduce((acc, c) => acc + c.g, 0) / samples.length,
          b: samples.reduce((acc, c) => acc + c.b, 0) / samples.length,
        };

        // Scan pixels and convert matchers to transparent alpha
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean color distance
          const dist = Math.sqrt(
            Math.pow(r - avgBg.r, 2) +
            Math.pow(g - avgBg.g, 2) +
            Math.pow(b - avgBg.b, 2)
          );

          if (dist < threshold) {
            // Apply transparency transition near the threshold edges (anti-aliasing)
            if (dist > threshold - 8) {
              const alphaFactor = (dist - (threshold - 8)) / 8;
              data[i + 3] = Math.round(alphaFactor * 255);
            } else {
              data[i + 3] = 0; // Fully transparent
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

function getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number) {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };
}
