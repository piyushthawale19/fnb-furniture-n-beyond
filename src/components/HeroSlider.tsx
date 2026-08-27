/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, MessageSquare, Wrench, Sparkles } from "lucide-react";
import { Banner } from "../types";

interface HeroSliderProps {
  banners: Banner[];
  setCurrentTab: (tab: string) => void;
  onSelectCategory: (catId: string | null) => void;
}

export default function HeroSlider({ banners, setCurrentTab, onSelectCategory }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 4500); // 4.5 seconds auto-slide
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  const handleCTAClick = (linkType: "explore" | "repair" | "whatsapp") => {
    if (linkType === "explore") {
      setCurrentTab("categories");
      onSelectCategory(null);
    } else if (linkType === "repair") {
      setCurrentTab("repair");
    } else if (linkType === "whatsapp") {
      window.open(
        "https://wa.me/918830402066?text=Hello%20FNB%20Furniture%20N%20Beyond,%20I%20am%20exploring%20your%20website%20slider%20and%20want%20to%20discuss%20custom%20luxury%20furniture.",
        "_blank"
      );
    }
  };

  if (!banners.length) return null;

  return (
    <div className="relative h-[480px] w-full overflow-hidden bg-stone-900 sm:h-[620px]" id="hero-slider">
      {/* Slides */}
      {banners.map((banner, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Dark Premium Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/40 to-stone-950/70 z-10"></div>
            
            {/* Image */}
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="h-full w-full object-cover object-center transform scale-105 transition-transform duration-[4500ms] ease-out"
              referrerPolicy="no-referrer"
            />

            {/* Content overlay container */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-left space-y-6">
                  
                  {/* Tagline micro */}
                  <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 mr-1.5" />
                    <span>FNB Masterpieces</span>
                  </div>

                  {/* Title and subtitle */}
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
                    {banner.title}
                  </h1>
                  
                  <p className="text-sm font-light leading-relaxed text-stone-300 sm:text-lg">
                    {banner.subtitle}
                  </p>

                  {/* Beautiful customized action buttons requested in spec */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 pt-1 sm:pt-2">
                    <button
                      onClick={() => handleCTAClick("explore")}
                      className="rounded-xl bg-[#D4AF37] px-4 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-950 transition-all duration-300 ease-out shadow-md shadow-amber-500/10 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-400/30 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    >
                      Explore Collection
                    </button>
                    
                    <button
                      onClick={() => handleCTAClick("repair")}
                      className="inline-flex items-center space-x-1.5 sm:space-x-2 rounded-xl bg-stone-900/90 backdrop-blur-sm border border-stone-800 px-4 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 ease-out shadow-md hover:bg-stone-800 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    >
                      <Wrench className="h-3.5 w-3.5 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
                      <span>Repair Service</span>
                    </button>

                    <button
                      onClick={() => handleCTAClick("whatsapp")}
                      className="inline-flex items-center space-x-1.5 sm:space-x-2 rounded-xl bg-[#25D366] px-4 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 ease-out shadow-md shadow-emerald-500/10 hover:bg-[#1ebd59] hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Contact WhatsApp</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Arrow Controls */}
      <button
        onClick={handlePrev}
        className="hidden sm:block absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-stone-700 bg-stone-900/60 p-3 text-white hover:bg-stone-850 hover:border-amber-500 transition-colors focus:outline-none"
        aria-label="Previous Slide"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <button
        onClick={handleNext}
        className="hidden sm:block absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-stone-700 bg-stone-900/60 p-3 text-white hover:bg-stone-850 hover:border-amber-500 transition-colors focus:outline-none"
        aria-label="Next Slide"
      >
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* Navigation Indicators Overlay */}
      <div className="absolute bottom-6 left-1/2 z-35 -translate-x-1/2 flex space-x-3.5 bg-stone-950/30 backdrop-blur-md px-4 py-2 rounded-full">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-amber-505 w-8 bg-amber-500" : "bg-stone-600 w-2.5 hover:bg-stone-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
