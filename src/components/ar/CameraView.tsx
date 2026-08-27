/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface CameraViewProps {
  stream: MediaStream | null;
  active: boolean;
}

export default function CameraView({ stream, active }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active && stream) {
      video.srcObject = stream;
      video.play().catch((err) => {
        console.warn("Camera video playback was interrupted:", err);
      });
    } else {
      video.srcObject = null;
    }
  }, [stream, active]);

  if (!active || !stream) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 w-full h-full z-0 overflow-hidden"
    >
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: "scaleX(1)" }} // Keeps standard perspective
      />
      {/* Subtle realistic dark room vignetting to elevate furniture standing */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none mix-blend-multiply opacity-25" />
    </motion.div>
  );
}
