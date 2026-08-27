/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { getFloorIntersectionPoint } from "../../utils/planeDetection";

interface GestureControllerProps {
  children: React.ReactNode;
  modelGroup: THREE.Group | null;
  camera: THREE.Camera | null;
  scale: number;
  rotation: number;
  position: [number, number, number];
  onUpdateTransform: (updates: {
    scale?: number;
    rotation?: number;
    position?: [number, number, number];
  }) => void;
  onDoubleTap: () => void;
}

export default function GestureController({
  children,
  modelGroup,
  camera,
  scale,
  rotation,
  position,
  onUpdateTransform,
  onDoubleTap,
}: GestureControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Touch gesture state persistence
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialRotation: 0,
    initialModelRotation: 0,
    isDragging: false,
    dragStartIntersection: new THREE.Vector3(),
    dragStartModelPos: new THREE.Vector3(),
    lastTapTime: 0,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Helper: Compute distance between two touch points
    const getTouchDistance = (t1: Touch, t2: Touch): number => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Helper: Compute angle between two touch points
    const getTouchAngle = (t1: Touch, t2: Touch): number => {
      return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!modelGroup || !camera) return;

      const rect = element.getBoundingClientRect();

      // Double tap detector
      if (e.touches.length === 1) {
        const now = Date.now();
        const delay = now - touchState.current.lastTapTime;
        if (delay < 300) {
          // Trigger double-tap centering
          onDoubleTap();
          touchState.current.lastTapTime = 0;
          e.preventDefault();
          return;
        }
        touchState.current.lastTapTime = now;
      }

      if (e.touches.length === 1) {
        // --- DRAGGING INTENT ---
        const touch = e.touches[0];
        const ndcX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        const intersection = getFloorIntersectionPoint(ndcX, ndcY, camera);
        if (intersection) {
          touchState.current.isDragging = true;
          touchState.current.dragStartIntersection.copy(intersection);
          touchState.current.dragStartModelPos.set(position[0], position[1], position[2]);
        }
      } else if (e.touches.length === 2) {
        // --- PINCH-TO-SCALE & ROTATE INTENT ---
        touchState.current.isDragging = false;
        const t1 = e.touches[0];
        const t2 = e.touches[1];

        touchState.current.initialDistance = getTouchDistance(t1, t2);
        touchState.current.initialScale = scale;
        
        touchState.current.initialRotation = getTouchAngle(t1, t2);
        touchState.current.initialModelRotation = rotation;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!modelGroup || !camera) return;

      const rect = element.getBoundingClientRect();

      if (e.touches.length === 1 && touchState.current.isDragging) {
        // Move object along horizontal floor plane
        const touch = e.touches[0];
        const ndcX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        const intersection = getFloorIntersectionPoint(ndcX, ndcY, camera);
        if (intersection) {
          const delta = new THREE.Vector3().subVectors(
            intersection,
            touchState.current.dragStartIntersection
          );

          const newX = touchState.current.dragStartModelPos.x + delta.x;
          const newZ = touchState.current.dragStartModelPos.z + delta.z;
          
          onUpdateTransform({
            position: [newX, position[1], newZ],
          });
        }
      } else if (e.touches.length === 2) {
        // Scale and Rotate in tandem
        const t1 = e.touches[0];
        const t2 = e.touches[1];

        // 1. Pinch to Scale (30% to 300%)
        const currentDist = getTouchDistance(t1, t2);
        if (touchState.current.initialDistance > 0) {
          const factor = currentDist / touchState.current.initialDistance;
          const targetScale = Math.min(3.0, Math.max(0.3, touchState.current.initialScale * factor));
          
          // 2. Multi-touch Rotation
          const currentAngle = getTouchAngle(t1, t2);
          const angleDelta = currentAngle - touchState.current.initialRotation;
          const targetRotation = touchState.current.initialModelRotation + angleDelta;

          onUpdateTransform({
            scale: targetScale,
            rotation: targetRotation,
          });
        }
      }
    };

    const handleTouchEnd = () => {
      touchState.current.isDragging = false;
      touchState.current.initialDistance = 0;
    };

    // Attach listeners
    element.addEventListener("touchstart", handleTouchStart, { passive: false });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [modelGroup, camera, scale, rotation, position, onUpdateTransform, onDoubleTap]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {children}
    </div>
  );
}
