/** Canonical library categories shown on the home shelf and stored on books. */
export const BOOK_CATEGORIES = ["Kid", "IT", "PersonalDevelopment"] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const HOME_CATEGORY_PICKER = [
  { id: "Kid", label: "Kid", icon: "🧸", coverColorStart: "#fb923c", coverColorMiddle: "#f97316", coverColorEnd: "#ea580c" },
  { id: "IT", label: "IT", icon: "💻", coverColorStart: "#38bdf8", coverColorMiddle: "#0ea5e9", coverColorEnd: "#0369a1" },
  {
    id: "PersonalDevelopment",
    label: "PersonalDevelopment",
    icon: "🌱",
    coverColorStart: "#86efac",
    coverColorMiddle: "#22c55e",
    coverColorEnd: "#15803d",
  },
  { id: "Author", label: "Author", icon: "👤", coverColorStart: "#c4b5fd", coverColorMiddle: "#8b5cf6", coverColorEnd: "#6d28d9" },
] as const;

export type HomeCategoryPickerId = (typeof HOME_CATEGORY_PICKER)[number]["id"];

/** Old catalog value — mapped on read and rewritten in IndexedDB. */
const LEGACY_CATEGORY_MAP: Record<string, string> = {
  Fiction: "PersonalDevelopment",
};

export function normalizeBookCategory(category: string | null | undefined): string {
  const raw = (category ?? "").trim();
  if (!raw) return raw;
  return LEGACY_CATEGORY_MAP[raw] ?? raw;
}

export function isBookCategory(value: string): value is BookCategory {
  return (BOOK_CATEGORIES as readonly string[]).includes(value);
}
