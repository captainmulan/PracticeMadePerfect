import type { BookImportChapterPlan, BookImportPagePlan, BookImportPreview, ParsedHtmlPage } from "./bookImport";
import { createDefaultBookFields } from "./bookImport";
import type { Course } from "../data/courses";
import { getBookAssetUrl } from "../config/externalHosting";

const DEFAULT_BOOK_HTML_DIRECTORY_PATH = "book_html";
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

type EpubZipFile = {
  async: (type: "string" | "uint8array") => Promise<string | Uint8Array>;
};

type EpubZip = {
  file(name: string): EpubZipFile | null;
  file(name: string, data: string | Uint8Array): void;
  files: Record<string, { dir: boolean }>;
  generateAsync(options: { type: "uint8array" }): Promise<Uint8Array>;
};

type EpubZipConstructor = new () => {
  loadAsync: (data: ArrayBuffer) => Promise<EpubZip>;
};

declare global {
  interface Window {
    ePub?: EpubJsLib;
    JSZip?: EpubZipConstructor;
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

async function loadJsZip(): Promise<EpubZipConstructor | null> {
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

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[<>:"|?*\/\\]/g, "-") // remove OS-illegal characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeBookFolderName(value: string) {
  return slugify(value) || "imported-epub-book";
}

function sanitizeAssetFileName(value: string) {
  return slugify(value) || "document";
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
async function collectSpineFromZip(zip: EpubZip): Promise<EpubSpineItem[]> {
  const info = await readOpfInfo(zip);
  if (!info) return [];
  /* Keep OPF-relative hrefs — epub.js display() expects package-relative paths. */
  return info.spineHrefs.map((href, index) => ({ href, index }));
}

/** Read nav/toc links from the EPUB zip when EPUB.js navigation is thin. */
async function collectTocFromZip(zip: EpubZip): Promise<Array<{ label: string; href: string }>> {
  try {
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
          const href = hrefRaw.replace(/^\.\//, "");
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

async function loadEpubZip(arrayBuffer: ArrayBuffer): Promise<EpubZip | null> {
  const JSZip = await loadJsZip();
  if (!JSZip) return null;
  try {
    return await new JSZip().loadAsync(arrayBuffer);
  } catch {
    return null;
  }
}

interface EpubManifestItem {
  href: string;
  mediaType: string;
  properties: string;
}

interface EpubOpfInfo {
  opfPath: string;
  opfDir: string;
  manifest: Map<string, EpubManifestItem>;
  spineHrefs: string[];
  metaCoverId: string;
}

async function readOpfInfo(zip: EpubZip): Promise<EpubOpfInfo | null> {
  try {
    const names = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
    let opfPath = names.find((n) => n.toLowerCase().endsWith(".opf")) ?? "";
    const container = zip.file("META-INF/container.xml");
    if (container) {
      const xml = String(await container.async("string"));
      const match = xml.match(/full-path=["']([^"']+\.opf)["']/i);
      if (match?.[1]) opfPath = match[1];
    }
    if (!opfPath) return null;

    const opfFile = zip.file(opfPath);
    if (!opfFile) return null;
    const opf = String(await opfFile.async("string"));

    const manifest = new Map<string, EpubManifestItem>();
    const itemRe = /<item\b[^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = itemRe.exec(opf))) {
      const tag = match[0];
      const id = tag.match(/\bid=["']([^"']+)["']/i)?.[1];
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
      if (!id || !href) continue;
      manifest.set(id, {
        href: href.replace(/\\/g, "/"),
        mediaType: tag.match(/\bmedia-type=["']([^"']+)["']/i)?.[1] ?? "",
        properties: tag.match(/\bproperties=["']([^"']+)["']/i)?.[1] ?? "",
      });
    }

    const spineHrefs: string[] = [];
    const refRe = /<itemref\b[^>]*>/gi;
    while ((match = refRe.exec(opf))) {
      const tag = match[0];
      const idref = tag.match(/\bidref=["']([^"']+)["']/i)?.[1];
      const linear = tag.match(/\blinear=["']([^"']+)["']/i)?.[1];
      if (!idref || linear === "no") continue;
      const item = manifest.get(idref);
      if (item) spineHrefs.push(item.href);
    }

    const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
    const metaCoverId = opf.match(/<meta\b[^>]*name=["']cover["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "";
    return { opfPath, opfDir, manifest, spineHrefs, metaCoverId };
  } catch {
    return null;
  }
}

function joinZipPath(baseDir: string, relative: string): string {
  const parts = `${baseDir}${relative}`.split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }
  return out.join("/");
}

/**
 * Resolve a TOC/manifest href (OPF-relative or package-relative) to a real ZIP entry name.
 * EPUB.js resolves against the OPF folder while raw NCX hrefs stay relative, so try both.
 */
function resolveZipEntryName(zip: EpubZip, href: string, opfDir: string): string | null {
  const raw = href.split("#")[0].split("?")[0].trim().replace(/\\/g, "/").replace(/^\.?\//, "");
  if (!raw) return null;
  const names = Object.keys(zip.files).filter((name) => !zip.files[name].dir);
  const direct = [raw, `${opfDir}${raw}`].find((candidate) => names.includes(candidate));
  if (direct) return direct;

  const lower = raw.toLowerCase();
  return (
    names.find((name) => name.toLowerCase() === lower) ??
    names.find((name) => name.toLowerCase().endsWith(`/${lower}`)) ??
    null
  );
}

const PAGE_ANCHOR_PATTERN = /(?:^|[\s"'<])(?:id|name)\s*=\s*["']([^"']+)["']/gi;
const PAGE_ANCHOR_MARKER = /^(?:p\d+|pgepubid[\w.-]*|page[-_]?\d+|pmp-p\d+)$/i;

/** Page-break style anchors (#p12, #pgepubid00000) in document order. */
function collectPageAnchors(html: string): string[] {
  const anchors: string[] = [];
  PAGE_ANCHOR_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PAGE_ANCHOR_PATTERN.exec(html))) {
    const id = match[1].trim();
    if (!id || !PAGE_ANCHOR_MARKER.test(id) || anchors.includes(id)) continue;
    anchors.push(id);
  }
  return anchors;
}

/**
 * Inject physical anchors (<a id="pmp-p1">, etc.) by splitting large prose chunks
 * on actual block elements. This is more reliable for EPUBs that contain a single
 * giant XHTML file with many divs and no explicit page-break metadata.
 */
function injectPageAnchors(html: string): string {
  if (!html.trim()) return html;

  /* Keep existing injected markers idempotent. */
  if (html.includes('id="pmp-p1"') || html.includes('id="pmp-p2"')) {
    console.log('[EPUB] Skipping anchor injection - already has pmp-p anchors');
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body || doc.documentElement;
  if (!body) {
    return html;
  }

  const blockSelector = "p, div, h1, h2, h3, h4, h5, h6, section, article, blockquote, li, figure, table, img";
  const blocks = Array.from(body.querySelectorAll(blockSelector));
  if (!blocks.length) {
    return html;
  }

  const targetChars = 1600;
  const minChars = 350;
  let pageNumber = 1;
  let currentChars = 0;

  const addAnchor = (before: Node | null) => {
    if (!before || !body.contains(before)) return;
    const anchor = doc.createElement("a");
    anchor.id = `pmp-p${pageNumber}`;
    anchor.setAttribute("name", `pmp-p${pageNumber}`);
    body.insertBefore(anchor, before);
    pageNumber += 1;
  };

  addAnchor(body.firstChild);

  for (const block of blocks) {
    const tag = block.tagName.toLowerCase();
    const textLength = (block.textContent ?? "").replace(/\s+/g, " ").trim().length;
    const weight = tag === "img" ? 1800 : Math.max(textLength, 120);
    currentChars += weight;

    const isHeading = /^h[1-6]$/.test(tag);
    const shouldSplit =
      currentChars >= targetChars ||
      (currentChars >= minChars && isHeading) ||
      (currentChars >= minChars && block.tagName.toLowerCase() === "img");

    if (shouldSplit) {
      addAnchor(block);
      currentChars = 0;
    }
  }

  const anchorCount = body.querySelectorAll("[id^='pmp-p']").length;
  if (anchorCount <= 2 && (body.textContent ?? "").replace(/\s+/g, " ").trim().length > 4000) {
    console.log('[EPUB] Dense prose fallback: splitting body text into page-sized chunks.');
    const fullText = body.textContent ?? "";
    const cleanText = fullText.replace(/\s+/g, " ").trim();
    const chunkSize = 1800;
    const temp = body.cloneNode(true) as HTMLElement;
    body.replaceChildren();
    const firstAnchor = doc.createElement("a");
    firstAnchor.id = "pmp-p1";
    firstAnchor.setAttribute("name", "pmp-p1");
    body.appendChild(firstAnchor);

    const textParts = [] as string[];
    for (let i = 0; i < cleanText.length; i += chunkSize) {
      textParts.push(cleanText.slice(i, i + chunkSize));
    }

    for (let i = 0; i < textParts.length; i += 1) {
      const p = doc.createElement("p");
      p.textContent = textParts[i];
      const anchor = doc.createElement("a");
      anchor.id = `pmp-p${i + 2}`;
      anchor.setAttribute("name", `pmp-p${i + 2}`);
      body.appendChild(p);
      body.appendChild(anchor);
    }
  }

  const serialized = body.innerHTML;
  console.log('[EPUB] Anchor injection complete. Page anchors created:', body.querySelectorAll("[id^='pmp-p']").length);
  return serialized;
}

function isCoverDocument(href: string | undefined): boolean {
  return /^(?:.*\/)?cover\.(?:xhtml?|html?)$/i.test((href ?? "").split("#")[0]);
}

function normalizeHref(href: string | undefined): string {
  return (href ?? "").trim().replace(/^\.\//, "");
}

function cleanTocLabel(label: string | undefined): string {
  return (label ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function pageTitleForAnchor(chapterTitle: string, anchor: string): string {
  const number = /(\d+)/.exec(anchor)?.[1];
  return number ? `${chapterTitle} - ${number}` : `${chapterTitle} - ${anchor}`;
}

interface ChapterPlanDraft {
  title: string;
  pages: Array<{ title: string; href: string }>;
}

function collectDescendantPages(
  entries: EpubTocEntry[] | undefined,
  out: Array<{ title: string; href: string }>,
) {
  if (!entries?.length) return;
  for (const entry of entries) {
    const href = normalizeHref(entry.href);
    const label = cleanTocLabel(entry.label);
    if (href) out.push({ title: label || href, href });
    collectDescendantPages(entry.subitems, out);
  }
}

/** Split a chapter document into one page per page-break anchor, bounded by the next chapter. */
async function expandChapterAnchors(
  zip: EpubZip,
  opfDir: string,
  chapterHref: string,
  nextChapterHref: string | undefined,
  chapterTitle: string,
): Promise<Array<{ title: string; href: string }> | null> {
  console.log('[EPUB] expandChapterAnchors called for:', chapterHref, 'title:', chapterTitle);
  const entryName = resolveZipEntryName(zip, chapterHref, opfDir);
  if (!entryName) {
    console.log('[EPUB] Could not resolve entry name for:', chapterHref);
    return null;
  }
  const file = zip.file(entryName);
  if (!file) {
    console.log('[EPUB] File not found:', entryName);
    return null;
  }

  let html = String(await file.async("string"));
  console.log('[EPUB] HTML length:', html.length, 'for:', entryName);
  let anchors = collectPageAnchors(html);
  console.log('[EPUB] Initial anchors found:', anchors.length);

  /* Fallback: if no physical anchors exist, inject them every ~1400 chars. */
  if (anchors.length < 2) {
    console.log('[EPUB] Less than 2 anchors, injecting page anchors');
    const injected = injectPageAnchors(html);
    if (injected !== html) {
      html = injected;
      zip.file(entryName, html);
      anchors = collectPageAnchors(html);
      console.log('[EPUB] After injection, anchors:', anchors.length);
    } else {
      console.log('[EPUB] Injection did not change HTML');
    }
  }

  /* We return anchors even if only 1 exists, to ensure the reader gets a start anchor like #pmp-p1. */
  if (!anchors.length) return null;

  const filePart = chapterHref.split("#")[0];
  const startAnchor = chapterHref.split("#")[1] ?? "";
  const nextFilePart = nextChapterHref ? nextChapterHref.split("#")[0] : "";
  const nextAnchor = nextChapterHref && nextFilePart === filePart ? nextChapterHref.split("#")[1] ?? "" : "";

  const startIndex = Math.max(0, startAnchor ? anchors.indexOf(startAnchor) : 0);
  const requestedEnd = nextAnchor ? anchors.indexOf(nextAnchor) : -1;
  const endIndex = requestedEnd > startIndex ? requestedEnd : anchors.length;
  const range = anchors.slice(startIndex, endIndex);

  return range.map((anchor) => ({
    title: pageTitleForAnchor(chapterTitle, anchor),
    href: `${filePart}#${anchor}`,
  }));
}

/**
 * Group the EPUB TOC into chapters (reader steppers) with pages inside each chapter.
 * Falls back to a single chapter holding the spine pages when the book has no TOC.
 */
async function buildChapterPlans(options: {
  tocTree?: EpubTocEntry[];
  tocFlat: Array<{ label: string; href: string }>;
  zip: EpubZip | null;
  opfDir: string;
  spinePages: Array<{ title: string; href: string }>;
  bookTitle: string;
}): Promise<ChapterPlanDraft[]> {
  const { tocTree, tocFlat, zip, opfDir, spinePages, bookTitle } = options;
  const plans: ChapterPlanDraft[] = [];

  const addChapter = (title: string, pages: Array<{ title: string; href: string }>) => {
    const usable = pages.filter((page) => page.href && !isCoverDocument(page.href));
    if (usable.length) plans.push({ title: title || usable[0].title || bookTitle, pages: usable });
  };

  // Smart source selection: choose between TOC and spine based on quality
  const useToc = () => {
    if (tocTree?.length) {
      const flattenToc = (entries: EpubTocEntry[]) => {
        for (const entry of entries) {
          const title = cleanTocLabel(entry.label);
          const href = normalizeHref(entry.href);
          if (href) {
            addChapter(title || href, [{ title: title || href, href }]);
          }
          if (entry.subitems?.length) {
            flattenToc(entry.subitems);
          }
        }
      };
      flattenToc(tocTree);
      return true;
    }
    if (tocFlat.length) {
      // Check if TOC is better than spine items
      const tocHasFragments = tocFlat.some((entry) => entry.href.includes("#"));
      const tocHasMoreEntries = tocFlat.length > spinePages.length;
      const tocHasMultipleEntries = tocFlat.length >= 2;
      
      // Use TOC if it has fragments, more entries, or at least 2 entries
      if (tocHasFragments || tocHasMoreEntries || tocHasMultipleEntries) {
        for (const entry of tocFlat) {
          addChapter(entry.label, [{ title: entry.label || entry.href, href: entry.href }]);
        }
        return true;
      }
    }
    return false;
  };

  // Try TOC first, fall back to spine if TOC is minimal
  const usedToc = useToc();

  if (!usedToc) {
    addChapter(bookTitle, spinePages);
  }

  if (!plans.length) {
    addChapter(bookTitle, spinePages);
    return plans;
  }

  /* Expand all chapters into page anchors to create more granular pages. */
  if (zip) {
    const MAX_PAGES_PER_CHAPTER = 500; // Safeguard against excessive splits
    console.log('[EPUB] Expanding chapters, total plans:', plans.length, 'zip available:', !!zip);
    
    for (let index = 0; index < plans.length; index += 1) {
      const plan = plans[index];
      console.log('[EPUB] Processing chapter', index, 'with', plan.pages.length, 'initial pages');
      const nextHref = plans.slice(index + 1).find((next) => next.pages[0]?.href)?.pages[0]?.href;
      
      // Expand each page in the chapter
      const expandedPages: Array<{ title: string; href: string }> = [];
      for (const page of plan.pages) {
        console.log('[EPUB] Expanding page:', page.href);
        const expanded = await expandChapterAnchors(zip, opfDir, page.href, nextHref, page.title);
        if (expanded?.length) {
          console.log('[EPUB] Expanded to', expanded.length, 'pages');
          // Limit expansion to prevent excessive page counts
          if (expandedPages.length + expanded.length > MAX_PAGES_PER_CHAPTER) {
            console.log('[EPUB] Hit MAX_PAGES limit, using original');
            expandedPages.push(page); // Fall back to original if too many
          } else {
            expandedPages.push(...expanded);
          }
        } else {
          console.log('[EPUB] Expansion returned null, using original');
          expandedPages.push(page);
        }
      }
      
      if (expandedPages.length) {
        console.log('[EPUB] Chapter', index, 'final page count:', expandedPages.length);
        plan.pages = expandedPages;
      }
    }
  }

  return plans;
}

const COVER_MAX_WIDTH = 480;
const COVER_WEBP_QUALITY = 0.82;

function imageMimeTypeForName(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (extension === "png") return "image/png";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  if (extension === "svg") return "image/svg+xml";
  return "image/jpeg";
}

/** Rasterize cover bytes to a webp data URL (used as the book cover thumbnail). */
async function rasterizeCoverToWebp(bytes: Uint8Array, name: string): Promise<string | null> {
  if (typeof document === "undefined" || typeof Image === "undefined") return null;

  const objectUrl = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: imageMimeTypeForName(name) }));
  try {
    const image = await new Promise<HTMLImageElement | null>((resolve) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => resolve(null);
      element.src = objectUrl;
    });
    if (!image) return null;

    const naturalWidth = image.naturalWidth || COVER_MAX_WIDTH;
    const naturalHeight = image.naturalHeight || naturalWidth;
    const scale = Math.min(1, COVER_MAX_WIDTH / naturalWidth);
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/webp", COVER_WEBP_QUALITY);
    return dataUrl.startsWith("data:image/") ? dataUrl : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** First image referenced by an EPUB front/cover page document. */
async function readDocumentCoverImage(zip: EpubZip, docHref: string, opfDir: string): Promise<string | null> {
  const entryName = resolveZipEntryName(zip, docHref, opfDir);
  if (!entryName) return null;
  const file = zip.file(entryName);
  if (!file) return null;

  const html = String(await file.async("string"));
  const src =
    html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ??
    html.match(/<image\b[^>]*\bxlink:href=["']([^"']+)["']/i)?.[1] ??
    html.match(/<image\b[^>]*\bhref=["']([^"']+)["']/i)?.[1];
  if (!src || /^(?:https?:|data:)/i.test(src)) return null;

  const docDir = entryName.includes("/") ? entryName.slice(0, entryName.lastIndexOf("/") + 1) : "";
  const candidate = joinZipPath(docDir, src.split("?")[0].split("#")[0].replace(/\\/g, "/"));
  return resolveZipEntryName(zip, candidate, opfDir) ? candidate : null;
}

/**
 * Cover image from the EPUB front page, falling back to the OPF cover metadata.
 * Returns a `data:image/webp` URL so it can be stored straight on the course.
 */
async function extractEpubCover(zip: EpubZip): Promise<string | null> {
  const info = await readOpfInfo(zip);
  if (!info) return null;

  const candidates: string[] = [];
  const push = (href: string | null | undefined) => {
    const clean = href?.trim();
    if (clean && !candidates.some((item) => item.toLowerCase() === clean.toLowerCase())) candidates.push(clean);
  };

  /* 1. Front page: cover document (or first spine document) and its first image. */
  const frontPages = [...info.manifest.values()]
    .map((item) => item.href)
    .filter((href) => isCoverDocument(href));
  if (info.spineHrefs[0]) frontPages.push(info.spineHrefs[0]);
  for (const page of frontPages) {
    push(await readDocumentCoverImage(zip, page, info.opfDir));
  }

  /* 2. OPF cover metadata. */
  const metaCover = info.metaCoverId ? info.manifest.get(info.metaCoverId) : undefined;
  if (metaCover && /^image\//i.test(metaCover.mediaType)) push(metaCover.href);
  for (const item of info.manifest.values()) {
    if (/cover-image/i.test(item.properties)) push(item.href);
  }

  /* 3. Manifest / ZIP name heuristics. */
  for (const [id, item] of info.manifest) {
    if (/^image\//i.test(item.mediaType) && /cover/i.test(`${id} ${item.href}`)) push(item.href);
  }
  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir) continue;
    if (/(^|\/)cover[_\-.]?[^/]*\.(?:jpe?g|png|gif|webp)$/i.test(name)) push(name);
  }

  for (const href of candidates) {
    if (/\.svg$/i.test(href.split("#")[0])) continue;
    const entryName = resolveZipEntryName(zip, href, info.opfDir);
    if (!entryName) continue;
    const file = zip.file(entryName);
    if (!file) continue;
    const dataUrl = await rasterizeCoverToWebp((await file.async("uint8array")) as Uint8Array, entryName);
    if (dataUrl) return dataUrl;
  }

  return null;
}

export interface EpubImportPreviewOptions {
  preferredFolder?: string;
  bookIdOverride?: string;
  courseIndex?: number;
  existingBookIds?: string[];
  preferSpine?: boolean;
}

export type EpubImportPreview = BookImportPreview;

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
  console.log('[EPUB] buildEpubImportPreview called for file:', file.name);
  const folderName = sanitizeBookFolderName(options?.preferredFolder ?? file.name.replace(/\.epub$/i, "")) || `epub-import-${Date.now()}`;
  const bookId = slugify(options?.bookIdOverride?.trim() || folderName) || `book-${Date.now()}`;
  const epubFileName = `${sanitizeAssetFileName(file.name.replace(/\.epub$/i, "")) || "document"}.epub`;
  const baseEpubSource = getBookAssetUrl(`${folderName}/${epubFileName}`);

  console.log('[EPUB] Reading file array buffer...');
  const arrayBuffer = await file.arrayBuffer();
  console.log('[EPUB] Array buffer size:', arrayBuffer.byteLength);
  const zip = await loadEpubZip(arrayBuffer.slice(0));
  console.log('[EPUB] ZIP loaded:', !!zip);
  const opfDir = (await (zip ? readOpfInfo(zip) : null))?.opfDir ?? "";

  let spineItems: EpubSpineItem[] = [];
  let tocTree: EpubTocEntry[] = [];
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
        tocTree = navigation?.toc ?? [];
        tocFlat = dedupeTocEntries(flattenToc(navigation?.toc));
      } catch {
        tocTree = [];
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

  if (!spineItems.length && zip) {
    spineItems = await collectSpineFromZip(zip);
  }
  if (tocFlat.length < 2 && zip) {
    const zipToc = await collectTocFromZip(zip);
    if (zipToc.length > tocFlat.length) tocFlat = zipToc;
  }

  const spinePages = spineItems
    .filter((item) => !isCoverDocument(item.href))
    .map((item, index) => {
      const href = normalizeHref(item.href);
      if (!href) return null;
      return { title: item.label || item.title || titleForHref(href, tocFlat, `Page ${index + 1}`), href };
    })
    .filter((page): page is { title: string; href: string } => Boolean(page));

  /*
    Group the TOC into chapters (reader steppers); each chapter holds one step
    per page anchor so a chapter with several pages gets several steps.
  */
  const chapterPlans = (await buildChapterPlans({
    tocTree,
    tocFlat,
    zip,
    opfDir,
    spinePages,
    bookTitle: folderName,
  })).filter((plan) => plan.pages.length);

  if (!chapterPlans.length) {
    chapterPlans.push({ title: folderName, pages: [{ title: folderName, href: "" }] });
  }

  /* Flatten first so every page knows its successor, even across chapter borders. */
  const sequence: Array<{ title: string; href: string }> = [];
  const chapterStarts: number[] = [];
  for (const plan of chapterPlans) {
    chapterStarts.push(sequence.length);
    for (const page of plan.pages) sequence.push({ title: page.title, href: normalizeHref(page.href) });
  }
  chapterStarts.push(sequence.length);

  const chapters: BookImportChapterPlan[] = [];
  for (let c = 0; c < chapterStarts.length - 1; c += 1) {
    const steps: BookImportPagePlan[] = [];
    for (let i = chapterStarts[c]; i < chapterStarts[c + 1]; i += 1) {
      const page = sequence[i];
      steps.push({
        title: page.title || `Page ${i + 1}`,
        href: page.href,
        content: page.href ? `${baseEpubSource}#${page.href}` : baseEpubSource,
        nextHref: sequence[i + 1]?.href || undefined,
      });
    }
    chapters.push({ title: chapterPlans[c].title || `Chapter ${c + 1}`, pages: steps });
  }

  const pages: ParsedHtmlPage[] = [];
  for (const chapter of chapters) {
    for (const page of chapter.pages) {
      const pageNumber = pages.length + 1;
      const fileName = `chapter-${String(pageNumber).padStart(2, "0")}.html`;
      pages.push({
        fileName,
        relativePath: fileName,
        pageNumber,
        sortOrder: pageNumber,
        title: page.title,
        content: page.content,
        stepType: "epub",
        assets: [],
      });
    }
  }

  return {
    folderPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH,
    folderName,
    bookId,
    bookTitle: folderName,
    pages,
    chapters,
    existingBookId: existingBookIds.includes(bookId) ? bookId : undefined,
    pageCount: pages.length,
    epubFileName,
    chapterCount: chapters.length,
    coverImageUrl: (await (zip ? extractEpubCover(zip) : null)) ?? undefined,
    modifiedEpubData: zip ? await zip.generateAsync({ type: "uint8array" }) : undefined,
  };
}

export async function writeEpubAssetToDirectory(
  rootDirectory: FileSystemDirectoryHandle | null,
  folderName: string,
  fileName: string,
  file: File,
  coverImageUrl?: string,
  onProgress?: (progress: EpubAssetExportProgress) => void,
  coverOptions?: { folder: string; fileName: string }
): Promise<{ written: number; total: number; errors: string[] }> {
  const hasCover = !!(coverImageUrl && coverImageUrl.startsWith("data:"));
  const total = hasCover ? 2 : 1;
  const errors: string[] = [];
  let written = 0;

  if (!rootDirectory) {
    onProgress?.({ completed: 0, total, currentFileName: fileName });
    return { written: 0, total, errors: ["Folder access was not granted for the fixed project destination."] };
  }

  try {
    // 1. Write EPUB to book_html/[category]/[book]
    let pathParts = folderName.replace(/\\/g, "/").split("/").filter(Boolean);
    const rootName = rootDirectory.name.toLowerCase();

    // If user picked a subfolder (e.g. 'book_html', 'Other', 'Comic'), adjust pathParts
    if (rootName === "book_html") {
      // Already in book_html, no need to navigate into it
    } else if (rootName === "other" || rootName === "comic") {
      // Already in the category folder, skip the first part if it matches
      if (pathParts.length > 0 && pathParts[0].toLowerCase() === rootName) {
        pathParts = pathParts.slice(1);
      }
    }

    // If user picked project root, we might need to go into book_html first
    let bookHtmlRoot = rootDirectory;
    if (rootName !== "book_html" && rootName !== "other" && rootName !== "comic") {
      try {
        bookHtmlRoot = await rootDirectory.getDirectoryHandle("book_html", { create: false });
      } catch {
        // Fallback: assume rootDirectory IS book_html or we just create folders relative to it
        bookHtmlRoot = rootDirectory;
      }
    }

    const bookDirectory = await pathParts.reduce(
      (directory, part) => directory.then((current) => current.getDirectoryHandle(part, { create: true })),
      Promise.resolve(bookHtmlRoot),
    );

    const fileHandle = await bookDirectory.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
    written += 1;
    onProgress?.({ completed: written, total, currentFileName: fileName });

    // 2. Write Cover if present
    if (hasCover) {
      try {
        const coverFileName = coverOptions?.fileName || "cover.webp";
        let targetCoverDirectory: FileSystemDirectoryHandle | null = null;

        if (coverOptions?.folder.startsWith("/book_covers")) {
          const coverPathParts = coverOptions.folder.split("/").filter(Boolean);

          try {
            // Try to find 'public' folder in the selected root
            const publicDir = await rootDirectory.getDirectoryHandle("public", { create: false });
            targetCoverDirectory = await coverPathParts.reduce(
              (directory, part) => directory.then((current) => current.getDirectoryHandle(part, { create: true })),
              Promise.resolve(publicDir),
            );
          } catch {
            // Fallback: If 'public' not found, save the cover INSIDE the book's own folder
            // so it's not lost, and warn the user.
            targetCoverDirectory = bookDirectory;
            errors.push(`Note: 'public' folder not found in "${rootDirectory.name}". The cover was saved to the book folder instead. For global covers, please select the project root (PracticeMadePerfect).`);
          }
        } else {
          targetCoverDirectory = bookDirectory;
        }

        if (targetCoverDirectory) {
          const response = await fetch(coverImageUrl!);
          const blob = await response.blob();
          const coverHandle = await targetCoverDirectory.getFileHandle(coverFileName, { create: true });
          const coverWritable = await coverHandle.createWritable();
          await coverWritable.write(blob);
          await coverWritable.close();
          written += 1;
          onProgress?.({ completed: written, total, currentFileName: coverFileName });
        }
      } catch (err) {
        errors.push(`Cover not saved: ${String(err)}`);
      }
    }

    return { written, total, errors };
  } catch (error) {
    onProgress?.({ completed: written, total, currentFileName: fileName });
    return { written, total, errors: [String(error)] };
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
