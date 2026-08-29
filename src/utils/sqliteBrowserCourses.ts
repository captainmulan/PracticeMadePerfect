import type { Course, CourseStep } from "../data/courses";
import { FICTION_BOOK_ID, FICTION_BOOK } from "../data/fictionBook";
import {
  getCourses as getCoursesFromIndexedDb,
  getCourseSummaries as getCourseSummariesFromIndexedDb,
  getCourseById as getCourseByIdFromIndexedDb,
  getCourseOutlineById as getCourseOutlineByIdFromIndexedDb,
  getCourseStepById as getCourseStepByIdFromIndexedDb,
  saveCourse as saveCourseToIndexedDb,
  deleteCourse as deleteCourseFromIndexedDb,
  migrateFromSqlJs,
  patchCourseIndexes,
} from "./indexedDb";

// Keep these interfaces for compatibility, though we might not use them anymore
export interface CourseRow {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  courseIndex: number;
  category: string;
  pIndex?: number | null;
  scIndex?: number | null;
  sIndex?: number | null;
  coverWidth?: number | null;
  coverHeight?: number | null;
  artifactType?: string | null;
  raw: string;
}

export interface ChapterRow {
  id: string;
  courseId: string;
  title: string;
  chapterIndex: number;
  raw: string;
}

export interface CourseStepRow {
  id: string;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  pageIndex: number;
  stepType: string;
  title: string;
  raw: string;
}

// Keep the old functions as no-ops or stubs for compatibility, but export the new IndexedDB functions instead!

// Helper functions for assembling courses (still useful!)
export function flattenCourseSteps(course: Course): any[] {
  return course.chapters.flatMap((chapter) =>
    chapter.steps.map((step) => ({
      ...step,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterIndex: chapter.chapterIndex,
    })),
  );
}

export function rebuildChaptersFromSteps(courseId: string, steps: any[]): any[] {
  const chaptersById = new Map<string, any>();
  steps.forEach((step) => {
    const chapterId = step.chapterId;
    if (!chaptersById.has(chapterId)) {
      chaptersById.set(chapterId, {
        id: chapterId,
        courseId,
        title: step.chapterTitle || "New Chapter",
        chapterIndex: step.chapterIndex || 0,
        steps: [],
      });
    }
    chaptersById.get(chapterId)!.steps.push(step);
  });
  return Array.from(chaptersById.values()).sort((a, b) => a.chapterIndex - b.chapterIndex);
}

export function toCourseSummary(course: Course): Course {
  const { chapters: _chapters, ...meta } = course;
  return {
    ...meta,
    stepCount: meta.stepCount ?? course.chapters.reduce((count, chapter) => count + chapter.steps.length, 0),
    chapters: [],
  };
}

// Now our main functions, using IndexedDB
export async function loadCourseSummariesFromBrowserDb(): Promise<Course[]> {
  const existing = await getCourseSummariesFromIndexedDb();
  if (existing.length > 0) {
    void migrateFromSqlJs();
    return existing;
  }
  await migrateFromSqlJs();
  return getCourseSummariesFromIndexedDb();
}

export async function loadFullCourseById(courseId: string): Promise<Course | null> {
  await migrateFromSqlJs();
  return getCourseByIdFromIndexedDb(courseId);
}

export async function loadCourseOutlineById(courseId: string): Promise<Course | null> {
  await migrateFromSqlJs();
  return getCourseOutlineByIdFromIndexedDb(courseId);
}

export async function loadCourseStepById(stepId: string): Promise<CourseStep | null> {
  await migrateFromSqlJs();
  return getCourseStepByIdFromIndexedDb(stepId);
}

export async function loadCoursesFromBrowserDb(): Promise<Course[]> {
  await migrateFromSqlJs(); // Ensure migration is done first!
  return await getCoursesFromIndexedDb();
}

export async function loadCourseById(courseId: string): Promise<Course | null> {
  return loadFullCourseById(courseId);
}

export async function persistCourses(courses: Course[]): Promise<void> {
  // Delete all existing courses first and save the new ones
  // But for now, let's just save each course one by one
  for (const course of courses) {
    await saveCourseToIndexedDb(course);
  }
}

export async function persistCourse(course: Course): Promise<void> {
  await saveCourseToIndexedDb(course);
}

export async function persistCourseIndexes(
  courseId: string,
  indexes: { pIndex?: number; scIndex?: number; sIndex?: number },
): Promise<void> {
  await patchCourseIndexes(courseId, indexes);
}

export async function reloadCourses(): Promise<Course[]> {
  return await loadCoursesFromBrowserDb();
}

export async function removeCourse(courseId: string): Promise<void> {
  await deleteCourseFromIndexedDb(courseId);
}

// Keep ensureCoursesSeeded as a no-op for compatibility, since we now do migration in loadCoursesFromBrowserDb
export async function ensureCoursesSeeded(): Promise<void> {
  await migrateFromSqlJs();
}

// Keep the rest of the functions as no-ops to prevent breaking changes
export function ensureCourseSchema(): void {
  // No-op for IndexedDB, we handle schema in onupgradeneeded
}

export function saveCourseBundleToDb(): void {
  // No-op
}

export function deleteCourseFromDb(): void {
  // No-op
}

export function saveAllCoursesToDb(): void {
  // No-op
}

export function queryCourseRows(): CourseRow[] {
  return [];
}

export function queryChapterRows(): ChapterRow[] {
  return [];
}

export function queryCourseStepRows(): CourseStepRow[] {
  return [];
}

export function assembleCourses(): Course[] {
  return [];
}

