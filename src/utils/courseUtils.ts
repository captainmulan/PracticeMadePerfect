import type { CourseStep } from "../data/courses";
import type { PracticeTask } from "../data/tasks";
import type { BookBookmark } from "../services/types/account";
import type { ProgressPort } from "../services/ports/progressPort";

export function courseStepToPracticeTask(step: CourseStep, category = "react"): PracticeTask {
  return {
    id: step.id,
    category,
    title: step.title,
    description: step.description,
    checklist: step.checklist ?? [],
    type: step.codeType ?? "code",
    starterCode: step.starterCode,
    verificationKeywords: step.verificationKeywords,
    detailedInstructions: step.detailedInstructions,
    page: step.page,
  };
}

export function getCourseProgressKey(courseId: string) {
  return `pmp-course-progress-${courseId}`;
}

/** Guest / legacy localStorage keys — always kept so existing readers keep working. */
export function loadCourseProgress(courseId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(getCourseProgressKey(courseId));
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function saveCourseProgress(courseId: string, stepIndex: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getCourseProgressKey(courseId), String(stepIndex));

  if (progressBridge && progressUserId) {
    void progressBridge
      .setLastPage(progressUserId, courseId, { lastStepIndex: stepIndex })
      .catch((error) => console.warn("Progress sync failed:", error));
  }
}

/** Synthetic user id used for users who haven't signed in — bookmarks still work on-device. */
export const GUEST_USER_ID = "guest-local";

const GUEST_ID_KEY = "pmp-guest-user-id-v1";

export function getOrCreateGuestUserId(): string {
  if (typeof window === "undefined") return GUEST_USER_ID;
  try {
    const existing = window.localStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;
    const generated = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    window.localStorage.setItem(GUEST_ID_KEY, generated);
    return generated;
  } catch {
    return GUEST_USER_ID;
  }
}

function getEffectiveUserId(): string {
  return progressUserId ?? getOrCreateGuestUserId();
}

let progressBridge: ProgressPort | null = null;
let progressUserId: string | null = null;

export function bindProgressBridge(port: ProgressPort | null, userId: string | null) {
  progressBridge = port;
  progressUserId = userId;
}

/** Prefer cloud/local port progress for signed-in users; fall back to legacy key. */
export async function loadCourseProgressForUser(
  courseId: string,
  userId: string | null | undefined,
): Promise<number> {
  if (userId && progressBridge) {
    try {
      const book = await progressBridge.getBookProgress(userId, courseId);
      if (book && Number.isFinite(book.lastStepIndex) && book.lastStepIndex >= 0) {
        return book.lastStepIndex;
      }
    } catch (error) {
      console.warn("Progress load failed, using local fallback:", error);
    }
  }
  return loadCourseProgress(courseId);
}

function localStorageBookmarksKey(userId: string, bookId?: string | null): string {
  return bookId ? `pmp-bookmarks-${userId}-${bookId}` : `pmp-bookmarks-${userId}-all`;
}

function readLocalBookmarks(userId: string, bookId?: string | null): BookBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localStorageBookmarksKey(userId, bookId ?? null));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalBookmarks(userId: string, list: BookBookmark[], bookId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(localStorageBookmarksKey(userId, bookId ?? null), JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function bookmarkId(bookId: string, stepIndex: number): string {
  return `${bookId}::step::${stepIndex}`;
}

export async function getBookmarksForCurrentUser(bookId: string): Promise<BookBookmark[]> {
  const userId = getEffectiveUserId();
  if (progressBridge && progressUserId) {
    try {
      return await progressBridge.getBookmarks(progressUserId, bookId);
    } catch (error) {
      console.warn("Bookmark load via port failed, using local fallback:", error);
    }
  }
  return readLocalBookmarks(userId, bookId).sort((a, b) => a.stepIndex - b.stepIndex);
}

export async function isCurrentStepBookmarked(bookId: string, stepIndex: number): Promise<boolean> {
  const list = await getBookmarksForCurrentUser(bookId);
  const id = bookmarkId(bookId, stepIndex);
  return list.some((b) => b.id === id);
}

export async function toggleCurrentBookmark(input: {
  bookId: string;
  stepIndex: number;
  stepTitle?: string | null;
  note?: string | null;
}): Promise<{ created: BookBookmark | null; deleted: boolean; list: BookBookmark[] }> {
  const userId = getEffectiveUserId();
  const id = bookmarkId(input.bookId, input.stepIndex);

  if (progressBridge && progressUserId) {
    try {
      return await progressBridge.toggleBookmark(progressUserId, input);
    } catch (error) {
      console.warn("Bookmark toggle via port failed, using local fallback:", error);
    }
  }

  const list = readLocalBookmarks(userId, input.bookId);
  const existingIndex = list.findIndex((b) => b.id === id);
  if (existingIndex >= 0) {
    const removed = list.splice(existingIndex, 1)[0];
    writeLocalBookmarks(userId, list, input.bookId);
    return { created: null, deleted: true, list: [...list].sort((a, b) => a.stepIndex - b.stepIndex) };
  }
  const created: BookBookmark = {
    id,
    bookId: input.bookId,
    stepIndex: Math.max(0, Math.floor(input.stepIndex)),
    stepTitle: input.stepTitle ?? null,
    note: input.note ?? null,
    createdAt: new Date().toISOString(),
  };
  list.push(created);
  writeLocalBookmarks(userId, list, input.bookId);
  return { created, deleted: false, list: [...list].sort((a, b) => a.stepIndex - b.stepIndex) };
}

export async function removeBookmarkForCurrentUser(
  bookId: string,
  bookmarkIdInput: string,
): Promise<BookBookmark[]> {
  const userId = getEffectiveUserId();
  if (progressBridge && progressUserId) {
    try {
      return await progressBridge.removeBookmark(progressUserId, bookmarkIdInput);
    } catch (error) {
      console.warn("Bookmark remove via port failed, using local fallback:", error);
    }
  }
  const list = readLocalBookmarks(userId, bookId).filter((b) => b.id !== bookmarkIdInput);
  writeLocalBookmarks(userId, list, bookId);
  return list.sort((a, b) => a.stepIndex - b.stepIndex);
}

export function currentUserHasAccount(): boolean {
  return Boolean(progressUserId);
}
