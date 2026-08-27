/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sofa, Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import FnbLogo from "./FnbLogo";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSelectCategory: (catId: string | null) => void;
  userRole: "customer" | "admin";
  setUserRole: (role: "customer" | "admin") => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  onSelectCategory,
  userRole,
  setUserRole,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", tab: "home" },
    { label: "Collections", tab: "categories" },
    { label: "Repair Services", tab: "repair" },
    { label: "Bulk Orders", tab: "bulk" },
    { label: "About Us", tab: "about" },
    { label: "Feedback", tab: "feedback" },
  ];

  // If user is already authenticated as admin, show Admin Console link
  const displayNavItems = userRole === "admin" 
    ? [...navItems, { label: "Admin Console", tab: "admin" }]
    : navItems;

  const handleTabChange = (tabName: string) => {
    setCurrentTab(tabName);
    if (tabName === "admin") {
      setUserRole("admin");
    }
    if (tabName === "categories") {
      onSelectCategory(null); // Reset filters
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-amber-900/10 bg-stone-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 sm:h-22 md:h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Block */}
        <button
          onClick={() => handleTabChange("home")}
          className="group flex items-center focus:outline-none transition-transform active:scale-95 py-1"
          id="logo-button"
        >
          <FnbLogo className="h-11 sm:h-12 md:h-14 lg:h-16 xl:h-18 w-auto max-h-20" />
        </button>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {displayNavItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleTabChange(item.tab)}
                className={`relative py-2 text-sm font-medium tracking-wide transition-colors focus:outline-none ${
                  isActive
                    ? "text-amber-800 font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-amber-700" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Actions (Quick Contact Button) */}
        <div className="hidden md:flex items-center">
          <a
            href="https://wa.me/918830402066?text=Hello%20FNB%20Furniture%20N%20Beyond,%20I%20am%20interested%20in%20browsing%20your%20premium%20collection."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-amber-100 hover:bg-stone-850 hover:text-white transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Inquire Now</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 focus:outline-none"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-stone-200 bg-stone-50 overflow-hidden shadow-inner"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <div className="space-y-1">
                {displayNavItems.map((item) => {
                  const isActive = currentTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleTabChange(item.tab)}
                      className={`block w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors focus:outline-none ${
                        isActive
                          ? "bg-amber-50 text-amber-900 font-semibold border-l-4 border-amber-700"
                          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 px-1">
                <a
                  href="https://wa.me/918830402066?text=Hello%20FNB%20Furniture%20N%20Beyond,%20I%20have%20an%20inquiry%20from%20your%20mobile%20website."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full rounded-xl bg-amber-900 hover:bg-amber-800 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-white shadow"
                >
                  <Phone className="h-4 w-4" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
