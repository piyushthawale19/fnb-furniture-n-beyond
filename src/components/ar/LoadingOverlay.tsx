/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Preparing your furniture..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-md px-6 text-center select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <Loader2 className="h-8 w-8 text-amber-400 animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          Spatial Engine
        </p>
        <h4 className="text-sm font-serif text-stone-200 mt-2 font-medium tracking-wide">
          {message}
        </h4>
      </motion.div>
    </div>
  );
}
