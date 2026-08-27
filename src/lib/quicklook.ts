/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds the iOS Quick Look URL for a USDZ file.
 * 
 * @param usdzUrl The absolute or relative URL to the USDZ model
 */
export function getQuickLookUrl(usdzUrl: string): string {
  const absoluteUsdzUrl = usdzUrl.startsWith("http") 
    ? usdzUrl 
    : `${window.location.origin}${usdzUrl.startsWith("/") ? "" : "/"}${usdzUrl}`;

  return absoluteUsdzUrl;
}

/**
 * Launches iOS Quick Look AR natively by dynamically creating and clicking an anchor link.
 */
export function launchQuickLook(usdzUrl: string, previewImageUrl?: string): boolean {
  if (typeof window === "undefined") return false;

  const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    
  if (!isIOS) return false;

  const link = document.createElement("a");
  link.setAttribute("rel", "ar");
  
  const href = getQuickLookUrl(usdzUrl);
  link.setAttribute("href", href);

  // If a preview image is provided, place it inside the anchor for a cleaner load
  if (previewImageUrl) {
    const img = document.createElement("img");
    img.setAttribute("src", previewImageUrl);
    img.setAttribute("alt", "AR Preview");
    link.appendChild(img);
  }

  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);

  return true;
}
