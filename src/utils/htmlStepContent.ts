const IFRAME_SRC_PATTERN = /^<iframe\b[^>]*\ssrc=["']([^"']+)["'][^>]*>\s*(?:<\/iframe>)?\s*$/i;

const BOOK_HTML_FOLDER_ALIASES: Record<string, string> = {
  myfirst100mmwords: "MyFirst100MMWords",
  "little-programmer": "LittleProgrammer",
  solarsystem: "SolarSystem",
  oceanadventure: "OceanAdventure",
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

function usesRelativeBookAssets(html: string): boolean {
  return /(?:href|src)=["'](?:_mmwords-|assets\/)/i.test(html);
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
