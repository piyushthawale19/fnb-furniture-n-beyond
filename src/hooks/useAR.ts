/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { checkWebXRSupport } from "../lib/webxr";

export type ARMode = "none" | "webxr" | "quicklook" | "sceneviewer" | "3d_viewer";

export interface ARState {
  isSupported: boolean;
  mode: ARMode;
  loading: boolean;
  loadingProgress: number;
  loadingText: string;
  errorMessage: string | null;
  scale: number; // 0.3 (30%) to 3.0 (300%)
  rotation: number; // in radians
  position: [number, number, number];
  cameraStreamActive: boolean;
}

export function useAR(productName: string, glbUrl?: string, usdzUrl?: string) {
  const [state, setState] = useState<ARState>({
    isSupported: true,
    mode: "none",
    loading: false,
    loadingProgress: 0,
    loadingText: "Initializing AR...",
    errorMessage: null,
    scale: 1.0,
    rotation: 0,
    position: [0, 0, 0],
    cameraStreamActive: false,
  });

  // Detect which mode to run based on browser userAgent and capabilities
  const detectBestARMode = useCallback(async (): Promise<ARMode> => {
    if (typeof window === "undefined") return "none";

    const ua = navigator.userAgent;
    const isIOS = /ipad|iphone|ipod/i.test(ua) || 
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(ua);

    // 1. If iOS, and USDZ is available, prioritize native Apple Quick Look
    if (isIOS && usdzUrl) {
      return "quicklook";
    }

    // 2. If Android and GLB is available, check for WebXR first, then fall back to Google Scene Viewer
    if (isAndroid && glbUrl) {
      const xrSupport = await checkWebXRSupport();
      if (xrSupport.isSupported) {
        return "webxr";
      }
      return "sceneviewer";
    }

    // 3. Fallback for Desktop or any mobile without native AR files:
    // Interactive 3D Viewer with Optional Camera Background (Simulated Web AR)
    return "3d_viewer";
  }, [glbUrl, usdzUrl]);

  // Start AR Experience
  const startAR = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      loadingProgress: 10,
      loadingText: "Scanning room...",
      errorMessage: null,
    }));

    try {
      const bestMode = await detectBestARMode();
      
      // Update loading status
      setState((prev) => ({
        ...prev,
        loadingText: "Preparing your luxury furniture...",
        loadingProgress: 40,
      }));

      // Simulate a small room scanning delay for extreme production-ready polish
      await new Promise((r) => setTimeout(r, 800));

      setState((prev) => ({
        ...prev,
        mode: bestMode,
        loadingProgress: 100,
        loading: false,
      }));

      // Request camera stream if in standard 3D simulated AR viewer to overlay the model on video
      if (bestMode === "3d_viewer") {
        try {
          setState((prev) => ({ ...prev, loadingText: "Enabling camera feed..." }));
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          
          // Store stream to release later
          (window as any)._arCameraStream = stream;
          setState((prev) => ({ ...prev, cameraStreamActive: true }));
        } catch (camErr) {
          console.warn("Camera access denied or unavailable, continuing in offline 3D mode:", camErr);
          // Don't crash, let user view interactive 3D with elegant studio backdrop
        }
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        errorMessage: err instanceof Error ? err.message : "Failed to initiate AR view.",
      }));
    }
  }, [detectBestARMode]);

  // Stop AR / Exit
  const stopAR = useCallback(() => {
    // Release camera stream if active
    const stream = (window as any)._arCameraStream;
    if (stream) {
      stream.getTracks().forEach((track: any) => track.stop());
      (window as any)._arCameraStream = null;
    }

    setState((prev) => ({
      ...prev,
      mode: "none",
      cameraStreamActive: false,
      scale: 1.0,
      rotation: 0,
      position: [0, 0, 0],
      errorMessage: null,
    }));
  }, []);

  // Gesture Controls (Rotation, Scale, Zoom)
  const rotateLeft = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rotation: prev.rotation - Math.PI / 8,
    }));
  }, []);

  const rotateRight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rotation: prev.rotation + Math.PI / 8,
    }));
  }, []);

  const scaleUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.min(3.0, prev.scale + 0.15),
    }));
  }, []);

  const scaleDown = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.3, prev.scale - 0.15),
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: 1.0,
      rotation: 0,
      position: [0, 0, 0],
    }));
  }, []);

  return {
    state,
    setState,
    startAR,
    stopAR,
    rotateLeft,
    rotateRight,
    scaleUp,
    scaleDown,
    resetTransform,
  };
}
