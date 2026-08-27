/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from "react";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setError("Web camera APIs are not supported on this browser.");
      return null;
    }

    try {
      // Prioritize environment-facing (rear) camera for placing furniture
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setPermissionGranted(true);
      return mediaStream;
    } catch (err: any) {
      console.error("Camera connection failed:", err);
      setPermissionGranted(false);
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission is required. Please grant camera access in settings.");
      } else {
        setError("Could not activate camera feed. Ensure another app is not using it.");
      }
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    error,
    permissionGranted,
    startCamera,
    stopCamera,
  };
}
