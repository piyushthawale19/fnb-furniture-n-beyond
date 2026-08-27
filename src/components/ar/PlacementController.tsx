/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

interface PlacementControllerProps {
  visible: boolean;
  onPlace: () => void;
  statusText?: string;
}

export default function PlacementController({ visible, onPlace, statusText }: PlacementControllerProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-[130] flex flex-col items-center justify-center pointer-events-none select-none">
      
      {/* Visual Placement Ring Target */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.1, 1], opacity: 1 }}
        transition={{ 
          scale: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
          opacity: { duration: 0.4 }
        }}
        className="relative h-24 w-24 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center bg-amber-500/10 pointer-events-auto cursor-pointer shadow-lg shadow-amber-400/20 active:scale-90 transition-transform"
        onClick={(e) => {
          e.stopPropagation();
          onPlace();
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-amber-300/40"
        />
        <Plus className="h-6 w-6 text-amber-300 drop-shadow-md" />
      </motion.div>

      {/* Floating Call to Action */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-6 bg-stone-950/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-amber-400/20 text-center shadow-md shrink-0"
      >
        <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest animate-pulse">
          {statusText || "TAP TARGET TO PLACE FURNITURE"}
        </p>
      </motion.div>

    </div>
  );
}
