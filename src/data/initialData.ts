/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, SubCategory, Product, Banner, Testimonial, AboutContent, UserFeedback, RepairReferenceImage } from "../types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "sofa-set",
    name: "Sofa Set",
    description: "Premium handcrafted sofas designed for ultimate comfort and aesthetic elegance.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "curtain",
    name: "Curtain",
    description: "Elegant and custom-made curtains, drapes, and blinds for premium window styling.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "iron-ms-cupboard",
    name: "Iron / MS Cupboard",
    description: "Heavy-duty, secure, and stylish steel cupboards, almirahs, and lockers for home & office.",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "panel-box",
    name: "Panel Box",
    description: "Durable and secure heavy-gauge metal distribution panels and electronic enclosure cabinets.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mattress",
    name: "Mattress",
    description: "Orthopedic, memory foam, and pocket spring mattresses for sound sleep and posture support.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cushion-items",
    name: "Cushion Items",
    description: "Plush cushions, designer throw pillows, bolsters, and customized comfort accessories.",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "school-bench",
    name: "School Bench",
    description: "Ergonomic, sturdy wooden and metal dual benches, desks, and educational furniture.",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "indian-seating",
    name: "Indian Seating",
    description: "Traditional Baithak, Diwan sets, low-profile wooden seating, and custom royal Indian lounges.",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "wooden-furniture",
    name: "Wooden Furniture",
    description: "Bespoke solid wood dining tables, beds, wardrobes, and modular kitchen installations.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "carpet",
    name: "Carpet",
    description: "Luxury hand-tufted carpets, Persian rugs, and customizable modern floor mats.",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "wallpaper",
    name: "Wallpaper",
    description: "Textured, 3D, non-woven, and customizable premium designer wallpapers for walls.",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "restaurant-furniture",
    name: "Restaurant Furniture",
    description: "Commercial-grade dining tables, bar stools, booth seating, and bistro setups.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "furniture-repair-maintenance",
    name: "Furniture Repair & Maintenance",
    description: "Professional polishing, wooden repair, sofa foam replacement, and restoration services.",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_SUB_CATEGORIES: SubCategory[] = [
  // Sofa Set Subcategories
  { id: "maharaja-sofa", categoryId: "sofa-set", name: "Maharaja Sofa" },
  { id: "l-shape-sofa", categoryId: "sofa-set", name: "L Shape Sofa" },
  { id: "corner-sofa", categoryId: "sofa-set", name: "Corner Sofa" },
  { id: "sofa-cum-bed", categoryId: "sofa-set", name: "Sofa Cum Bed" },
  { id: "wooden-sofa", categoryId: "sofa-set", name: "Wooden Sofa" },
  { id: "recliner-sofa", categoryId: "sofa-set", name: "Recliner Sofa" },
  { id: "designer-sofa", categoryId: "sofa-set", name: "Designer Sofa" },

  // Curtain Subcategories
  { id: "sheer-curtains", categoryId: "curtain", name: "Sheer Curtains" },
  { id: "blackout-curtains", categoryId: "curtain", name: "Blackout Curtains" },
  { id: "roman-blinds", categoryId: "curtain", name: "Roman Blinds" },

  // Iron MS Cupboard Subcategories
  { id: "home-almirah", categoryId: "iron-ms-cupboard", name: "Home Almirah" },
  { id: "office-filing-cabinet", categoryId: "iron-ms-cupboard", name: "Office Locker" },

  // Panel Box Subcategories
  { id: "distribution-box", categoryId: "panel-box", name: "Distribution Panel Box" },
  { id: "meter-cabinet", categoryId: "panel-box", name: "Electric Meter Cabinet" },

  // Mattress Subcategories
  { id: "memory-foam-mattress", categoryId: "mattress", name: "Memory Foam" },
  { id: "pocket-spring-mattress", categoryId: "mattress", name: "Pocket Spring" },
  { id: "latex-orthopedic", categoryId: "mattress", name: "Orthopedic Latex" },

  // Cushion Items Subcategories
  { id: "sofa-cushions", categoryId: "cushion-items", name: "Sofa Cushions" },
  { id: "throw-pillows", categoryId: "cushion-items", name: "Throw Pillows" },

  // School Bench Subcategories
  { id: "dual-desk-bench", categoryId: "school-bench", name: "Dual Desk Bench" },
  { id: "teacher-desk-chair", categoryId: "school-bench", name: "Teacher Desk & Chair" },

  // Indian Seating Subcategories
  { id: "traditional-diwan", categoryId: "indian-seating", name: "Traditional Royal Diwan" },
  { id: "wooden-baithak", categoryId: "indian-seating", name: "Floor Baithak Setup" },

  // Wooden Furniture Subcategories
  { id: "dining-tables", categoryId: "wooden-furniture", name: "Dining Tables" },
  { id: "wooden-beds", categoryId: "wooden-furniture", name: "Wooden Beds & Wardrobes" },

  // Carpet Subcategories
  { id: "persian-rugs", categoryId: "carpet", name: "Persian & Hand-tufted Rugs" },
  { id: "office-carpets", categoryId: "carpet", name: "Office Carpet Tiles" },

  // Wallpaper Subcategories
  { id: "textured-wallpaper", categoryId: "wallpaper", name: "Textured & 3D Wallpaper" },
  { id: "customized-scenic", categoryId: "wallpaper", name: "Customized Scenic Wallpapers" },

  // Restaurant Furniture Subcategories
  { id: "cafe-dining-sets", categoryId: "restaurant-furniture", name: "Cafe Chairs & Tables" },
  { id: "booth-sofas", categoryId: "restaurant-furniture", name: "Lounge Booth Sofas" },

  // Repair Subcategories
  { id: "sofa-upholstery-repair", categoryId: "furniture-repair-maintenance", name: "Sofa Upholstery & Repair" },
  { id: "wood-polish-restoration", categoryId: "furniture-repair-maintenance", name: "Wooden Polish & Restoration" }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "royal-maharaja-sofa-set",
    name: "Royal Maharaja Carved Sofa Set",
    shortDescription: "Ultra-luxury solid teak wood sofa set featuring exquisite hand-carving and gold accents.",
    description: "Add royal grandeur to your living room with our FNB Signature Maharaja Sofa Set. Built strictly from seasoned high-grade solid teak wood and upholstered in stain-resistant heavy velvet, it offers plush comfort and lifetime durability. Every carving is done by our veteran generational craftsmen at the Chandoli factory.",
    categoryId: "sofa-set",
    subCategoryId: "maharaja-sofa",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Walnut", "Brown", "Cream", "Beige"],
    fabrics: ["Velvet", "Suede", "Cotton"],
    material: "Solid Wood",
    woodType: "Teak Wood",
    finish: "Glossy",
    dimensions: "3-Seater: 84W x 36D x 42H | 1-Seater: 38W x 36D x 42H inches",
    warranty: "5 Years Brand Warranty",
    availability: "Made to Order",
    price: "₹85,000",
    featured: true,
    newest: true,
    createdAt: "2026-06-01T00:00:00Z",
    glbModelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb",
    usdzModelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.usdz"
  },
  {
    id: "modern-l-shape-sectional-sofa",
    name: "Nordic Sectional L-Shape Sofa",
    shortDescription: "Contemporary minimalist sectional sofa with plush high-density foam seating.",
    description: "Designed for modern open-floor plans, this L-Shape sofa offers spacious lounge capabilities. Engineered with premium treated salwood frames and reinforced with elastic webbing and 40-density Sleepwell foam for endless comfort.",
    categoryId: "sofa-set",
    subCategoryId: "l-shape-sofa",
    images: [
      "https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Grey", "Beige", "Black", "Cream"],
    fabrics: ["Suede", "Leatherette", "Fabric"],
    material: "Solid Wood",
    woodType: "Sal Wood",
    finish: "Matte",
    dimensions: "108W x 72D x 34H inches",
    warranty: "3 Years Structural Warranty",
    availability: "In Stock",
    price: "₹62,000",
    featured: true,
    newest: false,
    createdAt: "2026-05-15T00:00:00Z",
    glbModelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.glb",
    usdzModelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/SheenChair/glTF-Binary/SheenChair.usdz"
  },
  {
    id: "luxury-velvet-blackout-curtain",
    name: "Royal Velvet Heavy Blackout Curtain",
    shortDescription: "100% Light-blocking heavy-gauge thermal curtains for bedrooms and theaters.",
    description: "Elevate your privacy and sleep quality. Made with high-density layered velvet and custom thermal lining that blocks outside drafts and isolates acoustics beautifully.",
    categoryId: "curtain",
    subCategoryId: "blackout-curtains",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Beige", "Grey", "Brown", "Cream"],
    fabrics: ["Velvet", "Fabric"],
    material: "Fabric",
    finish: "Natural Finish",
    dimensions: "9ft Height x 4ft Width (Customizable)",
    warranty: "1 Year Color Fastness Warranty",
    availability: "Made to Order",
    price: "₹3,500/panel",
    featured: true,
    newest: true,
    createdAt: "2026-06-10T00:00:00Z"
  },
  {
    id: "premium-sheesham-dining-set",
    name: "Signature 6-Seater Sheesham Dining Table",
    shortDescription: "Solid Sheesham wood dining table with 6 cushioned high-back chairs.",
    description: "A gorgeous addition to your family meals. Features a durable grain structure, smooth hand-rubbed oil finish, and premium beige cushioned seats.",
    categoryId: "wooden-furniture",
    subCategoryId: "dining-tables",
    images: [
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Walnut", "Brown"],
    fabrics: ["Cotton", "Leatherette"],
    material: "Solid Wood",
    woodType: "Sheesham",
    finish: "Natural Finish",
    dimensions: "72W x 36D x 30H inches",
    warranty: "5 Years Warranty Against Termites",
    availability: "In Stock",
    price: "₹48,000",
    featured: true,
    newest: true,
    createdAt: "2026-06-20T00:00:00Z"
  },
  {
    id: "heavy-duty-triveni-cupboard",
    name: "FNB Heavy-Duty MS Double Locker Wardrobe",
    shortDescription: "Ultra-secure, double-locked Mild Steel cupboard with high-security locks.",
    description: "Keep your valuables safe. Built from premium 18-gauge heavy-duty Tata cold-rolled sheet steel and coated with premium multi-stage anti-rust powder coating.",
    categoryId: "iron-ms-cupboard",
    subCategoryId: "home-almirah",
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Grey", "White", "Brown"],
    fabrics: ["None"],
    material: "Metal",
    finish: "Wooden Texture",
    dimensions: "78H x 36W x 20D inches",
    warranty: "10 Years Lock & Corrosion Warranty",
    availability: "In Stock",
    price: "₹18,500",
    featured: false,
    newest: true,
    createdAt: "2026-06-18T00:00:00Z"
  },
  {
    id: "orthopedic-pocket-spring-mattress",
    name: "FNB Ortho-Spine Sleep-Well Mattress",
    shortDescription: "Pocketed coil spring mattress with 2-inch premium memory foam padding.",
    description: "Designed scientifically with orthopedic experts to guarantee neutral spinal alignment. Individually wrapped coils absorb partner motion completely for uninterrupted rest.",
    categoryId: "mattress",
    subCategoryId: "pocket-spring-mattress",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["White", "Grey"],
    fabrics: ["Cotton", "Fabric"],
    material: "Plywood",
    finish: "Natural Finish",
    dimensions: "78L x 72W x 8H inches (King Size)",
    warranty: "10 Years Spine Support Warranty",
    availability: "In Stock",
    price: "₹24,000",
    featured: false,
    newest: false,
    createdAt: "2026-04-10T00:00:00Z"
  },
  {
    id: "premium-dual-school-bench",
    name: "Classic Wooden-Metal Dual School Bench",
    shortDescription: "Heavy-duty powder-coated steel frame paired with smooth rounded edge wooden panels.",
    description: "Highly durable design for schools, colleges, and coaching academies. Built with 1-inch thick reinforced wooden panels and anti-scratch nylon shoe bases.",
    categoryId: "school-bench",
    subCategoryId: "dual-desk-bench",
    images: [
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Brown", "Beige"],
    fabrics: ["None"],
    material: "Metal",
    woodType: "Teak Wood",
    finish: "Matte",
    dimensions: "36W x 30D x 30H inches",
    warranty: "3 Years Heavy Use Warranty",
    availability: "Made to Order",
    price: "₹4,200",
    featured: false,
    newest: false,
    createdAt: "2026-05-20T00:00:00Z"
  },
  {
    id: "traditional-teakwood-diwan",
    name: "Royal Teakwood Maharaja Diwan Set",
    shortDescription: "Elegant low-profile traditional Indian diwan with golden textured upholstery.",
    description: "A perfect masterpiece for the royal Indian sitting room (Baithak). Designed with solid hand-turned teakwood legs, featuring vintage brass detailing.",
    categoryId: "indian-seating",
    subCategoryId: "traditional-diwan",
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=80"
    ],
    colors: ["Brown", "Walnut", "Cream"],
    fabrics: ["Velvet", "Cotton", "Suede"],
    material: "Solid Wood",
    woodType: "Teak Wood",
    finish: "Glossy",
    dimensions: "80L x 36W x 18H inches",
    warranty: "5 Years Termite Protection",
    availability: "Made to Order",
    price: "₹38,000",
    featured: true,
    newest: true,
    createdAt: "2026-06-22T00:00:00Z"
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: "banner-1",
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1400&q=80",
    title: "Handcrafted Luxury Living",
    subtitle: "Custom-made luxury sofa sets and wooden furniture tailored to your dream home.",
    linkType: "explore"
  },
  {
    id: "banner-2",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    title: "Expert Sofa & Furniture Repair",
    subtitle: "Restore your beloved furniture with premium foam, luxury fabrics, and polishing.",
    linkType: "repair"
  },
  {
    id: "banner-3",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80",
    title: "Bulk Corporate & Institutional Orders",
    subtitle: "Custom manufacturing for Hotels, Restaurants, Schools, and Offices across Maharashtra.",
    linkType: "explore"
  },
  {
    id: "banner-4",
    imageUrl: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1400&q=80",
    title: "FNB Furniture N Beyond",
    subtitle: "Direct Factory Pricing with Premium German Quality and Life-long Durability.",
    linkType: "whatsapp"
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Dr. Abhijit Deshmukh",
    role: "Manchar, Pune",
    comment: "Excellent finish and teak quality! We ordered a custom Maharaja Sofa Set and a Dining Table. The wood quality is superb and delivery was on time.",
    rating: 5
  },
  {
    id: "test-2",
    name: "Hotel Sayaji Executive",
    role: "Lounge Manager, Kolhapur",
    comment: "FNB manufactured 25 custom booth sofas and dining chairs for our fine-dine restaurant. High-grade construction and perfect premium look. Very happy!",
    rating: 5
  },
  {
    id: "test-3",
    name: "Sneha Kulkarni",
    role: "Nashik, Maharashtra",
    comment: "The curtain installation was flawless. The blackout fabrics and Roman blinds completely changed our living room vibe. Highly professional work.",
    rating: 4
  }
];

export const SYSTEM_COLORS = ["Brown", "Walnut", "White", "Black", "Grey", "Beige", "Cream"];
export const SYSTEM_FABRICS = ["Velvet", "Leatherette", "Cotton", "Fabric", "Suede"];
export const SYSTEM_MATERIALS = ["Solid Wood", "Sheesham", "Teak Wood", "Mango Wood", "Plywood", "MDF", "Metal"];
export const SYSTEM_FINISHES = ["Matte", "Glossy", "Natural Finish", "Wooden Texture"];

export const INITIAL_ABOUT: AboutContent = {
  tagline: "Our Story & Heritage",
  title: "FNB Furniture N Beyond",
  paragraph1: "Established with a commitment to bring architectural furniture precision and luxury design to Indian homes, FNB has grown from a specialized family workshop near Pune to one of Maharashtra's leading institutional manufacturers.",
  paragraph2: "By controlling the entire process from seasoned wood procurement to final polishing at our Chandoli Bk factory, we eliminate middlemen commissions to provide exceptional pricing with long-term brand warranties.",
  imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
  stat1Value: "20+ Years",
  stat1Label: "Generational Artisans",
  stat2Value: "10,000+",
  stat2Label: "Happy Homes Supplied",
  pillarsTitle: "Core Values & Promises",
  pillars: [
    {
      id: "p-1",
      icon: "🎯",
      title: "Our Mission",
      description: "To deliver direct factory-to-consumer luxury furniture with bespoke structural customization and premium durability across Maharashtra."
    },
    {
      id: "p-2",
      icon: "👁️",
      title: "Our Vision",
      description: "To build a reputable furniture brand recognized for architectural-grade quality, honest material choices, and flawless onsite assembly."
    },
    {
      id: "p-3",
      icon: "🤝",
      title: "Why Choose FNB",
      description: "Direct WhatsApp configuration updates, fully certified materials, lifetime customer support support, and no hidden dealers markups."
    }
  ],
  locationsTitle: "Visit Our Workshops & Showrooms",
  locations: [
    {
      id: "loc-1",
      title: "FNB Factory Workshop",
      subtitle: "Chandoli BK, Ambegaon Taluka",
      address: "AT/PO Chandoli BK, Tal. Ambegaon, Dist. Pune, Maharashtra.",
      note: "Our direct manufacturing hub, heavy carpentry lines, welding bays, and quality-checking stations are situated here."
    },
    {
      id: "loc-2",
      title: "Corporate Office & Showcase",
      subtitle: "Near Bank of Maharashtra, Manchar",
      address: "Pune-Nasik Highway, Manchar, Dist. Pune, Maharashtra.",
      note: "Consult our dedicated master designers, view material catalog samples, fabric booklets, and color swatches."
    }
  ]
};

export const INITIAL_FEEDBACKS: UserFeedback[] = [
  {
    id: "fb-1",
    name: "Rajesh & Sunita Kulkarni",
    city: "Manchar, Pune",
    productPurchased: "Solid Teak L-Shape Sofa & Center Table",
    comment: "Direct factory pricing saved us over ₹35,000 compared to showroom dealers! The teak wood quality and cushioning are superb.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    pushedToHome: true,
    status: "Approved",
    createdAt: "2026-07-20"
  },
  {
    id: "fb-2",
    name: "Dr. Vikram Joshi",
    city: "Kothrud, Pune",
    productPurchased: "Ergonomic High-Back Executive Chair",
    comment: "Prompt delivery and excellent lumbar support. Onsite assembly was fast and flawless. Highly recommended!",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1294?auto=format&fit=crop&w=600&q=80",
    pushedToHome: true,
    status: "Approved",
    createdAt: "2026-07-22"
  },
  {
    id: "fb-3",
    name: "Aniket Deshmukh",
    city: "Chakan, MH",
    productPurchased: "School Dual Desks (Bulk Order)",
    comment: "We ordered 80 dual desks for our academy. Heavy-duty MS framing and powder coating. Very sturdy!",
    rating: 5,
    imageUrl: "",
    pushedToHome: true,
    status: "Approved",
    createdAt: "2026-07-25"
  }
];

export const INITIAL_REPAIR_IMAGES: RepairReferenceImage[] = [
  {
    id: "rep-img-1",
    imageUrl: "/repair-sample-cupboard.svg",
    title: "Almirah / Cupboard Rust Cleaning & Powder Coat Finish (Before & After)",
    createdAt: "2026-07-27"
  },
  {
    id: "rep-img-2",
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    title: "Sofa Cushion & Foam Replacement",
    createdAt: "2026-07-26"
  },
  {
    id: "rep-img-3",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    title: "Sofa Upholstery Fabric Change",
    createdAt: "2026-07-25"
  },
  {
    id: "rep-img-4",
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
    title: "Wooden Chair Structure Joint Repair & Polishing",
    createdAt: "2026-07-24"
  }
];

