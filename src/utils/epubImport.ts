import type { BookImportPreview, ParsedHtmlPage } from "./bookImport";

const DEFAULT_BOOK_HTML_DIRECTORY_PATH = "C:\\Users\\65966\\PracticeMadePerfect\\book_html";
let cachedEpubAssetDirectory: FileSystemDirectoryHandle | null = null;

type EpubJsLib = {
  (source: ArrayBuffer | string, options?: Record<string, unknown>): EpubBook;
  Book?: new (source: ArrayBuffer | string, options?: Record<string, unknown>) => EpubBook;
};

type EpubSpineItem = {
  href?: string;
  idref?: string;
  index?: number;
  linear?: string | boolean;
  label?: string;
  title?: string;
};

type EpubBook = {
  ready?: Promise<unknown>;
  spine?: {
    items?: EpubSpineItem[];
    length?: number;
    each?: (fn: (item: EpubSpineItem, index: number) => void) => void;
    get?: (index: number) => EpubSpineItem | undefined;
  };
  loaded?: {
    navigation?: Promise<{ toc?: EpubTocEntry[] }>;
  };
  destroy?: () => void;
};

type EpubTocEntry = {
  label?: string;
  href?: string;
  subitems?: EpubTocEntry[];
};

declare global {
  interface Window {
    ePub?: EpubJsLib;
    JSZip?: new () => {
      loadAsync: (data: ArrayBuffer) => Promise<{
        file: (name: string) => { async: (type: "string" | "uint8array") => Promise<string | Uint8Array> } | null;
        files: Record<string, { dir: boolean }>;
      }>;
    };
    showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}

async function loadEpubJsLib(): Promise<EpubJsLib | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = window.ePub;
  if (typeof existing === "function") {
    return existing;
  }

  const existingScript = document.querySelector<HTMLScriptElement>("script[data-epubjs-loader='true']");
  if (existingScript) {
    await new Promise<void>((resolve) => {
      if (typeof window.ePub === "function") {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => resolve(), { once: true });
    });
    return typeof window.ePub === "function" ? window.ePub : null;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.3.93/epub.min.js";
      script.async = true;
      script.setAttribute("data-epubjs-loader", "true");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load EPUB.js from CDN."));
      document.head.appendChild(script);
    });
  } catch {
    return null;
  }

  return typeof window.ePub === "function" ? window.ePub : null;
}

async function loadJsZip(): Promise<NonNullable<Window["JSZip"]> | null> {
  if (typeof window === "undefined") return null;
  if (window.JSZip) return window.JSZip;

  const existingScript = document.querySelector<HTMLScriptElement>("script[data-jszip-loader='true']");
  if (existingScript) {
    await new Promise<void>((resolve) => {
      if (window.JSZip) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => resolve(), { once: true });
    });
    return window.JSZip ?? null;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.async = true;
      script.setAttribute("data-jszip-loader", "true");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load JSZip from CDN."));
      document.head.appendChild(script);
    });
  } catch {
    return null;
  }
  return window.JSZip ?? null;
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sanitizeBookFolderName(value: string) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .split(/[\/]+/)
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "imported-epub-book";
}

function sanitizeAssetFileName(value: string) {
  const normalized = value.trim().replace(/\\/g, "/").split(/[\/]+/).filter(Boolean).join("-");
  return normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "document";
}

function flattenToc(entries: EpubTocEntry[] | undefined, out: Array<{ label: string; href: string }> = []) {
  if (!entries?.length) return out;
  for (const entry of entries) {
    /* Keep #fragment — many EPUBs put several chapters in one XHTML file. */
    const href = (entry.href ?? "").trim().replace(/^\.\//, "");
    const label = (entry.label ?? "").replace(/\s+/g, " ").trim();
    if (href && label) out.push({ label, href });
    if (entry.subitems?.length) flattenToc(entry.subitems, out);
  }
  return out;
}

function dedupeTocEntries(entries: Array<{ label: string; href: string }>) {
  const seen = new Set<string>();
  const out: Array<{ label: string; href: string }> = [];
  for (const entry of entries) {
    const key = entry.href.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function titleForHref(href: string | undefined, toc: Array<{ label: string; href: string }>, fallback: string) {
  if (!href) return fallback;
  const full = href.replace(/^\.\//, "");
  const clean = full.split("#")[0];
  const base = clean.split("/").pop() ?? clean;
  const hit =
    toc.find((t) => t.href === full || t.href.endsWith(full)) ??
    toc.find((t) => t.href === clean || t.href.endsWith(clean) || t.href.endsWith(base)) ??
    toc.find((t) => (t.href.split("#")[0].split("/").pop() ?? "") === base);
  return hit?.label || fallback;
}

function collectSpineFromBook(book: EpubBook): EpubSpineItem[] {
  const items: EpubSpineItem[] = [];
  if (typeof book.spine?.each === "function") {
    book.spine.each((item) => {
      if (item) items.push(item);
    });
  }
  if (!items.length && Array.isArray(book.spine?.items) && book.spine.items.length) {
    items.push(...book.spine.items);
  }
  if (!items.length && typeof book.spine?.length === "number" && typeof book.spine.get === "function") {
    for (let i = 0; i < book.spine.length; i += 1) {
      const item = book.spine.get(i);
      if (item) items.push(item);
    }
  }
  return items.filter((item) => {
    if (item.linear === false || item.linear === "no") return false;
    return Boolean(item.href);
  });
}

/** Fallback when EPUB.js spine is empty: read spine order from the OPF inside the ZIP. */
async function collectSpineFromZip(arrayBuffer: ArrayBuffer): Promise<EpubSpineItem[]> {
  const JSZip = await loadJsZip();
  if (!JSZip) return [];

  try {
    const zip = await new JSZip().loadAsync(arrayBuffer);
    const names = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
    const container = zip.file("META-INF/container.xml");
    let opfPath = names.find((n) => n.toLowerCase().endsWith(".opf")) ?? "";
    if (container) {
      const xml = String(await container.async("string"));
      const match = xml.match(/full-path=["']([^"']+\.opf)["']/i);
      if (match?.[1]) opfPath = match[1];
    }
    if (!opfPath) return [];

    const opfFile = zip.file(opfPath);
    if (!opfFile) return [];
    const opf = String(await opfFile.async("string"));

    const idToHref = new Map<string, string>();
    const itemRe = /<item\b[^>]*>/gi;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRe.exec(opf))) {
      const tag = itemMatch[0];
      const id = tag.match(/\bid=["']([^"']+)["']/i)?.[1];
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
      if (id && href) idToHref.set(id, href);
    }

    const refs: EpubSpineItem[] = [];
    const refRe = /<itemref\b[^>]*>/gi;
    let refMatch: RegExpExecArray | null;
    while ((refMatch = refRe.exec(opf))) {
      const tag = refMatch[0];
      const idref = tag.match(/\bidref=["']([^"']+)["']/i)?.[1];
      const linear = tag.match(/\blinear=["']([^"']+)["']/i)?.[1];
      if (!idref || linear === "no") continue;
      const href = idToHref.get(idref);
      if (!href) continue;
      /* Keep OPF-relative hrefs — epub.js display() expects package-relative paths. */
      refs.push({ idref, href: href.replace(/\\/g, "/"), index: refs.length });
    }
    return refs;
  } catch {
    return [];
  }
}

/** Read nav/toc links from the EPUB zip when EPUB.js navigation is thin. */
async function collectTocFromZip(arrayBuffer: ArrayBuffer): Promise<Array<{ label: string; href: string }>> {
  const JSZip = await loadJsZip();
  if (!JSZip) return [];

  try {
    const zip = await new JSZip().loadAsync(arrayBuffer);
    const names = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
    const candidates = names.filter((n) => {
      const lower = n.toLowerCase();
      return lower.endsWith("toc.xhtml") || lower.endsWith("nav.xhtml") || lower.endsWith("toc.ncx");
    });
    const out: Array<{ label: string; href: string }> = [];

    for (const path of candidates) {
      const file = zip.file(path);
      if (!file) continue;
      const text = String(await file.async("string"));
      const baseDir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";

      if (path.toLowerCase().endsWith(".ncx")) {
        const navPoints = text.match(/<navPoint\b[\s\S]*?<\/navPoint>/gi) ?? [];
        for (const block of navPoints) {
          const label = block.match(/<navLabel>\s*<text>([\s\S]*?)<\/text>/i)?.[1];
          const src = block.match(/<content\b[^>]*src=["']([^"']+)["']/i)?.[1];
          if (!label || !src) continue;
          const cleanLabel = label.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          const href = src.replace(/^\.\//, "");
          if (cleanLabel && href) out.push({ label: cleanLabel, href });
        }
      } else {
        const linkRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;
        while ((match = linkRe.exec(text))) {
          const hrefRaw = match[1].trim();
          if (!hrefRaw || hrefRaw.startsWith("#") && !hrefRaw.includes(".xhtml") && !hrefRaw.includes(".html")) {
            /* in-page only — keep if we can resolve later; skip bare # */
            if (hrefRaw.startsWith("#")) continue;
          }
          const label = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
          if (!label || !hrefRaw) continue;
          let href = hrefRaw.replace(/^\.\//, "");
          if (!href.includes("/") && baseDir && !href.startsWith("#")) {
            /* relative to nav file folder — strip OEBPS/ if already in href from epub.js style */
          }
          out.push({ label, href });
        }
      }
    }

    return dedupeTocEntries(out);
  } catch {
    return [];
  }
}

export interface EpubImportPreviewOptions {
  preferredFolder?: string;
  bookIdOverride?: string;
  courseIndex?: number;
  existingBookIds?: string[];
}

export interface EpubImportPreview extends BookImportPreview {
  pageCount: number;
  epubFileName: string;
}

export interface EpubAssetExportProgress {
  completed: number;
  total: number;
  currentFileName?: string;
}

export async function buildEpubImportPreview(
  file: File,
  _courseIndex: number,
  existingBookIds: string[],
  options?: EpubImportPreviewOptions,
): Promise<EpubImportPreview | null> {
  const folderName = sanitizeBookFolderName(options?.preferredFolder ?? file.name.replace(/\.epub$/i, "")) || `epub-import-${Date.now()}`;
  const bookId = slugify(options?.bookIdOverride?.trim() || folderName) || `book-${Date.now()}`;
  const epubFileName = `${sanitizeAssetFileName(file.name.replace(/\.epub$/i, "")) || "document"}.epub`;
  const baseEpubSource = `/book_html/${folderName}/${epubFileName}`;

  const arrayBuffer = await file.arrayBuffer();
  let spineItems: EpubSpineItem[] = [];
  let tocFlat: Array<{ label: string; href: string }> = [];

  try {
    const ePub = await loadEpubJsLib();
    if (ePub) {
      /*
        Use ePub(buffer) — same as epub-viewer.html. Calling ePub.Book(buffer)
        without `new` leaves spine empty and the import falls back to 1 page.
      */
      const book = ePub(arrayBuffer.slice(0), { storage: false });
      if (typeof book.ready?.then === "function") {
        await book.ready;
      }
      spineItems = collectSpineFromBook(book);
      try {
        const navigation = await book.loaded?.navigation;
        tocFlat = dedupeTocEntries(flattenToc(navigation?.toc));
      } catch {
        tocFlat = [];
      }
      try {
        book.destroy?.();
      } catch {
        /* ignore */
      }
    }
  } catch {
    spineItems = [];
  }

  if (!spineItems.length) {
    spineItems = await collectSpineFromZip(arrayBuffer.slice(0));
  }
  if (tocFlat.length < 2) {
    const zipToc = await collectTocFromZip(arrayBuffer.slice(0));
    if (zipToc.length > tocFlat.length) tocFlat = zipToc;
  }

  /*
    Prefer TOC entries (often file.xhtml#chapter-id) so each library page is one
    chapter. Spine alone can be a handful of huge HTML files with many chapters.
  */
  const useToc = tocFlat.some((t) => t.href.includes("#")) && tocFlat.length >= 2;
  const chapterEntries: Array<{ label: string; href: string }> = useToc
    ? tocFlat
    : spineItems.map((item, index) => ({
        label: item.label || item.title || `Chapter ${index + 1}`,
        href: (item.href ?? "").replace(/^\.\//, ""),
      }));

  const pageCount = Math.max(1, chapterEntries.length || spineItems.length);

  const pages: ParsedHtmlPage[] = [];
  for (let i = 0; i < pageCount; i++) {
    const pageNumber = i + 1;
    const entry = chapterEntries[i];
    const href = (entry?.href ?? "").replace(/^\.\//, "");
    const title = entry?.label || titleForHref(href, tocFlat, `Chapter ${pageNumber}`);
    const chapterLocation = href ? `#${href}` : "";
    const pageSource = `${baseEpubSource}${chapterLocation}`;

    pages.push({
      fileName: `chapter-${String(pageNumber).padStart(2, "0")}.html`,
      relativePath: `chapter-${String(pageNumber).padStart(2, "0")}.html`,
      pageNumber,
      sortOrder: pageNumber,
      title,
      content: pageSource,
      stepType: "epub",
      assets: [],
    });
  }

  return {
    folderPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH,
    folderName,
    bookId,
    bookTitle: folderName,
    pages,
    existingBookId: existingBookIds.includes(bookId) ? bookId : undefined,
    pageCount,
    epubFileName,
  };
}

export async function writeEpubAssetToDirectory(
  rootDirectory: FileSystemDirectoryHandle | null,
  folderName: string,
  fileName: string,
  file: File,
  onProgress?: (progress: EpubAssetExportProgress) => void,
): Promise<{ written: number; total: number; errors: string[] }> {
  const total = 1;
  const errors: string[] = [];

  if (!rootDirectory) {
    onProgress?.({ completed: 0, total, currentFileName: fileName });
    return { written: 0, total, errors: ["Folder access was not granted for the fixed project destination."] };
  }

  try {
    const bookDirectory = await rootDirectory.getDirectoryHandle(folderName, { create: true });
    const fileHandle = await bookDirectory.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
    onProgress?.({ completed: 1, total, currentFileName: fileName });
    return { written: 1, total, errors: [] };
  } catch (error) {
    onProgress?.({ completed: 0, total, currentFileName: fileName });
    return { written: 0, total, errors: [String(error)] };
  }
}

export async function resolveEpubAssetDirectory(): Promise<{ directoryHandle: FileSystemDirectoryHandle | null; resolvedPath: string } | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedEpubAssetDirectory) {
    return { directoryHandle: cachedEpubAssetDirectory, resolvedPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH };
  }

  if (typeof window.showDirectoryPicker !== "function") {
    return null;
  }

  try {
    const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    cachedEpubAssetDirectory = directoryHandle;
    return { directoryHandle, resolvedPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH };
  } catch {
    return { directoryHandle: cachedEpubAssetDirectory, resolvedPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH };
  }
}
