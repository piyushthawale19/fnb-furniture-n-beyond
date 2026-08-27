/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  PhoneCall,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  Sofa,
  Sparkles,
  ChevronDown,
  Hammer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon
} from "lucide-react";
import { RepairRequest, RepairReferenceImage } from "../types";

interface RepairFormProps {
  onSubmitRequest: (request: Omit<RepairRequest, "id" | "status" | "createdAt">) => void;
  repairHistory: RepairRequest[];
  repairImages?: RepairReferenceImage[];
}

export default function RepairForm({ onSubmitRequest, repairHistory, repairImages = [] }: RepairFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceCategory, setServiceCategory] = useState("Upholstery Change");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Fullscreen Image Lightbox Preview
  const [previewImg, setPreviewImg] = useState<{ url: string; title?: string } | null>(null);

  // Scroll ref for reference images
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRefImages = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -340 : 340,
        behavior: "smooth"
      });
    }
  };

  // Manual Date & Time options
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("10:00 AM");

  const services = [
    "Upholstery Change",
    "Sofa Repair",
    "Foam Replacement",
    "Structural Frame Reinforcement",
    "Ortho-Cushion Upgrades",
    "Furniture Maintenance",
    "Curtain Installation",
    "Wallpaper Installation",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !description) {
      alert("Please fill in all required fields (Full Name, Phone, and Details).");
      return;
    }

    const finalAddress = address || "Address to be confirmed via WhatsApp call";

    // Call state handler to save request to admin logs
    onSubmitRequest({
      customerName,
      phone,
      address: finalAddress,
      serviceCategory,
      description: `${description} | Selected Slot: ${timeSlot}`,
      preferredDate,
    });

    // Launch WhatsApp message to Admin WhatsApp (918830402066)
    const formattedText = encodeURIComponent(
      `🔨 *FNB FURNITURE REPAIR & RESTORATION REQUEST* 🔨\n\n` +
      `*Customer Details:*\n` +
      `- Name: ${customerName}\n` +
      `- Phone: ${phone}\n` +
      `- Address: ${finalAddress}\n\n` +
      `*Service Required:*\n` +
      `- Service Category: ${serviceCategory}\n` +
      `- Appointment Date: ${preferredDate}\n` +
      `- Preferred Time Slot: ${timeSlot}\n` +
      `- Issue / Requirements: ${description}\n\n` +
      `Sent from FNB Furniture N Beyond Website.`
    );
    window.open(`https://wa.me/918830402066?text=${formattedText}`, "_blank");

    setSubmitted(true);
    // Reset form
    setCustomerName("");
    setPhone("");
    setAddress("");
    setDescription("");

    setTimeout(() => {
      setSubmitted(false);
    }, 6000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* 1. HERO BANNER: RESTORATION & REPAIR */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-800 min-h-[260px] flex flex-col justify-center px-6 py-10 sm:px-12 bg-black text-white">
        {/* Background Image of Carpentry Workshop */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80"
            alt="Carpentry restoration laboratory" 
            className="w-full h-full object-cover object-center opacity-65 transform scale-102 hover:scale-100 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Content over image */}
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.35em] text-amber-400 block">
            ATELIER & WORKSHOP
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05] text-amber-50">
            RESTORATION & <br className="hidden sm:inline"/>REPAIR
          </h1>
          <p className="text-stone-300 font-light text-xs sm:text-sm leading-relaxed max-w-xl">
            Don't throw away old or broken furniture. Our skilled craftsmen repair wood, change sofa covers, fix loose frames, and replace soft foam to make your furniture look and feel brand new.
          </p>
        </div>

        {/* Elegant top right watermark */}
        <div className="hidden md:block absolute top-8 right-12 text-right opacity-15 pointer-events-none">
          <span className="font-serif text-5xl font-light italic tracking-tight text-amber-400">FNB Atelier</span>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: SPECIALTIES & COMMISSION FORM */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        
        {/* Left Column: Restoration Specialties */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-800 block">
              OUR SERVICES
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              RESTORATION SPECIALITIES
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed font-normal">
              We fix, repair, and renew your old or damaged furniture like sofas, chairs, and tables. Choose what service you need help with:
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Specialty 1 */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-stone-200/50 hover:border-amber-500/20 shadow-sm transition-all duration-300">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-stone-900 flex items-center justify-center text-white">
                <Sofa className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wide">
                  UPHOLSTERY CHANGE
                </h4>
                <p className="text-xs font-normal text-stone-600 leading-normal">
                  Change sofa covers or fabric. Choose from velvet, leatherette, and easy-clean stain-resistant fabrics.
                </p>
              </div>
            </div>

            {/* Specialty 2 */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-stone-200/50 hover:border-amber-500/20 shadow-sm transition-all duration-300">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-stone-900 flex items-center justify-center text-white">
                <Hammer className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wide">
                  STRUCTURAL FRAME REINFORCEMENT
                </h4>
                <p className="text-xs font-normal text-stone-600 leading-normal">
                  Fix loose wooden joints, broken frames, squeaking sounds, and sagging springs.
                </p>
              </div>
            </div>

            {/* Specialty 3 */}
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-stone-200/50 hover:border-amber-500/20 shadow-sm transition-all duration-300">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-stone-900 flex items-center justify-center text-white">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wide">
                  ORTHO-CUSHION UPGRADES
                </h4>
                <p className="text-xs font-normal text-stone-600 leading-normal">
                  Replace old or sunken sofa foam with long-lasting high-density foam and comfortable cushions.
                </p>
              </div>
            </div>
          </div>

          {/* Call support prompt */}
          <div className="rounded-2xl bg-stone-950 text-[#F5F2ED] p-6 space-y-4 border border-amber-500/15">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Atelier Direct Helpline</span>
            </div>
            <p className="text-xs font-light text-stone-300 leading-relaxed">
              Have customized dimensions or an entire ancestral home set to restore? Share images directly on WhatsApp with our workshop supervisor.
            </p>
            <a
              href="https://wa.me/918830402066?text=Hello%20FNB%20Furniture%20N%20Beyond,%20I%20want%20to%20get%20a%20price%20quote%20for%20a%20sofa/furniture%20repair%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full rounded-xl bg-[#25D366] hover:bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm"
            >
              <PhoneCall className="h-4 w-4" />
              <span>WhatsApp Workshop Supervisor</span>
            </a>
          </div>
        </div>

        {/* Right Column: High-End Commission Restoration Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#E6E1D6]/30 border border-stone-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {submitted && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-center space-x-3 text-emerald-800 animate-fade-in">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  Commission logged! Opening Admin WhatsApp with your repair details...
                </span>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C7E6A] block">
                WORK INQUIRY
              </span>
              <h3 className="font-serif text-xl font-bold text-[#5D4037] uppercase tracking-wide">
                COMMISSION RESTORATION
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Full Name & Phone Number */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-transparent border-b border-stone-300 py-2 text-sm outline-none focus:border-amber-700 transition-colors placeholder-stone-400 font-light"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Phone (e.g. +91 99999 88888) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border-b border-stone-300 py-2 text-sm outline-none focus:border-amber-700 transition-colors placeholder-stone-400 font-light"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* Row 2: Service Type Selector */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  SERVICE TYPE
                </label>
                <div className="relative">
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full bg-transparent border-b border-stone-300 py-2 text-sm outline-none focus:border-amber-700 transition-colors appearance-none cursor-pointer font-medium text-stone-800 pr-8"
                  >
                    {services.map((srv, idx) => (
                      <option key={idx} value={srv} className="bg-white text-stone-900">
                        {srv}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1 bottom-2.5 h-4 w-4 text-stone-500 pointer-events-none" />
                </div>
              </div>

              {/* Row 3: Site Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Onsite Site Address (All Maharashtra service)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-transparent border-b border-stone-300 py-2 text-sm outline-none focus:border-amber-700 transition-colors placeholder-stone-400 font-light"
                  placeholder="Street address, City, Maharashtra"
                />
              </div>

              {/* Row 4: Issue Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Describe sagging, cracks, or wear *
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent border-b border-stone-300 py-2 text-sm outline-none focus:border-amber-700 transition-colors placeholder-stone-400 font-light resize-none"
                  placeholder="Tell us about the issue or required fabrics..."
                />
              </div>

              {/* Row 5: Manual Date Picker */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  📅 SELECT APPOINTMENT DATE *
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-700 font-medium text-stone-800 shadow-sm"
                />
              </div>

              {/* Row 6: Preferred Time Slots */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  ⏰ PREFERRED TIME SLOT
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                        timeSlot === slot
                          ? "bg-[#D4AF37] border-[#D4AF37] text-stone-950 font-bold shadow-sm"
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-950 hover:text-amber-400 active:scale-98 transition-all duration-300 py-4 px-6 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg rounded-xl flex items-center justify-center space-x-2 border border-transparent hover:border-amber-500/20"
              >
                <span>Commission Restoration</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* Local Submitted Request History hidden */}
      {/* 
      {repairHistory.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-[#E6E1D6]/20 p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <ClipboardCheck className="h-5 w-5 text-amber-800" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Your Inquiry Tracking</h3>
          </div>
          <div className="overflow-x-auto rounded-xl bg-white border border-stone-200/50">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold bg-stone-50/50">
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-light">
                {repairHistory.map((req) => (
                  <tr key={req.id} className="hover:bg-stone-50/30">
                    <td className="py-3 px-4 font-semibold text-stone-900">{req.serviceCategory}</td>
                    <td className="py-3 px-4">{req.preferredDate}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block rounded px-2.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      */}

      {/* 3. REPAIR & RESTORATION REFERENCE WORK GALLERY (SCROLLABLE IMAGES) */}
      <div className="pt-8 border-t border-stone-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 block">
              WORK EXAMPLES & PROOF
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              REPAIR SERVICE REFERENCE IMAGES
            </h2>
            <p className="text-xs text-stone-500 font-light">
              Actual before & after restoration examples and custom repair work completed by our workshop craftsmen.
            </p>
          </div>

          {repairImages.length > 1 && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => scrollRefImages("left")}
                className="p-2.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:border-amber-500/50 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRefImages("right")}
                className="p-2.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:border-amber-500/50 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {repairImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center space-y-2">
            <ImageIcon className="h-8 w-8 text-stone-400 mx-auto" />
            <p className="text-xs font-medium text-stone-600">No reference images uploaded yet.</p>
            <p className="text-[11px] text-stone-400">Admin can upload repair work images from the Admin Panel.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex items-center gap-5 overflow-x-auto pb-4 scrollbar-thin scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "thin" }}
          >
            {repairImages.map((imgItem) => (
              <div
                key={imgItem.id}
                onClick={() => setPreviewImg({ url: imgItem.imageUrl, title: imgItem.title })}
                className="group relative shrink-0 w-[280px] sm:w-[340px] aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm cursor-pointer snap-start transition-all duration-300 hover:shadow-md hover:border-amber-500/40"
              >
                <img
                  src={imgItem.imageUrl}
                  alt={imgItem.title || "Repair Reference Work"}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-white">
                    <span className="text-xs font-medium truncate drop-shadow-sm pr-2">
                      {imgItem.title || "Restoration Example"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {previewImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-800 text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {previewImg.title || "Repair Service Reference Image"}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImg(null)}
                className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black">
              <img
                src={previewImg.url}
                alt={previewImg.title || "Reference Image"}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

