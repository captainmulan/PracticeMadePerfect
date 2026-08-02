import type { BookImportPreview, ParsedHtmlPage } from "./bookImport";

const DEFAULT_BOOK_HTML_DIRECTORY_PATH = "C:\\Users\\65966\\PracticeMadePerfect\\book_html";
let cachedPdfAssetDirectory: FileSystemDirectoryHandle | null = null;

type PdfJsLib = {
  getDocument: (input: { data: ArrayBuffer }) => { promise: Promise<any> };
};

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
    showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
  }
}

async function loadPdfJsLib(): Promise<PdfJsLib | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = window.pdfjsLib;
  if (existing?.getDocument) {
    return existing;
  }

  const existingScript = document.querySelector<HTMLScriptElement>("script[data-pdfjs-loader='true']");
  if (existingScript) {
    await new Promise<void>((resolve) => {
      if (window.pdfjsLib?.getDocument) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => resolve(), { once: true });
    });
    return window.pdfjsLib ?? null;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.setAttribute("data-pdfjs-loader", "true");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to load PDF.js from CDN."));
      document.head.appendChild(script);
    });
  } catch {
    return null;
  }

  return window.pdfjsLib ?? null;
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
    .replace(/^-|-$/g, "") || "imported-pdf-book";
}

function sanitizeAssetFileName(value: string) {
  const normalized = value.trim().replace(/\\/g, "/").split(/[\/]+/).filter(Boolean).join("-");
  return normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "document";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPdfViewerContent(folderName: string, pdfFileName: string, title: string): string {
  return `/book_html/${folderName}/${pdfFileName}`;
}

export interface PdfImportPreviewOptions {
  preferredFolder?: string;
  bookIdOverride?: string;
  courseIndex?: number;
  existingBookIds?: string[];
}

export interface PdfImportPreview extends BookImportPreview {
  pageCount: number;
  pdfFileName: string;
}

export interface PdfAssetExportProgress {
  completed: number;
  total: number;
  currentFileName?: string;
}

export async function buildPdfImportPreview(
  file: File,
  _courseIndex: number,
  existingBookIds: string[],
  options?: PdfImportPreviewOptions,
): Promise<PdfImportPreview | null> {
  const folderName = sanitizeBookFolderName(options?.preferredFolder ?? file.name.replace(/\.pdf$/i, "")) || `pdf-import-${Date.now()}`;
  const bookId = slugify(options?.bookIdOverride?.trim() || folderName) || `book-${Date.now()}`;
  const pdfFileName = `${sanitizeAssetFileName(file.name.replace(/\.pdf$/i, "")) || "document"}.pdf`;
  const basePdfSource = `/book_html/${folderName}/${pdfFileName}`;

  let pageCount = 1;
  try {
    const pdfjsLib = await loadPdfJsLib();
    if (pdfjsLib) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      if (Number.isFinite(pdf?.numPages) && pdf?.numPages > 0) {
        pageCount = pdf.numPages;
      }
    }
  } catch {
    pageCount = 1;
  }

  const pages: ParsedHtmlPage[] = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    const pageSource = `${basePdfSource}#page=${pageNumber}`;
    return {
      fileName: `page-${String(pageNumber).padStart(2, "0")}.pdf`,
      relativePath: `page-${String(pageNumber).padStart(2, "0")}.pdf`,
      pageNumber,
      sortOrder: pageNumber,
      title: `Page ${pageNumber}`,
      content: pageSource,
      stepType: "pdf",
      assets: [],
    };
  });

  return {
    folderPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH,
    folderName,
    bookId,
    bookTitle: folderName,
    pages,
    existingBookId: existingBookIds.includes(bookId) ? bookId : undefined,
    pageCount,
    pdfFileName,
  };
}

export async function writePdfAssetToDirectory(
  rootDirectory: FileSystemDirectoryHandle | null,
  folderName: string,
  fileName: string,
  file: File,
  onProgress?: (progress: PdfAssetExportProgress) => void,
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

export async function resolvePdfAssetDirectory(): Promise<{ directoryHandle: FileSystemDirectoryHandle | null; resolvedPath: string } | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedPdfAssetDirectory) {
    return { directoryHandle: cachedPdfAssetDirectory, resolvedPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH };
  }

  if (typeof window.showDirectoryPicker !== "function") {
    return null;
  }

  try {
    const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    cachedPdfAssetDirectory = directoryHandle;
    return { directoryHandle, resolvedPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH };
  } catch {
    return { directoryHandle: cachedPdfAssetDirectory, resolvedPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH };
  }
}
