/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WebXRSupport {
  isSupported: boolean;
  reason?: string;
}

/**
 * Checks if WebXR with immersive-ar mode is supported by the device and browser.
 */
export async function checkWebXRSupport(): Promise<WebXRSupport> {
  if (typeof window === "undefined" || !navigator.xr) {
    return {
      isSupported: false,
      reason: "WebXR is not supported on this browser or device. Try using Android Chrome or iOS WebXR viewer.",
    };
  }

  try {
    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    if (isSupported) {
      return { isSupported: true };
    } else {
      return {
        isSupported: false,
        reason: "Immersive AR session is not supported on this device.",
      };
    }
  } catch (err) {
    return {
      isSupported: false,
      reason: err instanceof Error ? err.message : "Error checking WebXR support.",
    };
  }
}

/**
 * Request a WebXR session with immersive-ar and hit-test features.
 */
export async function requestARSession(): Promise<any> {
  if (typeof window === "undefined" || !navigator.xr) {
    throw new Error("WebXR is not available.");
  }

  // Request standard immersive-ar session with hit-test feature
  return await navigator.xr.requestSession("immersive-ar", {
    requiredFeatures: ["local-floor", "hit-test"],
    optionalFeatures: ["dom-overlay"],
    domOverlay: { root: document.body },
  } as any);
}
