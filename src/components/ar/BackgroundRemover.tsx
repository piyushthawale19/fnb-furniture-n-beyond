/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Eye, ShieldCheck } from "lucide-react";

interface BackgroundRemoverProps {
  active: boolean;
  onDone: () => void;
}

export default function BackgroundRemover({ active, onDone }: BackgroundRemoverProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-stone-950/90 backdrop-blur-md px-6 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xs text-center"
      >
        {/* Animated Scanning Mask */}
        <div className="relative mb-6 flex items-center justify-center h-16 w-16 rounded-full border border-amber-500/20 bg-amber-500/5 mx-auto">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="absolute inset-0 rounded-full bg-amber-500/10"
          />
          <Eye className="h-6 w-6 text-amber-400" />
        </div>

        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
          Chroma Isolation
        </span>
        <h4 className="text-sm font-serif font-semibold text-stone-100 mb-2">
          Segmenting Studio Photo
        </h4>
        <p className="text-xs text-stone-400 leading-relaxed mb-6">
          Removing solid color backdrops to extract the luxury furniture asset safely...
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-40 bg-stone-800 rounded-full h-[2px] mx-auto overflow-hidden">
          <div 
            className="bg-amber-500 h-full transition-all duration-150" 
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-stone-500 mt-2 block">
          {percent}% EXTRACTED
        </span>
      </motion.div>
    </div>
  );
}
