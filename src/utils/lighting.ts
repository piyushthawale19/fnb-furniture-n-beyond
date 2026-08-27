/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

export interface LightEstimation {
  intensity: number;      // Light intensity factor
  color: THREE.Color;     // Estimated ambient tint
}

/**
 * Periodically samples the camera feed to estimate room illumination and tinting.
 * 
 * @param video Element streaming the real camera feed
 * @returns Estimated light factors or fallback values
 */
export function estimateEnvironmentLighting(video: HTMLVideoElement): LightEstimation {
  const fallback: LightEstimation = {
    intensity: 1.0,
    color: new THREE.Color("#FFFFFF"),
  };

  if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
    return fallback;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback;

    // Draw tiny downscaled video frame to easily compute average color
    ctx.drawImage(video, 0, 0, 32, 32);
    const imgData = ctx.getImageData(0, 0, 32, 32);
    const data = imgData.data;

    let totalR = 0, totalG = 0, totalB = 0;
    const totalPixels = 32 * 32;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }

    const avgR = totalR / totalPixels;
    const avgG = totalG / totalPixels;
    const avgB = totalB / totalPixels;

    // Calculate perceived relative luminance
    // Standard formula: Y = 0.299R + 0.587G + 0.114B
    const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;

    // Map luminance to an optimal light range (0.6 to 1.6)
    const estimatedIntensity = Math.min(1.6, Math.max(0.6, luminance * 2.0));

    // Dynamic environmental tint
    const estimatedColor = new THREE.Color(avgR / 255, avgG / 255, avgB / 255);

    return {
      intensity: estimatedIntensity,
      color: estimatedColor,
    };
  } catch (err) {
    console.warn("Could not estimate room light parameters:", err);
    return fallback;
  }
}
