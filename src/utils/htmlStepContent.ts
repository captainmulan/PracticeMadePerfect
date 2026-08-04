const IFRAME_SRC_PATTERN = /^<iframe\b[^>]*\ssrc=["']([^"']+)["'][^>]*>\s*(?:<\/iframe>)?\s*$/i;

const BOOK_HTML_FOLDER_ALIASES: Record<string, string> = {
  myfirst100mmwords: "MyFirst100MMWords",
  "little-programmer": "LittleProgrammer",
  solarsystem: "SolarSystem",
  oceanadventure: "OceanAdventure",
  continents: "Continents",
  "let-s-speak-myanmar-story": "Mudra holiday trip to Myanmar",
  letsspeakmyanmarstory: "Mudra holiday trip to Myanmar",
  "mudra-holiday-trip-to-myanmar": "Mudra holiday trip to Myanmar",
  mudraholidaytriptomyanmar: "Mudra holiday trip to Myanmar",
  "mudra-goes-to-bagan": "Mudra goes to Bagan",
  mudragoestobagan: "Mudra goes to Bagan",
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
  const match = src.match(/^\/book_html\/([^/]+)\//);
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

/** Folder name for /book_html/… iframe links when importing or updating a book. */
export function resolveImportBookHtmlFolder(
  course?: { id?: string; bookHtmlFolder?: string | null } | null,
  uploadFolderName?: string,
): string {
  const fromCourse = resolveBookHtmlFolder({
    bookHtmlFolder: course?.bookHtmlFolder,
    courseId: course?.id,
  });
  if (fromCourse) {
    return fromCourse;
  }
  if (uploadFolderName && uploadFolderName !== "Imported Book") {
    return uploadFolderName;
  }
  return uploadFolderName ?? "Imported Book";
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

  const baseTag = `<base href="/book_html/${bookHtmlFolder}/">`;
  return trimmed.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
}
