import type { BookImportPreview, ParsedHtmlPage } from "./bookImport";

const DEFAULT_BOOK_HTML_DIRECTORY_PATH = "C:\\Users\\65966\\PracticeMadePerfect\\book_html";
let cachedEpubAssetDirectory: FileSystemDirectoryHandle | null = null;

type EpubJsLib = {
  Book: any;
};

declare global {
  interface Window {
    ePub?: EpubJsLib;
    showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}

async function loadEpubJsLib(): Promise<EpubJsLib | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = window.ePub;
  if (existing?.Book) {
    return existing;
  }

  const existingScript = document.querySelector<HTMLScriptElement>("script[data-epubjs-loader='true']");
  if (existingScript) {
    await new Promise<void>((resolve) => {
      if (window.ePub?.Book) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => resolve(), { once: true });
    });
    return window.ePub ?? null;
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

  return window.ePub ?? null;
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

function buildEpubViewerContent(folderName: string, epubFileName: string): string {
  return `/book_html/${folderName}/${epubFileName}`;
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

  let pageCount = 1;
  let spineItems: any[] = [];
  try {
    const ePub = await loadEpubJsLib();
    if (ePub?.Book) {
      const arrayBuffer = await file.arrayBuffer();
      const book = ePub.Book(arrayBuffer);

      // EPUB.js loads the spine asynchronously. We must wait for the book
      // to be "ready" before accessing book.spine.items — otherwise the
      // spine is empty and pageCount falls back to 1.
      if (typeof book.ready?.then === "function") {
        await book.ready;
      }

      // Get spine items (chapters/sections)
      spineItems = book.spine?.items ?? [];
      pageCount = spineItems.length || 1;

      // If spine is empty, try to get from navigation
      if (pageCount === 0) {
        const navigation = await book.loaded.navigation;
        if (navigation && navigation.toc && navigation.toc.length > 0) {
          pageCount = navigation.toc.length;
          spineItems = navigation.toc;
        }
      }
    }
  } catch {
    pageCount = 1;
  }

  // Create pages based on EPUB spine/chapter structure
  const pages: ParsedHtmlPage[] = [];
  for (let i = 0; i < pageCount; i++) {
    const pageNumber = i + 1;
    const spineItem = spineItems[i];
    const title = spineItem?.label || spineItem?.title || `Chapter ${pageNumber}`;
    
    // Add location fragment to navigate to specific chapter
    const chapterLocation = spineItem?.href ? `#${spineItem.href}` : "";
    const pageSource = `${baseEpubSource}${chapterLocation}`;
    
    pages.push({
      fileName: `chapter-${String(pageNumber).padStart(2, "0")}.html`,
      relativePath: `chapter-${String(pageNumber).padStart(2, "0")}.html`,
      pageNumber,
      sortOrder: pageNumber,
      title: title,
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
