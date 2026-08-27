/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds the Android Scene Viewer intent URL for a GLB file.
 * This launches Google Scene Viewer natively on Android devices.
 * 
 * @param glbUrl The absolute URL to the GLB model
 * @param title The name/title of the product
 * @param fallbackUrl Optional fallback page if Scene Viewer fails
 */
export function getSceneViewerUrl(glbUrl: string, title: string, fallbackUrl?: string): string {
  const absoluteGlbUrl = glbUrl.startsWith("http") 
    ? glbUrl 
    : `${window.location.origin}${glbUrl.startsWith("/") ? "" : "/"}${glbUrl}`;

  const currentUrl = fallbackUrl || window.location.href;

  // Google Scene Viewer intent format
  const params = new URLSearchParams({
    file: absoluteGlbUrl,
    mode: "ar_only", // "ar_only", "3d_only", or default
    title: title,
    resizable: "true",
  });

  return `intent://arvr.google.com/scene-viewer/1.0?${params.toString()}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end;`;
}

/**
 * Launches Android Scene Viewer.
 */
export function launchSceneViewer(glbUrl: string, title: string): boolean {
  if (typeof window === "undefined") return false;
  
  const isAndroid = /android/i.test(navigator.userAgent);
  if (!isAndroid) return false;

  const url = getSceneViewerUrl(glbUrl, title);
  window.location.href = url;
  return true;
}
