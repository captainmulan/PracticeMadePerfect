type CacheEntry =
  | { status: "loading"; promise: Promise<ArrayBuffer> }
  | { status: "ready"; buffer: ArrayBuffer; fetchedAt: number };

const bufferCache = new Map<string, CacheEntry>();

const MAX_CACHE_SIZE = 8;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const IDB_NAME = "magic-library-epub-cache";
const IDB_VERSION = 1;
const IDB_STORE = "epub-buffers";

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

// --- IndexedDB helpers for persistent EPUB cache ---
let idbPromise: Promise<IDBDatabase> | null = null;
function openEpubIdb(): Promise<IDBDatabase> {
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
    const db = await openEpubIdb();
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(url);
    return await new Promise<{ url: string; buffer: ArrayBuffer; fetchedAt: number } | null>((resolve, reject) => {
      req.onsuccess = () => {
        const result = req.result ?? null;
        if (result && Date.now() - result.fetchedAt > CACHE_TTL_MS) {
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
    const db = await openEpubIdb();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    store.put({ url, buffer: buffer.slice(0), fetchedAt });
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
    /* ignore idb put errors */
  }
}

/**
 * Normalize an EPUB step source like `/folder/book.epub#chapter1.xhtml`
 * down to the canonical file URL (stripped of location fragments).
 */
export function normalizeEpubFileUrl(source: string): string {
  if (!source) return "";
  return source.replace(/#.+$/, "");
}

/**
 * Extract the location fragment from an EPUB step source like
 * `/folder/book.epub#chapter1.xhtml`.
 * Returns the location string (e.g. "chapter1.xhtml") or null if none.
 */
export function extractEpubLocation(source: string): string | null {
  if (!source) return null;
  const locationMatch = source.match(/#(.+)$/);
  return locationMatch ? locationMatch[1] : null;
}

/**
 * Fetch an EPUB file once per URL.
 * 1. Try in-memory cache first (instant).
 * 2. Try IndexedDB persistent cache next (survives page reloads).
 * 3. Fetch from network only if missing.
 */
export async function getEpubBuffer(fileUrl: string): Promise<ArrayBuffer> {
  const key = normalizeEpubFileUrl(fileUrl);

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

  const idbHit = await idbGet(key);
  if (idbHit) {
    bufferCache.set(key, { status: "ready", buffer: idbHit.buffer.slice(0), fetchedAt: idbHit.fetchedAt });
    pruneCache();
    return idbHit.buffer.slice(0);
  }

  const promise = (async () => {
    const response = await fetch(key, { credentials: "same-origin" });
    if (!response.ok) {
      bufferCache.delete(key);
      throw new Error(`EPUB fetch failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const fetchedAt = Date.now();
    bufferCache.set(key, { status: "ready", buffer: buffer.slice(0), fetchedAt });
    pruneCache();
    void idbPut(key, buffer, fetchedAt);
    return buffer.slice(0);
  })();

  bufferCache.set(key, { status: "loading", promise });
  const result = await promise;
  return result.slice(0);
}

/**
 * Return cached buffer without triggering a fetch, or `null` if not cached.
 */
export function getCachedEpubBuffer(fileUrl: string): ArrayBuffer | null {
  const key = normalizeEpubFileUrl(fileUrl);
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

/** Clear a single EPUB cache entry. */
export function evictEpubBuffer(fileUrl: string) {
  const key = normalizeEpubFileUrl(fileUrl);
  bufferCache.delete(key);
  openEpubIdb()
    .then((db) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
    })
    .catch(() => {
      /* ignore */
    });
}

/** Wipe the whole cache (memory + IndexedDB). */
export function clearEpubCache() {
  bufferCache.clear();
  openEpubIdb()
    .then((db) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).clear();
    })
    .catch(() => {
      /* ignore */
    });
}
