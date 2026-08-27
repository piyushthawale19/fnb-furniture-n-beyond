/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, MessageCircle, Ruler, Shield, CheckCircle, ArrowRight, Star, Heart, Share2, Award, Zap, Percent, Check, RefreshCcw, Download } from "lucide-react";
import { Product, Category, SubCategory } from "../types";
import { downloadImageFile } from "../lib/imageProcessor";

interface ProductDetailModalProps {
  product: Product;
  categories: Category[];
  subCategories: SubCategory[];
  allProducts: Product[];
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  categories,
  subCategories,
  allProducts,
  onClose,
  onOpenProduct,
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Default");
  const [selectedFabric, setSelectedFabric] = useState(product.fabrics[0] || "Default");
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Sync favorited state with localStorage
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem("fnb_favorites") || "[]");
      setIsFavorited(favorites.includes(product.id));
    } catch (e) {
      console.error(e);
    }
  }, [product.id]);

  const toggleFavorite = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem("fnb_favorites") || "[]");
      let updated: string[];
      if (favorites.includes(product.id)) {
        updated = favorites.filter((id: string) => id !== product.id);
        setIsFavorited(false);
      } else {
        updated = [...favorites, product.id];
        setIsFavorited(true);
      }
      localStorage.setItem("fnb_favorites", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetCustomizations = () => {
    setSelectedColor(product.colors[0] || "Default");
    setSelectedFabric(product.fabrics[0] || "Default");
    setSelectedImage(product.images[0]);
  };

  const handleShareProduct = () => {
    const shareUrl = `${window.location.origin}/share/${product.id}?color=${encodeURIComponent(selectedColor)}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Furniture N Beyond!`,
        url: shareUrl,
      }).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch((err) => {
        console.log("Error sharing:", err);
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper: Retrieve corresponding image URL for a given color
  const getColorImage = (colorName: string): string => {
    if (product.colorMap) {
      const found = product.colorMap.find(
        (item) => item.color.toLowerCase() === colorName.toLowerCase()
      );
      if (found && found.image) return found.image;
    }
    // Fallback: use the same index in images if available, otherwise first image
    const idx = product.colors.indexOf(colorName);
    if (idx !== -1 && product.images[idx]) {
      return product.images[idx];
    }
    return product.images[0];
  };

  // Sync selected image if the product prop changes, handling URL sharing parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const colorParam = params.get("color");
    if (colorParam && product.colors.some((c) => c?.toLowerCase() === colorParam.toLowerCase())) {
      const actualColor = product.colors.find((c) => c?.toLowerCase() === colorParam.toLowerCase()) || colorParam;
      setSelectedColor(actualColor);
      setSelectedImage(getColorImage(actualColor));
    } else {
      setSelectedImage(product.images[0]);
      setSelectedColor(product.colors[0] || "Default");
    }
    setSelectedFabric(product.fabrics[0] || "None");
  }, [product]);

  const category = categories.find((c) => c.id === product.categoryId);
  const subCategory = subCategories.find((sc) => sc.id === product.subCategoryId);

  // Find other products in the same category (max 3 related)
  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  // Helper: Find color mapped to an image URL
  const getMappedColorForImage = (imageSrc: string): string | null => {
    if (product.colorMap) {
      const match = product.colorMap.find((item) => item.image === imageSrc);
      if (match) return match.color;
    }
    const idx = product.images.indexOf(imageSrc);
    if (idx !== -1 && product.colors[idx]) {
      return product.colors[idx];
    }
    return null;
  };

  const handleThumbnailClick = (img: string) => {
    setSelectedImage(img);
    const color = getMappedColorForImage(img);
    if (color) {
      setSelectedColor(color);
    }
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello FNB Furniture N Beyond! I am inquiring about: *${product.name}*\n\n` +
      `*Selected Preferences:*\n` +
      `- Color: ${selectedColor}\n` +
      `- Fabric/Material Option: ${selectedFabric}\n` +
      `- Base Material: ${product.material} ${product.woodType ? `(${product.woodType})` : ""}\n` +
      `- Finish Type: ${product.finish}\n` +
      `- Dimensions: ${product.dimensions}\n` +
      `- Warranty: ${product.warranty}\n` +
      `- Price Quote Request: ${product.price || "Contact for Price"}\n\n` +
      `Could you please let me know the customization options, bulk discounts, and expected delivery timeline? Thank you!`
    );
    window.open(`https://wa.me/918830402066?text=${text}`, "_blank");
  };

  // Filter out empty colors
  const validColors = product.colors ? product.colors.filter(c => c && c !== "None") : [];

  return (
    <>
      <div className="fixed inset-0 z-[90] overflow-y-auto bg-stone-950/60 backdrop-blur-sm pt-[68px] sm:pt-[76px] flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col transition-all duration-300">
        
        {/* Top Premium Badge / Close header */}
        <div className="flex items-center justify-between border-b border-stone-200/60 px-6 py-4 bg-stone-50 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/10">
              {category?.name}
            </span>
            {subCategory && (
              <>
                <span className="text-stone-300 text-xs">/</span>
                <span className="text-stone-500 text-xs font-medium">{subCategory.name}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-900 hover:text-white transition-all focus:outline-none"
              aria-label="Close dialog"
              id="close-modal-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content body (Scrollable) */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Column: Flipkart/Amazon-style interactive galleries (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
              
              {/* Vertical thumbnail strip for desktop (hidden on mobile, scrolled horizontally on tablet) */}
              {product.images.length > 1 && (
                <div className="hidden md:flex flex-col gap-2.5 max-h-[480px] overflow-y-auto shrink-0 w-20 py-1 scrollbar-thin">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(img)}
                      className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        selectedImage === img 
                          ? "border-amber-700 ring-2 ring-amber-600/15 scale-95 shadow-sm" 
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <img src={img} alt={`${product.name} gallery ${idx + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Display Image */}
              <div className="flex-1 space-y-4">
                <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 group shadow-sm">
                  <img
                    src={selectedImage || product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.availability === "In Stock" && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        ● Live in Showroom
                      </span>
                    )}
                    {product.availability === "Made to Order" && (
                      <span className="inline-flex items-center rounded-full bg-black/45 backdrop-blur-[2px] px-3 py-1 text-xs font-bold text-white border border-white/20 shadow-sm">
                        ⚙ Custom Tailored
                      </span>
                    )}
                  </div>
                  
                  {/* Premium floating actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2.5 z-10" id="premium-floating-actions-deck">
                    {/* 1. Wishlist Button */}
                    <button
                      onClick={toggleFavorite}
                      className={`p-2.5 rounded-full backdrop-blur-md shadow-md border transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer ${
                        isFavorited
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white/90 border-stone-100 text-stone-600 hover:text-red-500 hover:bg-white"
                      }`}
                      title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFavorited ? "fill-current" : ""}`} />
                    </button>
                    {/* 2. Share Button */}
                    <button
                      onClick={handleShareProduct}
                      className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-100 text-stone-600 hover:text-amber-800 hover:bg-white transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer"
                      title={copied ? "Link Copied!" : "Share Design Link"}
                    >
                      {copied ? (
                        <Check className="h-4.5 w-4.5 text-emerald-600" />
                      ) : (
                        <Share2 className="h-4.5 w-4.5" />
                      )}
                    </button>
                    {/* 3. Download Image Button */}
                    <button
                      onClick={() => downloadImageFile(selectedImage || product.images[0], `${product.name}-${selectedColor || "default"}.jpg`)}
                      className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-100 text-stone-600 hover:text-amber-800 hover:bg-white transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer"
                      title="Download Product Photo"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                {/* Horizontal thumbnail strip for mobile/tablet (hidden on desktop) */}
                {product.images.length > 1 && (
                  <div className="flex md:hidden gap-3 overflow-x-auto py-1 scrollbar-none">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleThumbnailClick(img)}
                        className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          selectedImage === img ? "border-amber-700 scale-95" : "border-stone-200"
                        }`}
                      >
                        <img src={img} alt="thumbnail" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Premium Spec & Customized Configuration UI (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between" id="modal-right-column">
              
              <div className="space-y-5">
                {/* 1. Brand, Name and Rating (below name) */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                    THE AUTUMN ATELIER COLLECTION
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
                    {product.name}
                  </h1>
                  
                  {/* Star rating and reviews (below the name) */}
                  <div className="flex items-center space-x-2.5 mt-2.5">
                    <div className="flex items-center bg-amber-900 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                      <span>4.8</span>
                      <Star className="h-3 w-3 fill-current ml-1" />
                    </div>
                    <span className="text-xs text-stone-500 font-medium hover:underline cursor-pointer">
                      12 Verified Showroom Orders
                    </span>
                  </div>
                </div>

                {/* 2. CIRCULAR IMAGE COLOR SWATCHES (Placed below rating) */}
                {validColors.length > 0 && (
                  <div className="space-y-3 border-t border-stone-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                        Select Color Palette:
                      </span>
                      <span className="text-xs font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-900/10">
                        {selectedColor}
                      </span>
                    </div>
                    
                    {/* Circle Swatches displaying cropped item photos inside */}
                    <div className="flex flex-wrap gap-3.5">
                      {validColors.map((color) => {
                        const colorImg = getColorImage(color);
                        const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              setSelectedImage(colorImg);
                            }}
                            className="group relative flex flex-col items-center focus:outline-none"
                            title={`View in ${color}`}
                          >
                            <div className={`relative h-14 w-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                              isActive 
                                ? "border-amber-700 ring-4 ring-amber-600/15 scale-105 shadow-md" 
                                : "border-stone-200 hover:border-stone-400 hover:scale-105"
                            }`}>
                              <img
                                src={colorImg}
                                alt={color}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className={`mt-1.5 text-[10px] font-medium transition-colors tracking-tight ${
                              isActive ? "text-amber-900 font-extrabold" : "text-stone-500 group-hover:text-stone-800"
                            }`}>
                              {color}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Price & Payment details Display (Placed below the color palette, and styled carefully to prevent squishing) */}
                {product.price && (
                  <div className="border-t border-b border-stone-200/60 py-3.5 flex flex-wrap items-center gap-3 bg-stone-50/70 px-4 rounded-xl">
                    <div className="flex items-baseline space-x-2 shrink-0">
                      <span className="text-2xl font-black font-mono text-stone-900">
                        {product.price}
                      </span>
                      <span className="text-xs text-stone-400 line-through font-mono">
                        ₹{(parseInt(product.price.replace(/[^0-9]/g, "")) * 1.15).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                      <Percent className="h-3.5 w-3.5 mr-1" /> Direct Workshop Discount
                    </span>
                  </div>
                )}

                {/* 4. Description / Short Spec Highlights */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Product Description
                  </span>
                  <p className="text-sm text-stone-600 font-normal leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* 5. Fabric Material options */}
                {product.fabrics && product.fabrics.length > 0 && product.fabrics[0] !== "None" && (
                  <div className="space-y-2 border-t border-stone-100 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      Custom Upholstery Selection: <span className="text-stone-900 font-black">{selectedFabric}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.fabrics.map((fabric) => (
                        <button
                          key={fabric}
                          onClick={() => setSelectedFabric(fabric)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                            selectedFabric === fabric
                              ? "bg-amber-900 text-amber-50 border-amber-900 shadow-sm"
                              : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          {fabric}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Specs Attributes Grid */}
                <div className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Technical Attributes
                    </span>
                    <span className="text-[10px] text-amber-800 font-semibold flex items-center">
                      <Award className="h-3.5 w-3.5 mr-0.5" /> Direct From Factory
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                    <div className="border-b border-stone-200/50 pb-2">
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Base Material</span>
                      <span className="font-bold text-stone-800">{product.material}</span>
                    </div>
                    {product.woodType && (
                      <div className="border-b border-stone-200/50 pb-2">
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Wood Type</span>
                        <span className="font-bold text-stone-800">{product.woodType}</span>
                      </div>
                    )}
                    <div className="border-b border-stone-200/50 pb-2">
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Texture & Finish</span>
                      <span className="font-bold text-stone-800">{product.finish}</span>
                    </div>
                    <div className="border-b border-stone-200/50 pb-2 flex items-center space-x-2">
                      <Ruler className="h-4 w-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Dimensions</span>
                        <span className="font-bold text-stone-800">{product.dimensions}</span>
                      </div>
                    </div>
                    <div className="border-b border-stone-200/50 pb-2 flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Warranty</span>
                        <span className="font-bold text-stone-800">{product.warranty}</span>
                      </div>
                    </div>
                    <div className="border-b border-stone-200/50 pb-2 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Quality Level</span>
                        <span className="font-bold text-stone-800">Premium Export</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 7. Direct WhatsApp Call-to-action (Elegant, Human-designed, Compact Pill with WhatsApp Brand SVG) */}
              <div className="pt-5 border-t border-stone-200/60 mt-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                    Direct From Workshop
                  </span>
                  <p className="text-xs font-bold text-stone-800">
                    Need customized sizing?
                  </p>
                  <p className="text-[11px] text-stone-500 font-normal leading-tight max-w-xs mt-0.5">
                    FNB supports full bespoke sizing, custom polishes, and pan-India doorstep shipping.
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-end">
                  <button
                    onClick={handleWhatsAppInquiry}
                    className="inline-flex items-center justify-center space-x-2 rounded-full bg-[#128C7E] hover:bg-[#075E54] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2"
                    id="wa-detail-inquiry-button"
                  >
                    {/* Official WhatsApp SVG Logo */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-current text-white shrink-0 group-hover:scale-110 transition-transform duration-200"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                    </svg>
                    <span>Inquiry on WhatsApp</span>
                  </button>
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-2 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5 shrink-0"></span>
                    Showroom designers respond instantly
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Related Collections Gallery Section */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-stone-100 pt-8 space-y-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
                Recommended Collections from Furniture N Beyond
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {relatedProducts.map((rp) => (
                  <div
                    key={rp.id}
                    onClick={() => {
                      onOpenProduct(rp);
                    }}
                    className="flex cursor-pointer items-center space-x-3 rounded-xl border border-stone-100 p-3 hover:border-amber-900/10 hover:bg-stone-50/50 transition-all shadow-sm"
                  >
                    <img
                      src={rp.images[0]}
                      alt={rp.name}
                      className="h-14 w-14 rounded-lg object-cover shrink-0 border border-stone-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <span className="block text-[9px] font-bold text-amber-800 uppercase tracking-widest">
                        {categories.find((c) => c.id === rp.categoryId)?.name}
                      </span>
                      <h4 className="font-serif text-xs font-bold text-stone-850 truncate">{rp.name}</h4>
                      <p className="text-[11px] text-stone-500 font-mono font-bold mt-0.5">{rp.price || "Contact for price"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  );
}
