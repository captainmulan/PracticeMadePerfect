/** Suggested tags for Admin; any comma-separated value can be stored. */
export const BOOK_CATEGORIES = [
  "Kid",
  "IT",
  "PersonalDevelopment",
  "Language",
  "Migration",
  "Myanmar",
  "Comic",
  "Fiction",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const AUTHOR_SHELF_ID = "Author";
export const LANGUAGE_PARENT_ID = "Language";

/** Taught-language tags nested under Language (flag tiles). Not MM/Myanmar written-lang. */
export const LANGUAGE_SUBCATEGORY_FLAGS: Record<string, { label: string; icon: string; flagSrc?: string }> = {
  Eng: { label: "English", icon: "🇬🇧", flagSrc: "/flags/eng.webp" },
  Jap: { label: "Japanese", icon: "🇯🇵", flagSrc: "/flags/jp.webp" },
  Thai: { label: "Thai", icon: "🇹🇭", flagSrc: "/flags/th.webp" },
  Chi: { label: "Chinese", icon: "🇨🇳", flagSrc: "/flags/cn.svg" },
  Cn: { label: "Chinese", icon: "🇨🇳", flagSrc: "/flags/cn.svg" },
  Kor: { label: "Korean", icon: "🇰🇷", flagSrc: "/flags/kr.svg" },
  Ko: { label: "Korean", icon: "🇰🇷", flagSrc: "/flags/kr.svg" },
  Fr: { label: "French", icon: "🇫🇷" },
  De: { label: "German", icon: "🇩🇪" },
  Es: { label: "Spanish", icon: "🇪🇸" },
  Hi: { label: "Hindi", icon: "🇮🇳" },
  Ru: { label: "Russian", icon: "🇷🇺" },
  Vie: { label: "Vietnamese", icon: "🇻🇳" },
  Id: { label: "Indonesian", icon: "🇮🇩" },
};

export const CATEGORY_FOLDER_COVERS: Record<string, string> = {
  "Shwe Thway": "/flags/shwe-thway.webp",
  Tootpee: "/flags/tootpee.webp",
};

const LANGUAGE_SUB_ORDER = ["Eng", "Jap", "Thai", "Chi", "Cn", "Kor", "Ko", "Fr", "De", "Es", "Hi", "Ru", "Vie", "Id"];

export function isLanguageSubcategoryTag(tag: string): boolean {
  return Object.prototype.hasOwnProperty.call(LANGUAGE_SUBCATEGORY_FLAGS, tag);
}

export function collectNestedLanguageSubTags(courses: Array<{ category?: string | null }>): string[] {
  const seen = new Set<string>();
  for (const course of courses) {
    if (!bookHasCategoryTag(course.category, LANGUAGE_PARENT_ID)) {
      continue;
    }
    for (const tag of parseCategoryTags(course.category)) {
      if (isLanguageSubcategoryTag(tag)) {
        seen.add(tag);
      }
    }
  }
  return LANGUAGE_SUB_ORDER.filter((tag) => seen.has(tag)).concat(
    [...seen].filter((tag) => !LANGUAGE_SUB_ORDER.includes(tag)),
  );
}

const DEFAULT_CATEGORY_STYLE = {
  icon: "📚",
  coverColorStart: "#cbd5e1",
  coverColorMiddle: "#94a3b8",
  coverColorEnd: "#64748b",
};

const CATEGORY_STYLES: Record<
  string,
  { icon: string; coverColorStart: string; coverColorMiddle: string; coverColorEnd: string }
> = {
  Kid: { icon: "🧸", coverColorStart: "#fb923c", coverColorMiddle: "#f97316", coverColorEnd: "#ea580c" },
  IT: { icon: "💻", coverColorStart: "#38bdf8", coverColorMiddle: "#0ea5e9", coverColorEnd: "#0369a1" },
  PersonalDevelopment: { icon: "🌱", coverColorStart: "#86efac", coverColorMiddle: "#22c55e", coverColorEnd: "#15803d" },
  Language: { icon: "🌐", coverColorStart: "#67e8f9", coverColorMiddle: "#06b6d4", coverColorEnd: "#0e7490" },
  MM: { icon: "🇲🇲", coverColorStart: "#fca5a5", coverColorMiddle: "#ef4444", coverColorEnd: "#b91c1c" },
  Eng: { icon: "🇬🇧", coverColorStart: "#93c5fd", coverColorMiddle: "#3b82f6", coverColorEnd: "#1d4ed8" },
  Jap: { icon: "🇯🇵", coverColorStart: "#fecaca", coverColorMiddle: "#f87171", coverColorEnd: "#b91c1c" },
  Thai: { icon: "🇹🇭", coverColorStart: "#99f6e4", coverColorMiddle: "#2dd4bf", coverColorEnd: "#0f766e" },
  Migration: { icon: "🧳", coverColorStart: "#fdba74", coverColorMiddle: "#fb923c", coverColorEnd: "#c2410c" },
  Myanmar: { icon: "🇲🇲", coverColorStart: "#fca5a5", coverColorMiddle: "#ef4444", coverColorEnd: "#b91c1c" },
  Comic: { icon: "💥", coverColorStart: "#fde047", coverColorMiddle: "#facc15", coverColorEnd: "#ca8a04" },
  Other: { icon: "📦", coverColorStart: "#cbd5e1", coverColorMiddle: "#94a3b8", coverColorEnd: "#64748b" },
  AI: { icon: "🤖", coverColorStart: "#c4b5fd", coverColorMiddle: "#8b5cf6", coverColorEnd: "#6d28d9" },
  "Shwe Thway": { icon: "📒", coverColorStart: "#fde047", coverColorMiddle: "#facc15", coverColorEnd: "#ca8a04" },
  Tootpee: { icon: "📚", coverColorStart: "#f97316", coverColorMiddle: "#ea580c", coverColorEnd: "#c2410c" },
  Author: { icon: "👤", coverColorStart: "#c4b5fd", coverColorMiddle: "#8b5cf6", coverColorEnd: "#6d28d9" },
  Fiction: { icon: "📖", coverColorStart: "#fda4af", coverColorMiddle: "#fb7185", coverColorEnd: "#e11d48" },
};

const STYLE_PALETTE = [
  { coverColorStart: "#f9a8d4", coverColorMiddle: "#ec4899", coverColorEnd: "#be185d" },
  { coverColorStart: "#a5b4fc", coverColorMiddle: "#6366f1", coverColorEnd: "#4338ca" },
  { coverColorStart: "#5eead4", coverColorMiddle: "#14b8a6", coverColorEnd: "#0f766e" },
  { coverColorStart: "#fdba74", coverColorMiddle: "#f97316", coverColorEnd: "#c2410c" },
  { coverColorStart: "#d8b4fe", coverColorMiddle: "#a855f7", coverColorEnd: "#7e22ce" },
];

function normalizeTag(tag: string): string {
  return tag.trim();
}

/** Split IndexedDB category column into tags (comma-separated). */
export function parseCategoryTags(category: string | null | undefined): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of String(category ?? "").split(",")) {
    const tag = normalizeTag(part);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function serializeCategoryTags(tags: string[]): string {
  return parseCategoryTags(tags.join(",")).join(", ");
}

/** Normalize a full category cell (one or many tags) for storage. */
export function normalizeBookCategory(category: string | null | undefined): string {
  return serializeCategoryTags(parseCategoryTags(category));
}

export function bookHasCategoryTag(category: string | null | undefined, tag: string): boolean {
  const wanted = normalizeTag(tag);
  if (!wanted) return false;
  return parseCategoryTags(category).some((item) => item.toLowerCase() === wanted.toLowerCase());
}

export function categoriesOverlap(a: string | null | undefined, b: string | null | undefined): boolean {
  const tagsB = new Set(parseCategoryTags(b).map((tag) => tag.toLowerCase()));
  if (tagsB.size === 0) return false;
  return parseCategoryTags(a).some((tag) => tagsB.has(tag.toLowerCase()));
}

export function collectCategoryTagsFromCourses(courses: Array<{ category?: string | null }>): string[] {
  const nested = new Set(collectNestedLanguageSubTags(courses).map((tag) => tag.toLowerCase()));
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const course of courses) {
    for (const tag of parseCategoryTags(course.category)) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      if (nested.has(key)) continue;
      if (key === "mm") continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  if (
    courses.some((course) => bookHasCategoryTag(course.category, LANGUAGE_PARENT_ID)) &&
    !tags.some((tag) => tag.toLowerCase() === LANGUAGE_PARENT_ID.toLowerCase())
  ) {
    tags.push(LANGUAGE_PARENT_ID);
  }
  return tags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function formatCategoryLabel(tag: string): string {
  if (tag === "PersonalDevelopment") return "Personal Dev";
  if (tag === "Shwe Thway") return "Shwe Thway";
  return LANGUAGE_SUBCATEGORY_FLAGS[tag]?.label ?? tag;
}

export type CategoryCourse = {
  id?: string;
  title?: string;
  category?: string | null;
  cat1?: string | null;
  cat2?: string | null;
  cat3?: string | null;
  cat4?: string | null;
};

export function inferCategoryLevels(course: CategoryCourse): [string, string, string, string] {
  if (course.cat1?.trim()) {
    return [
      course.cat1.trim(),
      (course.cat2 ?? "").trim(),
      (course.cat3 ?? "").trim(),
      (course.cat4 ?? "").trim(),
    ];
  }
  const tags = parseCategoryTags(course.category);
  const id = String(course.id ?? "").toLowerCase();
  const has = (name: string) => tags.some((tag) => tag.toLowerCase() === name.toLowerCase());

  if (id.includes("shwe-thway") || has("Comic") && has("Kid") && id.includes("shwe")) {
    return ["Comic", "Kid", "Shwe Thway", ""];
  }
  if (has("Language")) {
    const lang = tags.find((tag) => isLanguageSubcategoryTag(tag)) ?? "";
    return ["Language", lang, "", ""];
  }
  if (has("AI")) {
    return ["IT", has("Kid") ? "Kid" : "Other", "AI", ""];
  }
  if (has("IT") && has("Kid")) {
    return ["IT", "Kid", "", ""];
  }
  if (has("IT")) {
    return ["IT", "Other", "", ""];
  }
  if (has("Fiction")) {
    return ["Fiction", "", "", ""];
  }
  if (has("PersonalDevelopment")) {
    return ["PersonalDevelopment", "", "", ""];
  }
  if (has("Comic") && has("Kid")) {
    return ["Comic", "Kid", "", ""];
  }
  if (has("Comic")) {
    return ["Comic", "Other", "", ""];
  }
  if (has("Kid")) {
    return ["Comic", "Kid", "", ""];
  }
  return [tags[0] ?? "", tags[1] ?? "", tags[2] ?? "", tags[3] ?? ""];
}

export function getCategoryLevels(course: CategoryCourse): string[] {
  return inferCategoryLevels(course).filter(Boolean);
}

export function formatCategoryPath(course: CategoryCourse): string {
  return getCategoryLevels(course).map(formatCategoryLabel).join(" > ") || "—";
}

export function courseMatchesCategoryPath(course: CategoryCourse, path: string[]): boolean {
  const levels = getCategoryLevels(course);
  if (path.length === 0) return true;
  if (levels.length < path.length) return false;
  return path.every((part, index) => levels[index]?.toLowerCase() === part.toLowerCase());
}

export function courseIsExactCategoryPath(course: CategoryCourse, path: string[]): boolean {
  const levels = getCategoryLevels(course);
  return levels.length === path.length && courseMatchesCategoryPath(course, path);
}

export function collectCategoryChildren(courses: CategoryCourse[], path: string[]): string[] {
  const seen = new Set<string>();
  const children: string[] = [];
  for (const course of courses) {
    if (!courseMatchesCategoryPath(course, path)) continue;
    const levels = getCategoryLevels(course);
    const next = levels[path.length];
    if (!next) continue;
    const key = next.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    children.push(next);
  }
  const rank = ["Kid", "Other", "Eng", "Jap", "Thai", "AI", "Shwe Thway"];
  return children.sort((a, b) => {
    const ia = rank.indexOf(a);
    const ib = rank.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });
}

export function collectTopCategoryNames(courses: CategoryCourse[]): string[] {
  return collectCategoryChildren(courses, []);
}

function hashTag(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCategoryShelfStyle(tag: string) {
  const known = CATEGORY_STYLES[tag];
  if (known) return known;
  const palette = STYLE_PALETTE[hashTag(tag) % STYLE_PALETTE.length];
  return { icon: DEFAULT_CATEGORY_STYLE.icon, ...palette };
}

export function isBookCategory(value: string): value is BookCategory {
  return (BOOK_CATEGORIES as readonly string[]).includes(value);
}
