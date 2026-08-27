/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = "fnb-spatial-cache";
const STORE_NAME = "models";
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database.
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject("Not in browser environment");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a GLB file blob or data URI into IndexedDB cache.
 */
export async function cacheModel(productId: string, data: Blob | string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, productId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB cache save failed:", err);
  }
}

/**
 * Retrieves a GLB file blob or data URI from IndexedDB cache.
 */
export async function getCachedModel(productId: string): Promise<Blob | string | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(productId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB cache fetch failed:", err);
    return null;
  }
}

/**
 * Clears cached models from IndexedDB.
 */
export async function clearModelCache(): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB cache clear failed:", err);
  }
}
