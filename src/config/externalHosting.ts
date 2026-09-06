/**
 * Configuration for external hosting services
 * This allows separating bandwidth-heavy assets (PDFs) from the main app
 */

// Whether to use folder-based external hosting for book assets (Comic/Other folders)
export const USE_EXTERNAL_BOOK_HOSTING = true;

/**
 * Multi-hosting configuration for book distribution
 * Routes different book folders to different Firebase projects
 */
export const BOOK_HOSTING_CONFIG = {
  "Comic": "https://magiclibrary-d9921.web.app",
  "Other": "https://magiclibrary-143b7.web.app",
  // Add more mappings as needed
};

/**
 * Get the full URL for a book asset with folder-based routing
 * @param relativePath - Relative path from book_html (e.g., "Comic/file.html" or "Other/file.pdf")
 * @returns Full URL for the book asset, routed to appropriate hosting
 */
export function getBookAssetUrl(relativePath: string): string {
  const normalizedPath = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const pathParts = normalizedPath.split("/").filter(Boolean);
  if (pathParts.length > 1 && /^(Comic|Other)$/i.test(pathParts[0])) {
    const root = pathParts[0];
    while (pathParts.length > 1 && pathParts[1].toLowerCase() === root.toLowerCase()) {
      pathParts.splice(1, 1);
    }
    relativePath = pathParts.join("/");
  }

  // If external book hosting is disabled, always use local hosting
  if (!USE_EXTERNAL_BOOK_HOSTING) {
    return `/book_html/${relativePath}`;
  }

  // Extract folder from path (e.g., "Comic" from "Comic/file.html")
  const folderIndex = pathParts.findIndex((part) => /^(Comic|Other)$/i.test(part));
  if (folderIndex >= 0) {
    pathParts[folderIndex] = pathParts[folderIndex].toLowerCase() === "comic" ? "Comic" : "Other";
  }
  const folder = pathParts[folderIndex >= 0 ? folderIndex : 0];

  // Check if this folder has external hosting configured
  const externalHost = BOOK_HOSTING_CONFIG[folder as keyof typeof BOOK_HOSTING_CONFIG];

  if (externalHost) {
    // Each external Firebase site serves its category folder as the web root.
    return `${externalHost}/${pathParts.slice(folderIndex + 1).join('/')}`;
  }

  // Default to local hosting for folders not in config
  return `/book_html/${relativePath}`;
}
