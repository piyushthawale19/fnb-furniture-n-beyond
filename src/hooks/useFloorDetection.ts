/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";

export type FloorDetectionStatus = "searching" | "detecting" | "locked" | "failed";

export function useFloorDetection() {
  const [status, setStatus] = useState<FloorDetectionStatus>("searching");
  const [instruction, setInstruction] = useState<string>("Move your phone slowly to detect the floor.");
  const [planeDetected, setPlaneDetected] = useState<boolean>(false);

  // Simulate premium floor scanning steps to align with camera motion
  const startScanning = useCallback(() => {
    setStatus("searching");
    setInstruction("Move your phone slowly to detect the floor.");
    setPlaneDetected(false);

    // After 1.5 seconds, transition to "detecting"
    const t1 = setTimeout(() => {
      setStatus("detecting");
      setInstruction("Scanning floor surfaces...");
    }, 1500);

    // After 3.5 seconds, lock the plane
    const t2 = setTimeout(() => {
      setStatus("locked");
      setInstruction("Floor detected. Tap anywhere to place your furniture.");
      setPlaneDetected(true);
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const resetDetection = useCallback(() => {
    startScanning();
  }, [startScanning]);

  useEffect(() => {
    const cleanup = startScanning();
    return cleanup;
  }, [startScanning]);

  return {
    status,
    instruction,
    planeDetected,
    resetDetection,
    setStatus,
    setInstruction,
  };
}
