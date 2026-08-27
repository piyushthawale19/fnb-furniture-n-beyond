/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "motion/react";
import { removeProductBackground } from "../../utils/backgroundRemoval";

interface ModelViewerProps {
  productImage: string;
  productName: string;
  selectedColor?: string;
  scale: number;
  scaleVector?: [number, number, number];
  rotation: number;
  position: [number, number, number];
  cameraStreamActive: boolean;
  onUpdateTransform: (updates: {
    scale?: number;
    rotation?: number;
    position?: [number, number, number];
  }) => void;
  onReset: () => void;
  onLoadStart: () => void;
  onLoadProgress: (percent: number) => void;
  onLoadComplete: () => void;
  onLoadError: (msg: string) => void;
}

export default function ModelViewer({
  productImage,
  productName,
  selectedColor = "#C8B195",
  scale,
  scaleVector,
  rotation,
  position,
  cameraStreamActive,
  onUpdateTransform,
  onReset,
  onLoadStart,
  onLoadProgress,
  onLoadComplete,
  onLoadError,
}: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isolatedImage, setIsolatedImage] = useState<string | null>(null);
  const [ambientLight, setAmbientLight] = useState({ intensity: 1.0, colorTint: "#FFFFFF" });

  // 1. Manage camera stream for background view
  useEffect(() => {
    const video = videoRef.current;
    if (cameraStreamActive && video) {
      const stream = (window as any)._arCameraStream;
      if (stream) {
        video.srcObject = stream;
        video.play().catch((err) => console.log("Video playback interrupted:", err));
      }
    } else if (video) {
      video.srcObject = null;
    }
  }, [cameraStreamActive]);

  // 2. Perform Dynamic Chroma/Background isolation on the product image
  useEffect(() => {
    let active = true;
    onLoadStart();
    onLoadProgress(10);

    const timer = setTimeout(() => onLoadProgress(40), 150);

    removeProductBackground(productImage)
      .then((transparentUri) => {
        if (!active) return;
        onLoadProgress(80);
        setIsolatedImage(transparentUri);
        onLoadProgress(100);
        setTimeout(() => {
          if (active) onLoadComplete();
        }, 150);
      })
      .catch((err) => {
        console.error("Failed to extract background:", err);
        if (!active) return;
        // Fallback to the original image without isolation
        setIsolatedImage(productImage);
        onLoadProgress(100);
        onLoadComplete();
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [productImage]);

  // 3. Environmental Light Color Estimation
  useEffect(() => {
    if (!cameraStreamActive) {
      setAmbientLight({ intensity: 1.0, colorTint: "#FFFFFF" });
      return;
    }

    let active = true;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16);
        const data = imgData.data;

        let rSum = 0, gSum = 0, bSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
        }

        const count = 16 * 16;
        const rAvg = rSum / count;
        const gAvg = gSum / count;
        const bAvg = bSum / count;

        // Luminance calculation
        const brightness = (0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg) / 255;
        // Map to light scale (0.7 to 1.3)
        const intensity = 0.7 + brightness * 0.6;
        const colorTint = `rgb(${Math.round(rAvg)}, ${Math.round(gAvg)}, ${Math.round(bAvg)})`;

        if (active) {
          setAmbientLight({ intensity, colorTint });
        }
      } catch (err) {
        // Silent fail for cross-origin or hardware limitations
      }
    }, 1200);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [cameraStreamActive]);

  // Calculate customized dimensions dynamically matching sliders
  const baseWidth = 330;
  const baseHeight = 250;
  const currentScaleX = scaleVector ? scaleVector[0] : 1;
  const currentScaleY = scaleVector ? scaleVector[1] : 1;
  const currentScaleZ = scaleVector ? scaleVector[2] : 1;

  const displayWidth = useMemo(() => Math.round(baseWidth * scale * currentScaleX), [scale, currentScaleX]);
  const displayHeight = useMemo(() => Math.round(baseHeight * scale * currentScaleY), [scale, currentScaleY]);

  // 4. Capture screenshot of the 2D scene composition
  useEffect(() => {
    (window as any)._captureARCanvasScreenshot = async () => {
      try {
        const video = videoRef.current;
        const container = mountRef.current;
        if (!container) return;

        const canvas = document.createElement("canvas");
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw camera stream or elegant background backdrop
        if (cameraStreamActive && video && video.readyState === video.HAVE_ENOUGH_DATA) {
          const videoAspect = video.videoWidth / video.videoHeight;
          const containerAspect = canvas.width / canvas.height;
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (videoAspect > containerAspect) {
            drawWidth = canvas.height * videoAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          } else {
            drawHeight = canvas.width / videoAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          }
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        } else {
          // Premium luxury architectural backdrop layout
          ctx.fillStyle = "#F3F1EC";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = "rgba(196, 178, 158, 0.22)";
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
        }

        // Overlay transparent furniture product
        if (isolatedImage) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const cx = canvas.width / 2 + position[0];
            const cy = canvas.height / 2 + position[1];

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);

            // Draw soft ground shadow
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.beginPath();
            ctx.ellipse(0, displayHeight / 2 - 3, displayWidth * 0.45, 9 * currentScaleZ, 0, 0, Math.PI * 2);
            ctx.fill();

            // Apply light approximation adjustments to canvas drawing
            ctx.filter = `brightness(${ambientLight.intensity}) contrast(1.05)`;
            ctx.drawImage(img, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
            ctx.restore();

            const cleanName = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const filename = `fnb-design-${cleanName}-${new Date().toISOString().slice(0, 10)}.png`;
            const dataUrl = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
          img.src = isolatedImage;
        }
      } catch (err) {
        console.error("Failed to construct room preview snapshot:", err);
      }
    };

    return () => {
      (window as any)._captureARCanvasScreenshot = null;
    };
  }, [isolatedImage, cameraStreamActive, displayWidth, displayHeight, position, rotation, ambientLight, currentScaleZ]);

  // Handle double tap workspace reset
  const handleDoubleClick = () => {
    onReset();
  };

  return (
    <div 
      ref={mountRef} 
      onDoubleClick={handleDoubleClick}
      className="relative w-full h-full overflow-hidden select-none bg-stone-950 flex items-center justify-center cursor-crosshair"
      title="Double tap to reset placement"
    >
      {/* Live Video Camera Feed */}
      {cameraStreamActive ? (
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity duration-500"
        />
      ) : (
        /* Designer Showroom Luxury Grid Backdrop when Camera is closed */
        <div className="absolute inset-0 w-full h-full z-0 bg-stone-900 flex items-center justify-center">
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: `radial-gradient(circle, #C4B29E 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-transparent to-stone-950/40 pointer-events-none" />
          <div className="text-center p-8 max-w-sm pointer-events-none z-10">
            <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-widest font-mono">
              Virtual Studio Backdrop
            </span>
            <h4 className="font-serif text-sm font-bold text-stone-400 mt-1">
              Select "Check My Room" to align with your camera feed
            </h4>
          </div>
        </div>
      )}

      {/* Main Interactive Product Overlay */}
      {isolatedImage && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.03}
          onDrag={(event, info) => {
            const newX = position[0] + info.delta.x;
            const newY = position[1] + info.delta.y;
            onUpdateTransform({ position: [newX, newY, 0] });
          }}
          style={{
            width: displayWidth,
            height: displayHeight,
            x: position[0],
            y: position[1],
            rotate: `${rotation}rad`,
          }}
          className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center justify-center select-none"
        >
          {/* Soft Ground Shadow Depth (modulated by currentScaleZ) */}
          <div 
            className="absolute bottom-2 rounded-full blur-md opacity-65 pointer-events-none transition-all duration-300"
            style={{
              width: `${displayWidth * 0.9}px`,
              height: `${Math.max(12, 16 * currentScaleZ)}px`,
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 70%)",
            }}
          />

          {/* Background isolated e-commerce asset image */}
          <img
            src={isolatedImage}
            alt={productName}
            className="w-full h-full object-contain pointer-events-none relative select-none"
            style={{
              filter: `brightness(${ambientLight.intensity}) contrast(1.05) drop-shadow(0 15px 30px rgba(0,0,0,0.25))`,
            }}
            referrerPolicy="no-referrer"
          />
        </motion.div>
      )}
    </div>
  );
}
