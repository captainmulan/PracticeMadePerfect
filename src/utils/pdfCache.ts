type CacheEntry =
  | { status: "loading"; promise: Promise<ArrayBuffer> }
  | { status: "ready"; buffer: ArrayBuffer; fetchedAt: number };

const bufferCache = new Map<string, CacheEntry>();

const MAX_CACHE_SIZE = 8;
const CACHE_TTL_MS = 10 * 60 * 1000;

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
 * Fetch a PDF file once per URL, cache the raw ArrayBuffer in memory
 * for the lifetime of the tab (up to MAX_CACHE_SIZE entries / CACHE_TTL_MS).
 * This eliminates the delay when navigating from one PDF page to the next,
 * because PDF.js no longer re-downloads the file per iframe/page navigation.
 */
export async function getPdfBuffer(fileUrl: string): Promise<ArrayBuffer> {
  const key = normalizePdfFileUrl(fileUrl);
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

  const promise = (async () => {
    const response = await fetch(key, { credentials: "same-origin" });
    if (!response.ok) {
      bufferCache.delete(key);
      throw new Error(`PDF fetch failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    bufferCache.set(key, { status: "ready", buffer, fetchedAt: Date.now() });
    pruneCache();
    return buffer;
  })();

  bufferCache.set(key, { status: "loading", promise });
  const result = await promise;
  return result.slice(0);
}

/**
 * Return cached buffer without triggering a fetch, or `null` if not cached.
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
  bufferCache.delete(normalizePdfFileUrl(fileUrl));
}

/** Wipe the whole cache. */
export function clearPdfCache() {
  bufferCache.clear();
}
