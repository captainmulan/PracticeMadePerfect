const SHELF_RETURN_KEY = "pmp-shelf-return-v2";

export type ShelfReturnState = {
  tab: string;
  categoryPath: string[];
  selectedAuthorName: string | null;
  searchQuery: string;
};

export function saveShelfReturn(state: ShelfReturnState) {
  try {
    sessionStorage.setItem(SHELF_RETURN_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readShelfReturn(): ShelfReturnState | null {
  try {
    const raw = sessionStorage.getItem(SHELF_RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShelfReturnState>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      tab: parsed.tab || "Category",
      categoryPath: Array.isArray(parsed.categoryPath)
        ? parsed.categoryPath.filter((part) => typeof part === "string" && part.length > 0)
        : [],
      selectedAuthorName: parsed.selectedAuthorName ?? null,
      searchQuery: typeof parsed.searchQuery === "string" ? parsed.searchQuery : "",
    };
  } catch {
    return null;
  }
}

export function getShelfReturnLabel(): { nav: string; about: string } {
  const saved = readShelfReturn();
  if (saved?.tab === "Search") {
    return { nav: "Search", about: "Search" };
  }
  return { nav: "Previous category", about: "Category" };
}

export const SHELF_RETURN_HREF = "/?restoreShelf=1";
