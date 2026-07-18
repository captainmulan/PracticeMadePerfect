import type { Course, CourseChapter, CourseStep } from "../data/courses";
import type { PracticeTask } from "../data/tasks";
import type { Announcement } from "../types/announcement";

const DB_NAME = "magic-library-db";
const DB_VERSION = 2;

// Define our store names
const STORE_TASKS = "tasks";
const STORE_COURSES = "courses";
const STORE_CHAPTERS = "chapters";
const STORE_STEPS = "steps";
const STORE_ANNOUNCEMENTS = "announcements";

// IndexedDB helper function to promisify requests
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function openDb(): Promise<IDBDatabase> {
  console.log("openDb called with version", DB_VERSION);
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (event) => {
    console.log("onupgradeneeded called");
    const db = (event.target as IDBOpenDBRequest).result;
    console.log("db version after upgrade:", db.version);

    // Create tasks store
    if (!db.objectStoreNames.contains(STORE_TASKS)) {
      console.log("creating tasks store");
      const taskStore = db.createObjectStore(STORE_TASKS, { keyPath: "id" });
      taskStore.createIndex("category", "category", { unique: false });
      taskStore.createIndex("categoryIndex", "categoryIndex", { unique: false });
      taskStore.createIndex("taskIndex", "taskIndex", { unique: false });
    } else {
      console.log("tasks store already exists");
    }

    // Create courses store
    if (!db.objectStoreNames.contains(STORE_COURSES)) {
      console.log("creating courses store");
      const courseStore = db.createObjectStore(STORE_COURSES, { keyPath: "id" });
      courseStore.createIndex("courseIndex", "courseIndex", { unique: false });
    } else {
      console.log("courses store already exists");
    }

    // Create chapters store
    if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
      console.log("creating chapters store");
      const chapterStore = db.createObjectStore(STORE_CHAPTERS, { keyPath: "id" });
      chapterStore.createIndex("courseId", "courseId", { unique: false });
      chapterStore.createIndex("chapterIndex", "chapterIndex", { unique: false });
    } else {
      console.log("chapters store already exists");
    }

    // Create steps store
    if (!db.objectStoreNames.contains(STORE_STEPS)) {
      console.log("creating steps store");
      const stepStore = db.createObjectStore(STORE_STEPS, { keyPath: "id" });
      stepStore.createIndex("courseId", "courseId", { unique: false });
      stepStore.createIndex("chapterId", "chapterId", { unique: false });
      stepStore.createIndex("stepIndex", "stepIndex", { unique: false });
    } else {
      console.log("steps store already exists");
    }

    if (!db.objectStoreNames.contains(STORE_ANNOUNCEMENTS)) {
      console.log("creating announcements store");
      const announcementStore = db.createObjectStore(STORE_ANNOUNCEMENTS, { keyPath: "id" });
      announcementStore.createIndex("publishedAt", "publishedAt", { unique: false });
      announcementStore.createIndex("isActive", "isActive", { unique: false });
      announcementStore.createIndex("sortOrder", "sortOrder", { unique: false });
    } else {
      console.log("announcements store already exists");
    }
  };

  return promisifyRequest(request);
}

// --- Tasks operations ---
export async function getTasks(): Promise<PracticeTask[]> {
  const db = await openDb();
  const transaction = db.transaction(STORE_TASKS, "readonly");
  const store = transaction.objectStore(STORE_TASKS);
  const tasks = await promisifyRequest(store.getAll());
  // Sort them like before
  return tasks.sort((a, b) => {
    // First sort by category index
    const catA = a.categoryIndex ?? 999;
    const catB = b.categoryIndex ?? 999;
    if (catA !== catB) return catA - catB;
    // Then category name
    const catNameA = (a.category ?? "").toLowerCase();
    const catNameB = (b.category ?? "").toLowerCase();
    if (catNameA < catNameB) return -1;
    if (catNameA > catNameB) return 1;
    // Then task index
    const tA = a.taskIndex ?? a.index ?? 999;
    const tB = b.taskIndex ?? b.index ?? 999;
    if (tA !== tB) return tA - tB;
    // Finally title
    const titleA = (a.title ?? "").toLowerCase();
    const titleB = (b.title ?? "").toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
}

export async function saveTask(task: PracticeTask): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_TASKS, "readwrite");
  const store = transaction.objectStore(STORE_TASKS);
  store.put(task);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_TASKS, "readwrite");
  const store = transaction.objectStore(STORE_TASKS);
  store.delete(taskId);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function saveTasks(tasks: PracticeTask[]): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_TASKS, "readwrite");
  const store = transaction.objectStore(STORE_TASKS);
  for (const task of tasks) {
    store.put(task);
  }
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// --- Courses operations ---
export async function getCourses(): Promise<Course[]> {
  console.log("getCourses called");
  const db = await openDb();
  console.log("db opened successfully");
  const coursesTransaction = db.transaction([STORE_COURSES, STORE_CHAPTERS, STORE_STEPS], "readonly");
  const coursesStore = coursesTransaction.objectStore(STORE_COURSES);
  const chaptersStore = coursesTransaction.objectStore(STORE_CHAPTERS);
  const stepsStore = coursesTransaction.objectStore(STORE_STEPS);
  
  console.log("fetching courses");
  const courses = await promisifyRequest(coursesStore.getAll());
  console.log("courses retrieved:", courses);
  courses.forEach((c: any) => {
    console.log(`Course ${c.id}: coverWidth=${c.coverWidth}, coverHeight=${c.coverHeight}`);
  });
  const chapters = await promisifyRequest(chaptersStore.getAll());
  console.log("chapters retrieved:", chapters);
  const steps = await promisifyRequest(stepsStore.getAll());
  console.log("steps retrieved:", steps);

  // Reassemble the courses with chapters and steps
  const result = courses
    .sort((a: any, b: any) => (a.courseIndex ?? 0) - (b.courseIndex ?? 0))
    .map((course: any) => ({
    ...course,
    chapters: chapters
      .filter((chapter: any) => chapter.courseId === course.id)
      .sort((a: any, b: any) => (a.chapterIndex ?? 0) - (b.chapterIndex ?? 0))
      .map((chapter: any) => ({
        ...chapter,
        steps: steps
          .filter((step: any) => step.chapterId === chapter.id)
          .sort((a: any, b: any) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0)),
      })),
  }));
  console.log("assembled courses:", result);
  result.forEach((c: any) => {
    console.log(`Assembled course ${c.id}: coverWidth=${c.coverWidth}, coverHeight=${c.coverHeight}`);
  });
  return result;
}

export async function saveCourse(course: Course): Promise<void> {
  console.log("saveCourse called for", course.id, course.title);
  console.log("course.coverWidth:", course.coverWidth, "course.coverHeight:", course.coverHeight);
  const db = await openDb();

  // First: Get all existing chapters and steps in one go without await inside the transaction
  let chaptersToDelete: string[] = [];
  let stepsToDelete: string[] = [];

  await new Promise<void>((resolve, reject) => {
    const readTransaction = db.transaction([STORE_CHAPTERS, STORE_STEPS], "readonly");
    const chaptersReq = readTransaction.objectStore(STORE_CHAPTERS).getAll();
    const stepsReq = readTransaction.objectStore(STORE_STEPS).getAll();

    chaptersReq.onsuccess = () => {
      chaptersToDelete = chaptersReq.result
        .filter(ch => ch.courseId === course.id)
        .map(ch => ch.id);
    };
    stepsReq.onsuccess = () => {
      stepsToDelete = stepsReq.result
        .filter(st => st.courseId === course.id)
        .map(st => st.id);
    };
    readTransaction.oncomplete = () => {
      console.log("read transaction complete, chapters to delete:", chaptersToDelete.length, "steps to delete:", stepsToDelete.length);
      resolve();
    };
    readTransaction.onerror = () => reject(readTransaction.error);
  });

  // Then: Write everything in a separate transaction without await
  await new Promise<void>((resolve, reject) => {
    const writeTransaction = db.transaction([STORE_COURSES, STORE_CHAPTERS, STORE_STEPS], "readwrite");
    writeTransaction.objectStore(STORE_COURSES).put(course);

    // Delete old
    const chaptersStore = writeTransaction.objectStore(STORE_CHAPTERS);
    chaptersToDelete.forEach((id) => chaptersStore.delete(id));
    const stepsStore = writeTransaction.objectStore(STORE_STEPS);
    stepsToDelete.forEach((id) => stepsStore.delete(id));

    // Save new
    for (const chapter of course.chapters) {
      chaptersStore.put({ ...chapter, courseId: course.id });
      for (const step of chapter.steps) {
        stepsStore.put({ ...step, courseId: course.id, chapterId: chapter.id });
      }
    }
    writeTransaction.oncomplete = () => {
      console.log("write transaction complete");
      resolve();
    };
    writeTransaction.onerror = () => reject(writeTransaction.error);
  });
  console.log("saveCourse complete");
}

export async function deleteCourse(courseId: string): Promise<void> {
  const db = await openDb();
  let chaptersToDelete: string[] = [];
  let stepsToDelete: string[] = [];

  // Read phase
  await new Promise<void>((resolve, reject) => {
    const readTransaction = db.transaction([STORE_CHAPTERS, STORE_STEPS], "readonly");
    const chaptersReq = readTransaction.objectStore(STORE_CHAPTERS).getAll();
    const stepsReq = readTransaction.objectStore(STORE_STEPS).getAll();

    chaptersReq.onsuccess = () => {
      chaptersToDelete = chaptersReq.result
        .filter(ch => ch.courseId === courseId)
        .map(ch => ch.id);
    };
    stepsReq.onsuccess = () => {
      stepsToDelete = stepsReq.result
        .filter(st => st.courseId === courseId)
        .map(st => st.id);
    };
    readTransaction.oncomplete = () => resolve();
    readTransaction.onerror = () => reject(readTransaction.error);
  });

  // Write phase
  await new Promise<void>((resolve, reject) => {
    const writeTransaction = db.transaction([STORE_COURSES, STORE_CHAPTERS, STORE_STEPS], "readwrite");
    writeTransaction.objectStore(STORE_COURSES).delete(courseId);
    const chaptersStore = writeTransaction.objectStore(STORE_CHAPTERS);
    chaptersToDelete.forEach((id) => chaptersStore.delete(id));
    const stepsStore = writeTransaction.objectStore(STORE_STEPS);
    stepsToDelete.forEach((id) => stepsStore.delete(id));
    writeTransaction.oncomplete = () => resolve();
    writeTransaction.onerror = () => reject(writeTransaction.error);
  });
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "welcome",
    title: "Welcome to Magic Library",
    body: "Explore interactive books and courses. New content is added regularly.",
    publishedAt: new Date().toISOString(),
    isActive: true,
    sortOrder: 0,
  },
];

function sortAnnouncements(items: Announcement[]): Announcement[] {
  return items.slice().sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const db = await openDb();
  if (!db.objectStoreNames.contains(STORE_ANNOUNCEMENTS)) {
    return [];
  }
  const transaction = db.transaction(STORE_ANNOUNCEMENTS, "readonly");
  const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
  const items = await promisifyRequest(store.getAll());
  return sortAnnouncements(items);
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const items = await getAnnouncements();
  return sortAnnouncements(items.filter((item) => item.isActive));
}

export async function saveAnnouncement(announcement: Announcement): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_ANNOUNCEMENTS, "readwrite");
  const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
  store.put(announcement);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_ANNOUNCEMENTS, "readwrite");
  const store = transaction.objectStore(STORE_ANNOUNCEMENTS);
  store.delete(announcementId);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function ensureAnnouncementsSeeded(): Promise<void> {
  const existing = await getAnnouncements();
  if (existing.length > 0) return;
  for (const announcement of DEFAULT_ANNOUNCEMENTS) {
    await saveAnnouncement(announcement);
  }
}

// --- Initialization (Load defaults if no data exists) ---
import { DEFAULT_COURSES } from "../data/courses";
import { FICTION_BOOK } from "../data/fictionBook";
import { LITTLE_PROGRAMMER_BOOK } from "../data/littleProgrammerBook";
import { JS_PROGRAMMER_BOOK } from "../data/jsProgrammerBook";
import initSqlJs from "sql.js";
import wasmURL from "sql.js/dist/sql-wasm.wasm?url";

export async function clearDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadCoursesFromOldSqlite(): Promise<Course[]> {
  try {
    console.log("Attempting to load courses from old SQLite DB");
    const SQL = await initSqlJs({ locateFile: () => wasmURL });
    const response = await fetch("/data/tasks.db");
    if (!response.ok) {
      console.log("Old SQLite DB not found, will use defaults");
      return [];
    }
    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));
    
    // Query courses
    const coursesStmt = db.prepare("SELECT * FROM courses");
    const courses: Course[] = [];
    
    while (coursesStmt.step()) {
      const row = coursesStmt.getAsObject() as any;
      try {
        const courseData = JSON.parse(row.raw);
        // Map cover_width and cover_height from SQLite columns if not present in JSON
        if (!courseData.coverWidth && row.cover_width) {
          courseData.coverWidth = row.cover_width;
        }
        if (!courseData.coverHeight && row.cover_height) {
          courseData.coverHeight = row.cover_height;
        }
        courses.push(courseData);
      } catch (e) {
        console.error("Failed to parse course data:", row.id, e);
      }
    }
    coursesStmt.free();
    db.close();
    
    console.log("Loaded", courses.length, "courses from old SQLite DB");
    return courses;
  } catch (e) {
    console.error("Failed to load from old SQLite DB:", e);
    return [];
  }
}

async function loadFromIndexedDbExport(): Promise<boolean> {
  try {
    console.log("Attempting to load from indexeddb-export.json");
    const response = await fetch("/data/indexeddb-export.json");
    if (!response.ok) {
      console.log("indexeddb-export.json not found");
      return false;
    }
    const jsonData = await response.text();
    await importIndexedDb(jsonData);
    console.log("Successfully loaded from indexeddb-export.json");
    return true;
  } catch (e) {
    console.error("Failed to load from indexeddb-export.json:", e);
    return false;
  }
}

export async function migrateFromSqlJs(): Promise<void> {
  console.log("migrateFromSqlJs called");
  // First check if we already have data in IndexedDB
  const testCourses = await getCourses();
  console.log("testCourses:", testCourses);

  if (testCourses.length > 0) {
    console.log("Courses already exist, skipping initialization");
    await ensureAnnouncementsSeeded();
    return;
  }

  // Try to load from indexeddb-export.json first (new format)
  const loadedFromExport = await loadFromIndexedDbExport();
  if (loadedFromExport) {
    console.log("Initialization complete (from indexeddb-export.json)");
    await ensureAnnouncementsSeeded();
    return;
  }

  // Fall back to old SQLite DB
  console.log("Attempting to load from old SQLite DB");
  const oldCourses = await loadCoursesFromOldSqlite();

  if (oldCourses.length > 0) {
    console.log("Using courses from old SQLite DB");
    for (const course of oldCourses) {
      console.log("saving course from old DB:", course.id);
      await saveCourse(course);
    }
  } else {
    console.log("Initializing with default courses");
    // Load defaults
    for (const course of [...DEFAULT_COURSES, FICTION_BOOK, LITTLE_PROGRAMMER_BOOK, JS_PROGRAMMER_BOOK]) {
      console.log("saving course:", course.id);
      await saveCourse(course);
    }
  }
  await ensureAnnouncementsSeeded();
  console.log("Initialization complete!");
}

export async function exportIndexedDb(): Promise<Blob> {
  const db = await openDb();
  const courses = await getCourses();
  const tasks = await getTasks();
  const announcements = await getAnnouncements();
  
  const exportData = {
    courses,
    tasks,
    announcements,
    exportedAt: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  return blob;
}

export async function importIndexedDb(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.courses || !Array.isArray(data.courses)) {
      throw new Error("Invalid export data: missing courses array");
    }
    
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error("Invalid export data: missing tasks array");
    }
    
    // Clear existing data
    await clearDatabase();
    
    // Import courses
    for (const course of data.courses) {
      await saveCourse(course);
    }
    
    // Import tasks
    if (data.tasks.length > 0) {
      await saveTasks(data.tasks);
    }

    if (Array.isArray(data.announcements)) {
      for (const announcement of data.announcements) {
        await saveAnnouncement(announcement);
      }
    } else {
      await ensureAnnouncementsSeeded();
    }
    
    console.log(`Imported ${data.courses.length} courses and ${data.tasks.length} tasks`);
  } catch (e) {
    console.error("Failed to import IndexedDB data:", e);
    throw e;
  }
}
