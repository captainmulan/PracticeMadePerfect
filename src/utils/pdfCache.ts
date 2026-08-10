type CacheEntry =
  | { status: "loading"; promise: Promise<ArrayBuffer> }
  | { status: "ready"; buffer: ArrayBuffer; fetchedAt: number };

const bufferCache = new Map<string, CacheEntry>();

const MAX_CACHE_SIZE = 8;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (now with IndexedDB persistence, keep longer)
const IDB_NAME = "magic-library-pdf-cache";
const IDB_VERSION = 1;
const IDB_STORE = "pdf-buffers";

function pruneCache() {
  const now = Date.now();
  const entries = Array.from(bufferCache.entries()).filter(
    ([, entry]) => entry.status === "ready",
  ) as Array<[string, Extract<CacheEntry, { status: "ready" }>]>;

  entries.sort((a, b) => a[1].fetchedAt - b[1].fetchedAt);

  const expiredCount = entries.filter(([, e]) => now - e.fetchedAt > CACHE_TTL_MS).length;
  if (expiredCount > 0) {
    for (const [key, entry] of entries) {
      if (now - entry.fetchedAt > CACHE_TTL_MS) {
        bufferCache.delete(key);
      }
    }
  }

  if (bufferCache.size > MAX_CACHE_SIZE) {
    const remaining = Array.from(bufferCache.entries())
      .filter(([, entry]) => entry.status === "ready")
      .sort(
        (a, b) =>
          (a[1] as Extract<CacheEntry, { status: "ready" }>).fetchedAt -
          (b[1] as Extract<CacheEntry, { status: "ready" }>).fetchedAt,
      );
    while (bufferCache.size > MAX_CACHE_SIZE && remaining.length > 0) {
      const [oldestKey] = remaining.shift()!;
      bufferCache.delete(oldestKey);
    }
  }
}

// --- IndexedDB helpers for persistent PDF cache ---
let idbPromise: Promise<IDBDatabase> | null = null;
function openPdfIdb(): Promise<IDBDatabase> {
  if (idbPromise) return idbPromise;
  idbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        const store = db.createObjectStore(IDB_STORE, { keyPath: "url" });
        store.createIndex("fetchedAt", "fetchedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbPromise;
}

async function idbGet(url: string): Promise<{ url: string; buffer: ArrayBuffer; fetchedAt: number } | null> {
  try {
    const db = await openPdfIdb();
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(url);
    return await new Promise<{ url: string; buffer: ArrayBuffer; fetchedAt: number } | null>((resolve, reject) => {
      req.onsuccess = () => {
        const result = req.result ?? null;
        if (result && Date.now() - result.fetchedAt > CACHE_TTL_MS) {
          // Expired — remove from IDB lazily
          const delTx = db.transaction(IDB_STORE, "readwrite");
          delTx.objectStore(IDB_STORE).delete(url);
          resolve(null);
        } else {
          resolve(result);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbPut(url: string, buffer: ArrayBuffer, fetchedAt: number): Promise<void> {
  try {
    const db = await openPdfIdb();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    store.put({ url, buffer: buffer.slice(0), fetchedAt });
    // Lazy prune old IndexedDB entries
    try {
      const idx = store.index("fetchedAt");
      const allReq = idx.openCursor();
      const cutoff = Date.now() - CACHE_TTL_MS;
      allReq.onsuccess = () => {
        const cursor = allReq.result;
        if (!cursor) return;
        if (cursor.value.fetchedAt < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      };
    } catch {
      /* ignore prune errors */
    }
  } catch {
    /* ignore idb put errors — memory cache is enough */
  }
}

/**
 * Normalize a PDF step source like `/folder/book.pdf#page=3` or `/folder/book.pdf`
 * down to the canonical file URL (stripped of `#page=` / `?page=` fragments).
 */
export function normalizePdfFileUrl(source: string): string {
  if (!source) return "";
  return source.replace(/#page=\d+/i, "").replace(/\?page=\d+/i, "");
}

/**
 * Extract the page number from a source URL like `/book.pdf#page=5` or `/book.pdf?page=5`.
 * Returns `1` if no page fragment is found.
 */
export function extractPdfPageNumber(source: string): number {
  if (!source) return 1;
  const pageMatch = source.match(/#page=(\d+)/i) ?? source.match(/\?page=(\d+)/i);
  const parsed = Number.parseInt(pageMatch?.[1] ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

/**
 * Fetch a PDF file once per URL.
 * 1. Try in-memory cache first (instant).
 * 2. Try IndexedDB persistent cache next (survives page reloads).
 * 3. Fetch from network only if missing.
 *
 * This eliminates the delay when navigating from one PDF page to the next,
 * because PDF.js no longer re-downloads the file per iframe/page navigation.
 */
export async function getPdfBuffer(fileUrl: string): Promise<ArrayBuffer> {
  const key = normalizePdfFileUrl(fileUrl);

  // 1. Check memory cache first
  const existing = bufferCache.get(key);
  if (existing) {
    if (existing.status === "ready") {
      if (Date.now() - existing.fetchedAt > CACHE_TTL_MS) {
        bufferCache.delete(key);
      } else {
        return existing.buffer.slice(0);
      }
    } else {
      const buffer = await existing.promise;
      return buffer.slice(0);
    }
  }

  // 2. Check persistent IndexedDB cache (survives page reloads)
  const idbHit = await idbGet(key);
  if (idbHit) {
    bufferCache.set(key, { status: "ready", buffer: idbHit.buffer.slice(0), fetchedAt: idbHit.fetchedAt });
    pruneCache();
    return idbHit.buffer.slice(0);
  }

  // 3. Network fetch
  const promise = (async () => {
    const response = await fetch(key, { credentials: "same-origin" });
    if (!response.ok) {
      bufferCache.delete(key);
      throw new Error(`PDF fetch failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const fetchedAt = Date.now();
    bufferCache.set(key, { status: "ready", buffer: buffer.slice(0), fetchedAt });
    pruneCache();
    // Persist to IndexedDB in the background (don't await, so first load is not blocked)
    void idbPut(key, buffer, fetchedAt);
    return buffer.slice(0);
  })();

  bufferCache.set(key, { status: "loading", promise });
  const result = await promise;
  return result.slice(0);
}

/**
 * Return cached buffer without triggering a fetch, or `null` if not cached.
 * Checks both in-memory cache first, then IndexedDB.
 */
export function getCachedPdfBuffer(fileUrl: string): ArrayBuffer | null {
  const key = normalizePdfFileUrl(fileUrl);
  const entry = bufferCache.get(key);
  if (entry && entry.status === "ready") {
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      bufferCache.delete(key);
      return null;
    }
    return entry.buffer.slice(0);
  }
  return null;
}

/** Clear a single PDF cache entry (useful for tests / explicit invalidation). */
export function evictPdfBuffer(fileUrl: string) {
  const key = normalizePdfFileUrl(fileUrl);
  bufferCache.delete(key);
  // Also remove from IndexedDB (fire-and-forget)
  openPdfIdb()
    .then((db) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
    })
    .catch(() => {
      /* ignore */
    });
}

/** Wipe the whole cache (memory + IndexedDB). */
export function clearPdfCache() {
  bufferCache.clear();
  openPdfIdb()
    .then((db) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).clear();
    })
    .catch(() => {
      /* ignore */
    });
}
