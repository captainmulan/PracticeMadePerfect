const SHELF_RETURN_KEY = "pmp-shelf-return-v1";

export type ShelfReturnState = {
  tab: string;
  categoryPath: string[];
  selectedAuthorName: string | null;
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
    const parsed = JSON.parse(raw) as ShelfReturnState;
    if (!parsed || !Array.isArray(parsed.categoryPath)) return null;
    return {
      tab: parsed.tab || "Category",
      categoryPath: parsed.categoryPath.filter((part) => typeof part === "string" && part.length > 0),
      selectedAuthorName: parsed.selectedAuthorName ?? null,
    };
  } catch {
    return null;
  }
}

export const SHELF_RETURN_HREF = "/?restoreShelf=1";
