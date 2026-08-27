/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

import {
  Category,
  SubCategory,
  Product,
  Banner,
  Testimonial,
  AboutContent,
  UserFeedback,
  RepairRequest,
  BulkOrderRequest,
  RepairReferenceImage,
} from "../types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if available
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection Names
export const COLLECTIONS = {
  CATEGORIES: "categories",
  SUBCATEGORIES: "subcategories",
  PRODUCTS: "products",
  BANNERS: "banners",
  TESTIMONIALS: "testimonials",
  ABOUT: "about",
  FEEDBACKS: "feedbacks",
  REPAIR_REQUESTS: "repair_requests",
  BULK_ORDERS: "bulk_orders",
  REPAIR_IMAGES: "repair_images",
  SITE_SETTINGS: "site_settings",
} as const;

export interface SiteSettings {
  id?: string;
  storeName?: string;
  whatsappNumber?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  storageProvider?: string;
  updatedAt?: string;
  [key: string]: any;
}

// Generic helper to subscribe in real-time to a Firestore collection
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnapshot) => {
          items.push({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        });
        onData(items);
      },
      (err) => {
        console.error(`Error listening to collection ${collectionName}:`, err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error(`Failed to initialize snapshot on ${collectionName}:`, err);
    if (onError) onError(err);
    return () => {};
  }
}

// Helper to subscribe to a single document (like About or Settings)
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  onData: (data: T | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onData(docSnap.data() as T);
        } else {
          onData(null);
        }
      },
      (err) => {
        console.error(`Error listening to doc ${collectionName}/${docId}:`, err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error(`Failed to initialize doc snapshot on ${collectionName}/${docId}:`, err);
    if (onError) onError(err);
    return () => {};
  }
}

// Helper to save/update a single document
export async function saveFirestoreDoc<T extends { id?: string }>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  // Remove undefined fields to prevent Firestore serialization errors
  const sanitized = JSON.parse(JSON.stringify(data));
  await setDoc(docRef, sanitized, { merge: true });
}

// Helper to delete a document
export async function deleteFirestoreDoc(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Batch save an entire list of items (e.g. initial seed or bulk update)
export async function batchSaveCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (!items || items.length === 0) return;
  const batch = writeBatch(db);
  for (const item of items) {
    const docRef = doc(db, collectionName, item.id);
    const sanitized = JSON.parse(JSON.stringify(item));
    batch.set(docRef, sanitized, { merge: true });
  }
  await batch.commit();
}

// Initialize seed data into Firebase if collections are completely empty
export async function seedInitialDataIfEmpty(seeds: {
  categories: Category[];
  subCategories: SubCategory[];
  products: Product[];
  banners: Banner[];
  testimonials: Testimonial[];
  about: AboutContent;
  feedbacks: UserFeedback[];
  repairImages: RepairReferenceImage[];
}): Promise<void> {
  try {
    // Check if products exist
    const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (productsSnap.empty) {
      console.log("Firebase Firestore is empty. Seeding initial catalog and settings...");
      
      await batchSaveCollection(COLLECTIONS.CATEGORIES, seeds.categories);
      await batchSaveCollection(COLLECTIONS.SUBCATEGORIES, seeds.subCategories);
      await batchSaveCollection(COLLECTIONS.PRODUCTS, seeds.products);
      await batchSaveCollection(COLLECTIONS.BANNERS, seeds.banners);
      await batchSaveCollection(COLLECTIONS.TESTIMONIALS, seeds.testimonials);
      await batchSaveCollection(COLLECTIONS.FEEDBACKS, seeds.feedbacks);
      await batchSaveCollection(COLLECTIONS.REPAIR_IMAGES, seeds.repairImages);
      await saveFirestoreDoc(COLLECTIONS.ABOUT, "main", seeds.about);
      
      console.log("Firebase Firestore initial data seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding initial data to Firestore:", err);
  }
}

// Test live server connection to Firestore
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, COLLECTIONS.SITE_SETTINGS, "main"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("client is offline")) {
      console.warn("Firestore client currently offline, using cached/local store.");
      return false;
    }
    // Any successful network response (even doc not existing) indicates connection works
    return true;
  }
}

