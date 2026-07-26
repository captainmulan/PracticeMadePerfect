const IFRAME_SRC_PATTERN = /^<iframe\b[^>]*\ssrc=["']([^"']+)["'][^>]*>\s*(?:<\/iframe>)?\s*$/i;

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

export function buildHtmlStepSrcDoc(contentHtml: string): string {
  const trimmed = contentHtml.trim();
  const isFullDocument = /<\s*html/i.test(trimmed);
  if (isFullDocument) {
    return trimmed;
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${trimmed}</body></html>`;
}
