/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface ModelGeneratorProps {
  productName: string;
  onComplete: () => void;
}

export default function ModelGenerator({ productName, onComplete }: ModelGeneratorProps) {
  const [step, setStep] = useState(0);

  const generatorSteps = [
    { title: "Segmenting Image", desc: "Isolating product from studio backdrop..." },
    { title: "Running Tripo AI Engine", desc: "Synthesizing depth map & mesh vertices..." },
    { title: "Baking PBR Materials", desc: "Generating high-fidelity gold/fabric shaders..." },
    { title: "Assembling GLB Asset", desc: "Compressing with Draco engine fallback..." },
    { title: "Asset Generated", desc: "Caching to browser storage for instant loading." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= generatorSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-[155] flex flex-col items-center justify-center bg-stone-950/95 backdrop-blur-lg px-6 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm w-full bg-stone-900 border border-white/5 rounded-2xl p-6 text-center shadow-2xl"
      >
        {/* Animated AI Core Icon */}
        <div className="relative mb-6 flex items-center justify-center h-16 w-16 rounded-full border border-amber-500/20 bg-amber-500/5 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t border-b border-amber-500"
          />
          <Cpu className="h-6 w-6 text-amber-400 animate-pulse" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            AI Spatial Synthesizer
          </span>
        </div>
        <h4 className="text-sm font-serif font-semibold text-stone-100 mb-2">
          Generating {productName}
        </h4>
        <p className="text-xs text-stone-400 leading-relaxed mb-6">
          Converting product visuals into a realistic 3D volumetric AR model automatically.
        </p>

        {/* Progress Timeline */}
        <div className="flex flex-col gap-3 text-left">
          {generatorSteps.map((s, idx) => {
            const isActive = idx === step;
            const isCompleted = idx < step;

            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="h-4.5 w-4.5 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-4.5 w-4.5 rounded-full border border-stone-700 shrink-0" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-stone-200">{s.title}</h5>
                  {isActive && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-stone-400 leading-normal mt-0.5"
                    >
                      {s.desc}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}
