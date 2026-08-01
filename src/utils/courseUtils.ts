import type { CourseStep } from "../data/courses";
import type { PracticeTask } from "../data/tasks";
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

  // Mirror into ProgressPort when a signed-in user is bound (AccountProvider).
  if (progressBridge && progressUserId) {
    void progressBridge
      .setLastPage(progressUserId, courseId, { lastStepIndex: stepIndex })
      .catch((error) => console.warn("Progress sync failed:", error));
  }
}

let progressBridge: ProgressPort | null = null;
let progressUserId: string | null = null;

/**
 * AccountProvider binds the active ProgressPort + userId.
 * Guests keep using localStorage-only keys above.
 */
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
