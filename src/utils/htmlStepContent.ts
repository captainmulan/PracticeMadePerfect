import { getBookAssetUrl } from "../config/externalHosting";

const IFRAME_SRC_PATTERN = /^<iframe\b[^>]*\ssrc=["']([^"']+)["'][^>]*>\s*(?:<\/iframe>)?\s*$/i;

const BOOK_HTML_FOLDER_ALIASES: Record<string, string> = {
  myfirst100mmwords: "Other/MyFirst100MMWords",
  "little-programmer": "Other/LittleProgrammer",
  solarsystem: "Other/SolarSystem",
  oceanadventure: "Other/OceanAdventure",
  continents: "Other/Continents",
  "let-s-speak-myanmar-story": "Other/Mudra holiday trip to Myanmar",
  letsspeakmyanmarstory: "Other/Mudra holiday trip to Myanmar",
  "mudra-holiday-trip-to-myanmar": "Other/Mudra holiday trip to Myanmar",
  mudraholidaytriptomyanmar: "Other/Mudra holiday trip to Myanmar",
  "mudra-goes-to-bagan": "Other/Mudra goes to Bagan",
  mudragoestobagan: "Other/Mudra goes to Bagan",
};

export function extractBookHtmlIframeSrc(contentHtml: string): string | null {
  const trimmed = contentHtml.trim();
  if (!/^<iframe\b/i.test(trimmed)) {
    return null;
  }
  const strictMatch = trimmed.match(IFRAME_SRC_PATTERN);
  if (strictMatch) {
    return strictMatch[1];
  }
  const looseMatch = trimmed.match(/\ssrc=["']([^"']+)["']/i);
  return looseMatch?.[1] ?? null;
}

export function extractBookHtmlFolderFromIframeSrc(src: string): string | null {
  const match = src.match(/^\/book_html\/(.+?\/[^/]+)\//);
  return match?.[1] ?? null;
}

export function resolveBookHtmlFolder(options: {
  bookHtmlFolder?: string | null;
  courseId?: string | null;
  contentHtml?: string | null;
}): string | null {
  if (options.bookHtmlFolder) {
    return options.bookHtmlFolder;
  }

  const iframeSrc = options.contentHtml ? extractBookHtmlIframeSrc(options.contentHtml) : null;
  if (iframeSrc) {
    const fromSrc = extractBookHtmlFolderFromIframeSrc(iframeSrc);
    if (fromSrc) {
      return fromSrc;
    }
  }

  if (options.courseId && BOOK_HTML_FOLDER_ALIASES[options.courseId]) {
    return BOOK_HTML_FOLDER_ALIASES[options.courseId];
  }

  return null;
}

export function bookStorageCategory(category?: string | null): "Comic" | "Other" {
  return /(^|[,>\s])comic([,>\s]|$)/i.test(category ?? "") ? "Comic" : "Other";
}

export function normalizeBookStorageFolder(folder: string): string {
  const normalized = folder.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2 || !/^(Comic|Other)$/i.test(parts[0])) {
    return parts.join("/");
  }
  const root = parts[0];
  while (parts.length > 1 && parts[1].toLowerCase() === root.toLowerCase()) {
    parts.splice(1, 1);
  }
  return parts.join("/");
}

/** Folder name for /book_html/... iframe links when importing or updating a book. */
export function resolveImportBookHtmlFolder(
  course?: { id?: string; bookHtmlFolder?: string | null } | null,
  uploadFolderName?: string,
  category?: string | null,
): string {
  const fromCourse = resolveBookHtmlFolder({
    bookHtmlFolder: course?.bookHtmlFolder,
    courseId: course?.id,
  });
  if (fromCourse) {
    return normalizeBookStorageFolder(fromCourse);
  }

  const normalizedUploadFolder = uploadFolderName ? normalizeBookStorageFolder(uploadFolderName) : undefined;
  if (normalizedUploadFolder && /^(Comic|Other)\//i.test(normalizedUploadFolder)) {
    const [root, ...rest] = normalizedUploadFolder.split("/");
    return `${root[0].toUpperCase()}${root.slice(1).toLowerCase()}/${rest.join("/")}`;
  }

  if (uploadFolderName && uploadFolderName !== "Imported Book") {
    return `${bookStorageCategory(category)}/${normalizedUploadFolder}`;
  }
  return `${bookStorageCategory(category)}/${normalizedUploadFolder || "Imported Book"}`;
}

/** Relative book scripts/assets (e.g. _ocean-img-overview.js, assets/foo.png) need a base href in srcDoc. */
function usesRelativeBookAssets(html: string): boolean {
  return (
    /(?:href|src)=["'](?!https?:|\/|data:)(?:_|assets\/)/i.test(html) ||
    /<script[^>]+src=["']_/i.test(html)
  );
}

export function buildHtmlStepSrcDoc(contentHtml: string, bookHtmlFolder?: string | null): string {
  const trimmed = contentHtml.trim();
  const isFullDocument = /<\s*html/i.test(trimmed);
  if (!isFullDocument) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${trimmed}</body></html>`;
  }

  if (!bookHtmlFolder || !usesRelativeBookAssets(trimmed) || /<base\b/i.test(trimmed)) {
    return trimmed;
  }

  const baseUrl = getBookAssetUrl(`${bookHtmlFolder}/`);
  const baseTag = `<base href="${baseUrl}">`;
  return trimmed.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
}
