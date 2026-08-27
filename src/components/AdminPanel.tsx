/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Image as ImageIcon,
  Wrench,
  Building,
  UserCheck,
  Check,
  Save,
  X,
  FileText,
  Upload,
  Info,
  MapPin,
  Building2,
  MessageSquare,
  Star,
  Sparkles,
  Share2,
  Cloud,
  Database,
  Key,
  CheckCircle,
  RefreshCw,
  Layers,
  ExternalLink,
  Globe,
  HardDrive,
  ShieldCheck,
  Activity,
  Download,
  PieChart,
  Server,
  Zap,
  Calculator,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Category,
  SubCategory,
  Product,
  Banner,
  Testimonial,
  RepairRequest,
  BulkOrderRequest,
  AboutContent,
  AboutPillar,
  AboutLocation,
  UserFeedback,
  RepairReferenceImage
} from "../types";
import {
  SYSTEM_COLORS,
  SYSTEM_FABRICS,
  SYSTEM_MATERIALS,
  SYSTEM_FINISHES,
} from "../data/initialData";
import {
  compressImageToMax3MB,
  formatBytes,
  downloadImageFile,
  CompressionResult,
} from "../lib/imageProcessor";
import {
  SiteSettings,
  deleteFirestoreDoc,
  COLLECTIONS,
} from "../lib/firebase";

interface AdminPanelProps {
  categories: Category[];
  subCategories: SubCategory[];
  products: Product[];
  banners: Banner[];
  testimonials: Testimonial[];
  repairHistory: RepairRequest[];
  bulkHistory: BulkOrderRequest[];
  aboutContent: AboutContent;
  feedbacks: UserFeedback[];
  repairImages?: RepairReferenceImage[];
  siteSettings?: SiteSettings;
  firebaseStatus?: "connected" | "connecting" | "offline";
  
  onUpdateCategories: (cats: Category[]) => void;
  onUpdateSubCategories: (subs: SubCategory[]) => void;
  onUpdateProducts: (prods: Product[]) => void;
  onUpdateBanners: (banners: Banner[]) => void;
  onUpdateTestimonials: (tests: Testimonial[]) => void;
  onUpdateRepairHistory: (repairs: RepairRequest[]) => void;
  onUpdateBulkHistory: (bulks: BulkOrderRequest[]) => void;
  onUpdateAboutContent: (about: AboutContent) => void;
  onUpdateFeedbacks: (fbs: UserFeedback[]) => void;
  onUpdateRepairImages?: (imgs: RepairReferenceImage[]) => void;
  onUpdateSiteSettings?: (settings: SiteSettings) => void;

  onDeleteCategory?: (id: string) => void;
  onDeleteSubCategory?: (id: string) => void;
  onDeleteProduct?: (id: string) => void;
  onDeleteBanner?: (id: string) => void;
  onDeleteTestimonial?: (id: string) => void;
  onDeleteFeedback?: (id: string) => void;
  onDeleteRepairImage?: (id: string) => void;
  onDeleteRepairHistory?: (id: string) => void;
  onDeleteBulkHistory?: (id: string) => void;
}

export default function AdminPanel({
  categories,
  subCategories,
  products,
  banners,
  testimonials,
  repairHistory,
  bulkHistory,
  aboutContent,
  feedbacks = [],
  repairImages = [],
  siteSettings = {},
  firebaseStatus = "connected",
  onUpdateCategories,
  onUpdateSubCategories,
  onUpdateProducts,
  onUpdateBanners,
  onUpdateTestimonials,
  onUpdateRepairHistory,
  onUpdateBulkHistory,
  onUpdateAboutContent,
  onUpdateFeedbacks,
  onUpdateRepairImages,
  onUpdateSiteSettings,
  onDeleteCategory,
  onDeleteSubCategory,
  onDeleteProduct,
  onDeleteBanner,
  onDeleteTestimonial,
  onDeleteFeedback,
  onDeleteRepairImage,
  onDeleteRepairHistory,
  onDeleteBulkHistory,
}: AdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<
    | "products"
    | "categories"
    | "banners"
    | "repairs"
    | "bulks"
    | "testimonials"
    | "about"
    | "feedback"
    | "repair_images"
    | "settings"
  >("products");


  // Feedback filter state
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "pushed" | "pending">("all");

  // State for editing About Us section
  const [aboutForm, setAboutForm] = useState<AboutContent>(aboutContent);
  const [aboutSavedMessage, setAboutSavedMessage] = useState<boolean>(false);

  // Form states - Products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    name: "",
    shortDescription: "",
    description: "",
    categoryId: categories[0]?.id || "",
    subCategoryId: subCategories[0]?.id || "",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"],
    colors: ["Brown"],
    fabrics: ["Velvet"],
    material: "Solid Wood",
    woodType: "Teak Wood",
    finish: "Glossy",
    dimensions: "36 x 36 x 36 inches",
    warranty: "1 Year Warranty",
    availability: "In Stock",
    price: "₹15,000",
    featured: false,
    newest: false,
  });

  // Form states - Categories
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<Partial<Category>>({
    id: "",
    name: "",
    description: "",
    image: "",
  });

  // Form states - Subcategories
  const [subForm, setSubForm] = useState({
    id: "",
    categoryId: categories[0]?.id || "",
    name: "",
  });

  // Form states - Banners
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkType: "explore",
  });

  // Form states - Testimonials
  const [editingTest, setEditingTest] = useState<Testimonial | null>(null);
  const [testForm, setTestForm] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    comment: "",
    rating: 5,
  });

  // Form state - Repair Reference Images
  const [repairImgForm, setRepairImgForm] = useState({ title: "", imageUrl: "" });

  // Unified Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type:
      | "product"
      | "category"
      | "subcategory"
      | "banner"
      | "testimonial"
      | "feedback"
      | "repair_image"
      | "repair_log"
      | "bulk_log";
    id: string;
    name: string;
  } | null>(null);

  // Uploading field tracking state
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [lastCompressionResult, setLastCompressionResult] = useState<CompressionResult | null>(null);

  // Store Settings Form State (Direct Firebase Firestore persistence)
  const [storeSettingsForm, setStoreSettingsForm] = useState<{
    storeName: string;
    whatsappNumber: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
  }>({
    storeName: siteSettings?.storeName || "FNB Furniture & Interior",
    whatsappNumber: siteSettings?.whatsappNumber || "+91 98765 43210",
    contactPhone: siteSettings?.contactPhone || "+91 98765 43210",
    contactEmail: siteSettings?.contactEmail || "orders@fnbfurniture.com",
    address: siteSettings?.address || "FNB Design Studio, Showroom Arcade, Mumbai, India",
  });

  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState<boolean>(false);
  
  // Calculate live image storage breakdown and totals across the database
  const storageAnalysis = useMemo(() => {
    const allImages: {
      id: string;
      url: string;
      title: string;
      source: "Product" | "Banner" | "Category" | "Repair Gallery" | "Customer Feedback";
      category?: string;
      estimatedSizeKB: number;
    }[] = [];

    // 1. Products images
    products.forEach((p) => {
      (p.images || []).forEach((img, idx) => {
        if (img) {
          const isBase64 = img.startsWith("data:");
          const estKB = isBase64 ? Math.round((img.length * 0.75) / 1024) : 380;
          allImages.push({
            id: `prod-${p.id}-${idx}`,
            url: img,
            title: `${p.name} (Angle ${idx + 1})`,
            source: "Product",
            category: p.categoryId,
            estimatedSizeKB: estKB,
          });
        }
      });
    });

    // 2. Banners
    banners.forEach((b) => {
      if (b.imageUrl) {
        const isBase64 = b.imageUrl.startsWith("data:");
        const estKB = isBase64 ? Math.round((b.imageUrl.length * 0.75) / 1024) : 450;
        allImages.push({
          id: `banner-${b.id}`,
          url: b.imageUrl,
          title: b.title || "Hero Banner",
          source: "Banner",
          estimatedSizeKB: estKB,
        });
      }
    });

    // 3. Categories
    categories.forEach((c) => {
      if (c.image) {
        const isBase64 = c.image.startsWith("data:");
        const estKB = isBase64 ? Math.round((c.image.length * 0.75) / 1024) : 320;
        allImages.push({
          id: `cat-${c.id}`,
          url: c.image,
          title: `${c.name} Category Cover`,
          source: "Category",
          estimatedSizeKB: estKB,
        });
      }
    });

    // 4. Repair Reference Images
    repairImages.forEach((r) => {
      if (r.imageUrl) {
        const isBase64 = r.imageUrl.startsWith("data:");
        const estKB = isBase64 ? Math.round((r.imageUrl.length * 0.75) / 1024) : 350;
        allImages.push({
          id: `repair-${r.id}`,
          url: r.imageUrl,
          title: r.title || "Repair Reference Work",
          source: "Repair Gallery",
          estimatedSizeKB: estKB,
        });
      }
    });

    // 5. Feedbacks
    feedbacks.forEach((f) => {
      if (f.imageUrl) {
        const isBase64 = f.imageUrl.startsWith("data:");
        const estKB = isBase64 ? Math.round((f.imageUrl.length * 0.75) / 1024) : 300;
        allImages.push({
          id: `feedback-${f.id}`,
          url: f.imageUrl,
          title: `${f.name}'s Feedback Photo`,
          source: "Customer Feedback",
          estimatedSizeKB: estKB,
        });
      }
    });

    const totalImagesCount = allImages.length;
    const totalEstSizeKB = allImages.reduce((sum, item) => sum + item.estimatedSizeKB, 0);
    const totalEstSizeMB = (totalEstSizeKB / 1024).toFixed(2);
    const totalEstSizeGB = (totalEstSizeKB / (1024 * 1024)).toFixed(3);
    const quotaGB = 5.0;
    const quotaMB = 5 * 1024; // 5120 MB
    const quotaKB = 5 * 1024 * 1024; // 5242880 KB

    const usagePercent = Math.min(100, Math.max(0.1, (totalEstSizeKB / quotaKB) * 100)).toFixed(2);
    const remainingGB = Math.max(0, quotaGB - (totalEstSizeKB / (1024 * 1024))).toFixed(2);

    const avgSizeKB = 350;
    const maxImagesPossible = Math.floor(quotaKB / avgSizeKB);
    const remainingImagesPossible = Math.floor((quotaKB - totalEstSizeKB) / avgSizeKB);

    return {
      allImages,
      totalImagesCount,
      totalEstSizeKB,
      totalEstSizeMB,
      totalEstSizeGB,
      quotaGB,
      usagePercent,
      remainingGB,
      maxImagesPossible,
      remainingImagesPossible,
      productsImagesCount: allImages.filter((i) => i.source === "Product").length,
      bannersImagesCount: allImages.filter((i) => i.source === "Banner").length,
      categoriesImagesCount: allImages.filter((i) => i.source === "Category").length,
      repairsImagesCount: allImages.filter((i) => i.source === "Repair Gallery").length,
      feedbacksImagesCount: allImages.filter((i) => i.source === "Customer Feedback").length,
    };
  }, [products, banners, categories, repairImages, feedbacks]);

  useEffect(() => {
    if (siteSettings) {
      setStoreSettingsForm({
        storeName: siteSettings.storeName || "FNB Furniture & Interior",
        whatsappNumber: siteSettings.whatsappNumber || "+91 98765 43210",
        contactPhone: siteSettings.contactPhone || "+91 98765 43210",
        contactEmail: siteSettings.contactEmail || "orders@fnbfurniture.com",
        address: siteSettings.address || "FNB Design Studio, Showroom Arcade, Mumbai, India",
      });
    }
  }, [siteSettings]);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSiteSettings) {
      onUpdateSiteSettings({
        ...siteSettings,
        storeName: storeSettingsForm.storeName.trim(),
        whatsappNumber: storeSettingsForm.whatsappNumber.trim(),
        contactPhone: storeSettingsForm.contactPhone.trim(),
        contactEmail: storeSettingsForm.contactEmail.trim(),
        address: storeSettingsForm.address.trim(),
        storageProvider: "Firebase Direct Cloud Storage (Auto <3MB)",
        updatedAt: new Date().toISOString(),
      });
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 4000);
    }
  };

  /**
   * Directly uploads & converts an image of ANY size (e.g. 10MB, 20MB) to <= 3MB,
   * preserving sharp detail, and stores it directly into Firebase Firestore!
   */
  const handleUploadImageFile = async (
    file: File,
    folder: string,
    onSuccess: (url: string) => void,
    fieldId: string
  ) => {
    setUploadingField(fieldId);
    try {
      // Auto-compress any large image (e.g. 10MB+) down to strictly <= 3MB with crisp resolution
      const result = await compressImageToMax3MB(file, {
        maxSizeMB: 0.6, // Optimal size for high resolution and fast cloud streaming
        maxWidth: 1600,
        maxHeight: 1600,
        preferredFormat: "image/jpeg",
      });

      setLastCompressionResult(result);

      if (result.url) {
        onSuccess(result.url);
      }
    } catch (err) {
      console.error("Direct Firebase image processing error:", err);
    } finally {
      setUploadingField(null);
    }
  };

  const executeDelete = () => {
    if (!deleteConfirmTarget) return;
    const { type, id } = deleteConfirmTarget;

    if (type === "product") {
      if (onDeleteProduct) {
        onDeleteProduct(id);
      } else {
        onUpdateProducts(products.filter((p) => p.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.PRODUCTS, id).catch(console.error);
    } else if (type === "category") {
      if (onDeleteCategory) {
        onDeleteCategory(id);
      } else {
        onUpdateCategories(categories.filter((c) => c.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.CATEGORIES, id).catch(console.error);
    } else if (type === "subcategory") {
      if (onDeleteSubCategory) {
        onDeleteSubCategory(id);
      } else {
        onUpdateSubCategories(subCategories.filter((s) => s.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.SUBCATEGORIES, id).catch(console.error);
    } else if (type === "banner") {
      if (onDeleteBanner) {
        onDeleteBanner(id);
      } else {
        onUpdateBanners(banners.filter((b) => b.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.BANNERS, id).catch(console.error);
    } else if (type === "testimonial") {
      if (onDeleteTestimonial) {
        onDeleteTestimonial(id);
      } else {
        onUpdateTestimonials(testimonials.filter((t) => t.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.TESTIMONIALS, id).catch(console.error);
    } else if (type === "feedback") {
      if (onDeleteFeedback) {
        onDeleteFeedback(id);
      } else {
        onUpdateFeedbacks(feedbacks.filter((f) => f.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.FEEDBACKS, id).catch(console.error);
    } else if (type === "repair_image") {
      if (onDeleteRepairImage) {
        onDeleteRepairImage(id);
      } else if (onUpdateRepairImages) {
        onUpdateRepairImages(repairImages.filter((img) => img.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.REPAIR_IMAGES, id).catch(console.error);
    } else if (type === "repair_log") {
      if (onDeleteRepairHistory) {
        onDeleteRepairHistory(id);
      } else {
        onUpdateRepairHistory(repairHistory.filter((r) => r.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.REPAIR_REQUESTS, id).catch(console.error);
    } else if (type === "bulk_log") {
      if (onDeleteBulkHistory) {
        onDeleteBulkHistory(id);
      } else {
        onUpdateBulkHistory(bulkHistory.filter((b) => b.id !== id));
      }
      deleteFirestoreDoc(COLLECTIONS.BULK_ORDERS, id).catch(console.error);
    }

    setDeleteConfirmTarget(null);
  };

  const handleSaveRepairImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairImgForm.imageUrl.trim()) {
      return;
    }
    const newImg: RepairReferenceImage = {
      id: "rep-img-" + Date.now(),
      imageUrl: repairImgForm.imageUrl.trim(),
      title: repairImgForm.title.trim() || "Restoration Example",
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updated = [newImg, ...repairImages];
    if (onUpdateRepairImages) {
      onUpdateRepairImages(updated);
    }
    setRepairImgForm({ title: "", imageUrl: "" });
  };

  const handleDeleteRepairImage = (id: string, title?: string) => {
    setDeleteConfirmTarget({
      type: "repair_image",
      id,
      name: title || "Repair Service Reference Image"
    });
  };

  const handleRepairImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImageFile(
        file,
        "repairs",
        (url) => {
          const newImg: RepairReferenceImage = {
            id: "rep-img-" + Date.now(),
            imageUrl: url,
            title: repairImgForm.title.trim() || file.name.replace(/\.[^/.]+$/, "") || "Restoration Example",
            createdAt: new Date().toISOString().split("T")[0]
          };
          const updated = [newImg, ...repairImages];
          if (onUpdateRepairImages) {
            onUpdateRepairImages(updated);
          }
          setRepairImgForm({ title: "", imageUrl: "" });
        },
        "repair-image"
      );
    }
  };

  // Image input text field helper
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [detectingIndex, setDetectingIndex] = useState<number | null>(null);

  // Helper to extract or fallback colorMap rows
  const getColorMapRows = (): { color: string; image: string }[] => {
    if (prodForm.colorMap && prodForm.colorMap.length > 0) {
      return prodForm.colorMap;
    }
    const imgs = prodForm.images || [];
    const cols = prodForm.colors || [];
    if (imgs.length === 0) {
      return [{ color: "Brown", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80" }];
    }
    return imgs.map((img, idx) => ({
      image: img,
      color: cols[idx] || "Custom Color",
    }));
  };

  const handleUpdateColorMapRow = (index: number, field: "image" | "color", value: string) => {
    const currentRows = getColorMapRows();
    const updated = currentRows.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setProdForm({
      ...prodForm,
      colorMap: updated,
      images: updated.map((r) => r.image).filter(Boolean),
      colors: Array.from(new Set(updated.map((r) => r.color).filter(Boolean))),
    });
  };

  const handleAddColorMapRow = () => {
    const currentRows = getColorMapRows();
    const updated = [...currentRows, { color: "", image: "" }];
    setProdForm({
      ...prodForm,
      colorMap: updated,
      images: updated.map((r) => r.image).filter(Boolean),
      colors: Array.from(new Set(updated.map((r) => r.color).filter(Boolean))),
    });
  };

  const handleDeleteColorMapRow = (index: number) => {
    const currentRows = getColorMapRows();
    const updated = currentRows.filter((_, idx) => idx !== index);
    setProdForm({
      ...prodForm,
      colorMap: updated,
      images: updated.map((r) => r.image).filter(Boolean),
      colors: Array.from(new Set(updated.map((r) => r.color).filter(Boolean))),
    });
  };

  const handleAIDetectColor = async (index: number, imageUrl: string) => {
    if (!imageUrl) {
      alert("Please enter an image URL first to analyze.");
      return;
    }
    setDetectingIndex(index);
    try {
      const res = await fetch("/api/ai/detect-color", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (res.ok && data.color) {
        handleUpdateColorMapRow(index, "color", data.color);
      } else {
        alert(data.error || "Could not detect color. Please type it manually.");
      }
    } catch (err: any) {
      console.error("AI color detection failed:", err);
      alert("AI analysis failed. Please type color manually.");
    } finally {
      setDetectingIndex(null);
    }
  };

  // Handler: Add/Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.categoryId || !prodForm.subCategoryId) {
      alert("Please fill out Name, Category, and Subcategory.");
      return;
    }

    const rows = getColorMapRows();
    const finalImages = rows.map((r) => r.image).filter(Boolean);
    const finalColors = Array.from(new Set(rows.map((r) => r.color).filter(Boolean)));

    if (finalImages.length === 0) {
      alert("Please provide at least one valid image URL.");
      return;
    }

    const updatedForm = {
      ...prodForm,
      images: finalImages,
      colors: finalColors.length > 0 ? finalColors : ["Brown"],
      colorMap: rows,
    };

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...updatedForm } as Product) : p
      );
      onUpdateProducts(updated);
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: "prod-" + Date.now(),
        name: updatedForm.name!,
        shortDescription: updatedForm.shortDescription || "",
        description: updatedForm.description || "",
        categoryId: updatedForm.categoryId!,
        subCategoryId: updatedForm.subCategoryId!,
        images: updatedForm.images || [],
        colors: updatedForm.colors || ["Brown"],
        colorMap: updatedForm.colorMap,
        fabrics: updatedForm.fabrics || ["Velvet"],
        material: updatedForm.material || "Solid Wood",
        woodType: updatedForm.woodType,
        finish: updatedForm.finish || "Glossy",
        dimensions: updatedForm.dimensions || "",
        warranty: updatedForm.warranty || "",
        availability: (updatedForm.availability as any) || "In Stock",
        price: updatedForm.price,
        featured: !!updatedForm.featured,
        newest: !!updatedForm.newest,
        createdAt: new Date().toISOString(),
      };
      onUpdateProducts([newProduct, ...products]);
    }

    // Reset Form
    setProdForm({
      name: "",
      shortDescription: "",
      description: "",
      categoryId: categories[0]?.id || "",
      subCategoryId: subCategories[0]?.id || "",
      images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"],
      colors: ["Brown"],
      colorMap: [],
      fabrics: ["Velvet"],
      material: "Solid Wood",
      woodType: "Teak Wood",
      finish: "Glossy",
      dimensions: "",
      warranty: "",
      availability: "In Stock",
      price: "",
      featured: false,
      newest: false,
    });
    setImageUrlInput("");
  };

  const handleDeleteProduct = (id: string, name?: string) => {
    const prod = products.find((p) => p.id === id);
    setDeleteConfirmTarget({
      type: "product",
      id,
      name: name || prod?.name || "Product Item",
    });
  };

  // Handler: Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) {
      alert("Name is required");
      return;
    }

    const customId = catForm.id || "cat-" + Date.now();
    const preparedImage = catForm.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80";

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, name: catForm.name!, description: catForm.description || "", image: preparedImage } : c
      );
      onUpdateCategories(updated);
      setEditingCategory(null);
    } else {
      const newCat: Category = {
        id: customId,
        name: catForm.name!,
        description: catForm.description || "",
        image: preparedImage,
      };
      onUpdateCategories([...categories, newCat]);
    }
    setCatForm({ id: "", name: "", description: "", image: "" });
  };

  const handleDeleteCategory = (id: string, name?: string) => {
    const cat = categories.find((c) => c.id === id);
    setDeleteConfirmTarget({
      type: "category",
      id,
      name: name || cat?.name || "Category",
    });
  };

  // Handler: Add Subcategory
  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name) return;

    const newSub: SubCategory = {
      id: "sub-" + Date.now(),
      categoryId: subForm.categoryId,
      name: subForm.name,
    };
    onUpdateSubCategories([...subCategories, newSub]);
    setSubForm({ ...subForm, name: "" });
  };

  const handleDeleteSub = (id: string, name?: string) => {
    const sub = subCategories.find((s) => s.id === id);
    setDeleteConfirmTarget({
      type: "subcategory",
      id,
      name: name || sub?.name || "Subcategory",
    });
  };

  // Handler: Save Banner
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title) return;

    const preparedImg = bannerForm.imageUrl || "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80";

    if (editingBanner) {
      const updated = banners.map((b) =>
        b.id === editingBanner.id ? ({ ...b, ...bannerForm, imageUrl: preparedImg } as Banner) : b
      );
      onUpdateBanners(updated);
      setEditingBanner(null);
    } else {
      const newBanner: Banner = {
        id: "banner-" + Date.now(),
        title: bannerForm.title!,
        subtitle: bannerForm.subtitle || "",
        imageUrl: preparedImg,
        linkType: bannerForm.linkType as any,
      };
      onUpdateBanners([...banners, newBanner]);
    }
    setBannerForm({ title: "", subtitle: "", imageUrl: "", linkType: "explore" });
  };

  const handleDeleteBanner = (id: string, name?: string) => {
    const b = banners.find((ban) => ban.id === id);
    setDeleteConfirmTarget({
      type: "banner",
      id,
      name: name || b?.title || "Hero Banner",
    });
  };

  // Handler: Save Testimonial
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.name || !testForm.comment) return;

    if (editingTest) {
      const updated = testimonials.map((t) =>
        t.id === editingTest.id ? ({ ...t, ...testForm } as Testimonial) : t
      );
      onUpdateTestimonials(updated as any);
      setEditingTest(null);
    } else {
      const newTest: Testimonial = {
        id: "test-" + Date.now(),
        name: testForm.name!,
        role: testForm.role || "Home Owner, Maharashtra",
        comment: testForm.comment!,
        rating: testForm.rating || 5,
      };
      onUpdateTestimonials([...testimonials, newTest]);
    }
    setTestForm({ name: "", role: "", comment: "", rating: 5 });
  };

  const handleDeleteTestimonial = (id: string, name?: string) => {
    const test = testimonials.find((t) => t.id === id);
    setDeleteConfirmTarget({
      type: "testimonial",
      id,
      name: name || test?.name || "Client Review",
    });
  };

  const handleUpdateRepairStatus = (id: string, newStatus: "Pending" | "In Progress" | "Completed") => {
    const updated = repairHistory.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    onUpdateRepairHistory(updated);
  };

  const handleUpdateBulkStatus = (id: string, newStatus: "Pending" | "Reviewed" | "Contacted") => {
    const updated = bulkHistory.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
    onUpdateBulkHistory(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <span className="text-xs font-bold tracking-widest text-amber-700 uppercase">FNB Control Console</span>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Admin Dashboard Panel</h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Manage live products, categories, direct Firebase cloud storage (auto-compressed to &lt;3MB), and real-time database syncing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex h-11 items-center space-x-2 rounded-xl px-4 text-xs font-bold border transition-colors ${
            firebaseStatus === "connected"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <Database className="h-4 w-4 text-emerald-600" />
            <span>Firebase Firestore: {firebaseStatus === "connected" ? "Live Real-Time" : "Connecting..."}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveAdminTab("settings")}
            className="flex h-11 items-center space-x-2 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-100 px-4 text-xs font-bold border border-amber-800 cursor-pointer shadow-sm transition-all"
          >
            <Settings className="h-4 w-4 text-amber-400" />
            <span>Store Settings</span>
          </button>
        </div>
      </div>

      {/* Main interface layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side Sidebar options */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-3 lg:pb-0">
          {[
            { id: "products", label: "Furniture Products", count: products.length, icon: FileText },
            { id: "categories", label: "Categories / Subs", count: categories.length, icon: FolderPlus },
            { id: "banners", label: "Hero Banner Sliders", count: banners.length, icon: ImageIcon },
            { id: "repairs", label: "Repair Requests", count: repairHistory.length, icon: Wrench, alert: repairHistory.some(r => r.status === "Pending") },
            { id: "bulks", label: "Bulk / B2B Quotes", count: bulkHistory.length, icon: Building, alert: bulkHistory.some(b => b.status === "Pending") },
            { id: "testimonials", label: "Testimonials", count: testimonials.length, icon: UserCheck },
            { id: "feedback", label: "Client Feedback & Home Push", count: feedbacks.length, icon: MessageSquare, alert: feedbacks.some(f => f.status === "Pending") },
            { id: "repair_images", label: "Repair Service Images", count: repairImages.length, icon: ImageIcon },
            { id: "about", label: "About Us Page", count: 0, icon: Info },
            { id: "settings", label: "Store Brand & Settings", count: 0, icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`relative flex items-center justify-between space-x-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none shrink-0 text-left ${
                  isActive
                    ? "bg-amber-950 text-amber-100 shadow"
                    : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
                style={{ minWidth: "160px" }}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] ${
                    isActive ? "bg-amber-500 text-stone-950" : "bg-stone-200 text-stone-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.alert && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side Working canvas */}
        <div className="lg:col-span-9 bg-stone-50 rounded-2xl border border-stone-200 p-6">
          
          {/* TAB: PRODUCTS */}
          {activeAdminTab === "products" && (
            <div className="space-y-6">
              
              {/* Product Form */}
              <form onSubmit={handleSaveProduct} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {editingProduct ? `Edit Product Spec: ${editingProduct.name}` : "Create New Furniture Product"}
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodForm.name || ""}
                      onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Royal Wooden Bed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Start Est Price Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={prodForm.price || ""}
                      onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="₹45,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Category Link *
                    </label>
                    <select
                      value={prodForm.categoryId || ""}
                      onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Subcategory Link *
                    </label>
                    <select
                      value={prodForm.subCategoryId || ""}
                      onChange={(e) => setProdForm({ ...prodForm, subCategoryId: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs bg-white"
                    >
                      {subCategories
                        .filter((sc) => sc.categoryId === prodForm.categoryId)
                        .map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Short Catchy Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.shortDescription || ""}
                    onChange={(e) => setProdForm({ ...prodForm, shortDescription: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                    placeholder="Premium solid wood with ergonomic comfort"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Full Spec Details Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={prodForm.description || ""}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                    placeholder="Handcrafted Teak design built directly in our Maharashtra workshop..."
                  />
                </div>

                {/* Available Stock status & custom color maps */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Available Stock Status
                    </label>
                    <select
                      value={prodForm.availability || "In Stock"}
                      onChange={(e) => setProdForm({ ...prodForm, availability: e.target.value as any })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs bg-white"
                    >
                      <option value="In Stock">In Stock (Standard Delivery)</option>
                      <option value="Made to Order">Made to Order (Customized)</option>
                      <option value="Out of Stock">Temporarily Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Product Color & Image Gallery Assets Row-Based Editor */}
                <div className="space-y-4 border-t border-stone-100 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                        Product Color & Image Gallery Assets
                      </h4>
                      <p className="text-[10px] text-stone-500 font-light mt-0.5">
                        Add multiple images and define their corresponding color labels. Use Google AI to automatically detect the dominant color!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddColorMapRow}
                      className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white hover:bg-amber-50 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Color & Image Asset</span>
                    </button>
                  </div>

                  <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/50">
                    {getColorMapRows().map((row, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row items-stretch md:items-center gap-3.5 bg-white p-3 rounded-xl border border-stone-100 shadow-sm relative group">
                        
                        {/* Image Preview */}
                        <div className="h-12 w-12 rounded-lg bg-stone-50 border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center">
                          {row.image ? (
                            <img src={row.image} alt="preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-stone-300" />
                          )}
                        </div>

                        {/* Image URL Input */}
                        <div className="flex-1">
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">
                            Image Asset (Upload File Directly to Firebase - Max 3MB)
                          </label>
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="text"
                              required
                              value={row.image}
                              onChange={(e) => handleUpdateColorMapRow(idx, "image", e.target.value)}
                              className="flex-1 rounded-lg border border-stone-200 px-2.5 py-1 text-xs"
                              placeholder="Direct image file or Firebase storage URL"
                            />
                            <label
                              className={`shrink-0 flex items-center justify-center p-1.5 rounded-lg border text-stone-500 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-colors shadow-sm ${
                                uploadingField === `prod-row-${idx}` ? "border-amber-500 bg-amber-50 animate-pulse text-amber-700" : "border-stone-200"
                              }`}
                              title="Upload photo directly to Firebase (Auto-compressed to <3MB)"
                            >
                              {uploadingField === `prod-row-${idx}` ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-700" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadImageFile(
                                      file,
                                      "products",
                                      (url) => handleUpdateColorMapRow(idx, "image", url),
                                      `prod-row-${idx}`
                                    );
                                  }
                                }}
                              />
                            </label>
                            {row.image && (
                              <button
                                type="button"
                                onClick={() => downloadImageFile(row.image, `${prodForm.name || "furniture"}-${row.color || "variant"}.jpg`)}
                                className="shrink-0 flex items-center justify-center p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-colors shadow-sm"
                                title="Download Image directly to Device"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Color Name Input */}
                        <div className="w-full md:w-44">
                          <label className="block text-[8px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">
                            Color Label (Manual/AI Type)
                          </label>
                          <input
                            type="text"
                            required
                            value={row.color}
                            onChange={(e) => handleUpdateColorMapRow(idx, "color", e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold"
                            placeholder="e.g. Emerald Green"
                          />
                        </div>

                        {/* AI Detect and Delete buttons */}
                        <div className="flex items-center space-x-2 pt-2 md:pt-4 self-end md:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAIDetectColor(idx, row.image)}
                            disabled={detectingIndex !== null}
                            className={`inline-flex items-center space-x-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 border border-amber-900/30 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer ${
                              detectingIndex === idx ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            {detectingIndex === idx ? (
                              <>
                                <span className="h-2 w-2 rounded-full border-2 border-amber-900 border-t-transparent animate-spin mr-1"></span>
                                <span>AI Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <span>✨ Detect Color</span>
                              </>
                            )}
                          </button>

                          {getColorMapRows().length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteColorMapRow(idx)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional detailed specs requested */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Base Material
                    </label>
                    <select
                      value={prodForm.material || "Solid Wood"}
                      onChange={(e) => setProdForm({ ...prodForm, material: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs bg-white"
                    >
                      {SYSTEM_MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Wood Type Option
                    </label>
                    <input
                      type="text"
                      value={prodForm.woodType || ""}
                      onChange={(e) => setProdForm({ ...prodForm, woodType: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
                      placeholder="Teak Wood"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Finish Texture
                    </label>
                    <select
                      value={prodForm.finish || "Glossy"}
                      onChange={(e) => setProdForm({ ...prodForm, finish: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs bg-white"
                    >
                      {SYSTEM_FINISHES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Warranty Coverage
                    </label>
                    <input
                      type="text"
                      value={prodForm.warranty || ""}
                      onChange={(e) => setProdForm({ ...prodForm, warranty: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
                      placeholder="3 Years Brand Warranty"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Product Dimensions
                    </label>
                    <input
                      type="text"
                      value={prodForm.dimensions || ""}
                      onChange={(e) => setProdForm({ ...prodForm, dimensions: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
                      placeholder="E.g. 72L x 36W x 30H inches"
                    />
                  </div>
                  <div className="flex items-center space-x-6 pt-5">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!prodForm.featured}
                        onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                        className="rounded text-amber-900 focus:ring-amber-900 h-4 w-4"
                      />
                      <span>Feature on Home</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!prodForm.newest}
                        onChange={(e) => setProdForm({ ...prodForm, newest: e.target.checked })}
                        className="rounded text-amber-900 focus:ring-amber-900 h-4 w-4"
                      />
                      <span>Tag as New arrival</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProdForm({ name: "" });
                      }}
                      className="rounded-lg bg-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-300"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 rounded-lg bg-amber-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-955"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingProduct ? "Apply Changes" : "Save to Inventory"}</span>
                  </button>
                </div>
              </form>

              {/* Product Inventory List */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-stone-900">Live Showroom Catalog</h4>
                <div className="overflow-y-auto max-h-[400px] border border-stone-200 rounded-xl bg-white divide-y divide-stone-100">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <img src={p.images[0]} alt="product" className="h-10 w-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <h5 className="font-bold text-stone-900 truncate">{p.name}</h5>
                          <span className="text-stone-400 block font-light">
                            {categories.find((c) => c.id === p.categoryId)?.name} › {p.price || "Contact for Quote"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {p.images[0] && (
                          <button
                            type="button"
                            onClick={() => downloadImageFile(p.images[0], `${p.name}.jpg`)}
                            className="rounded p-1.5 text-stone-500 hover:bg-stone-100 hover:text-amber-800 transition-colors"
                            title="Download Image"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm(p);
                            setImageUrlInput(p.images[0]);
                          }}
                          className="rounded p-1.5 text-stone-600 hover:bg-stone-100 hover:text-amber-800"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeAdminTab === "categories" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Category CRUD */}
              <div className="space-y-6">
                <form onSubmit={handleSaveCategory} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-stone-900">
                    {editingCategory ? "Edit Category Details" : "Add New Category"}
                  </h3>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Category Custom ID (Single word) *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingCategory}
                      value={catForm.id || ""}
                      onChange={(e) => setCatForm({ ...catForm, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="e.g. customized-wardrobe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={catForm.name || ""}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Customized Wardrobe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Short Tagline Description
                    </label>
                    <input
                      type="text"
                      value={catForm.description || ""}
                      onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Bespoke luxury bedroom storage panels"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Category Cover Image (Upload File Directly to Firebase - Max 3MB)
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={catForm.image || ""}
                        onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                        className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs"
                        placeholder="Direct image file or Firebase storage URL"
                      />
                      <label
                        className={`shrink-0 flex items-center justify-center p-2 rounded-lg border text-stone-500 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-colors shadow-sm ${
                          uploadingField === "cat-image" ? "border-amber-500 bg-amber-50 animate-pulse text-amber-700" : "border-stone-200"
                        }`}
                        title="Upload photo directly to Firebase (Auto-compressed to <3MB)"
                      >
                        {uploadingField === "cat-image" ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-amber-700" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadImageFile(
                                file,
                                "categories",
                                (url) => setCatForm({ ...catForm, image: url }),
                                "cat-image"
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCatForm({ id: "", name: "" });
                        }}
                        className="rounded-lg bg-stone-200 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-300"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-950"
                    >
                      {editingCategory ? "Apply" : "Save Category"}
                    </button>
                  </div>
                </form>

                {/* Categories listings */}
                <div className="space-y-3">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500">Categories Inventory</h4>
                  <div className="rounded-xl border border-stone-200 bg-white p-3 divide-y divide-stone-100 max-h-[250px] overflow-y-auto">
                    {categories.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2 text-xs">
                        <div>
                          <span className="font-bold text-stone-900">{c.name}</span>
                          <span className="block text-[10px] text-stone-400">ID: {c.id}</span>
                        </div>
                        <div className="flex space-x-1">
                          {c.image && (
                            <button
                              type="button"
                              onClick={() => downloadImageFile(c.image, `${c.name}-category.jpg`)}
                              className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-amber-800"
                              title="Download Category Cover"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setCatForm(c);
                            }}
                            className="rounded p-1 text-stone-600 hover:bg-stone-100"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subcategories link list */}
              <div className="space-y-6">
                <form onSubmit={handleAddSub} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-stone-900">Link Sub-Category</h3>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Parent Category *
                    </label>
                    <select
                      value={subForm.categoryId}
                      onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Sub-Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={subForm.name}
                      onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="e.g. Modular Recliners"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-amber-900 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-950"
                  >
                    Add Linked Sub-Category
                  </button>
                </form>

                {/* Subcategories list */}
                <div className="space-y-3">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500">Linked Sub-Categories</h4>
                  <div className="rounded-xl border border-stone-200 bg-white p-3 divide-y divide-stone-100 max-h-[250px] overflow-y-auto">
                    {subCategories.map((sub) => {
                      const parent = categories.find((c) => c.id === sub.categoryId)?.name || "N/A";
                      return (
                        <div key={sub.id} className="flex items-center justify-between py-2 text-xs">
                          <div>
                            <span className="font-semibold text-stone-900">{sub.name}</span>
                            <span className="block text-[10px] text-stone-400">Parent: {parent}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSub(sub.id)}
                            className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: BANNERS */}
          {activeAdminTab === "banners" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveBanner} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-900">
                  {editingBanner ? "Edit Banner Slider" : "Add Hero Slider Banner"}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Slider Main Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerForm.title || ""}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Luxury Sofas Collection"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Slider Secondary Subtitle
                    </label>
                    <input
                      type="text"
                      value={bannerForm.subtitle || ""}
                      onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Experience modular furniture crafted to order"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Background Image (Upload File Directly to Firebase - Max 3MB)
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        required
                        value={bannerForm.imageUrl || ""}
                        onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                        className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-xs"
                        placeholder="Direct image file or Firebase storage URL"
                      />
                      <label
                        className={`shrink-0 flex items-center justify-center p-2 rounded-lg border text-stone-500 hover:text-amber-800 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-colors shadow-sm ${
                          uploadingField === "banner-image" ? "border-amber-500 bg-amber-50 animate-pulse text-amber-700" : "border-stone-200"
                        }`}
                        title="Upload banner photo directly to Firebase (Auto-compressed to <3MB)"
                      >
                        {uploadingField === "banner-image" ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-amber-700" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadImageFile(
                                file,
                                "banners",
                                (url) => setBannerForm({ ...bannerForm, imageUrl: url }),
                                "banner-image"
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Slider CTA Link Routing
                    </label>
                    <select
                      value={bannerForm.linkType || "explore"}
                      onChange={(e) => setBannerForm({ ...bannerForm, linkType: e.target.value as any })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs bg-white"
                    >
                      <option value="explore">Goes to Collections Catalog</option>
                      <option value="repair">Goes to Repair Request Page</option>
                      <option value="whatsapp">Triggers Instant WhatsApp Chat</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  {editingBanner && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBanner(null);
                        setBannerForm({ title: "" });
                      }}
                      className="rounded-lg bg-stone-200 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-300"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-950"
                  >
                    {editingBanner ? "Apply" : "Publish Banner"}
                  </button>
                </div>
              </form>

              {/* Banner List */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {banners.map((b) => (
                  <div key={b.id} className="rounded-xl border border-stone-200 bg-white p-3 space-y-3 flex flex-col justify-between">
                    <img src={b.imageUrl} alt="banner" className="h-24 w-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                    <div>
                      <h5 className="font-bold text-stone-900 text-xs">{b.title}</h5>
                      <span className="text-[10px] text-stone-400 block font-light truncate">{b.subtitle}</span>
                      <span className="inline-block mt-1 bg-stone-100 rounded text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider text-amber-900">
                        Link: {b.linkType}
                      </span>
                    </div>
                    <div className="flex justify-end items-center space-x-2 border-t border-stone-100 pt-2">
                      {b.imageUrl && (
                        <button
                          type="button"
                          onClick={() => downloadImageFile(b.imageUrl, `${b.title || "banner"}.jpg`)}
                          className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-amber-800 text-xs font-semibold flex items-center space-x-1"
                          title="Download Banner Image"
                        >
                          <Download className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingBanner(b);
                          setBannerForm(b);
                        }}
                        className="rounded p-1 text-stone-600 hover:bg-stone-100 text-xs font-semibold uppercase"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50 text-xs font-semibold uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPAIRS LOGS */}
          {activeAdminTab === "repairs" && (
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-stone-900">Onsite Repair Requests Logs</h3>
              {repairHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-light">
                  No repair requests submitted yet. Complete the form in the Repair Tab to see items here.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {repairHistory.map((rep) => (
                    <div key={rep.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <div>
                          <span className="font-bold text-stone-900 block text-sm">{rep.customerName}</span>
                          <span className="text-stone-400 block font-light">Phone: {rep.phone} | Date: {rep.preferredDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={rep.status}
                            onChange={(e) => handleUpdateRepairStatus(rep.id, e.target.value as any)}
                            className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wider"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTarget({ type: "repair_log", id: rep.id, name: `Repair Request from ${rep.customerName}` })}
                            className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Delete Repair Request Log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-amber-900 block uppercase tracking-wider text-[10px]">Required service: {rep.serviceCategory}</span>
                        <p className="text-stone-600 font-light leading-relaxed mt-1">Address: {rep.address}</p>
                        <p className="text-stone-500 font-light mt-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                          Problem statement: "{rep.description}"
                        </p>
                      </div>
                      {rep.imageUrl && (
                        <div>
                          <span className="text-[10px] text-stone-400 block mb-1">Customer uploaded image:</span>
                          <img src={rep.imageUrl} alt="repair upload" className="h-28 w-28 object-cover rounded-lg border border-stone-200" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BULK B2B LOGS */}
          {activeAdminTab === "bulks" && (
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-stone-900">Institutional B2B Inquiries logs</h3>
              {bulkHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-light">
                  No institutional inquiries submitted yet. Submit a B2B project in the Bulk Orders Tab.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {bulkHistory.map((bulk) => (
                    <div key={bulk.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <div>
                          <span className="font-bold text-stone-900 block text-sm">{bulk.clientName}</span>
                          <span className="text-stone-400 block font-light">Org: {bulk.companyName || "Personal"} | Type: {bulk.clientType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={bulk.status}
                            onChange={(e) => handleUpdateBulkStatus(bulk.id, e.target.value as any)}
                            className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wider"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Contacted">Contacted</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTarget({ type: "bulk_log", id: bulk.id, name: `B2B Inquiry from ${bulk.clientName}` })}
                            className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Delete Bulk Inquiry Log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2 rounded-lg border border-stone-100 text-[11px] font-mono">
                        <div>📞 Phone: {bulk.phone}</div>
                        <div>📧 Email: {bulk.email}</div>
                        <div className="col-span-2">📆 Target completion: {bulk.preferredDate}</div>
                      </div>
                      <p className="text-stone-500 font-light bg-amber-50/20 p-2.5 rounded-lg border border-amber-900/5">
                        Requirements: "{bulk.description}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeAdminTab === "testimonials" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveTestimonial} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-900">Publish Client Review</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={testForm.name || ""}
                      onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Aniket Patil"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Location / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={testForm.role || ""}
                      onChange={(e) => setTestForm({ ...testForm, role: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      placeholder="Narayangaon, Pune"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Customer Experience Comment *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={testForm.comment || ""}
                    onChange={(e) => setTestForm({ ...testForm, comment: e.target.value })}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                    placeholder="We loved the sofa set customized to fit our small living room..."
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-amber-955"
                  >
                    Publish Testimonial
                  </button>
                </div>
              </form>

              {/* Testimonials logs */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-500">Live Client Reviews</h4>
                <div className="rounded-xl border border-stone-200 bg-white p-3 divide-y divide-stone-100 max-h-[300px] overflow-y-auto">
                  {testimonials.map((t) => (
                    <div key={t.id} className="flex items-start justify-between py-2 text-xs">
                      <div>
                        <span className="font-bold text-stone-900">{t.name}</span>
                        <span className="text-stone-400 block font-light">{t.role}</span>
                        <p className="text-stone-500 font-light italic mt-1">"{t.comment}"</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-700 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT US PAGE EDITOR */}
          {activeAdminTab === "about" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Edit About Us Page Content</h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Customize titles, descriptions, story images, statistics, core pillars, and workshop location details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateAboutContent(aboutForm);
                    setAboutSavedMessage(true);
                    setTimeout(() => setAboutSavedMessage(false), 3500);
                  }}
                  className="inline-flex items-center space-x-2 rounded-xl bg-amber-900 hover:bg-amber-955 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save All Changes</span>
                </button>
              </div>

              {aboutSavedMessage && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-fadeIn">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>About Us section content updated and saved to live website!</span>
                </div>
              )}

              {/* 1. BRAND STORY & HERO SECTION */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
                  <Info className="h-4 w-4 text-amber-800" />
                  <h4 className="font-serif text-sm font-bold text-stone-900">1. Hero & Brand Story</h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Section Tagline / Badge *
                    </label>
                    <input
                      type="text"
                      value={aboutForm.tagline}
                      onChange={(e) => setAboutForm({ ...aboutForm, tagline: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-amber-800"
                      placeholder="Our Story & Heritage"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Main Heading Title *
                    </label>
                    <input
                      type="text"
                      value={aboutForm.title}
                      onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-amber-800"
                      placeholder="FNB Furniture N Beyond"
                    />
                  </div>
                </div>

                {/* Main Story Image URL & Upload */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Main Story Banner Image (Direct Firebase Storage - Max 3MB)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={aboutForm.imageUrl}
                      onChange={(e) => setAboutForm({ ...aboutForm, imageUrl: e.target.value })}
                      className="w-full flex-grow rounded-lg border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-amber-800"
                      placeholder="Direct image file or Firebase storage URL"
                    />
                    <label className="inline-flex cursor-pointer items-center justify-center space-x-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 shrink-0">
                      {uploadingField === "about-image" ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-700" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      <span>{uploadingField === "about-image" ? "Uploading to Firebase..." : "Upload Local Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadImageFile(
                              file,
                              "about",
                              (url) => setAboutForm({ ...aboutForm, imageUrl: url }),
                              "about-image"
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                  {aboutForm.imageUrl && (
                    <div className="mt-2 h-24 w-36 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                      <img src={aboutForm.imageUrl} alt="About Hero Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Paragraphs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Story Paragraph 1 *
                    </label>
                    <textarea
                      rows={4}
                      value={aboutForm.paragraph1}
                      onChange={(e) => setAboutForm({ ...aboutForm, paragraph1: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-amber-800"
                      placeholder="Established with a commitment to bring..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Story Paragraph 2 *
                    </label>
                    <textarea
                      rows={4}
                      value={aboutForm.paragraph2}
                      onChange={(e) => setAboutForm({ ...aboutForm, paragraph2: e.target.value })}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-amber-800"
                      placeholder="By controlling the entire process..."
                    />
                  </div>
                </div>

                {/* Statistics Highlights */}
                <div className="border-t border-stone-100 pt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Stat 1 Value
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat1Value}
                        onChange={(e) => setAboutForm({ ...aboutForm, stat1Value: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs font-bold text-amber-900"
                        placeholder="20+ Years"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Stat 1 Label
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat1Label}
                        onChange={(e) => setAboutForm({ ...aboutForm, stat1Label: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                        placeholder="Generational Artisans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Stat 2 Value
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat2Value}
                        onChange={(e) => setAboutForm({ ...aboutForm, stat2Value: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs font-bold text-amber-900"
                        placeholder="10,000+"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Stat 2 Label
                      </label>
                      <input
                        type="text"
                        value={aboutForm.stat2Label}
                        onChange={(e) => setAboutForm({ ...aboutForm, stat2Label: e.target.value })}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                        placeholder="Happy Homes Supplied"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CORE PILLARS & VALUES SECTION */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-amber-800" />
                    <h4 className="font-serif text-sm font-bold text-stone-900">2. Core Pillars & Highlights</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newPillar: AboutPillar = {
                        id: "p-" + Date.now(),
                        icon: "✨",
                        title: "New Value Pillar",
                        description: "Add details about this core value proposition..."
                      };
                      setAboutForm({ ...aboutForm, pillars: [...aboutForm.pillars, newPillar] });
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Pillar</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Pillars Section Title
                  </label>
                  <input
                    type="text"
                    value={aboutForm.pillarsTitle || "Core Values & Promises"}
                    onChange={(e) => setAboutForm({ ...aboutForm, pillarsTitle: e.target.value })}
                    className="w-full max-w-md rounded-lg border border-stone-200 px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {aboutForm.pillars.map((pillar, idx) => (
                    <div key={pillar.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setAboutForm({
                            ...aboutForm,
                            pillars: aboutForm.pillars.filter((p) => p.id !== pillar.id)
                          });
                        }}
                        className="absolute top-2 right-2 rounded p-1 text-red-500 hover:bg-red-50 cursor-pointer"
                        title="Delete Pillar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="grid grid-cols-4 gap-2 pr-6">
                        <div className="col-span-1">
                          <label className="block text-[9px] font-bold text-stone-400 uppercase">Icon</label>
                          <input
                            type="text"
                            value={pillar.icon}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = aboutForm.pillars.map((p, i) => i === idx ? { ...p, icon: val } : p);
                              setAboutForm({ ...aboutForm, pillars: updated });
                            }}
                            className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-center text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold text-stone-400 uppercase">Title</label>
                          <input
                            type="text"
                            value={pillar.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = aboutForm.pillars.map((p, i) => i === idx ? { ...p, title: val } : p);
                              setAboutForm({ ...aboutForm, pillars: updated });
                            }}
                            className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-stone-400 uppercase">Description</label>
                        <textarea
                          rows={3}
                          value={pillar.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = aboutForm.pillars.map((p, i) => i === idx ? { ...p, description: val } : p);
                            setAboutForm({ ...aboutForm, pillars: updated });
                          }}
                          className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. WORKSHOPS & SHOWROOM LOCATIONS */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-amber-800" />
                    <h4 className="font-serif text-sm font-bold text-stone-900">3. Workshops & Showroom Locations</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newLoc: AboutLocation = {
                        id: "loc-" + Date.now(),
                        title: "New Location",
                        subtitle: "Area / City Name",
                        address: "Full address details...",
                        note: "Key highlight or note..."
                      };
                      setAboutForm({ ...aboutForm, locations: [...aboutForm.locations, newLoc] });
                    }}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-amber-900 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Location</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Locations Section Title
                  </label>
                  <input
                    type="text"
                    value={aboutForm.locationsTitle || "Visit Our Workshops & Showrooms"}
                    onChange={(e) => setAboutForm({ ...aboutForm, locationsTitle: e.target.value })}
                    className="w-full max-w-md rounded-lg border border-stone-200 px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {aboutForm.locations.map((loc, idx) => (
                    <div key={loc.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setAboutForm({
                            ...aboutForm,
                            locations: aboutForm.locations.filter((l) => l.id !== loc.id)
                          });
                        }}
                        className="absolute top-3 right-3 rounded p-1 text-red-500 hover:bg-red-50 cursor-pointer"
                        title="Delete Location"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="pr-8 space-y-2">
                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 uppercase">Location Title</label>
                          <input
                            type="text"
                            value={loc.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = aboutForm.locations.map((l, i) => i === idx ? { ...l, title: val } : l);
                              setAboutForm({ ...aboutForm, locations: updated });
                            }}
                            className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-amber-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 uppercase">Subtitle / Area</label>
                          <input
                            type="text"
                            value={loc.subtitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = aboutForm.locations.map((l, i) => i === idx ? { ...l, subtitle: val } : l);
                              setAboutForm({ ...aboutForm, locations: updated });
                            }}
                            className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 uppercase">Full Address</label>
                          <input
                            type="text"
                            value={loc.address}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = aboutForm.locations.map((l, i) => i === idx ? { ...l, address: val } : l);
                              setAboutForm({ ...aboutForm, locations: updated });
                            }}
                            className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-stone-400 uppercase">Note / Details</label>
                          <textarea
                            rows={2}
                            value={loc.note}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = aboutForm.locations.map((l, i) => i === idx ? { ...l, note: val } : l);
                              setAboutForm({ ...aboutForm, locations: updated });
                            }}
                            className="w-full rounded border border-stone-200 bg-white px-2 py-1 text-xs text-stone-500 italic"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateAboutContent(aboutForm);
                    setAboutSavedMessage(true);
                    setTimeout(() => setAboutSavedMessage(false), 3500);
                  }}
                  className="inline-flex items-center space-x-2 rounded-xl bg-amber-900 hover:bg-amber-955 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: CLIENT FEEDBACK & HOME PUSH CONTROL */}
          {activeAdminTab === "feedback" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-2 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-amber-800" />
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Manage Client Feedback & Home Screen Displays
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 font-light mt-1">
                      Review feedback submitted by clients. Click <strong>"Push to Home"</strong> on any review to immediately highlight it on the public home page feed.
                    </p>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
                      {feedbacks.filter(f => f.pushedToHome).length} Pushed to Home
                    </span>
                    <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
                      {feedbacks.filter(f => f.status === "Pending").length} Pending
                    </span>
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center space-x-2 border-t border-stone-100 pt-3 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Filter View:</span>
                  <button
                    type="button"
                    onClick={() => setFeedbackFilter("all")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                      feedbackFilter === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    All ({feedbacks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackFilter("pushed")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                      feedbackFilter === "pushed" ? "bg-emerald-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Pushed to Home ({feedbacks.filter(f => f.pushedToHome).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackFilter("pending")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                      feedbackFilter === "pending" ? "bg-amber-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Pending Review ({feedbacks.filter(f => f.status === "Pending").length})
                  </button>
                </div>
              </div>

              {/* Feedbacks Grid / List */}
              {feedbacks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-xs text-stone-500 bg-white">
                  No feedback submissions recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks
                    .filter((fb) => {
                      if (feedbackFilter === "pushed") return fb.pushedToHome;
                      if (feedbackFilter === "pending") return fb.status === "Pending";
                      return true;
                    })
                    .map((fb) => {
                      return (
                        <div
                          key={fb.id}
                          className={`rounded-xl border p-5 space-y-4 transition-all bg-white shadow-xs ${
                            fb.pushedToHome ? "border-emerald-300 ring-2 ring-emerald-500/20" : "border-stone-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-serif text-sm font-bold text-stone-900">{fb.name}</h4>
                                {fb.city && (
                                  <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                    📍 {fb.city}
                                  </span>
                                )}
                                {fb.productPurchased && (
                                  <span className="text-[10px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full">
                                    🛒 {fb.productPurchased}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-stone-400">
                                <span>Submitted: {fb.createdAt || "Recent"}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-0.5 text-amber-500">
                                  {Array.from({ length: fb.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* PUSH TO HOME BUTTON & STATUS */}
                            <div className="flex items-center space-x-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated: UserFeedback[] = feedbacks.map((f) =>
                                    f.id === fb.id ? { ...f, pushedToHome: !f.pushedToHome, status: "Approved" as const } : f
                                  );
                                  onUpdateFeedbacks(updated);
                                }}
                                className={`inline-flex items-center space-x-1.5 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                                  fb.pushedToHome
                                    ? "bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-600"
                                    : "bg-amber-900 hover:bg-amber-955 text-white border border-amber-800"
                                }`}
                              >
                                {fb.pushedToHome ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                                    <span>Pushed to Home Screen</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                    <span>Push to Home</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmTarget({
                                    type: "feedback",
                                    id: fb.id,
                                    name: `${fb.name}'s Feedback Review`
                                  });
                                }}
                                className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Delete Feedback"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {fb.imageUrl && (
                              <div className="relative group h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                                <img src={fb.imageUrl} alt={fb.name} className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => downloadImageFile(fb.imageUrl!, `${fb.name}-feedback-photo.jpg`)}
                                  className="absolute bottom-1.5 right-1.5 p-1 bg-white/90 hover:bg-white rounded-md text-stone-700 hover:text-amber-900 shadow-sm border border-stone-200 cursor-pointer transition-colors"
                                  title="Download attached customer photo"
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <p className="text-xs font-light leading-relaxed text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100 flex-grow italic">
                              "{fb.comment}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB: REPAIR SERVICE REFERENCE IMAGES */}
          {activeAdminTab === "repair_images" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">Repair Service Reference Images</h2>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Upload and manage reference images (before/after restoration work examples) shown to customers at the bottom of the Repair Services page.
                  </p>
                </div>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleSaveRepairImage} className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                <h3 className="font-serif text-base font-bold text-stone-900">Add New Repair Service Reference Image</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Title / Label (e.g. Almirah Before & After)
                    </label>
                    <input
                      type="text"
                      value={repairImgForm.title}
                      onChange={(e) => setRepairImgForm({ ...repairImgForm, title: e.target.value })}
                      placeholder="e.g. Almirah Powder Coating Restoration"
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Reference Photo (Upload File Directly to Firebase - Max 3MB)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={repairImgForm.imageUrl}
                        onChange={(e) => setRepairImgForm({ ...repairImgForm, imageUrl: e.target.value })}
                        placeholder="Direct image file or Firebase storage URL"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      />
                      <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0">
                        {uploadingField === "repair-image" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-700" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>{uploadingField === "repair-image" ? "Saving..." : "Upload"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRepairImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {repairImgForm.imageUrl ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Preview:</span>
                      <div className="h-16 w-24 rounded-lg border border-stone-200 overflow-hidden bg-stone-100">
                        <img src={repairImgForm.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  ) : <div />}
                  <button
                    type="submit"
                    disabled={!repairImgForm.imageUrl.trim()}
                    className="inline-flex items-center space-x-2 rounded-xl bg-amber-900 hover:bg-amber-955 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save Reference Image to Firebase</span>
                  </button>
                </div>
              </form>

              {/* Grid of uploaded images */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-800">
                  Live Reference Images ({repairImages.length})
                </h3>

                {repairImages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-xs text-stone-500">
                    No repair reference images added yet. Add one above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {repairImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative rounded-xl border border-stone-200 bg-white p-3 space-y-2 shadow-xs hover:shadow-sm transition-all"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100 border border-stone-100">
                          <img
                            src={img.imageUrl}
                            alt={img.title || "Repair Image"}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-semibold text-stone-800 truncate pr-2">
                            {img.title || "Restoration Example"}
                          </span>
                          <div className="flex items-center space-x-1 shrink-0">
                            {img.imageUrl && (
                              <button
                                type="button"
                                onClick={() => downloadImageFile(img.imageUrl, `${img.title || "repair-sample"}.jpg`)}
                                className="p-1.5 text-stone-400 hover:text-amber-900 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Download Reference Image"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteRepairImage(img.id, img.title)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: STORE BRAND & SETTINGS */}
          {activeAdminTab === "settings" && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-amber-900" />
                    <h2 className="font-serif text-xl font-bold text-stone-900">
                      Store Brand, Cloud Storage &amp; Firebase Settings
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Manage store branding, real-time Firebase connection, 5GB cloud storage capacity, and live uploaded media assets.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs ${
                    firebaseStatus === "connected"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Firebase Live: {firebaseStatus === "connected" ? "Real-Time Connected" : "Connecting..."}</span>
                  </span>
                </div>
              </div>

              {/* 5GB CLOUD STORAGE & IMAGE CAPACITY METRICS CARD */}
              <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950 p-6 text-white shadow-lg space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <HardDrive className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-amber-100">
                        Firebase Cloud Storage &amp; 5 GB Capacity
                      </h3>
                      <p className="text-xs text-stone-300 font-light">
                        Real-time auto-compressed image repository for furniture catalog &amp; showroom assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-start md:self-auto">
                    <span className="inline-flex items-center space-x-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                      <Zap className="h-3 w-3" />
                      <span>Live Firebase Sync</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-mono text-amber-200 font-semibold">
                      5.00 GB Allotment
                    </span>
                  </div>
                </div>

                {/* Progress bar and Storage Key Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium flex items-center space-x-1.5">
                      <PieChart className="h-3.5 w-3.5 text-amber-400" />
                      <span>Current Storage Consumption</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {storageAnalysis.totalEstSizeMB} MB used of 5,120 MB ({storageAnalysis.usagePercent}%)
                    </span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="h-3 w-full rounded-full bg-stone-800/90 overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.max(1, parseFloat(storageAnalysis.usagePercent))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-light pt-0.5">
                    <span>0 GB</span>
                    <span className="text-amber-200 font-medium">Remaining: {storageAnalysis.remainingGB} GB free</span>
                    <span>5.00 GB Max</span>
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-100">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                      Total Uploaded Images
                    </span>
                    <div className="font-serif text-2xl font-bold text-white">
                      {storageAnalysis.totalImagesCount}
                    </div>
                    <span className="text-[10px] text-stone-400 block font-light">
                      Across all collections
                    </span>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                      Max Image Capacity
                    </span>
                    <div className="font-serif text-2xl font-bold text-emerald-400">
                      ~{storageAnalysis.maxImagesPossible.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-400 block font-light">
                      At ~350 KB average / photo
                    </span>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                      Remaining Image Slots
                    </span>
                    <div className="font-serif text-2xl font-bold text-amber-200">
                      ~{storageAnalysis.remainingImagesPossible.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-400 block font-light">
                      Additional photos you can add
                    </span>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider block">
                      Avg Size Per Image
                    </span>
                    <div className="font-serif text-2xl font-bold text-sky-300">
                      {storageAnalysis.totalImagesCount > 0
                        ? `${Math.round(storageAnalysis.totalEstSizeKB / storageAnalysis.totalImagesCount)} KB`
                        : "350 KB"}
                    </div>
                    <span className="text-[10px] text-stone-400 block font-light">
                      Auto-compressed under 3MB
                    </span>
                  </div>
                </div>

                {/* Breakdown by Collection */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Real-Time Image Count Breakdown by Module</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                      <span className="text-stone-400">Products:</span>
                      <span className="font-bold text-amber-200">{storageAnalysis.productsImagesCount} imgs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                      <span className="text-stone-400">Banners:</span>
                      <span className="font-bold text-amber-200">{storageAnalysis.bannersImagesCount} imgs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                      <span className="text-stone-400">Categories:</span>
                      <span className="font-bold text-amber-200">{storageAnalysis.categoriesImagesCount} imgs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                      <span className="text-stone-400">Repairs:</span>
                      <span className="font-bold text-amber-200">{storageAnalysis.repairsImagesCount} imgs</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                      <span className="text-stone-400">Feedbacks:</span>
                      <span className="font-bold text-amber-200">{storageAnalysis.feedbacksImagesCount} imgs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIRESTORE COLLECTIONS REAL-TIME MONITOR */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-amber-900" />
                    <h3 className="font-serif text-sm font-bold text-stone-900">
                      Live Firestore Database Collections &amp; Document Counts
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Direct Cloud Sync Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { label: "Products", count: products.length, coll: "products", icon: FileText },
                    { label: "Categories", count: categories.length, coll: "categories", icon: FolderPlus },
                    { label: "Sub-Categories", count: subCategories.length, coll: "subcategories", icon: FolderPlus },
                    { label: "Hero Banners", count: banners.length, coll: "banners", icon: ImageIcon },
                    { label: "Testimonials", count: testimonials.length, coll: "testimonials", icon: UserCheck },
                    { label: "Repair Logs", count: repairHistory.length, coll: "repair_requests", icon: Wrench },
                    { label: "B2B Quotes", count: bulkHistory.length, coll: "bulk_orders", icon: Building },
                    { label: "Feedbacks", count: feedbacks.length, coll: "feedbacks", icon: MessageSquare },
                    { label: "Repair Gallery", count: repairImages.length, coll: "repair_images", icon: ImageIcon },
                    { label: "Site Settings", count: 1, coll: "site_settings", icon: Settings },
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="rounded-xl border border-stone-100 bg-stone-50/80 p-3 space-y-1">
                        <div className="flex items-center justify-between text-stone-400">
                          <ItemIcon className="h-3.5 w-3.5" />
                          <span className="text-[9px] font-mono text-stone-400">{item.coll}</span>
                        </div>
                        <div className="font-serif text-lg font-bold text-stone-900">{item.count}</div>
                        <div className="text-[10px] font-semibold text-stone-600">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STORE BRAND & CONTACT SETTINGS FORM */}
              <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-amber-900" />
                    <h3 className="font-serif text-sm font-bold text-stone-900">
                      Store Brand &amp; Showroom Configuration
                    </h3>
                  </div>
                  <div className="text-xs text-stone-500 font-light">
                    Synced automatically to Firestore <code className="font-mono text-amber-900">site_settings</code>
                  </div>
                </div>

                <form onSubmit={handleSaveStoreSettings} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Brand / Store Name
                      </label>
                      <input
                        type="text"
                        value={storeSettingsForm.storeName}
                        onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, storeName: e.target.value })}
                        placeholder="FNB Furniture & Interior"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        WhatsApp Contact Number
                      </label>
                      <input
                        type="text"
                        value={storeSettingsForm.whatsappNumber}
                        onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, whatsappNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Support Phone Line
                      </label>
                      <input
                        type="text"
                        value={storeSettingsForm.contactPhone}
                        onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, contactPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                        Support Email Address
                      </label>
                      <input
                        type="email"
                        value={storeSettingsForm.contactEmail}
                        onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, contactEmail: e.target.value })}
                        placeholder="orders@fnbfurniture.com"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Showroom Studio Physical Address
                    </label>
                    <input
                      type="text"
                      value={storeSettingsForm.address}
                      onChange={(e) => setStoreSettingsForm({ ...storeSettingsForm, address: e.target.value })}
                      placeholder="FNB Design Studio, Showroom Arcade, Mumbai, India"
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
                    />
                  </div>

                  {saveSettingsSuccess && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Store settings updated and synced directly to Firebase site_settings successfully!</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-2 rounded-lg bg-amber-900 hover:bg-amber-950 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Settings to Firebase</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* DELETE CONFIRMATION POPUP MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden p-6 space-y-5 animate-scaleUp">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-serif text-lg font-bold text-stone-900">Confirm Permanent Deletion</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  Are you sure you want to delete <strong className="font-semibold text-stone-900">"{deleteConfirmTarget.name}"</strong>? This item will be permanently removed from the admin panel and database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-colors cursor-pointer active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Delete Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
