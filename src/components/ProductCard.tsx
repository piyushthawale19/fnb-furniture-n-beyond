/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MessageCircle, ArrowUpRight, Heart, Star, Share2, Check } from "lucide-react";
import { Product, Category } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  categories: Category[];
  onOpenDetails: (product: Product) => void;
}

export default function ProductCard({ product, categories, onOpenDetails }: ProductCardProps) {
  const categoryName = categories.find((c) => c.id === product.categoryId)?.name || "Furniture";
  const [isFavorited, setIsFavorited] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);

  const handleShareProductCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: shareUrl,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCardCopied(true);
        setTimeout(() => setCardCopied(false), 2000);
      });
    }
  };

  // Load favorited state from localStorage on mount
  useEffect(() => {
    const favs = localStorage.getItem("fnb_favorites");
    if (favs) {
      try {
        const parsed = JSON.parse(favs) as string[];
        if (parsed.includes(product.id)) {
          setIsFavorited(true);
        }
      } catch (e) {
        console.error("Error parsing favorites", e);
      }
    }
  }, [product.id]);

  // Toggle favorite state
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening details modal
    const favs = localStorage.getItem("fnb_favorites");
    let updated: string[] = [];
    if (favs) {
      try {
        updated = JSON.parse(favs) as string[];
      } catch (err) {
        updated = [];
      }
    }
    if (updated.includes(product.id)) {
      updated = updated.filter((id) => id !== product.id);
      setIsFavorited(false);
    } else {
      updated.push(product.id);
      setIsFavorited(true);
    }
    localStorage.setItem("fnb_favorites", JSON.stringify(updated));
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details modal
    const text = encodeURIComponent(
      `Hello FNB Furniture N Beyond! I am interested in inquiring about: *${product.name}*\n\n` +
      `Category: ${categoryName}\n` +
      `Material: ${product.material}\n` +
      `Dimensions: ${product.dimensions}\n` +
      `Warranty: ${product.warranty}\n\n` +
      `Could you please share the pricing, fabric, and delivery timeline for Maharashtra/India? Thank you!`
    );
    window.open(`https://wa.me/918830402066?text=${text}`, "_blank");
  };

  // Extract a single fabric and color from lists for the elegant specs bar
  const displayFabric = product.fabrics && product.fabrics.length > 0 ? product.fabrics[0] : "Premium Fabric";
  const displayColor = product.colors && product.colors.length > 0 ? product.colors[0] : "Custom Shade";

  // Dummy premium badge text based on attributes
  const badgeText = product.featured ? "BESTSELLER" : product.newest ? "NEW ARRIVAL" : categoryName.toUpperCase();

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-amber-900/15"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Cover Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-50">
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Floating Custom Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-block bg-amber-950/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-amber-500/20 shadow-sm">
            {badgeText}
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3.5 right-3.5 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-100 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Add to favorites"
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-300 ${
              isFavorited ? "fill-red-500 text-red-500" : "text-stone-500 hover:text-red-500"
            }`}
          />
        </button>

        {/* Compact Share Button below Favorite Button */}
        <button
          onClick={handleShareProductCard}
          className="absolute top-[52px] right-3.5 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-100 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Share product"
          title={cardCopied ? "Link Copied!" : "Share Design"}
        >
          {cardCopied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Share2 className="h-4 w-4 text-stone-500 hover:text-amber-800" />
          )}
        </button>

        {/* Availability text banner */}
        <span className="absolute bottom-3 right-3 rounded-md bg-stone-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
          {product.availability}
        </span>
      </div>

      {/* Product Details Section */}
      <div className="mt-4 space-y-3.5">
        
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.price && (
            <span className="font-mono text-base font-bold text-stone-900 shrink-0">
              {product.price}
            </span>
          )}
        </div>

        {/* Rating Stars row with aesthetic visual score */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <Star className="h-3.5 w-3.5 fill-amber-500/30 text-amber-500/30" />
          </div>
          <span className="text-stone-400 font-medium text-[10px]">4.8 / 5.0</span>
        </div>

        {/* Short Description */}
        <p className="text-xs font-light text-stone-500 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Specifications strip with thin dividers */}
        <div className="grid grid-cols-2 gap-2 border-t border-b border-stone-100 py-2.5 text-[11px] text-stone-600 font-medium bg-stone-50/50 px-2 rounded-lg">
          <div className="flex items-center space-x-1">
            <span className="text-stone-400 font-light">Fabric:</span>
            <span className="text-stone-900 font-bold truncate">{displayFabric}</span>
          </div>
          <div className="flex items-center space-x-1 border-l border-stone-200 pl-2">
            <span className="text-stone-400 font-light">Color:</span>
            <span className="text-stone-900 font-bold truncate">{displayColor}</span>
          </div>
        </div>

        {/* INQUIRE WITH CONCIERGE Elegant Action Button */}
        <button
          onClick={handleWhatsAppClick}
          className="w-full bg-stone-900 hover:bg-[#D4AF37] hover:text-stone-950 active:scale-98 transition-all duration-300 py-3 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm rounded-xl flex items-center justify-center space-x-2 border border-transparent"
          id={`wa-btn-${product.id}`}
        >
          <span>Inquire with Concierge</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}
