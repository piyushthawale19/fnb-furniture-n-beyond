/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Move, Smartphone, Sparkles } from "lucide-react";

interface FloorDetectorProps {
  status: "searching" | "detecting" | "locked" | "failed";
  instruction: string;
}

export default function FloorDetector({ status, instruction }: FloorDetectorProps) {
  return (
    <div className="absolute inset-x-0 top-18 z-[135] flex flex-col items-center p-4 pointer-events-none select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 15, opacity: 0 }}
          className="w-full max-w-sm rounded-2xl bg-stone-950/90 backdrop-blur-md border border-white/10 p-4 shadow-xl flex items-center gap-3.5"
        >
          {/* Animated Scanning Icon */}
          <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 shrink-0 border border-amber-500/20">
            {status === "searching" && (
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <Smartphone className="h-5 w-5 text-amber-400" />
              </motion.div>
            )}
            
            {status === "detecting" && (
              <motion.div
                animate={{ scale: [0.9, 1.15, 0.9] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <Move className="h-5 w-5 text-amber-400" />
              </motion.div>
            )}

            {status === "locked" && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-5 w-5 text-amber-400" />
              </motion.div>
            )}
          </div>

          {/* Interactive Text Guidance */}
          <div className="flex-grow">
            <span className="text-[8px] font-bold text-amber-400/80 uppercase tracking-widest block mb-0.5">
              {status === "locked" ? "Surface Locked" : "Spatial Radar"}
            </span>
            <p className="text-xs font-medium text-stone-200 leading-tight">
              {instruction}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Realistic virtual horizontal grid projection scanning during search */}
      {status !== "locked" && (
        <div className="absolute inset-0 top-[200px] h-[120px] w-full flex items-center justify-center opacity-30">
          <motion.div
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              scaleY: [1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-[85%] h-full border border-dashed border-amber-500/40 rounded-full flex items-center justify-center"
            style={{ transform: "rotateX(75deg)" }}
          >
            <div className="w-[60%] h-[60%] border border-dotted border-amber-400/40 rounded-full" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
