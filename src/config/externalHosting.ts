/**
 * Configuration for external hosting services
 * This allows separating bandwidth-heavy assets (PDFs) from the main app
 */

// External Firebase project for PDF hosting
export const PDF_HOSTING_URL = "https://magiclibrary-92246.web.app";

// External Firebase project for other large assets if needed
export const ASSETS_HOSTING_URL = "https://magiclibrary-92246.web.app";

// Whether to use external hosting for PDFs
export const USE_EXTERNAL_PDF_HOSTING = false; // Disabled - everything on same site now

// Whether to use external hosting for HTML book assets
export const USE_EXTERNAL_ASSETS_HOSTING = true; // Use external hosting for assets on new deployment

/**
 * Get the full URL for a PDF file
 * @param relativePath - Relative path from book_html (e.g., "folder/file.pdf")
 * @returns Full URL for the PDF file
 */
export function getPdfUrl(relativePath: string): string {
  if (USE_EXTERNAL_PDF_HOSTING) {
    return `${PDF_HOSTING_URL}/book_html/${relativePath}`;
  }
  return `/book_html/${relativePath}`;
}

/**
 * Get the full URL for an HTML book asset
 * @param relativePath - Relative path from book_html (e.g., "folder/file.html")
 * @returns Full URL for the HTML asset
 */
export function getAssetUrl(relativePath: string): string {
  if (USE_EXTERNAL_ASSETS_HOSTING) {
    return `${ASSETS_HOSTING_URL}/book_html/${relativePath}`;
  }
  return `/book_html/${relativePath}`;
}
