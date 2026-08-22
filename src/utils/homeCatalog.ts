import type { Course } from "../data/courses";
import type { ShowcaseExcerpt } from "./showcasePicker";
import { normalizeBookCategory } from "./bookCategories";

const SHOWCASE_CACHE_KEY = "pmp-showcase-excerpt-v1";

export interface ShowcaseCachePayload {
  courseId: string;
  excerpt: ShowcaseExcerpt;
  savedAt: number;
}

export function readShowcaseCache(): ShowcaseCachePayload | null {
  try {
    const raw = sessionStorage.getItem(SHOWCASE_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ShowcaseCachePayload;
    if (!parsed?.excerpt?.bookTitle || !parsed.courseId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeShowcaseCache(courseId: string, excerpt: ShowcaseExcerpt): void {
  try {
    const payload: ShowcaseCachePayload = {
      courseId,
      excerpt,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(SHOWCASE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota */
  }
}

/** Lightweight home shelf catalog (optional deploy artifact). */
export interface HomeCatalogFile {
  exportedAt?: string;
  courses: Course[];
}

export async function fetchHomeCatalogSummaries(): Promise<Course[] | null> {
  try {
    const response = await fetch("/data/home-catalog.json", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as HomeCatalogFile;
    if (!Array.isArray(data.courses) || data.courses.length === 0) {
      return null;
    }
    return data.courses.map((course) => ({
      ...course,
      category: normalizeBookCategory(course.category),
      chapters: [],
      stepCount: course.stepCount ?? 0,
    }));
  } catch {
    return null;
  }
}
