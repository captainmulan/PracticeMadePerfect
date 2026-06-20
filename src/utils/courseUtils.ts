import type { CourseStep } from "../data/courses";
import type { PracticeTask } from "../data/tasks";

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
  };
}

export function getCourseProgressKey(courseId: string) {
  return `pmp-course-progress-${courseId}`;
}

export function loadCourseProgress(courseId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(getCourseProgressKey(courseId));
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function saveCourseProgress(courseId: string, stepIndex: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getCourseProgressKey(courseId), String(stepIndex));
}
