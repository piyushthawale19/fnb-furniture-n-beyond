/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  X, 
  Sliders, 
  Camera, 
  Layers, 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw, 
  FolderHeart, 
  Ruler, 
  Eye, 
  ShieldAlert, 
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { Product, Category } from "../../types";
import { useAR } from "../../hooks/useAR";
import ARLoading from "./ARLoading";
import ModelViewer from "./ModelViewer";

interface ARViewerProps {
  product: Product;
  allProducts?: Product[];
  categories?: Category[];
  selectedColor?: string;
  onClose: () => void;
}

// Simple Helper: Parse typical inches/dimensions string to width, depth, height
function parseDimensions(dimensionStr?: string) {
  if (!dimensionStr) return { width: 70, depth: 35, height: 32 };
  
  const wMatch = dimensionStr.match(/(\d+)\s*W/i) || dimensionStr.match(/Width:\s*(\d+)/i) || dimensionStr.match(/(\d+)\s*w/i);
  const dMatch = dimensionStr.match(/(\d+)\s*D/i) || dimensionStr.match(/Depth:\s*(\d+)/i) || dimensionStr.match(/(\d+)\s*d/i);
  const hMatch = dimensionStr.match(/(\d+)\s*H/i) || dimensionStr.match(/Height:\s*(\d+)/i) || dimensionStr.match(/(\d+)\s*h/i);

  let width = wMatch ? parseInt(wMatch[1]) : 70;
  let depth = dMatch ? parseInt(dMatch[1]) : 35;
  let height = hMatch ? parseInt(hMatch[1]) : 32;

  // General LxWxH parser fallback
  if (!wMatch && !dMatch && !hMatch) {
    const nums = dimensionStr.match(/\d+/g);
    if (nums && nums.length >= 3) {
      width = parseInt(nums[0]);
      depth = parseInt(nums[1]);
      height = parseInt(nums[2]);
    }
  }

  return { width, depth, height };
}

export default function ARViewer({ 
  product, 
  allProducts = [], 
  categories = [], 
  selectedColor = "#C8B195", 
  onClose 
}: ARViewerProps) {
  // 1. Core catalog and active product selection states
  const [activeProduct, setActiveProduct] = useState<Product>(product);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);

  // 2. Initialize default dimensions and customizable properties
  const defaultDimensions = useMemo(() => parseDimensions(activeProduct.dimensions), [activeProduct]);
  const [customWidth, setCustomWidth] = useState(defaultDimensions.width);
  const [customDepth, setCustomDepth] = useState(defaultDimensions.depth);
  const [customHeight, setCustomHeight] = useState(defaultDimensions.height);

  // Sync state whenever active product changes
  useEffect(() => {
    setCustomWidth(defaultDimensions.width);
    setCustomDepth(defaultDimensions.depth);
    setCustomHeight(defaultDimensions.height);
  }, [activeProduct, defaultDimensions]);

  // Compute exact scaling vector for threejs mapping
  const scaleVector = useMemo<[number, number, number]>(() => {
    const scaleX = customWidth / defaultDimensions.width;
    const scaleY = customHeight / defaultDimensions.height;
    const scaleZ = customDepth / defaultDimensions.depth;
    return [scaleX, scaleY, scaleZ];
  }, [customWidth, customDepth, customHeight, defaultDimensions]);

  // Filter products for the VR catalog selector
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      // Prioritize sofas/chairs/tables for VR alignment
      const isSofaOrChair = 
        p.name.toLowerCase().includes("sofa") || 
        p.name.toLowerCase().includes("chair") ||
        p.name.toLowerCase().includes("table") ||
        p.name.toLowerCase().includes("recliner") ||
        p.name.toLowerCase().includes("lounger") ||
        p.name.toLowerCase().includes("bench") ||
        p.name.toLowerCase().includes("bed") ||
        p.name.toLowerCase().includes("stool");
        
      if (!isSofaOrChair) return false;

      if (selectedCategory === "all") return true;
      return p.categoryId === selectedCategory;
    });
  }, [allProducts, selectedCategory]);

  // 3. Initiate the AR Core service
  const {
    state,
    setState,
    startAR,
    stopAR,
    rotateLeft,
    rotateRight,
    scaleUp,
    scaleDown,
    resetTransform,
  } = useAR(activeProduct.name, activeProduct.glbModelUrl, activeProduct.usdzModelUrl);

  // Start feed automatically
  useEffect(() => {
    startAR();
    return () => {
      stopAR();
    };
  }, [startAR, stopAR]);

  // Custom Dimension sliders min/max bounds
  const widthBounds = { min: Math.round(defaultDimensions.width * 0.4), max: Math.round(defaultDimensions.width * 1.8) };
  const depthBounds = { min: Math.round(defaultDimensions.depth * 0.4), max: Math.round(defaultDimensions.depth * 1.8) };
  const heightBounds = { min: Math.round(defaultDimensions.height * 0.4), max: Math.round(defaultDimensions.height * 1.8) };

  // Helper to convert inches to meters for user description
  const inchToMeter = (inches: number) => (inches * 0.0254).toFixed(2);

  // Handle camera background toggle
  const toggleCameraFeed = () => {
    setState((prev) => ({
      ...prev,
      cameraStreamActive: !prev.cameraStreamActive,
    }));
  };

  // Helper: Forward screenshot capture action to ModelViewer's window-registered function
  const handleCaptureScreenshot = () => {
    const captureFn = (window as any)._captureARCanvasScreenshot;
    if (captureFn) {
      captureFn();
    }
  };

  const handleUpdateTransform = (updates: {
    scale?: number;
    rotation?: number;
    position?: [number, number, number];
  }) => {
    setState((prev) => ({
      ...prev,
      scale: updates.scale !== undefined ? updates.scale : prev.scale,
      rotation: updates.rotation !== undefined ? updates.rotation : prev.rotation,
      position: updates.position !== undefined ? updates.position : prev.position,
    }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col md:flex-row bg-stone-950 font-sans overflow-hidden">
      
      {/* BACKGROUND DECOR FEED OR WARM LUXURY GRID Backdrop */}
      <div className="relative flex-grow h-[55%] md:h-full w-full z-10">
        {(state.mode === "3d_viewer" || state.mode === "none") && (
          <ModelViewer
            productImage={activeProduct.images[0]}
            productName={activeProduct.name}
            selectedColor={selectedColor}
            scale={state.scale}
            scaleVector={scaleVector}
            rotation={state.rotation}
            position={state.position}
            cameraStreamActive={state.cameraStreamActive}
            onUpdateTransform={handleUpdateTransform}
            onReset={resetTransform}
            onLoadStart={() =>
              setState((prev) => ({
                ...prev,
                loading: true,
                loadingProgress: 10,
                loadingText: "Loading Model...",
              }))
            }
            onLoadProgress={(p) =>
              setState((prev) => ({
                ...prev,
                loadingProgress: p,
              }))
            }
            onLoadComplete={() =>
              setState((prev) => ({
                ...prev,
                loading: false,
                loadingProgress: 100,
              }))
            }
            onLoadError={(msg) =>
              setState((prev) => ({
                ...prev,
                loading: false,
                errorMessage: msg,
              }))
            }
          />
        )}

        {/* Dynamic spatial feedback indicator in 3D viewport */}
        <div className="absolute bottom-4 left-4 z-20 bg-stone-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
          <div className={`h-2 w-2 rounded-full ${state.cameraStreamActive ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-[9px] font-bold text-stone-200 uppercase tracking-widest font-mono">
            {state.cameraStreamActive ? "Camera Feed Aligned" : "Studio Render Backdrop"}
          </span>
        </div>

        {/* Close Button overlay in viewport */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-stone-950/80 backdrop-blur-md hover:bg-stone-900 border border-white/15 text-stone-200 hover:text-white transition-all shadow-lg active:scale-90 cursor-pointer"
          title="Exit VR View"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Viewport Micro Interactions Bar */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={rotateLeft}
            className="p-2.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Rotate Left"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={rotateRight}
            className="p-2.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Rotate Right"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={scaleUp}
            className="p-2.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={scaleDown}
            className="p-2.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetTransform}
            className="p-2.5 rounded-xl bg-stone-950/85 hover:bg-stone-900 border border-white/10 text-stone-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Reset Position"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* VR CATALOG PANEL & DIMENSION CONTROLLER DRAWER */}
      <div className="w-full md:w-[410px] h-[45%] md:h-full bg-stone-900 border-t md:border-t-0 md:border-l border-white/5 flex flex-col z-20 overflow-hidden relative shrink-0">
        
        {/* Dynamic Glass Header */}
        <div className="p-4 border-b border-white/5 bg-stone-950/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                VR Sandbox Catalog
              </span>
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-100">
              Virtual Interior Matching
            </h3>
          </div>
          
          <button
            onClick={toggleCameraFeed}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
              state.cameraStreamActive 
                ? "bg-amber-400 border-amber-500 text-stone-950 font-bold" 
                : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Check My Room</span>
          </button>
        </div>

        {/* Scrollable Controllers and Gallery */}
        <div className="flex-grow overflow-y-auto p-4 space-y-5 scrollbar-thin">
          
          {/* Active Product Details & Dimensions Summary */}
          <div className="rounded-xl bg-stone-950/40 p-3.5 border border-white/5 space-y-3">
            <div className="flex items-start gap-3">
              <img 
                src={activeProduct.images[0]} 
                alt={activeProduct.name}
                className="h-14 w-14 rounded-lg object-cover border border-white/10 bg-stone-900"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                  Currently Visualizing
                </span>
                <h4 className="font-serif text-xs font-bold text-stone-100 truncate mt-0.5">
                  {activeProduct.name}
                </h4>
                <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                  Base Dimensions: {activeProduct.dimensions || "Default Studio Scale"}
                </p>
              </div>
            </div>

            {/* Custom live measurement badge */}
            <div className="grid grid-cols-3 gap-2 bg-stone-950/60 p-2.5 rounded-lg border border-white/5 text-center">
              <div>
                <span className="block text-[8px] font-medium text-stone-400 uppercase tracking-wider">Width</span>
                <span className="text-[11px] font-mono font-bold text-amber-300">{customWidth}"</span>
                <span className="block text-[8px] font-mono text-stone-500">{inchToMeter(customWidth)}m</span>
              </div>
              <div>
                <span className="block text-[8px] font-medium text-stone-400 uppercase tracking-wider">Depth</span>
                <span className="text-[11px] font-mono font-bold text-amber-300">{customDepth}"</span>
                <span className="block text-[8px] font-mono text-stone-500">{inchToMeter(customDepth)}m</span>
              </div>
              <div>
                <span className="block text-[8px] font-medium text-stone-400 uppercase tracking-wider">Height</span>
                <span className="text-[11px] font-mono font-bold text-amber-300">{customHeight}"</span>
                <span className="block text-[8px] font-mono text-stone-500">{inchToMeter(customHeight)}m</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC DIMENSION MANAGEMENT CONTROLLERS */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-stone-300">
              <Ruler className="h-4 w-4 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-200">
                Manage Dynamic Dimensions
              </span>
            </div>

            <div className="space-y-3 bg-stone-950/20 p-3.5 rounded-xl border border-white/5">
              {/* Width Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-stone-300 font-semibold uppercase tracking-wider">Custom Width</span>
                  <span className="text-amber-400 font-mono font-bold">{customWidth} inches</span>
                </div>
                <input 
                  type="range"
                  min={widthBounds.min}
                  max={widthBounds.max}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-ew-resize bg-stone-800 rounded-lg appearance-none h-1.5"
                />
                <div className="flex justify-between text-[8px] text-stone-500 font-mono">
                  <span>Min: {widthBounds.min}"</span>
                  <span>Max: {widthBounds.max}"</span>
                </div>
              </div>

              {/* Depth Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-stone-300 font-semibold uppercase tracking-wider">Custom Depth</span>
                  <span className="text-amber-400 font-mono font-bold">{customDepth} inches</span>
                </div>
                <input 
                  type="range"
                  min={depthBounds.min}
                  max={depthBounds.max}
                  value={customDepth}
                  onChange={(e) => setCustomDepth(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-ew-resize bg-stone-800 rounded-lg appearance-none h-1.5"
                />
                <div className="flex justify-between text-[8px] text-stone-500 font-mono">
                  <span>Min: {depthBounds.min}"</span>
                  <span>Max: {depthBounds.max}"</span>
                </div>
              </div>

              {/* Height Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-stone-300 font-semibold uppercase tracking-wider">Custom Height</span>
                  <span className="text-amber-400 font-mono font-bold">{customHeight} inches</span>
                </div>
                <input 
                  type="range"
                  min={heightBounds.min}
                  max={heightBounds.max}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-ew-resize bg-stone-800 rounded-lg appearance-none h-1.5"
                />
                <div className="flex justify-between text-[8px] text-stone-500 font-mono">
                  <span>Min: {heightBounds.min}"</span>
                  <span>Max: {heightBounds.max}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* CATALOG SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-300">
                <Layers className="h-4 w-4 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-200">
                  Interactive VR Catalog
                </span>
              </div>
              <span className="text-[9px] font-mono text-stone-500 uppercase">
                {filteredProducts.length} Items Available
              </span>
            </div>

            {/* Category selection bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                    : "bg-white/5 border-transparent text-stone-400 hover:text-stone-200"
                }`}
              >
                All Spatial Designs
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                      : "bg-white/5 border-transparent text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product items list */}
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((p) => {
                const isActive = p.id === activeProduct.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveProduct(p)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? "bg-amber-400/5 border-amber-400/30 shadow-md shadow-amber-400/5" 
                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.name}
                      className="h-10 w-10 rounded-lg object-cover bg-stone-950 border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-grow">
                      <h5 className={`text-xs font-bold truncate ${isActive ? "text-amber-400 font-serif" : "text-stone-200"}`}>
                        {p.name}
                      </h5>
                      <span className="block text-[9px] font-mono text-stone-400 mt-0.5">
                        {p.price || "Contact for Quote"} • {p.dimensions}
                      </span>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-amber-400 translate-x-0.5" : "text-stone-500"}`} />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info badge */}
        <div className="p-3 bg-stone-950 text-center border-t border-white/5">
          <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">
            Virtual Reality Decor System V2.1 • Furniture N Beyond
          </span>
        </div>

      </div>

      {/* Primary Loading Overlay */}
      <AnimatePresence>
        {state.loading && (
          <ARLoading progress={state.loadingProgress} loadingText={state.loadingText} />
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {state.errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[160] flex items-center justify-center p-6 bg-stone-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="w-full max-w-sm rounded-2xl bg-stone-900 border border-red-500/20 p-6 flex flex-col items-center text-center shadow-2xl"
            >
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-100 mb-2">
                Spatial Loader Exception
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed mb-6">
                {state.errorMessage}
              </p>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
              >
                Close Visualizer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
