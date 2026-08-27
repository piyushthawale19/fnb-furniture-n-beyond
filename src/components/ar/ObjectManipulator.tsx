/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Maximize2, Minimize2, RotateCw } from "lucide-react";

interface ObjectManipulatorProps {
  currentScale: number;
  currentRotation: number;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rot: number) => void;
}

export default function ObjectManipulator({
  currentScale,
  currentRotation,
  onScaleChange,
  onRotationChange,
}: ObjectManipulatorProps) {
  const scalePercent = Math.round(currentScale * 100);

  return (
    <div className="absolute top-18 right-4 z-[140] flex flex-col gap-2 pointer-events-none select-none">
      {/* Current Scale Display Badge */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-stone-950/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex flex-col items-center gap-1 shadow-md shrink-0 pointer-events-auto"
      >
        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">
          Scale
        </span>
        <span className="text-xs font-mono font-bold text-amber-400">
          {scalePercent}%
        </span>
      </motion.div>

      {/* Quick Incremental Controllers */}
      <motion.button
        onClick={() => onScaleChange(Math.min(3.0, currentScale + 0.1))}
        className="h-10 w-10 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
        title="Increase Scale"
      >
        <Maximize2 className="h-4 w-4" />
      </motion.button>

      <motion.button
        onClick={() => onScaleChange(Math.max(0.3, currentScale - 0.1))}
        className="h-10 w-10 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
        title="Decrease Scale"
      >
        <Minimize2 className="h-4 w-4" />
      </motion.button>

      <motion.button
        onClick={() => onRotationChange(currentRotation + Math.PI / 4)}
        className="h-10 w-10 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-md pointer-events-auto cursor-pointer"
        title="Rotate 45°"
      >
        <RotateCw className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
