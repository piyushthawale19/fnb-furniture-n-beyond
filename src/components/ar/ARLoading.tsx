/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Loader2, ScanEye } from "lucide-react";
import { motion } from "motion/react";

interface ARLoadingProps {
  progress?: number;
  loadingText?: string;
}

export default function ARLoading({ progress = 0, loadingText = "Loading Model..." }: ARLoadingProps) {
  return (
    <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-stone-950/85 backdrop-blur-md px-6 text-center select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-xs flex flex-col items-center"
      >
        {/* Animated Icon Ring */}
        <div className="relative mb-6 flex items-center justify-center h-20 w-20 rounded-full border border-amber-500/20 bg-amber-500/5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t border-b border-amber-500"
          />
          <ScanEye className="h-8 w-8 text-amber-400 animate-pulse" />
        </div>

        {/* Brand Text */}
        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/80 font-semibold mb-1">
          FNB Spatial Engine
        </span>
        
        {/* Animated Loading Text */}
        <h4 className="text-sm font-serif text-stone-100 font-medium tracking-wide min-h-[24px]">
          {loadingText}
        </h4>

        {/* Premium Progress Bar */}
        <div className="w-48 bg-stone-800/60 rounded-full h-[3px] mt-6 overflow-hidden border border-stone-800">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Percentage Tracker */}
        <span className="text-[10px] font-mono text-stone-400 mt-2.5 font-bold tracking-wider">
          {progress}% COMPLETED
        </span>
      </motion.div>
    </div>
  );
}
