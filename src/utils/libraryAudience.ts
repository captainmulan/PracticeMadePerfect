export type LibraryAudience = "Other" | "Kid";

const AUDIENCE_STORAGE_KEY = "pmp-library-audience";

export function getLibraryAudience(): LibraryAudience {
  try {
    return window.sessionStorage.getItem(AUDIENCE_STORAGE_KEY) === "Kid" ? "Kid" : "Other";
  } catch {
    return "Other";
  }
}

export function saveLibraryAudience(audience: LibraryAudience): void {
  try {
    window.sessionStorage.setItem(AUDIENCE_STORAGE_KEY, audience);
  } catch {
    // Keep browsing usable when session storage is unavailable.
  }
}