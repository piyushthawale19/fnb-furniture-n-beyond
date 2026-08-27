/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string; // URL to category cover image
}

export interface SubCategory {
  id: string;
  categoryId: string; // References Category
  name: string;
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  images: string[]; // List of image URLs
  colors: string[]; // E.g. ["Brown", "Walnut", "White", "Grey"]
  colorMap?: { color: string; image: string }[]; // E.g. [{ color: "Brown", image: "url1" }]
  fabrics: string[]; // E.g. ["Velvet", "Leatherette", "Cotton", "Suede"]
  material: string; // E.g. "Solid Wood", "Teak Wood"
  woodType?: string; // E.g. "Teak Wood", "Sheesham" (optional if metal/plastic)
  finish: string; // E.g. "Matte", "Glossy"
  dimensions: string; // E.g. "84W x 38D x 34H inches"
  warranty: string; // E.g. "3 Years Warranty"
  availability: "In Stock" | "Made to Order" | "Out of Stock";
  price?: string; // E.g. "₹45,000" (optional/premium look)
  featured: boolean;
  newest: boolean;
  createdAt: string;
  glbModelUrl?: string;
  usdzModelUrl?: string;
}

export interface RepairRequest {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  serviceCategory: string; // E.g. "Sofa Repair", "Curtain Installation"
  description: string;
  imageUrl?: string; // Base64 data or placeholder
  preferredDate: string;
  status: "Pending" | "In Progress" | "Completed";
  createdAt: string;
}

export interface BulkOrderRequest {
  id: string;
  clientName: string;
  companyName?: string;
  phone: string;
  email: string;
  clientType: string;
  description: string;
  preferredDate: string;
  status: "Pending" | "Reviewed" | "Contacted";
  createdAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkType: "explore" | "repair" | "whatsapp";
}

export interface Testimonial {
  id: string;
  name: string;
  role: string; // E.g. "Home Owner, Pune", "Hotel Manager, Mumbai"
  comment: string;
  rating: number;
}

export interface AboutPillar {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AboutLocation {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  note: string;
}

export interface AboutContent {
  id?: string;
  tagline: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  pillarsTitle: string;
  pillars: AboutPillar[];
  locationsTitle: string;
  locations: AboutLocation[];
}

export interface SiteSettings {
  id?: string;
  storeName?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  address?: string;
  storageProvider?: string;
  [key: string]: any;
}

export interface UserFeedback {
  id: string;
  name: string;
  city?: string;
  productPurchased?: string;
  comment: string;
  rating: number;
  imageUrl?: string;
  pushedToHome: boolean;
  status: "Pending" | "Approved" | "Archived";
  createdAt: string;
}

export interface RepairReferenceImage {
  id: string;
  imageUrl: string;
  title?: string;
  createdAt?: string;
}

