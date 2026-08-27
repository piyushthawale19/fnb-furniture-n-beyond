/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  Wrench,
  Building2,
  Users,
  CheckCircle,
  Phone,
  ArrowRight,
  Sofa,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Truck,
  MapPin,
  MessageSquare,
  Sparkles,
  Info,
  X,
  LayoutGrid,
  Shield,
  LogOut
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
  UserFeedback,
  RepairReferenceImage,
} from "./types";
import {
  INITIAL_CATEGORIES,
  INITIAL_SUB_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_TESTIMONIALS,
  INITIAL_ABOUT,
  INITIAL_FEEDBACKS,
  INITIAL_REPAIR_IMAGES,
} from "./data/initialData";
import {
  COLLECTIONS,
  subscribeToCollection,
  subscribeToDocument,
  saveFirestoreDoc,
  deleteFirestoreDoc,
  batchSaveCollection,
  seedInitialDataIfEmpty,
  testFirebaseConnection,
  SiteSettings,
} from "./lib/firebase";

// Sub-components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import RepairForm from "./components/RepairForm";
import BulkOrderForm from "./components/BulkOrderForm";
import FeedbackSection from "./components/FeedbackSection";
import AdminPanel from "./components/AdminPanel";
import AdminLoginModal from "./components/AdminLoginModal";

export default function App() {
  // Navigation states
  const [currentTab, setCurrentTab] = useState<string>("home"); // "home" | "categories" | "repair" | "bulk" | "about" | "admin"
  const [userRole, setUserRole] = useState<"customer" | "admin">("customer");
  
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("fnb_admin_authed") === "true";
  });

  // Check URL route for direct /admin or #admin access
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.endsWith("/admin") || hash === "#admin" || search.includes("admin")) {
        setCurrentTab("admin");
      }
    };

    checkAdminRoute();
    window.addEventListener("popstate", checkAdminRoute);
    window.addEventListener("hashchange", checkAdminRoute);
    return () => {
      window.removeEventListener("popstate", checkAdminRoute);
      window.removeEventListener("hashchange", checkAdminRoute);
    };
  }, []);

  // Update URL hash state when tab changes
  useEffect(() => {
    if (currentTab === "admin") {
      if (window.location.hash !== "#admin") {
        window.history.replaceState(null, "", "#admin");
      }
    } else {
      if (window.location.hash === "#admin") {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [currentTab]);
  
  // Data State managed with Firebase Firestore & localStorage persistence
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [repairHistory, setRepairHistory] = useState<RepairRequest[]>([]);
  const [bulkHistory, setBulkHistory] = useState<BulkOrderRequest[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent>(INITIAL_ABOUT);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [repairImages, setRepairImages] = useState<RepairReferenceImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [firebaseStatus, setFirebaseStatus] = useState<"connected" | "connecting" | "offline">("connecting");

  // Policy View overlays
  const [viewPolicy, setViewPolicy] = useState<"privacy" | "terms" | null>(null);

  // Listing page filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured"); // "featured" | "newest" | "name"
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Active Selected Product for Specifications Modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Ref for master categories scrolling
  const categoriesScrollRef = React.useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
  const [mobileCategoryViewMode, setMobileCategoryViewMode] = useState<"grid" | "scroll">("grid");

  // Auto-scroll mechanism for Explore Master Categories
  useEffect(() => {
    if (!isAutoScrolling || !categoriesScrollRef.current) return;
    const interval = setInterval(() => {
      if (categoriesScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          categoriesScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          categoriesScrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoScrolling, mobileCategoryViewMode]);

  // Helper to scroll categories horizontally
  const handleScrollCategories = (direction: "left" | "right") => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 340; // card width + gap
      categoriesScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Sync state with Firebase Firestore & localStorage on startup
  useEffect(() => {
    // 1. Initial fast local load from localStorage cache
    const savedCats = localStorage.getItem("fnb_categories");
    const savedSubs = localStorage.getItem("fnb_subcategories");
    const savedProds = localStorage.getItem("fnb_products");
    const savedBanners = localStorage.getItem("fnb_banners");
    const savedTests = localStorage.getItem("fnb_testimonials");
    const savedRepairs = localStorage.getItem("fnb_repairs");
    const savedBulks = localStorage.getItem("fnb_bulks");
    const savedAbout = localStorage.getItem("fnb_about");
    const savedFeedbacks = localStorage.getItem("fnb_feedbacks");
    const savedRepairImages = localStorage.getItem("fnb_repair_images");
    const savedSettings = localStorage.getItem("fnb_site_settings");

    if (savedCats) {
      try { setCategories(JSON.parse(savedCats)); } catch (e) { setCategories(INITIAL_CATEGORIES); }
    } else {
      setCategories(INITIAL_CATEGORIES);
    }

    if (savedSubs) {
      try { setSubCategories(JSON.parse(savedSubs)); } catch (e) { setSubCategories(INITIAL_SUB_CATEGORIES); }
    } else {
      setSubCategories(INITIAL_SUB_CATEGORIES);
    }

    if (savedProds) {
      try { setProducts(JSON.parse(savedProds)); } catch (e) { setProducts(INITIAL_PRODUCTS); }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }

    if (savedBanners) {
      try { setBanners(JSON.parse(savedBanners)); } catch (e) { setBanners(INITIAL_BANNERS); }
    } else {
      setBanners(INITIAL_BANNERS);
    }

    if (savedTests) {
      try { setTestimonials(JSON.parse(savedTests)); } catch (e) { setTestimonials(INITIAL_TESTIMONIALS); }
    } else {
      setTestimonials(INITIAL_TESTIMONIALS);
    }

    if (savedRepairs) {
      try { setRepairHistory(JSON.parse(savedRepairs)); } catch (e) {}
    }
    if (savedBulks) {
      try { setBulkHistory(JSON.parse(savedBulks)); } catch (e) {}
    }

    if (savedFeedbacks) {
      try { setFeedbacks(JSON.parse(savedFeedbacks)); } catch (e) { setFeedbacks(INITIAL_FEEDBACKS); }
    } else {
      setFeedbacks(INITIAL_FEEDBACKS);
    }

    if (savedRepairImages) {
      try { setRepairImages(JSON.parse(savedRepairImages)); } catch (e) { setRepairImages(INITIAL_REPAIR_IMAGES); }
    } else {
      setRepairImages(INITIAL_REPAIR_IMAGES);
    }

    if (savedAbout) {
      try { setAboutContent(JSON.parse(savedAbout)); } catch (e) { setAboutContent(INITIAL_ABOUT); }
    } else {
      setAboutContent(INITIAL_ABOUT);
    }

    if (savedSettings) {
      try { setSiteSettings(JSON.parse(savedSettings)); } catch (e) {}
    }

    // Test live Firestore server connectivity
    testFirebaseConnection().then((connected) => {
      if (connected) setFirebaseStatus("connected");
    });

    // 2. Seed Firebase Firestore if database is empty on first boot
    seedInitialDataIfEmpty({
      categories: INITIAL_CATEGORIES,
      subCategories: INITIAL_SUB_CATEGORIES,
      products: INITIAL_PRODUCTS,
      banners: INITIAL_BANNERS,
      testimonials: INITIAL_TESTIMONIALS,
      about: INITIAL_ABOUT,
      feedbacks: INITIAL_FEEDBACKS,
      repairImages: INITIAL_REPAIR_IMAGES,
    }).catch(console.error);

    // 3. Real-time subscriptions to Firestore collections
    const unsubCats = subscribeToCollection<Category>(COLLECTIONS.CATEGORIES, (items) => {
      setCategories(items);
      localStorage.setItem("fnb_categories", JSON.stringify(items));
      setFirebaseStatus("connected");
    });

    const unsubSubs = subscribeToCollection<SubCategory>(COLLECTIONS.SUBCATEGORIES, (items) => {
      setSubCategories(items);
      localStorage.setItem("fnb_subcategories", JSON.stringify(items));
      setFirebaseStatus("connected");
    });

    const unsubProds = subscribeToCollection<Product>(COLLECTIONS.PRODUCTS, (items) => {
      setProducts(items);
      localStorage.setItem("fnb_products", JSON.stringify(items));
      setFirebaseStatus("connected");
    });

    const unsubBanners = subscribeToCollection<Banner>(COLLECTIONS.BANNERS, (items) => {
      setBanners(items);
      localStorage.setItem("fnb_banners", JSON.stringify(items));
    });

    const unsubTests = subscribeToCollection<Testimonial>(COLLECTIONS.TESTIMONIALS, (items) => {
      setTestimonials(items);
      localStorage.setItem("fnb_testimonials", JSON.stringify(items));
    });

    const unsubRepairs = subscribeToCollection<RepairRequest>(COLLECTIONS.REPAIR_REQUESTS, (items) => {
      setRepairHistory(items);
      localStorage.setItem("fnb_repairs", JSON.stringify(items));
    });

    const unsubBulks = subscribeToCollection<BulkOrderRequest>(COLLECTIONS.BULK_ORDERS, (items) => {
      setBulkHistory(items);
      localStorage.setItem("fnb_bulks", JSON.stringify(items));
    });

    const unsubFeedbacks = subscribeToCollection<UserFeedback>(COLLECTIONS.FEEDBACKS, (items) => {
      setFeedbacks(items);
      localStorage.setItem("fnb_feedbacks", JSON.stringify(items));
    });

    const unsubRepairImages = subscribeToCollection<RepairReferenceImage>(COLLECTIONS.REPAIR_IMAGES, (items) => {
      setRepairImages(items);
      localStorage.setItem("fnb_repair_images", JSON.stringify(items));
    });

    const unsubAbout = subscribeToDocument<AboutContent>(COLLECTIONS.ABOUT, "main", (doc) => {
      if (doc) {
        setAboutContent(doc);
        localStorage.setItem("fnb_about", JSON.stringify(doc));
      }
    });

    const unsubSettings = subscribeToDocument<SiteSettings>(COLLECTIONS.SITE_SETTINGS, "main", (doc) => {
      if (doc) {
        setSiteSettings(doc);
        localStorage.setItem("fnb_site_settings", JSON.stringify(doc));
      }
    });

    return () => {
      unsubCats();
      unsubSubs();
      unsubProds();
      unsubBanners();
      unsubTests();
      unsubRepairs();
      unsubBulks();
      unsubFeedbacks();
      unsubRepairImages();
      unsubAbout();
      unsubSettings();
    };
  }, []);

  // Handle shared product loading automatically (supports /share/prod-id, ?product=prod-id, #product=prod-id)
  useEffect(() => {
    if (products.length > 0) {
      const path = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      let targetId: string | null = null;

      // 1. Check pathname for /share/prod-id or /product/prod-id
      if (path.includes("/share/")) {
        targetId = path.split("/share/")[1];
      } else if (path.includes("/product/")) {
        targetId = path.split("/product/")[1];
      }

      // 2. Check query params ?product=prod-id or ?productId=prod-id or ?id=prod-id
      if (!targetId && search) {
        const params = new URLSearchParams(search);
        targetId = params.get("product") || params.get("productId") || params.get("id");
      }

      // 3. Check hash #product=prod-id
      if (!targetId && hash.includes("product=")) {
        targetId = hash.split("product=")[1];
      }

      if (targetId) {
        // Remove trailing parameters or slashes
        const cleanId = targetId.split("?")[0].split("&")[0].replace(/\/$/, "");
        const found = products.find(
          (p) => p.id === cleanId || p.id.toLowerCase() === cleanId.toLowerCase()
        );
        if (found) {
          setActiveProduct(found);
        }
      }
    }
  }, [products]);

  // Firebase Firestore synchronized update functions
  const updateCategories = (newCats: Category[]) => {
    setCategories(newCats);
    localStorage.setItem("fnb_categories", JSON.stringify(newCats));
    batchSaveCollection(COLLECTIONS.CATEGORIES, newCats).catch(console.error);
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem("fnb_categories", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.CATEGORIES, id).catch(console.error);
  };

  const updateSubCategories = (newSubs: SubCategory[]) => {
    setSubCategories(newSubs);
    localStorage.setItem("fnb_subcategories", JSON.stringify(newSubs));
    batchSaveCollection(COLLECTIONS.SUBCATEGORIES, newSubs).catch(console.error);
  };

  const deleteSubCategory = (id: string) => {
    const updated = subCategories.filter((s) => s.id !== id);
    setSubCategories(updated);
    localStorage.setItem("fnb_subcategories", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.SUBCATEGORIES, id).catch(console.error);
  };

  const updateProducts = (newProds: Product[]) => {
    setProducts(newProds);
    localStorage.setItem("fnb_products", JSON.stringify(newProds));
    batchSaveCollection(COLLECTIONS.PRODUCTS, newProds).catch(console.error);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("fnb_products", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.PRODUCTS, id).catch(console.error);
  };

  const updateBanners = (newBanners: Banner[]) => {
    setBanners(newBanners);
    localStorage.setItem("fnb_banners", JSON.stringify(newBanners));
    batchSaveCollection(COLLECTIONS.BANNERS, newBanners).catch(console.error);
  };

  const deleteBanner = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    localStorage.setItem("fnb_banners", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.BANNERS, id).catch(console.error);
  };

  const updateTestimonials = (newTests: Testimonial[]) => {
    setTestimonials(newTests);
    localStorage.setItem("fnb_testimonials", JSON.stringify(newTests));
    batchSaveCollection(COLLECTIONS.TESTIMONIALS, newTests).catch(console.error);
  };

  const deleteTestimonial = (id: string) => {
    const updated = testimonials.filter((t) => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem("fnb_testimonials", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.TESTIMONIALS, id).catch(console.error);
  };

  const updateRepairHistory = (newRepairs: RepairRequest[]) => {
    setRepairHistory(newRepairs);
    localStorage.setItem("fnb_repairs", JSON.stringify(newRepairs));
    batchSaveCollection(COLLECTIONS.REPAIR_REQUESTS, newRepairs).catch(console.error);
  };

  const deleteRepairHistory = (id: string) => {
    const updated = repairHistory.filter((r) => r.id !== id);
    setRepairHistory(updated);
    localStorage.setItem("fnb_repairs", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.REPAIR_REQUESTS, id).catch(console.error);
  };

  const updateBulkHistory = (newBulks: BulkOrderRequest[]) => {
    setBulkHistory(newBulks);
    localStorage.setItem("fnb_bulks", JSON.stringify(newBulks));
    batchSaveCollection(COLLECTIONS.BULK_ORDERS, newBulks).catch(console.error);
  };

  const deleteBulkHistory = (id: string) => {
    const updated = bulkHistory.filter((b) => b.id !== id);
    setBulkHistory(updated);
    localStorage.setItem("fnb_bulks", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.BULK_ORDERS, id).catch(console.error);
  };

  const updateAboutContent = (newAbout: AboutContent) => {
    setAboutContent(newAbout);
    localStorage.setItem("fnb_about", JSON.stringify(newAbout));
    saveFirestoreDoc(COLLECTIONS.ABOUT, "main", newAbout).catch(console.error);
  };

  const updateFeedbacks = (newFeedbacks: UserFeedback[]) => {
    setFeedbacks(newFeedbacks);
    localStorage.setItem("fnb_feedbacks", JSON.stringify(newFeedbacks));
    batchSaveCollection(COLLECTIONS.FEEDBACKS, newFeedbacks).catch(console.error);
  };

  const deleteFeedback = (id: string) => {
    const updated = feedbacks.filter((f) => f.id !== id);
    setFeedbacks(updated);
    localStorage.setItem("fnb_feedbacks", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.FEEDBACKS, id).catch(console.error);
  };

  const updateRepairImages = (newImgs: RepairReferenceImage[]) => {
    setRepairImages(newImgs);
    localStorage.setItem("fnb_repair_images", JSON.stringify(newImgs));
    batchSaveCollection(COLLECTIONS.REPAIR_IMAGES, newImgs).catch(console.error);
  };

  const deleteRepairImage = (id: string) => {
    const updated = repairImages.filter((img) => img.id !== id);
    setRepairImages(updated);
    localStorage.setItem("fnb_repair_images", JSON.stringify(updated));
    deleteFirestoreDoc(COLLECTIONS.REPAIR_IMAGES, id).catch(console.error);
  };

  const updateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    localStorage.setItem("fnb_site_settings", JSON.stringify(newSettings));
    saveFirestoreDoc(COLLECTIONS.SITE_SETTINGS, "main", newSettings).catch(console.error);
  };

  const handleAddFeedback = (fb: Omit<UserFeedback, "id" | "pushedToHome" | "status" | "createdAt">) => {
    const newFb: UserFeedback = {
      ...fb,
      id: "fb-" + Date.now(),
      pushedToHome: false,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newFb, ...feedbacks];
    updateFeedbacks(updated);
    saveFirestoreDoc(COLLECTIONS.FEEDBACKS, newFb.id, newFb).catch(console.error);
  };

  // Callback to insert newly created onsite repair request
  const handleAddRepairRequest = (req: Omit<RepairRequest, "id" | "status" | "createdAt">) => {
    const newRequest: RepairRequest = {
      ...req,
      id: "rep-" + Date.now(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [newRequest, ...repairHistory];
    updateRepairHistory(updated);
    saveFirestoreDoc(COLLECTIONS.REPAIR_REQUESTS, newRequest.id, newRequest).catch(console.error);
  };

  // Callback to insert newly created bulk B2B project order
  const handleAddBulkOrder = (req: Omit<BulkOrderRequest, "id" | "status" | "createdAt">) => {
    const newRequest: BulkOrderRequest = {
      ...req,
      id: "bulk-" + Date.now(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [newRequest, ...bulkHistory];
    updateBulkHistory(updated);
    saveFirestoreDoc(COLLECTIONS.BULK_ORDERS, newRequest.id, newRequest).catch(console.error);
  };


  // Click handler for category cards on home page
  const handleCategorySelection = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory(null);
    setCurrentTab("categories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear filters
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedColor(null);
    setSelectedFabric(null);
    setSelectedMaterial(null);
    setSelectedFinish(null);
    setSearchQuery("");
  };

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSub = !selectedSubCategory || p.subCategoryId === selectedSubCategory;
    
    const matchesColor = !selectedColor || p.colors.some(c => c.toLowerCase() === selectedColor.toLowerCase());
    const matchesFabric = !selectedFabric || p.fabrics.some(f => f.toLowerCase() === selectedFabric.toLowerCase());
    const matchesMaterial = !selectedMaterial || p.material.toLowerCase() === selectedMaterial.toLowerCase();
    const matchesFinish = !selectedFinish || p.finish.toLowerCase() === selectedFinish.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSub && matchesColor && matchesFabric && matchesMaterial && matchesFinish && matchesSearch;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "newest") {
      return b.newest ? 1 : -1;
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    // "featured" default
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  // Unique attribute lists for sidebar filters
  const colorsFilterList = Array.from(new Set(products.flatMap((p) => p.colors))).filter(c => c && c !== "None");
  const fabricsFilterList = Array.from(new Set(products.flatMap((p) => p.fabrics))).filter(f => f && f !== "None");
  const materialsFilterList = Array.from(new Set(products.map((p) => p.material))).filter(Boolean);
  const finishesFilterList = Array.from(new Set(products.map((p) => p.finish))).filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col justify-between relative overflow-x-hidden">
      {/* Immersive Luxury Gradient Overlays */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none bg-gradient-to-l from-amber-500/5 to-transparent z-40"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/4 pointer-events-none bg-gradient-to-t from-stone-600/5 to-transparent z-40"></div>
      <div className="luxury-lighting-overlay"></div>
      
      {/* Sticky Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubCategory(null);
        }}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Container Router wrapper */}
      <main className="flex-grow">
        
        {/* VIEW: HOME PAGE */}
        {currentTab === "home" && (
          <div className="space-y-20 pb-20">
            
            {/* Elegant Hero Carousel Slider */}
            <HeroSlider
              banners={banners}
              setCurrentTab={setCurrentTab}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setSelectedSubCategory(null);
              }}
            />

            {/* Quality Statement Trust section */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-amber-950 px-6 py-6 text-white sm:px-10 sm:py-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-amber-900/40 via-transparent to-transparent opacity-40"></div>
                
                <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-amber-900/30">
                  <div className="flex items-start space-x-3 pt-4 md:pt-0 md:pl-0">
                    <Award className="h-8 w-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-serif text-base font-bold">Seasoned Teak Wood</h4>
                     </div>
                  </div>
                  <div className="flex items-start space-x-3 pt-4 md:pt-0 md:pl-6">
                    <ShieldCheck className="h-8 w-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-serif text-base font-bold">German Precision Finish</h4>
                     </div>
                  </div>
                  <div className="flex items-start space-x-3 pt-4 md:pt-0 md:pl-6">
                    <Truck className="h-8 w-8 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-serif text-base font-bold">India Wide Logistics</h4>
                     </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION: Redesigned Featured Categories with Unique Luxury Showroom Background */}
            <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/90 via-amber-50/50 to-stone-100/90 py-10 sm:py-14 border-y border-amber-900/10 shadow-xs">
              {/* Subtle ambient lighting glows for high-end showroom atmosphere */}
              <div className="absolute top-0 left-10 -mt-16 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-10 -mb-16 h-72 w-72 rounded-full bg-amber-800/10 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-amber-900/15 pb-4">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-900/10 border border-amber-900/15 px-3 py-0.5 text-[11px] font-bold text-amber-900 uppercase tracking-widest mb-1.5">
                      <Sparkles className="h-3 w-3 text-amber-800" />
                      <span>Premium Showroom Segments</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">Categories</h2>
                    <p className="text-xs sm:text-sm text-stone-600 font-normal mt-0.5">
                      Explore our handcrafted solid teak furniture collections designed for every space
                    </p>
                  </div>
                  
                  {/* Scroll controllers & view modes */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
                    {/* Mobile View Switcher (Grid vs Horizontal Scroll) */}
                    <div className="flex sm:hidden items-center rounded-xl bg-white/90 p-1 border border-stone-200 shadow-2xs text-[11px] font-bold">
                      <button
                        onClick={() => setMobileCategoryViewMode("grid")}
                        className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 transition-all ${
                          mobileCategoryViewMode === "grid"
                            ? "bg-amber-900 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>All (Grid)</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileCategoryViewMode("scroll");
                          setIsAutoScrolling(true);
                        }}
                        className={`rounded-lg px-2.5 py-1 transition-all ${
                          mobileCategoryViewMode === "scroll"
                            ? "bg-amber-900 text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Scroll Row
                      </button>
                    </div>

                    {/* View All Button */}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setCurrentTab("categories");
                      }}
                      className="inline-flex items-center text-xs uppercase font-bold tracking-wider text-amber-900 hover:text-amber-700 bg-white/80 border border-amber-900/20 hover:bg-white px-3.5 py-1.5 rounded-xl shadow-2xs transition-all"
                      id="view-all-categories-btn"
                    >
                      <span>All ({categories.length})</span>
                      <ChevronRight className="h-4 w-4 ml-0.5" />
                    </button>

                    {/* Desktop Navigation Arrows */}
                    <div className="hidden sm:flex items-center space-x-1.5">
                      <button
                        onClick={() => handleScrollCategories("left")}
                        className="p-2 rounded-full border border-stone-200/90 bg-white hover:bg-amber-50 hover:border-amber-400 text-stone-700 hover:text-amber-900 transition-all shadow-xs"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleScrollCategories("right")}
                        className="p-2 rounded-full border border-stone-200/90 bg-white hover:bg-amber-50 hover:border-amber-400 text-stone-700 hover:text-amber-900 transition-all shadow-xs"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* MOBILE VIEW: GRID ALL CATEGORIES AT ONCE (Smaller card size, no scroll needed) */}
                {mobileCategoryViewMode === "grid" && (
                  <div className="grid sm:hidden grid-cols-2 gap-3.5">
                    {categories.map((cat) => {
                      const catProductsCount = products.filter(p => p.categoryId === cat.id).length;
                      return (
                        <div
                          key={`mob-${cat.id}`}
                          onClick={() => handleCategorySelection(cat.id)}
                          className="group relative rounded-2xl border border-stone-200/90 bg-white/95 backdrop-blur-2xs p-2.5 shadow-sm hover:shadow-md transition-all duration-300 active:scale-98 cursor-pointer flex flex-col justify-between"
                        >
                          {/* Arched Top Image Container */}
                          <div className="relative h-[120px] w-full overflow-hidden rounded-t-[1.4rem] rounded-b-lg bg-stone-100">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 z-10 rounded-full bg-stone-900/80 px-2 py-0.5 text-[9px] font-bold text-amber-200 backdrop-blur-xs">
                              {catProductsCount} Designs
                            </div>
                          </div>

                          {/* Text info - Bold & Slightly Larger */}
                          <div className="pt-2.5 pb-1 px-1 flex flex-col justify-between flex-grow">
                            <div>
                              <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors">
                                {cat.name}
                              </h3>
                              <p className="text-[10px] text-stone-500 font-light line-clamp-1 mt-0.5">
                                {cat.description}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-1.5 text-[10px] font-bold text-amber-900">
                              <span>Explore Page</span>
                              <ChevronRight className="h-3 w-3 text-amber-700" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* DESKTOP & SCROLL MODE CAROUSEL (Arched Luxury Cards, No Hover Flip) */}
                <div
                  ref={categoriesScrollRef}
                  className={`${
                    mobileCategoryViewMode === "grid" ? "hidden sm:flex" : "flex"
                  } gap-5 sm:gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth`}
                >
                  {categories.map((cat) => {
                    const catProductsCount = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleCategorySelection(cat.id)}
                        className="group relative h-[365px] sm:h-[395px] w-[260px] sm:w-[300px] shrink-0 snap-start rounded-[2.2rem] bg-white border border-stone-200/90 p-3 sm:p-4 shadow-sm hover:shadow-2xl hover:border-amber-500/50 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        {/* Arched Luxury Image Frame */}
                        <div className="relative h-[220px] sm:h-[240px] w-full overflow-hidden rounded-t-[1.8rem] sm:rounded-t-[2.2rem] rounded-b-xl bg-stone-100">
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/10 to-transparent z-10"></div>
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-full w-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {/* Floating Product Count Badge */}
                          <div className="absolute top-3 left-3 z-20 rounded-full bg-amber-950/85 backdrop-blur-md text-amber-200 border border-amber-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                            {catProductsCount} Designs Available
                          </div>
                        </div>

                        {/* Content Info Area - Bold Titles */}
                        <div className="px-2 pt-3 pb-1 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug group-hover:text-amber-900 transition-colors">
                              {cat.name}
                            </h3>
                            <p className="text-xs text-stone-500 font-light line-clamp-2 mt-1 leading-relaxed">
                              {cat.description}
                            </p>
                          </div>
                          
                          {/* Action CTA Row */}
                          <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-2">
                            <span className="text-[11px] uppercase font-bold text-amber-900 tracking-wider">
                              Explore Collection
                            </span>
                            <div className="h-7 w-7 rounded-full bg-amber-800 text-white flex items-center justify-center transform group-hover:translate-x-1 transition-transform shadow-xs">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SECTION: Popular Products gallery list */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-stone-200 pb-4">
                <div>
                  <span className="text-xs font-bold tracking-widest text-amber-800 uppercase">Artisan Handcrafted</span>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">Popular Showroom Masterpieces</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                    setCurrentTab("categories");
                  }}
                  className="mt-2.5 inline-flex items-center text-sm font-bold text-amber-800 hover:text-amber-700 transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.filter((p) => p.featured).slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    onOpenDetails={(p) => setActiveProduct(p)}
                  />
                ))}
              </div>
            </section>

            {/* SECTION: Repair service callout */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-12 shadow-md relative overflow-hidden">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
                  <div className="space-y-5">
                    <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-800 uppercase">
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Sofa & Furniture Maintenance</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                      Worn-out sofas? We can restore it to premium brand-new quality
                    </h2>
                    <p className="text-sm font-light leading-relaxed text-stone-500">
                      We offer complete sofa upholstery overhaul, plush 40-density foam replacements, and premium Teak polishing services onsite at direct budget pricing. Fast & experienced craftsmen.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <button
                        onClick={() => setCurrentTab("repair")}
                        className="rounded-xl bg-amber-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-900"
                      >
                        Book Repair Service
                      </button>
                      <a
                        href="https://wa.me/918830402066?text=Hello%20FNB,%20I%20want%20to%20get%20a%20price%20quote%20for%20a%20cushion/sofa%20repair%20service."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-600 hover:text-white"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Consult on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-100 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80"
                      alt="furnishing restoration workshop"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION: B2B Institutional bulk orders callout */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-stone-900 px-6 py-12 text-white sm:px-12 sm:py-16 shadow-lg">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Building2 className="h-4 w-4" />
                      <span>Bulk Manufacturing Contracts</span>
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Custom furniture supply for Cafes, Hotels, and Educational Institutes
                    </h2>
                    <p className="text-sm font-light leading-relaxed text-stone-300">
                      Direct factory supply for school dual desks, corporate desks, heavy MS almirahs, hotel beds and luxury lounge setups. High-volume, high-durability production.
                    </p>
                    <div className="flex flex-col gap-3 text-xs font-light text-stone-300">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-amber-400">✔</span>
                        <span>Sturdy iron/MS framework, rust-proof powder coating</span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <span className="text-amber-400">✔</span>
                        <span>Bespoke blueprint manufacturing with solid teak or plywood base</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab("bulk")}
                      className="inline-flex items-center space-x-2.5 rounded-xl bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-amber-400"
                    >
                      <span>Inquire Bulk Order Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-stone-800">
                    <img
                      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                      alt="premium café setup custom supply"
                      className="h-full w-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION: Verified Client Feedback & Stories (Pushed to Home) */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-widest text-amber-800 uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Verified Client Experience & Stories</span>
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">What Our Clients Say</h2>
                </div>

                <button
                  onClick={() => setCurrentTab("feedback")}
                  className="inline-flex items-center space-x-2 rounded-xl bg-amber-900 hover:bg-amber-955 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Submit Your Feedback</span>
                </button>
              </div>

              {/* Grid showing pushed client feedbacks first */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {feedbacks.filter(f => f.pushedToHome).map((fb) => (
                  <div
                    key={fb.id}
                    className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-stone-50/30 p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3 text-emerald-700" />
                          <span>Verified Client</span>
                        </span>
                      </div>

                      {fb.imageUrl && (
                        <div className="h-40 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                          <img src={fb.imageUrl} alt={fb.name} className="h-full w-full object-cover" />
                        </div>
                      )}

                      <p className="text-xs sm:text-sm font-normal text-stone-700 italic leading-relaxed">
                        "{fb.comment}"
                      </p>
                    </div>

                    <div className="border-t border-stone-200/60 pt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-9 w-9 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
                          {fb.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">{fb.name}</h4>
                          <span className="text-[10px] sm:text-xs text-stone-500 block font-normal">
                            {fb.city || "Maharashtra"} {fb.productPurchased ? `• ${fb.productPurchased}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Additional static testimonials */}
                {testimonials.map((test) => (
                  <div
                    key={test.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-1 text-amber-500">
                        {Array.from({ length: test.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm font-normal text-stone-600 italic leading-relaxed">
                        "{test.comment}"
                      </p>
                    </div>

                    <div className="border-t border-stone-100 pt-3 flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-amber-800 uppercase shrink-0">
                        {test.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900">{test.name}</h4>
                        <span className="text-[10px] sm:text-xs text-stone-500 block font-normal">{test.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* VIEW: CATEGORY / SUB-CATEGORY / PRODUCT LISTINGS */}
        {currentTab === "categories" && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            
            {/* 1. HERO BANNER: CURATED SHOWROOM (Redesigned with premium background and elegant typography) */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-800 min-h-[280px] flex flex-col justify-center px-6 py-10 sm:px-12 bg-black text-white">
              {/* Background Image of Luxury Gray Sofas Showroom */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1600"
                  alt="Curated furniture showroom" 
                  className="w-full h-full object-cover object-center opacity-65 transform scale-102 hover:scale-100 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* Content over image */}
              <div className="relative z-10 max-w-3xl space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.35em] text-amber-400 block animate-fade-in">
                  THE AUTUMN ATELIER
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05] text-amber-50 uppercase">
                  CURATED SHOWROOM
                </h1>
                <p className="text-stone-300 font-light text-xs sm:text-sm leading-relaxed max-w-2xl">
                  Indulge in premium ergonomic alignments, premium velvet overlays, and solid teak foundations tailored to bring hotel-lounge aesthetics home.
                </p>
              </div>

              {/* Elegant top right watermark */}
              <div className="hidden md:block absolute top-8 right-12 text-right opacity-15 pointer-events-none">
                <span className="font-serif text-5xl font-light italic tracking-tight text-amber-400">Direct Factory</span>
              </div>
            </div>

            {/* 2. RECTANGULAR CATEGORIES ROW */}
            {/* Desktop View: Horizontal scroll categories & segments */}
            <div className="hidden lg:block space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block pl-1">
                Explore Categories
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory scroll-smooth">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                  }}
                  className={`rounded-xl border px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 snap-start ${
                    !selectedCategory
                      ? "bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-950/15"
                      : "bg-white border-stone-200 text-stone-700 hover:border-[#D4AF37] hover:bg-stone-50"
                  }`}
                >
                  All Products ({products.length})
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory(null);
                      }}
                      className={`rounded-xl border px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 snap-start ${
                        selectedCategory === cat.id
                          ? "bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-950/15"
                          : "bg-white border-stone-200 text-stone-700 hover:border-[#D4AF37] hover:bg-stone-50"
                      }`}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Sub-categories row if parent is active */}
              {selectedCategory && (
                <div className="flex flex-wrap gap-2 pt-2 bg-[#E6E1D6]/20 p-3 rounded-2xl border border-stone-200/50">
                  <span className="text-[10px] font-bold text-[#8C7E6A] uppercase tracking-widest pt-1.5 mr-2 pl-1">
                    Segments:
                  </span>
                  <button
                    onClick={() => setSelectedSubCategory(null)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all uppercase tracking-wide ${
                      !selectedSubCategory
                        ? "bg-stone-800 text-white font-bold"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    All {categories.find((c) => c.id === selectedCategory)?.name}
                  </button>
                  {subCategories
                    .filter((sc) => sc.categoryId === selectedCategory)
                    .map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => setSelectedSubCategory(sc.id)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all uppercase tracking-wide ${
                          selectedSubCategory === sc.id
                            ? "bg-stone-800 text-white font-bold"
                            : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        {sc.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Mobile View: Dedicated All Products & Filter Button Bar */}
            <div className="block lg:hidden space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleResetFilters();
                  }}
                  className={`flex items-center justify-center space-x-2 rounded-xl border px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                    !selectedCategory && !selectedSubCategory && !searchQuery && !selectedColor && !selectedFabric && !selectedMaterial
                      ? "bg-stone-900 border-stone-900 text-white shadow-stone-950/20"
                      : "bg-white border-stone-300 text-stone-800 hover:bg-stone-50"
                  }`}
                >
                  <span>All Products ({products.length})</span>
                </button>

                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-stone-900 hover:bg-stone-850 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md active:scale-95 transition-all"
                  id="mobile-filter-trigger-button"
                >
                  <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                  <span>Filter & Categories</span>
                  {(selectedCategory || selectedSubCategory || searchQuery || selectedColor || selectedFabric || selectedMaterial) && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-stone-950">
                      !
                    </span>
                  )}
                </button>
              </div>

              {/* Active selection badge banner on mobile */}
              {(selectedCategory || selectedSubCategory) && (
                <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200 px-3.5 py-2 rounded-xl text-xs text-amber-900 font-medium shadow-xs">
                  <span className="truncate">
                    Active: <strong className="font-bold">{categories.find(c => c.id === selectedCategory)?.name || "All"}</strong>
                    {selectedSubCategory && (
                      <span className="text-amber-800"> › {subCategories.find(s => s.id === selectedSubCategory)?.name}</span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSubCategory(null);
                    }}
                    className="ml-2 font-bold text-amber-900 underline text-[10px] uppercase shrink-0 hover:text-amber-700"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* 3. FILTERS PANEL + PRODUCTS DISPLAY LAYOUT */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
              
              {/* Left Column: High-End Curated Filters (Matches color palette, swatches, clean input box) */}
              <div className="hidden lg:block lg:col-span-3 space-y-6">
                
                <div className="rounded-2xl bg-[#E6E1D6]/30 border border-stone-200/80 p-6 space-y-6 shadow-sm">
                  
                  {/* Filter Header with Reset toggle */}
                  <div className="flex items-center justify-between border-b border-stone-300/60 pb-4">
                    <div className="flex items-center space-x-2">
                      <SlidersHorizontal className="h-4 w-4 text-[#5D4037]" />
                      <span className="font-serif text-xs font-bold text-[#5D4037] uppercase tracking-wider">
                        Filters
                      </span>
                    </div>
                    {(selectedCategory || selectedSubCategory || searchQuery || selectedColor || selectedFabric || selectedMaterial || selectedFinish) && (
                      <button
                        onClick={handleResetFilters}
                        className="text-[10px] font-bold text-amber-900 uppercase tracking-wider hover:text-amber-700 underline underline-offset-2 transition-colors"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Search Models Input field */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Search Models
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-b border-stone-300 py-2 pl-9 pr-8 text-xs outline-none focus:border-stone-850 transition-colors placeholder-stone-400 font-light"
                        placeholder="e.g. Milan Sectional"
                        id="search-input"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-700 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color Filter Rectangular buttons (Matches mockup design list) */}
                  {colorsFilterList.length > 0 && (
                    <div className="space-y-2.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Upholstery Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedColor(null)}
                          className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                            !selectedColor
                              ? "bg-stone-900 text-white font-bold"
                              : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          All
                        </button>
                        {colorsFilterList.map((col) => (
                          <button
                            key={col}
                            onClick={() => setSelectedColor(selectedColor === col ? null : col)}
                            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                              selectedColor === col
                                ? "bg-stone-900 text-white font-bold"
                                : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400"
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fabric Filter Options with check marks (Matches mockup checklist layout) */}
                  {fabricsFilterList.length > 0 && (
                    <div className="space-y-2.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Premium Fabric
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setSelectedFabric(null)}
                          className={`flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-xs transition-colors duration-200 ${
                            !selectedFabric
                              ? "bg-white border border-stone-800 text-stone-950 font-bold shadow-sm"
                              : "bg-transparent text-stone-600 hover:bg-white/40"
                          }`}
                        >
                          <span className="uppercase tracking-wide">All Fabrics</span>
                          {!selectedFabric && <span className="text-stone-950 font-bold text-xs">✓</span>}
                        </button>
                        {fabricsFilterList.map((fab) => (
                          <button
                            key={fab}
                            onClick={() => setSelectedFabric(selectedFabric === fab ? null : fab)}
                            className={`flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-xs transition-colors duration-200 ${
                              selectedFabric === fab
                                ? "bg-white border border-stone-800 text-stone-950 font-bold shadow-sm"
                                : "bg-transparent text-stone-600 hover:bg-white/40"
                            }`}
                          >
                            <span className="uppercase tracking-wide">{fab}</span>
                            {selectedFabric === fab && <span className="text-stone-950 font-bold text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material Filter */}
                  {materialsFilterList.length > 0 && (
                    <div className="space-y-2.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Core Material
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {materialsFilterList.map((mat) => (
                          <button
                            key={mat}
                            onClick={() => setSelectedMaterial(selectedMaterial === mat ? null : mat)}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                              selectedMaterial === mat
                                ? "bg-stone-900 text-white font-bold"
                                : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400"
                            }`}
                          >
                            {mat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort Selection inside panel for handy mobile controls */}
                  <div className="space-y-2.5 border-t border-stone-300/60 pt-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Sort Catalog
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs outline-none focus:border-stone-850 cursor-pointer"
                    >
                      <option value="featured">Featured Masterpieces</option>
                      <option value="newest">New Arrivals First</option>
                      <option value="name">Model Name (A-Z)</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Right column Grid of products */}
              <div className="lg:col-span-9 space-y-6" id="catalogue-grid">
                
                {sortedProducts.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center space-y-3">
                    <Sofa className="mx-auto h-12 w-12 text-stone-300" />
                    <h3 className="font-serif text-lg font-bold text-stone-900">No matching furniture items</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto font-light">
                      Try adjusting your custom filter settings or search query. You can also request a custom design directly on WhatsApp.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="rounded-full bg-stone-900 px-5 py-2 text-xs font-bold uppercase text-white hover:bg-amber-900"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categories={categories}
                        onOpenDetails={(p) => setActiveProduct(p)}
                      />
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* VIEW: REPAIR SERVICES FORM PAGE */}
        {currentTab === "repair" && (
          <RepairForm
            onSubmitRequest={handleAddRepairRequest}
            repairHistory={repairHistory}
            repairImages={repairImages}
          />
        )}

        {/* VIEW: BULK ORDERS B2B FORM PAGE */}
        {currentTab === "bulk" && (
          <BulkOrderForm
            onSubmitBulk={handleAddBulkOrder}
            bulkHistory={bulkHistory}
          />
        )}

        {/* VIEW: ABOUT US */}
        {currentTab === "about" && (
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
            
            {/* Story section */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold tracking-widest text-amber-800 uppercase">{aboutContent.tagline}</span>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl">
                  {aboutContent.title}
                </h1>
                {aboutContent.paragraph1 && (
                  <p className="text-sm font-light leading-relaxed text-stone-600">
                    {aboutContent.paragraph1}
                  </p>
                )}
                {aboutContent.paragraph2 && (
                  <p className="text-sm font-light leading-relaxed text-stone-600">
                    {aboutContent.paragraph2}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 border-t border-stone-200 pt-6">
                  {aboutContent.stat1Value && (
                    <div>
                      <span className="block font-serif text-2xl font-bold text-amber-900">{aboutContent.stat1Value}</span>
                      <span className="text-xs text-stone-400 uppercase tracking-wider">{aboutContent.stat1Label}</span>
                    </div>
                  )}
                  {aboutContent.stat2Value && (
                    <div>
                      <span className="block font-serif text-2xl font-bold text-amber-900">{aboutContent.stat2Value}</span>
                      <span className="text-xs text-stone-400 uppercase tracking-wider">{aboutContent.stat2Label}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-stone-100 border border-stone-200 shadow-sm">
                <img
                  src={aboutContent.imageUrl || "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"}
                  alt={aboutContent.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Mission Vision Value pillars */}
            {aboutContent.pillars && aboutContent.pillars.length > 0 && (
              <div className="space-y-6">
                {aboutContent.pillarsTitle && (
                  <h2 className="font-serif text-2xl font-bold text-stone-900 text-center">{aboutContent.pillarsTitle}</h2>
                )}
                <div className={`grid grid-cols-1 gap-8 ${aboutContent.pillars.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                  {aboutContent.pillars.map((pillar) => (
                    <div key={pillar.id} className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3.5 shadow-2xs hover:shadow-sm transition-shadow">
                      <span className="text-2xl">{pillar.icon}</span>
                      <h3 className="font-serif text-lg font-bold text-stone-900">{pillar.title}</h3>
                      <p className="text-xs font-light leading-relaxed text-stone-500">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Factory & Office display details */}
            {aboutContent.locations && aboutContent.locations.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-8 sm:p-12 space-y-6">
                <h2 className="font-serif text-2xl font-bold text-stone-900 text-center">{aboutContent.locationsTitle || "Visit Our Workshops & Showrooms"}</h2>
                <div className={`grid grid-cols-1 gap-8 ${aboutContent.locations.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'} text-sm leading-relaxed text-stone-600`}>
                  {aboutContent.locations.map((loc, idx) => (
                    <div key={loc.id} className={`space-y-2 ${idx === 0 && aboutContent.locations.length > 1 ? 'border-b md:border-b-0 md:border-r border-stone-200 pb-6 md:pb-0 md:pr-6' : 'pl-0 md:pl-2'}`}>
                      <h3 className="font-serif text-lg font-bold text-amber-900 flex items-center gap-1.5">
                        {idx % 2 === 0 ? <Building2 className="h-5 w-5 text-amber-700 shrink-0" /> : <MapPin className="h-5 w-5 text-amber-700 shrink-0" />}
                        <span>{loc.title}</span>
                      </h3>
                      {loc.subtitle && <p className="font-semibold text-stone-850">{loc.subtitle}</p>}
                      {loc.address && <p className="text-stone-500 font-light">{loc.address}</p>}
                      {loc.note && <p className="text-stone-400 text-xs italic">{loc.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW: USER CLIENT FEEDBACK PORTAL */}
        {currentTab === "feedback" && (
          <FeedbackSection
            feedbacks={feedbacks}
            onSubmitFeedback={handleAddFeedback}
          />
        )}

        {/* VIEW: ADMIN CONSOLE PANEL */}
        {currentTab === "admin" && (
          <>
            {!isAdminAuthenticated ? (
              <AdminLoginModal
                isOpen={true}
                onLoginSuccess={() => {
                  setIsAdminAuthenticated(true);
                  sessionStorage.setItem("fnb_admin_authed", "true");
                  setUserRole("admin");
                }}
                onCancel={() => {
                  setCurrentTab("home");
                  setUserRole("customer");
                  if (window.location.hash === "#admin") {
                    window.history.replaceState(null, "", window.location.pathname);
                  }
                }}
              />
            ) : (
              <div className="space-y-0">
                {/* Admin Status Header Bar */}
                <div className="bg-amber-950 text-amber-100 border-b border-amber-800/60 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-medium shadow-inner">
                  <div className="flex items-center space-x-2.5">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-stone-300">
                      Authenticated Administrator: <strong className="text-white font-bold tracking-wide">omkar123</strong>
                    </span>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 text-[10px] uppercase font-extrabold tracking-wider">
                      Encrypted Session Active
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      sessionStorage.removeItem("fnb_admin_authed");
                      setUserRole("customer");
                      setCurrentTab("home");
                      if (window.location.hash === "#admin") {
                        window.history.replaceState(null, "", window.location.pathname);
                      }
                    }}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/50 px-3.5 py-1.5 text-xs font-bold text-red-200 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                    title="Logout Administrator Session"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout Admin</span>
                  </button>
                </div>

                <AdminPanel
                  categories={categories}
                  subCategories={subCategories}
                  products={products}
                  banners={banners}
                  testimonials={testimonials}
                  repairHistory={repairHistory}
                  bulkHistory={bulkHistory}
                  aboutContent={aboutContent}
                  feedbacks={feedbacks}
                  repairImages={repairImages}
                  siteSettings={siteSettings}
                  firebaseStatus={firebaseStatus}
                  onUpdateCategories={updateCategories}
                  onUpdateSubCategories={updateSubCategories}
                  onUpdateProducts={updateProducts}
                  onUpdateBanners={updateBanners}
                  onUpdateTestimonials={updateTestimonials}
                  onUpdateRepairHistory={updateRepairHistory}
                  onUpdateBulkHistory={updateBulkHistory}
                  onUpdateAboutContent={updateAboutContent}
                  onUpdateFeedbacks={updateFeedbacks}
                  onUpdateRepairImages={updateRepairImages}
                  onUpdateSiteSettings={updateSiteSettings}
                  onDeleteCategory={deleteCategory}
                  onDeleteSubCategory={deleteSubCategory}
                  onDeleteProduct={deleteProduct}
                  onDeleteBanner={deleteBanner}
                  onDeleteTestimonial={deleteTestimonial}
                  onDeleteFeedback={deleteFeedback}
                  onDeleteRepairImage={deleteRepairImage}
                  onDeleteRepairHistory={deleteRepairHistory}
                  onDeleteBulkHistory={deleteBulkHistory}
                />
              </div>
            )}
          </>
        )}


      </main>

      {/* MOBILE FILTER MODAL DRAWER */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop with elegant fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-stone-950/65 backdrop-blur-sm"
            />

            {/* Slide-in container with smooth animation */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-[#fbfaf8] shadow-2xl flex flex-col z-10 border-l border-stone-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50 shrink-0">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#5D4037]" />
                  <h3 className="font-serif text-xs font-bold text-[#5D4037] uppercase tracking-wider">
                    Filter Catalogue
                  </h3>
                </div>
                <div className="flex items-center space-x-4">
                  {(selectedCategory || selectedSubCategory || searchQuery || selectedColor || selectedFabric || selectedMaterial || selectedFinish) && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[10px] font-bold text-amber-900 uppercase tracking-wider hover:text-amber-700 underline underline-offset-2 transition-colors"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-900 hover:text-white transition-all focus:outline-none"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable filter content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* 1. CATEGORIES SELECTION */}
                <div className="space-y-2.5 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Product Categories
                    </label>
                    {selectedCategory && (
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setSelectedSubCategory(null);
                        }}
                        className="text-[10px] font-bold text-amber-900 hover:underline uppercase"
                      >
                        Reset Category
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubCategory(null);
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                        !selectedCategory
                          ? "bg-stone-900 text-white shadow-sm"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      All Products ({products.length})
                    </button>
                    {categories.map((cat) => {
                      const count = products.filter(p => p.categoryId === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            if (selectedCategory === cat.id) {
                              setSelectedCategory(null);
                              setSelectedSubCategory(null);
                            } else {
                              setSelectedCategory(cat.id);
                              setSelectedSubCategory(null);
                            }
                          }}
                          className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                            selectedCategory === cat.id
                              ? "bg-stone-900 text-white shadow-sm"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {cat.name} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SEGMENTS SELECTION */}
                <div className="space-y-2.5 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Segments {selectedCategory ? `(${categories.find(c => c.id === selectedCategory)?.name})` : "(All)"}
                    </label>
                    {selectedSubCategory && (
                      <button
                        onClick={() => setSelectedSubCategory(null)}
                        className="text-[10px] font-bold text-amber-900 hover:underline uppercase"
                      >
                        Reset Segment
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setSelectedSubCategory(null)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        !selectedSubCategory
                          ? "bg-stone-800 text-white font-bold shadow-sm"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      All {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Segments"}
                    </button>
                    {(selectedCategory
                      ? subCategories.filter(sc => sc.categoryId === selectedCategory)
                      : subCategories
                    ).map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          if (selectedSubCategory === sc.id) {
                            setSelectedSubCategory(null);
                          } else {
                            if (!selectedCategory) {
                              setSelectedCategory(sc.categoryId);
                            }
                            setSelectedSubCategory(sc.id);
                          }
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                          selectedSubCategory === sc.id
                            ? "bg-stone-800 text-white font-bold shadow-sm"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        {sc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Models Input field */}
                <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Search Models
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-b border-stone-300 py-2.5 pl-9 pr-8 text-xs outline-none focus:border-stone-800 transition-colors placeholder-stone-400 font-light"
                      placeholder="e.g. Milan Sectional"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-sm text-stone-400 hover:text-stone-700 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort selection */}
                <div className="space-y-2.5 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Sort Catalog
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-transparent border-b border-stone-300 py-2 text-xs outline-none focus:border-stone-800 cursor-pointer"
                  >
                    <option value="featured">Featured Masterpieces</option>
                    <option value="newest">New Arrivals First</option>
                    <option value="name">Model Name (A-Z)</option>
                  </select>
                </div>

                {/* Color Filter */}
                {colorsFilterList.length > 0 && (
                  <div className="space-y-2.5 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Upholstery Color
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setSelectedColor(null)}
                        className={`rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                          !selectedColor
                            ? "bg-stone-900 text-white font-bold"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        All
                      </button>
                      {colorsFilterList.map((col) => (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(selectedColor === col ? null : col)}
                          className={`rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                            selectedColor === col
                              ? "bg-stone-900 text-white font-bold"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fabric Filter Options */}
                {fabricsFilterList.length > 0 && (
                  <div className="space-y-2.5 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Premium Fabric
                    </label>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        onClick={() => setSelectedFabric(null)}
                        className={`flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-xs transition-colors duration-200 ${
                          !selectedFabric
                            ? "bg-stone-50 border border-stone-800 text-stone-950 font-bold"
                            : "bg-stone-50 text-stone-600 hover:bg-stone-100/80"
                        }`}
                      >
                        <span className="uppercase tracking-wide text-[11px]">All Fabrics</span>
                        {!selectedFabric && <span className="text-stone-950 font-bold text-xs">✓</span>}
                      </button>
                      {fabricsFilterList.map((fab) => (
                        <button
                          key={fab}
                          onClick={() => setSelectedFabric(selectedFabric === fab ? null : fab)}
                          className={`flex items-center justify-between w-full text-left py-2 px-3 rounded-lg text-xs transition-colors duration-200 ${
                            selectedFabric === fab
                              ? "bg-stone-50 border border-stone-800 text-stone-950 font-bold"
                              : "bg-stone-50 text-stone-600 hover:bg-stone-100/80"
                          }`}
                        >
                          <span className="uppercase tracking-wide text-[11px]">{fab}</span>
                          {selectedFabric === fab && <span className="text-stone-950 font-bold text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Material Filter */}
                {materialsFilterList.length > 0 && (
                  <div className="space-y-2.5 bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Core Material
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {materialsFilterList.map((mat) => (
                        <button
                          key={mat}
                          onClick={() => setSelectedMaterial(selectedMaterial === mat ? null : mat)}
                          className={`rounded-lg px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                            selectedMaterial === mat
                              ? "bg-stone-900 text-white font-bold"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Apply Bar */}
              <div className="border-t border-stone-200 p-4 bg-stone-50 shrink-0">
                <button
                  onClick={() => {
                    setMobileFiltersOpen(false);
                    const el = document.getElementById("catalogue-grid");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full rounded-xl bg-stone-900 hover:bg-stone-850 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-98"
                >
                  Apply & View ({sortedProducts.length} Products)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POLICY DETAIL OVERLAYS */}
      {viewPolicy && (
        <div className="fixed inset-0 z-[100] bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif text-xl font-bold text-stone-900 uppercase tracking-wide">
                {viewPolicy === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
              </h3>
              <button
                onClick={() => setViewPolicy(null)}
                className="rounded-full bg-stone-100 p-2 text-stone-700 hover:bg-stone-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-stone-600 font-light space-y-4 leading-relaxed">
              {viewPolicy === "privacy" ? (
                <>
                  <p className="font-bold text-stone-800">1. Information We Process</p>
                  <p>When you submit an onsite repair request or bulk institutional inquiry form on FNB Furniture N Beyond, we collect your name, address, phone number, and description details to serve you. This information is processed exclusively to coordinate logistics and custom quote estimates.</p>
                  <p className="font-bold text-stone-800">2. Cookies & Local Storage</p>
                  <p>We use standard client-side browser storage (localStorage) to persist your inquiry lists, catalog choices, and local administrator parameters so that they remain active upon refresh.</p>
                  <p className="font-bold text-stone-800">3. Contacting Us</p>
                  <p>For any privacy requests regarding customer information, feel free to message our support helpline directly on WhatsApp (8830402066).</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-stone-800">1. Custom Manufacturing Standards</p>
                  <p>All FNB Furniture N Beyond items are handcrafted based on specific custom preferences. Actual wood grain lines, textures, or upholstery color hues may vary slightly due to natural material variations.</p>
                  <p className="font-bold text-stone-800">2. WhatsApp Inquiries & Quotations</p>
                  <p>FNB Furniture N Beyond is not an automated checkout ecommerce storefront. All transactions, pricing negotiations, and customization options are finalized directly via WhatsApp communication or showroom consultations.</p>
                  <p className="font-bold text-stone-800">3. Transportation and Assembly</p>
                  <p>Delivery charges are computed depending on your location coordinates in Maharashtra. Direct assembly is handled onsite by our factory carpentering experts.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT SPECIFICATION & PREFERRED DETAIL MODAL (FLIPKART/AMAZON STYLE MULTI-COLOR HANDLER) */}
      {activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          categories={categories}
          subCategories={subCategories}
          allProducts={products}
          onClose={() => setActiveProduct(null)}
          onOpenProduct={(p) => setActiveProduct(p)}
        />
      )}

      {/* Footer element */}
      <Footer
        categories={categories}
        setCurrentTab={setCurrentTab}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubCategory(null);
        }}
        setViewPolicy={setViewPolicy}
      />

    </div>
  );
}
