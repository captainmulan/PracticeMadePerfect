import type { Course, CourseChapter, CourseStep } from "../data/courses";
import { flattenCourseSteps } from "../data/courses";

export interface ParsedHtmlPage {
  fileName: string;
  relativePath: string;
  pageNumber: number;
  sortOrder: number;
  title: string;
  content: string;
}

export interface BookImportPreview {
  folderPath: string;
  folderName: string;
  bookId: string;
  bookTitle: string;
  pages: ParsedHtmlPage[];
  existingBookId?: string;
}

export interface ExistingBookPageMapping {
  fileName: string;
  pageNumber: number;
  stepTitle?: string;
  matched: boolean;
}

export interface ExistingBookMergeResult {
  course: Course;
  updatedCount: number;
  unmatchedFiles: string[];
  mappings: ExistingBookPageMapping[];
}

function findStepForPageNumber(steps: CourseStep[], pageNumber: number): CourseStep | undefined {
  const byStepIndex = steps.find((step) => step.stepIndex === pageNumber);
  if (byStepIndex) return byStepIndex;

  const byZeroBasedIndex = steps.find((step) => step.stepIndex === pageNumber - 1);
  if (byZeroBasedIndex) return byZeroBasedIndex;

  if (pageNumber >= 1 && pageNumber <= steps.length) {
    return steps[pageNumber - 1];
  }

  return undefined;
}

export function previewExistingBookPageMappings(
  course: Course,
  pages: ParsedHtmlPage[],
): ExistingBookPageMapping[] {
  const steps = flattenCourseSteps(course);

  return pages.map((page) => {
    const pageNumber = resolvePageNumberFromFileName(page.fileName) ??
      (page.pageNumber !== Number.MAX_SAFE_INTEGER ? page.pageNumber : null);

    if (pageNumber == null) {
      return { fileName: page.fileName, pageNumber: -1, matched: false };
    }

    const step = findStepForPageNumber(steps, pageNumber);
    return {
      fileName: page.fileName,
      pageNumber,
      stepTitle: step?.title,
      matched: Boolean(step && step.stepType === "html"),
    };
  });
}

export function mergeHtmlPagesIntoExistingCourse(
  course: Course,
  pages: ParsedHtmlPage[],
): ExistingBookMergeResult {
  const steps = flattenCourseSteps(course);
  const contentUpdates = new Map<string, string>();
  const titleUpdates = new Map<string, string>();
  const unmatchedFiles: string[] = [];
  const mappings: ExistingBookPageMapping[] = [];
  let updatedCount = 0;

  for (const page of pages) {
    const pageNumber = resolvePageNumberFromFileName(page.fileName) ??
      (page.pageNumber !== Number.MAX_SAFE_INTEGER ? page.pageNumber : null);

    if (pageNumber == null) {
      unmatchedFiles.push(page.fileName);
      mappings.push({ fileName: page.fileName, pageNumber: -1, matched: false });
      continue;
    }

    const step = findStepForPageNumber(steps, pageNumber);
    if (!step || step.stepType !== "html") {
      unmatchedFiles.push(page.fileName);
      mappings.push({ fileName: page.fileName, pageNumber, matched: false });
      continue;
    }

    contentUpdates.set(step.id, page.content);
    if (page.title) {
      titleUpdates.set(step.id, page.title);
    }
    updatedCount += 1;
    mappings.push({
      fileName: page.fileName,
      pageNumber,
      stepTitle: step.title,
      matched: true,
    });
  }

  const mergedCourse: Course = {
    ...course,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      steps: chapter.steps.map((step) => {
        if (!contentUpdates.has(step.id)) {
          return step;
        }
        return {
          ...step,
          contentHtml: contentUpdates.get(step.id),
          title: titleUpdates.get(step.id) ?? step.title,
        };
      }),
    })),
  };

  return {
    course: mergedCourse,
    updatedCount,
    unmatchedFiles,
    mappings,
  };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function humanizeSegment(value: string) {
  return value.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function resolvePageNumberFromFileName(fileName: string): number | null {
  const base = fileName.replace(/\.html?$/i, "");
  const numericMatch = base.match(/^(\d+)/);
  if (numericMatch) {
    return Number.parseInt(numericMatch[0], 10);
  }

  const pageMatch = base.match(/^page[_\-.]?(\d+)$/i);
  if (pageMatch) {
    return Number.parseInt(pageMatch[1], 10);
  }

  return null;
}

export function parseHtmlFileName(fileName: string): { pageNumber: number; sortOrder: number; title: string } {
  const base = fileName.replace(/\.html?$/i, "");
  const resolved = resolvePageNumberFromFileName(fileName);
  if (resolved != null) {
    const numericMatch = base.match(/^(\d+)/);
    const remainder = numericMatch
      ? base.slice(numericMatch[0].length).replace(/^[_\-.]+/, "")
      : base.replace(/^page[_\-.]?\d+/i, "").replace(/^[_\-.]+/, "");
    const title = humanizeSegment(remainder) || `Page ${resolved}`;
    return { pageNumber: resolved, sortOrder: resolved, title };
  }

  return {
    pageNumber: Number.MAX_SAFE_INTEGER,
    sortOrder: Number.MAX_SAFE_INTEGER,
    title: humanizeSegment(base) || base,
  };
}

export function getFolderInfoFromFiles(files: File[]): { folderPath: string; folderName: string } {
  const firstPath = files.find((file) => file.webkitRelativePath)?.webkitRelativePath;
  if (!firstPath) {
    return { folderPath: "", folderName: "Imported Book" };
  }

  const segments = firstPath.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return { folderPath: firstPath, folderName: "Imported Book" };
  }

  const folderName = segments[segments.length - 2];
  const folderPath = segments.slice(0, -1).join("/");
  return { folderPath, folderName };
}

export async function readHtmlPagesFromFiles(files: File[]): Promise<ParsedHtmlPage[]> {
  const htmlFiles = files.filter((file) => /\.html?$/i.test(file.name));
  const pages = await Promise.all(
    htmlFiles.map(async (file) => {
      const parsed = parseHtmlFileName(file.name);
      return {
        fileName: file.name,
        relativePath: file.webkitRelativePath || file.name,
        pageNumber: parsed.pageNumber,
        sortOrder: parsed.sortOrder,
        title: parsed.title,
        content: await file.text(),
      };
    }),
  );

  return pages.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.fileName.localeCompare(b.fileName, undefined, { numeric: true });
  });
}

export function createDefaultBookFields(courseIndex: number, title: string, id: string, category = "IT") {
  return {
    id,
    title,
    description: "",
    color: "#2563eb",
    coverColorStart: "#2563eb",
    coverColorMiddle: "#2563eb",
    coverColorEnd: "#2563eb",
    coverWidth: 100,
    coverHeight: 150,
    icon: "📘",
    iconColorStart: "#fff",
    iconColorMiddle: "#fff",
    iconColorEnd: "#fff",
    iconSize: 80,
    titleFontSize: 24,
    titleFontWeight: "bold",
    titleColor: "#ffffff",
    titlePosition: "bottom-left" as const,
    titleTextAlign: "left" as const,
    iconPosition: "center-center" as const,
    courseIndex,
    category,
    artifactType: "book" as const,
  };
}

function makeHtmlPageChapter(
  courseId: string,
  page: ParsedHtmlPage,
  fallbackIndex: number,
  stamp: number,
): CourseChapter {
  const pageNumber = page.pageNumber !== Number.MAX_SAFE_INTEGER ? page.pageNumber : fallbackIndex;
  const chapterId = `${courseId}-ch-import-${stamp}-${pageNumber}`;
  const stepId = `${chapterId}-step-0`;
  const pageLabel = `Page ${pageNumber}`;

  const step: CourseStep = {
    id: stepId,
    courseId,
    chapterId,
    chapterTitle: pageLabel,
    chapterIndex: 0,
    stepIndex: pageNumber,
    stepType: "html",
    title: page.title,
    description: "",
    contentHtml: page.content,
  };

  return {
    id: chapterId,
    courseId,
    chapterIndex: 0,
    title: pageLabel,
    steps: [step],
  };
}

export function buildCourseFromHtmlPages(
  folderName: string,
  pages: ParsedHtmlPage[],
  courseIndex: number,
  category = "IT",
  bookIdOverride?: string,
): Course {
  const bookId = bookIdOverride?.trim() || slugify(folderName) || `book-${Date.now()}`;
  const stamp = Date.now();
  let fallbackIndex = 1;
  const chapters = pages.map((page) => {
    const chapter = makeHtmlPageChapter(bookId, page, fallbackIndex, stamp);
    if (page.pageNumber === Number.MAX_SAFE_INTEGER) {
      fallbackIndex += 1;
    }
    return chapter;
  });

  return {
    ...createDefaultBookFields(courseIndex, folderName, bookId, category),
    chapters,
  };
}

export async function buildBookImportPreview(
  files: File[],
  _courseIndex: number,
  existingBookIds: string[],
): Promise<BookImportPreview | null> {
  const pages = await readHtmlPagesFromFiles(files);
  if (pages.length === 0) {
    return null;
  }

  const { folderPath, folderName } = getFolderInfoFromFiles(files);
  const bookId = slugify(folderName) || `book-${Date.now()}`;

  return {
    folderPath,
    folderName,
    bookId,
    bookTitle: folderName,
    pages,
    existingBookId: existingBookIds.includes(bookId) ? bookId : undefined,
  };
}

export function buildCourseFromPreview(
  preview: BookImportPreview,
  courseIndex: number,
  category: string,
  bookIdOverride?: string,
): Course {
  return buildCourseFromHtmlPages(
    preview.bookTitle,
    preview.pages,
    courseIndex,
    category,
    bookIdOverride || preview.bookId,
  );
}
