/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sofa, MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Category } from "../types";
import FnbLogo from "./FnbLogo";

interface FooterProps {
  categories: Category[];
  setCurrentTab: (tab: string) => void;
  onSelectCategory: (catId: string | null) => void;
  setViewPolicy: (policy: "privacy" | "terms" | null) => void;
}

export default function Footer({ categories, setCurrentTab, onSelectCategory, setViewPolicy }: FooterProps) {
  const handleCategoryClick = (catId: string) => {
    setCurrentTab("categories");
    onSelectCategory(catId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (tab === "categories") {
      onSelectCategory(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Upper micro segment */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand block */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <FnbLogo className="h-12 md:h-14 lg:h-16 w-auto" light={true} />
            </div>
            <p className="text-sm font-light leading-relaxed text-stone-400">
              Premium handcrafted furniture and custom-designed interior solutions directly from the manufacturer. High quality, durability, and customized sizing tailored precisely to your spaces.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://wa.me/918830402066?text=Hello%20FNB,%20I%20am%20interested%20in%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-stone-800 text-amber-500 hover:bg-stone-700 hover:text-white transition-colors"
                title="WhatsApp Contact"
              >
                <Phone className="h-4 w-4" />
              </a>
              <div className="flex items-center text-xs text-stone-500 font-mono">
                Direct Hotline: 8830402066
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-500">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm font-light">
              <li>
                <button onClick={() => handleTabChange("home")} className="hover:text-amber-400 transition-colors">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => handleTabChange("categories")} className="hover:text-amber-400 transition-colors">
                  Explore Collections
                </button>
              </li>
              <li>
                <button onClick={() => handleTabChange("repair")} className="hover:text-amber-400 transition-colors">
                  Repair & Maintenance
                </button>
              </li>
              <li>
                <button onClick={() => handleTabChange("bulk")} className="hover:text-amber-400 transition-colors">
                  Bulk & B2B Orders
                </button>
              </li>
              <li>
                <button onClick={() => handleTabChange("about")} className="hover:text-amber-400 transition-colors">
                  About Our Factory
                </button>
              </li>
            </ul>
          </div>

          {/* Furniture Categories list */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-500">
              Top Categories
            </h3>
            <ul className="grid grid-cols-1 gap-2 text-sm font-light">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              {categories.length > 7 && (
                <li>
                  <button
                    onClick={() => handleTabChange("categories")}
                    className="text-amber-400 hover:underline transition-colors text-xs font-semibold"
                  >
                    + View All {categories.length} Categories
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Location addresses */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-500">
              Contact & Locations
            </h3>
            <div className="space-y-3 text-xs font-light leading-relaxed text-stone-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <span className="font-semibold text-stone-200">Factory Workshop:</span>
                  <p>AT/PO Chandoli BK, Tal. Ambegaon, Dist. Pune, Maharashtra</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <span className="font-semibold text-stone-200">Head Office:</span>
                  <p>Near Bank of Maharashtra, Manchar, Pune, Maharashtra</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <span className="font-semibold text-stone-200">Business Hours:</span>
                  <p>Mon - Sat: 9:00 AM - 8:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <span className="font-semibold text-stone-200">Email Inquiry:</span>
                  <p>info.fnbfurniture@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

        </div>



        {/* Lower copyright segment */}
        <div className="mt-12 border-t border-stone-800 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-stone-500 font-light">
              © 2026 FNB Furniture N Beyond. All Rights Reserved. Crafted for premium lifestyles and institutions across Maharashtra.
            </p>
            <div className="inline-flex items-center space-x-2 pt-2 text-sm font-medium text-stone-200">
              <span className="text-amber-400 font-bold">Developed by — Omkar Karande</span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-300">mob.no — <a href="tel:9834534812" className="hover:text-amber-300 font-semibold font-mono underline decoration-amber-500/50">9834534812</a></span>
            </div>
          </div>
          <div className="flex space-x-6 text-xs text-stone-500 shrink-0">
            <button onClick={() => setViewPolicy("privacy")} className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setViewPolicy("terms")} className="hover:text-amber-400 transition-colors">
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
