import type { ParsedHtmlPage } from "./bookImport";

const DEFAULT_BOOK_HTML_DIRECTORY_PATH = "C:\\Users\\65966\\PracticeMadePerfect\\book_html";
const PDF_IMAGE_SCALE = 0.55;
const PDF_IMAGE_QUALITY = 0.82;
const MAX_EMBEDDED_IMAGE_CHARS = 180_000;
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

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.setAttribute("data-pdfjs-loader", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load PDF.js from CDN."));
    document.head.appendChild(script);
  });

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPdfParagraphs(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "<p>Page content</p>";
  }

  const chunks = cleaned.split(/\s{2,}/).map((chunk) => chunk.trim()).filter(Boolean);
  if (chunks.length === 0) {
    return `<p>${escapeHtml(cleaned)}</p>`;
  }

  return chunks.map((chunk) => `<p>${escapeHtml(chunk)}</p>`).join("");
}

function buildPdfPageHtml(pageNumber: number, text: string, folderName: string, assetFileName?: string, assetDataUrl?: string): string {
  const paragraphs = buildPdfParagraphs(text);
  const shouldEmbedImage = Boolean(assetDataUrl && assetDataUrl.length < MAX_EMBEDDED_IMAGE_CHARS);
  const imageMarkup = shouldEmbedImage
    ? `<img src="${assetDataUrl}" alt="Page ${pageNumber}" style="max-width:100%;height:auto;display:block;margin:12px 0;" />`
    : assetFileName
      ? `<img src="/book_html/${folderName}/${assetFileName}" alt="Page ${pageNumber}" style="max-width:100%;height:auto;display:block;margin:12px 0;" />`
      : "";
  return `<div>${imageMarkup}${paragraphs}</div>`;
}

export interface PdfPageAsset {
  fileName: string;
  mimeType: string;
  dataUrl: string;
}

export interface PdfImportPreviewOptions {
  preferredFolder?: string;
  bookIdOverride?: string;
  courseIndex?: number;
  existingBookIds?: string[];
}

export interface PdfImportPreview {
  folderPath: string;
  folderName: string;
  bookId: string;
  bookTitle: string;
  pages: ParsedHtmlPage[];
  existingBookId?: string;
}

export async function buildPdfImportPreview(
  file: File,
  courseIndex: number,
  existingBookIds: string[],
  options?: PdfImportPreviewOptions,
): Promise<PdfImportPreview | null> {
  const pdfjsLib = await loadPdfJsLib();
  if (!pdfjsLib) {
    throw new Error("PDF.js could not be loaded. Open the admin page in a browser with network access, or install PDF.js in the app bundle.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const folderName = sanitizeBookFolderName(options?.preferredFolder ?? file.name.replace(/\.pdf$/i, "")) || `pdf-import-${Date.now()}`;
  const bookId = slugify(options?.bookIdOverride?.trim() || folderName) || `book-${Date.now()}`;

  const pages: ParsedHtmlPage[] = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const viewport = page.getViewport({ scale: PDF_IMAGE_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) {
      continue;
    }

    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/webp", PDF_IMAGE_QUALITY);
    const assetFileName = `page-${String(index).padStart(2, "0")}.webp`;

    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => (typeof item?.str === "string" ? item.str : ""))
      .join(" ");

    pages.push({
      fileName: `page-${String(index).padStart(2, "0")}.html`,
      relativePath: `page-${String(index).padStart(2, "0")}.html`,
      pageNumber: index,
      sortOrder: index,
      title: `Page ${index}`,
      content: buildPdfPageHtml(index, text, folderName, assetFileName, dataUrl),
      assets: dataUrl.length < MAX_EMBEDDED_IMAGE_CHARS ? [{ fileName: assetFileName, mimeType: "image/webp", dataUrl }] : [],
    });
  }

  if (pages.length === 0) {
    return null;
  }

  return {
    folderPath: DEFAULT_BOOK_HTML_DIRECTORY_PATH,
    folderName,
    bookId,
    bookTitle: folderName,
    pages,
    existingBookId: existingBookIds.includes(bookId) ? bookId : undefined,
  };
}

export async function writePdfPageAssetsToDirectory(
  rootDirectory: FileSystemDirectoryHandle,
  folderName: string,
  pages: ParsedHtmlPage[],
): Promise<void> {
  const bookDirectory = await rootDirectory.getDirectoryHandle(folderName, { create: true });

  for (const page of pages) {
    for (const asset of page.assets ?? []) {
      const fileHandle = await bookDirectory.getFileHandle(asset.fileName, { create: true });
      const writable = await fileHandle.createWritable();
      const response = await fetch(asset.dataUrl);
      const blob = await response.blob();
      await writable.write(blob);
      await writable.close();
    }
  }
}

export async function resolvePdfAssetDirectory(): Promise<{ directoryHandle: FileSystemDirectoryHandle; resolvedPath: string } | null> {
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
    return null;
  }
}
