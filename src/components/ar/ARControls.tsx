/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw, 
  Camera, 
  X,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface ARControlsProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCaptureScreenshot: () => void;
  onExit: () => void;
  productName: string;
}

export default function ARControls({
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
  onReset,
  onCaptureScreenshot,
  onExit,
  productName,
}: ARControlsProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-[140] flex flex-col items-center justify-end p-5 md:p-8 pointer-events-none select-none">
      
      {/* Top Banner / Guidance */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 bg-stone-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center space-x-2 shadow-lg shrink-0 pointer-events-auto"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        <span className="text-[10px] font-semibold tracking-wider text-stone-200 uppercase">
          Drag to Move • Pinch to Scale • 2-Finger Rotate
        </span>
      </motion.div>

      {/* Main Glassmorphic Control Bar */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-stone-950/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col items-center gap-4 pointer-events-auto"
      >
        {/* Product Title Indicator */}
        <div className="flex items-center justify-between w-full border-b border-white/5 pb-2">
          <span className="text-[11px] font-serif text-stone-100 font-semibold truncate max-w-[200px]">
            {productName}
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400/80 uppercase">
            3D SPATIAL SANDBOX
          </span>
        </div>

        {/* Action Button Grid */}
        <div className="flex items-center justify-between w-full gap-2">
          
          {/* Rotate Left */}
          <button
            onClick={onRotateLeft}
            className="flex-1 p-3 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-stone-300 hover:text-white border border-white/5 cursor-pointer"
            title="Rotate Left"
          >
            <RotateCcw className="h-4.5 w-4.5" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Left</span>
          </button>

          {/* Rotate Right */}
          <button
            onClick={onRotateRight}
            className="flex-1 p-3 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-stone-300 hover:text-white border border-white/5 cursor-pointer"
            title="Rotate Right"
          >
            <RotateCw className="h-4.5 w-4.5" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Right</span>
          </button>

          {/* Shutter Button (Capture Screenshot) */}
          <button
            onClick={onCaptureScreenshot}
            className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-90 transition-transform border border-white/20 hover:brightness-110 cursor-pointer"
            title="Capture Screenshot"
          >
            <div className="h-full w-full rounded-full bg-stone-950 flex items-center justify-center text-amber-400 hover:text-white transition-colors">
              <Camera className="h-5.5 w-5.5" />
            </div>
          </button>

          {/* Zoom In */}
          <button
            onClick={onZoomIn}
            className="flex-1 p-3 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-stone-300 hover:text-white border border-white/5 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4.5 w-4.5" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Zoom +</span>
          </button>

          {/* Zoom Out */}
          <button
            onClick={onZoomOut}
            className="flex-1 p-3 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-stone-300 hover:text-white border border-white/5 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4.5 w-4.5" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Zoom -</span>
          </button>

        </div>

        {/* Reset and Close Row */}
        <div className="flex items-center gap-2.5 w-full">
          {/* Reset Transformations */}
          <button
            onClick={onReset}
            className="flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 transition-all text-stone-300 font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>Reset Position</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="py-2.5 px-4 flex items-center justify-center gap-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 active:scale-95 transition-all text-red-300 font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Exit AR</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
