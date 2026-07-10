import type { Database } from "sql.js";
import type { Course, CourseChapter, CourseStep } from "../data/courses";
import { DEFAULT_COURSES } from "../data/courses";
import { FICTION_BOOK_ID, FICTION_BOOK } from "../data/fictionBook";
import { openBrowserDb, persistBrowserDbToLocalStorage, resetBrowserDbCache } from "./sqliteBrowserDb";

export interface CourseRow {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  courseIndex: number;
  category: string;
  pIndex?: number | null;
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

function readRowNumber(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function readRowOptionalNumber(row: Record<string, unknown>, key: string): number | undefined {
  const value = row[key];
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function ensureCourseSchema(db: Database) {
  db.run(
    `CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      color TEXT,
      icon TEXT,
      course_index INTEGER,
      category TEXT,
      p_index INTEGER,
      cover_width INTEGER,
      cover_height INTEGER,
      artifact_type TEXT,
      raw TEXT
    )`,
  );
  // Add columns if they don't exist (for existing databases)
  try {
    db.run("ALTER TABLE courses ADD COLUMN category TEXT");
  } catch {
    // Ignore error if column already exists
  }
  try {
    db.run("ALTER TABLE courses ADD COLUMN cover_width INTEGER");
  } catch {
    // Ignore error if column already exists
  }
  try {
    db.run("ALTER TABLE courses ADD COLUMN cover_height INTEGER");
  } catch {
    // Ignore error if column already exists
  }  try {
    db.run("ALTER TABLE courses ADD COLUMN p_index INTEGER");
  } catch {
    // Ignore error if column already exists
  }
  try {
    db.run("ALTER TABLE courses ADD COLUMN artifact_type TEXT");
  } catch {
    // Ignore error if column already exists
  }
  db.run(
    `CREATE TABLE IF NOT EXISTS course_chapters (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT,
      chapter_index INTEGER,
      raw TEXT
    )`,
  );
  
  // Create new course_steps with page_index, or alter existing to add page_index
  db.run(
    `CREATE TABLE IF NOT EXISTS course_steps (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      chapter_id TEXT,
      chapter_title TEXT,
      chapter_index INTEGER,
      page_index INTEGER,
      step_type TEXT,
      title TEXT,
      raw TEXT
    )`,
  );
  
  // Try to add page_index column to existing course_steps table if missing
  try {
    db.run("ALTER TABLE course_steps ADD COLUMN page_index INTEGER");
    // Copy values from step_index to page_index if available
    db.run("UPDATE course_steps SET page_index = step_index WHERE page_index IS NULL AND step_index IS NOT NULL");
  } catch {
    // Ignore error if column already exists
  }
}

function countCourses(db: Database): number {
  const stmt = db.prepare("SELECT COUNT(*) AS c FROM courses");
  try {
    if (stmt.step()) {
      const row = stmt.getAsObject() as { c?: number | string };
      return Number(row.c ?? 0);
    }
  } finally {
    stmt.free();
  }
  return 0;
}

function courseToRows(course: Course): { course: CourseRow; chapters: ChapterRow[]; steps: CourseStepRow[] } {
  const courseRow: CourseRow = {
    id: course.id,
    title: course.title,
    description: course.description,
    color: course.color,
    icon: course.icon,
    courseIndex: course.courseIndex,
    category: course.category,
    pIndex: course.pIndex ?? null,
    // Coerce undefined -> null so sql.js binding doesn't receive undefined
    coverWidth: course.coverWidth ?? null,
    coverHeight: course.coverHeight ?? null,
    artifactType: course.artifactType,
    raw: JSON.stringify(course, null, 2),
  };

  const chapters: ChapterRow[] = course.chapters.map((chapter) => ({
    id: chapter.id,
    courseId: course.id,
    title: chapter.title,
    chapterIndex: chapter.chapterIndex,
    raw: JSON.stringify(chapter, null, 2),
  }));

  const steps: CourseStepRow[] = course.chapters.flatMap((chapter) =>
    chapter.steps.map((step) => ({
      id: step.id,
      courseId: course.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterIndex: chapter.chapterIndex,
      pageIndex: step.stepIndex,
      stepType: step.stepType,
      title: step.title,
      raw: JSON.stringify(step, null, 2),
    })),
  );

  return { course: courseRow, chapters, steps };
}

function parseStep(row: CourseStepRow): CourseStep {
  try {
    const parsed = JSON.parse(row.raw) as CourseStep;
    return {
      ...parsed,
      id: row.id,
      courseId: row.courseId,
      chapterId: row.chapterId,
      chapterTitle: row.chapterTitle,
      chapterIndex: row.chapterIndex,
      stepIndex: row.pageIndex,
      stepType: parsed.stepType ?? (row.stepType as CourseStep["stepType"]),
      title: parsed.title ?? row.title,
    };
  } catch {
    return {
      id: row.id,
      courseId: row.courseId,
      chapterId: row.chapterId,
      chapterTitle: row.chapterTitle,
      chapterIndex: row.chapterIndex,
      stepIndex: row.pageIndex,
      stepType: row.stepType as CourseStep["stepType"],
      title: row.title,
      description: "",
    };
  }
}

export function saveCourseBundleToDb(db: Database, course: Course) {
  ensureCourseSchema(db);
  db.run("BEGIN TRANSACTION;");

  const deleteSteps = db.prepare("DELETE FROM course_steps WHERE course_id = ?");
  const deleteChapters = db.prepare("DELETE FROM course_chapters WHERE course_id = ?");
  try {
    deleteSteps.bind([course.id]);
    deleteSteps.step();
    deleteSteps.reset();
    deleteChapters.bind([course.id]);
    deleteChapters.step();
  } finally {
    deleteSteps.free();
    deleteChapters.free();
  }

  const { course: courseRow, chapters, steps } = courseToRows(course);

  const courseStmt = db.prepare(
    "REPLACE INTO courses (id, title, description, color, icon, course_index, category, p_index, cover_width, cover_height, artifact_type, raw) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  try {
    courseStmt.bind([
      courseRow.id,
      courseRow.title,
      courseRow.description,
      courseRow.color,
      courseRow.icon,
      courseRow.courseIndex,
      courseRow.category,
      courseRow.pIndex ?? null,
      courseRow.coverWidth,
      courseRow.coverHeight,
      courseRow.artifactType,
      courseRow.raw,
    ]);
    courseStmt.step();
  } finally {
    courseStmt.free();
  }

  const chapterStmt = db.prepare(
    "REPLACE INTO course_chapters (id, course_id, title, chapter_index, raw) VALUES (?, ?, ?, ?, ?)",
  );
  try {
    chapters.forEach((chapter) => {
      chapterStmt.bind([chapter.id, chapter.courseId, chapter.title, chapter.chapterIndex, chapter.raw]);
      chapterStmt.step();
      chapterStmt.reset();
    });
  } finally {
    chapterStmt.free();
  }

  // Check if step_index still exists in the table, to support both
  let hasStepIndex = false;
  let hasPageIndex = false;
  try {
    const pragmaStmt = db.prepare("PRAGMA table_info(course_steps)");
    try {
      while (pragmaStmt.step()) {
        const col = pragmaStmt.getAsObject() as Record<string, unknown>;
        const colName = String(col.name);
        if (colName === "step_index") hasStepIndex = true;
        if (colName === "page_index") hasPageIndex = true;
      }
    } finally {
      pragmaStmt.free();
    }
  } catch {
    // Default - assume both are there
    hasStepIndex = true;
    hasPageIndex = true;
  }

  const insertCols: string[] = ["id", "course_id", "chapter_id", "chapter_title", "chapter_index", "step_type", "title", "raw"];
  const insertVals: string[] = ["?", "?", "?", "?", "?", "?", "?", "?"];
  const bindValues: (string | number | null)[] = [];

  if (hasPageIndex) {
    insertCols.push("page_index");
    insertVals.push("?");
  }
  if (hasStepIndex) {
    insertCols.push("step_index");
    insertVals.push("?");
  }

  const stepStmt = db.prepare(`REPLACE INTO course_steps (${insertCols.join(", ")}) VALUES (${insertVals.join(", ")})`);
  try {
    steps.forEach((step) => {
      const bindArr: (string | number | null)[] = [
        step.id,
        step.courseId,
        step.chapterId,
        step.chapterTitle,
        step.chapterIndex,
        step.stepType,
        step.title,
        step.raw,
      ];
      if (hasPageIndex) {
        bindArr.push(step.pageIndex);
      }
      if (hasStepIndex) {
        bindArr.push(step.pageIndex); // also set step_index for backward compatibility
      }
      stepStmt.bind(bindArr);
      stepStmt.step();
      stepStmt.reset();
    });
  } finally {
    stepStmt.free();
  }

  db.run("COMMIT;");
}

export function deleteCourseFromDb(db: Database, courseId: string) {
  ensureCourseSchema(db);
  const normalizedCourseId = courseId.trim();
  if (!normalizedCourseId) {
    throw new Error("Cannot delete a book without a valid id.");
  }

  const existsStmt = db.prepare("SELECT 1 FROM courses WHERE id = ?");
  try {
    existsStmt.bind([normalizedCourseId]);
    if (!existsStmt.step()) {
      throw new Error(`Book "${normalizedCourseId}" was not found.`);
    }
  } finally {
    existsStmt.free();
  }

  db.run("BEGIN TRANSACTION;");
  const statements = [
    ["DELETE FROM course_steps WHERE course_id = ?", [normalizedCourseId]],
    ["DELETE FROM course_chapters WHERE course_id = ?", [normalizedCourseId]],
    ["DELETE FROM courses WHERE id = ?", [normalizedCourseId]],
  ] as const;
  statements.forEach(([sql, params]) => {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(params);
      stmt.step();
    } finally {
      stmt.free();
    }
  });
  db.run("COMMIT;");
}

export function saveAllCoursesToDb(db: Database, courses: Course[]) {
  ensureCourseSchema(db);
  db.run("BEGIN TRANSACTION;");
  db.run("DELETE FROM course_steps;");
  db.run("DELETE FROM course_chapters;");
  db.run("DELETE FROM courses;");
  db.run("COMMIT;");
  courses.forEach((course) => saveCourseBundleToDb(db, course));
}

export function queryCourseRows(db: Database): CourseRow[] {
  ensureCourseSchema(db);
  const rows: CourseRow[] = [];
  const stmt = db.prepare(
    "SELECT id, title, description, color, icon, course_index, category, p_index, cover_width, cover_height, artifact_type, raw FROM courses ORDER BY course_index, title",
  );
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, unknown>;
      rows.push({
        id: String(row.id ?? ""),
        title: String(row.title ?? ""),
        description: String(row.description ?? ""),
        color: String(row.color ?? "#2563eb"),
        icon: String(row.icon ?? "📘"),
        courseIndex: readRowNumber(row, "course_index", "courseIndex"),
        category: String(row.category ?? "IT"),
        pIndex: readRowOptionalNumber(row, "p_index"),
        coverWidth: readRowOptionalNumber(row, "cover_width"),
        coverHeight: readRowOptionalNumber(row, "cover_height"),
        artifactType: row.artifact_type ? String(row.artifact_type) : null,
        raw: String(row.raw ?? ""),
      });
    }
  } finally {
    stmt.free();
  }
  return rows;
}

export function queryChapterRows(db: Database, courseId?: string): ChapterRow[] {
  ensureCourseSchema(db);
  const rows: ChapterRow[] = [];
  const sql = courseId
    ? "SELECT id, course_id, title, chapter_index, raw FROM course_chapters WHERE course_id = ? ORDER BY chapter_index, title"
    : "SELECT id, course_id, title, chapter_index, raw FROM course_chapters ORDER BY course_id, chapter_index";
  const stmt = db.prepare(sql);
  try {
    if (courseId) stmt.bind([courseId]);
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, unknown>;
      rows.push({
        id: String(row.id ?? ""),
        courseId: String(row.course_id ?? ""),
        title: String(row.title ?? ""),
        chapterIndex: readRowNumber(row, "chapter_index", "chapterIndex"),
        raw: String(row.raw ?? ""),
      });
    }
  } finally {
    stmt.free();
  }
  return rows;
}

export function queryCourseStepRows(db: Database, courseId?: string): CourseStepRow[] {
  ensureCourseSchema(db);
  const rows: CourseStepRow[] = [];
  
  // First check what columns exist
  let columns: string[] = [];
  try {
    const pragmaStmt = db.prepare("PRAGMA table_info(course_steps)");
    try {
      while (pragmaStmt.step()) {
        const col = pragmaStmt.getAsObject() as Record<string, unknown>;
        if (col.name) {
          columns.push(String(col.name));
        }
      }
    } finally {
      pragmaStmt.free();
    }
  } catch {
    // If we can't read table info, default to including both
  }

  // Build the SELECT statement based on available columns
  const selectCols: string[] = ["id", "course_id", "chapter_id", "chapter_title", "chapter_index", "step_type", "title", "raw"];
  if (columns.includes("page_index")) {
    selectCols.push("page_index");
  }
  if (columns.includes("step_index")) {
    selectCols.push("step_index");
  }

  const orderByCols: string[] = ["chapter_index"];
  if (columns.includes("page_index")) {
    orderByCols.push("page_index");
  } else if (columns.includes("step_index")) {
    orderByCols.push("step_index");
  }

  const sql = courseId
    ? `SELECT ${selectCols.join(", ")} FROM course_steps WHERE course_id = ? ORDER BY ${orderByCols.join(", ")}`
    : `SELECT ${selectCols.join(", ")} FROM course_steps ORDER BY course_id, ${orderByCols.join(", ")}`;
  const stmt = db.prepare(sql);
  try {
    if (courseId) stmt.bind([courseId]);
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, unknown>;
      rows.push({
        id: String(row.id ?? ""),
        courseId: String(row.course_id ?? ""),
        chapterId: String(row.chapter_id ?? ""),
        chapterTitle: String(row.chapter_title ?? ""),
        chapterIndex: readRowNumber(row, "chapter_index", "chapterIndex"),
        pageIndex: readRowNumber(row, "page_index", "step_index", "stepIndex"),
        stepType: String(row.step_type ?? "html"),
        title: String(row.title ?? ""),
        raw: String(row.raw ?? ""),
      });
    }
  } finally {
    stmt.free();
  }
  return rows;
}

export function assembleCourses(
  courseRows: CourseRow[],
  chapterRows: ChapterRow[],
  stepRows: CourseStepRow[],
): Course[] {
  return courseRows.map((courseRow) => {
    let courseMeta: Partial<Course> = {};
    try {
      courseMeta = JSON.parse(courseRow.raw) as Partial<Course>;
    } catch {
      courseMeta = {};
    }
    
    const chaptersForCourse = chapterRows
      .filter((chapter) => chapter.courseId === courseRow.id)
      .map((chapterRow) => {
        let chapterMeta: Partial<CourseChapter> = {};
        try {
          chapterMeta = JSON.parse(chapterRow.raw) as Partial<CourseChapter>;
        } catch {
          chapterMeta = {};
        }

        const steps = stepRows
          .filter((step) => step.chapterId === chapterRow.id)
          .map(parseStep);

        return {
          ...chapterMeta,
          id: chapterRow.id,
          courseId: courseRow.id,
          chapterIndex: chapterRow.chapterIndex,
          title: chapterRow.title,
          description: chapterMeta.description,
          steps,
        } satisfies CourseChapter;
      })
      .sort((a, b) => a.chapterIndex - b.chapterIndex);

    return {
      ...courseMeta,
      id: courseRow.id,
      title: courseRow.title,
      description: courseRow.description,
      color: courseRow.color,
      coverColorStart: courseMeta.coverColorStart ?? courseRow.color,
      coverColorMiddle: courseMeta.coverColorMiddle ?? courseRow.color,
      coverColorEnd: courseMeta.coverColorEnd ?? courseRow.color,
      // Prefer explicit DB columns when present to avoid stale `raw` JSON overriding updated values
      coverWidth: courseRow.coverWidth ?? courseMeta.coverWidth,
      coverHeight: courseRow.coverHeight ?? courseMeta.coverHeight,
      icon: courseRow.icon,
      iconColorStart: courseMeta.iconColorStart ?? "#ffffff",
      iconColorMiddle: courseMeta.iconColorMiddle ?? "#ffffff",
      iconColorEnd: courseMeta.iconColorEnd ?? "#ffffff",
      iconSize: courseMeta.iconSize,
      titleFontSize: courseMeta.titleFontSize,
      titleFontWeight: courseMeta.titleFontWeight,
      titleColor: courseMeta.titleColor,
      titlePosition: courseMeta.titlePosition,
      titleTextAlign: courseMeta.titleTextAlign,
      iconPosition: courseMeta.iconPosition,
      courseIndex: courseRow.courseIndex,
      category: courseMeta.category ?? courseRow.category,
      pIndex: courseMeta.pIndex ?? courseRow.pIndex ?? undefined,
      artifactType: (courseRow.artifactType as any) ?? courseMeta.artifactType ?? "book",
      chapters: chaptersForCourse,
    } satisfies Course;
  });
}

export async function ensureCoursesSeeded(db: Database) {
  ensureCourseSchema(db);
  const existing = queryCourseRows(db);
  const existingIds = new Set(existing.map((course) => course.id));

  const missingCourses = DEFAULT_COURSES.filter((course) => !existingIds.has(course.id));
  if (!existingIds.has(FICTION_BOOK_ID)) {
    missingCourses.push(FICTION_BOOK);
  }

  if (missingCourses.length === 0) {
    return;
  }

  missingCourses.forEach((course) => saveCourseBundleToDb(db, course));
  persistBrowserDbToLocalStorage(db);
}

export async function loadCoursesFromBrowserDb(): Promise<Course[]> {
  const db = await openBrowserDb();
  await ensureCoursesSeeded(db);
  const courseRows = queryCourseRows(db);
  const chapterRows = queryChapterRows(db);
  const stepRows = queryCourseStepRows(db);
  return assembleCourses(courseRows, chapterRows, stepRows);
}

export async function loadCourseById(courseId: string): Promise<Course | null> {
  const courses = await loadCoursesFromBrowserDb();
  return courses.find((course) => course.id === courseId) ?? null;
}

export async function persistCourses(courses: Course[]) {
  const db = await openBrowserDb();
  saveAllCoursesToDb(db, courses);
  persistBrowserDbToLocalStorage(db);
}

export async function persistCourse(course: Course) {
  const db = await openBrowserDb();
  saveCourseBundleToDb(db, course);
  persistBrowserDbToLocalStorage(db);
}

export async function reloadCourses(): Promise<Course[]> {
  return loadCoursesFromBrowserDb();
}

export async function removeCourse(courseId: string) {
  const db = await openBrowserDb();
  deleteCourseFromDb(db, courseId);
  persistBrowserDbToLocalStorage(db);
}
