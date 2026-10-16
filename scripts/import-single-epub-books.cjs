#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// New books to import
const newBooks = [
  { id: "percy-jackson-mm-5b7d743d4f", folder: "Other/percy-jackson-mm-5b7d743d4f", title: "Percy Jackson MM 1", category: "Kid, MM", author: "Rick Riordan" },
  { id: "percy-jackson-mm-91395c68e0", folder: "Other/percy-jackson-mm-91395c68e0", title: "Percy Jackson MM 2", category: "Kid, MM", author: "Rick Riordan" },
  { id: "percy-jackson-mm-972d2163dc", folder: "Other/percy-jackson-mm-972d2163dc", title: "Percy Jackson MM 3", category: "Kid, MM", author: "Rick Riordan" },
  { id: "percy-jackson-mm-ce6c21e4e5", folder: "Other/percy-jackson-mm-ce6c21e4e5", title: "Percy Jackson MM 4", category: "Kid, MM", author: "Rick Riordan" },
  { id: "percy-jackson-mm-e3a342a38f", folder: "Other/percy-jackson-mm-e3a342a38f", title: "Percy Jackson MM 5", category: "Kid, MM", author: "Rick Riordan" },
  { id: "percy-jackson-mm-fd1b30aa76", folder: "Other/percy-jackson-mm-fd1b30aa76", title: "Percy Jackson MM 6", category: "Kid, MM", author: "Rick Riordan" },
  { id: "khin-khin-htoo-16fae0f98b", folder: "Other/khin-khin-htoo-16fae0f98b", title: "Khin Khin Htoo 1", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-7e3baff1dc", folder: "Other/khin-khin-htoo-7e3baff1dc", title: "Khin Khin Htoo 2", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-7f4297305f", folder: "Other/khin-khin-htoo-7f4297305f", title: "Khin Khin Htoo 3", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-91da446dff", folder: "Other/khin-khin-htoo-91da446dff", title: "Khin Khin Htoo 4", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-9b37c2cf92", folder: "Other/khin-khin-htoo-9b37c2cf92", title: "Khin Khin Htoo 5", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-a18e0f5039", folder: "Other/khin-khin-htoo-a18e0f5039", title: "Khin Khin Htoo 6", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-bde6eaf37d", folder: "Other/khin-khin-htoo-bde6eaf37d", title: "Khin Khin Htoo 7", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-dae256f361", folder: "Other/khin-khin-htoo-dae256f361", title: "Khin Khin Htoo 8", category: "Kid, MM", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-e8a58f7721", folder: "Other/khin-khin-htoo-e8a58f7721", title: "Khin Khin Htoo 9", category: "Kid, MM", author: "Khin Khin Htoo" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

function readEpubStructure(epubPath) {
  // Simplified: just return a basic structure
  // The app's EPUB viewer will handle the actual parsing
  return { toc: [], pages: [] };
}

function buildCourse(book, template, epubStructure, courseIndex) {
  // Create a single chapter that points to the EPUB file
  // The app's EPUB viewer will handle navigation
  const chapterId = `${book.id}-epub-chapter-001`;
  const stepId = `${book.id}-epub-step-001`;
  
  const steps = [{
    id: stepId,
    courseId: book.id,
    chapterId,
    chapterTitle: book.title,
    chapterIndex: 0,
    stepIndex: 1,
    stepType: "epub",
    title: "Read Book",
    description: "",
    contentHtml: `/book_html/${book.folder}/book.epub`,
  }];

  return {
    ...template,
    id: book.id,
    title: book.title,
    description: `${book.title} by ${book.author}`,
    authorName: book.author,
    coverImageUrl: "", // Will be generated if cover exists
    courseIndex,
    category: book.category,
    cat1: "Kid",
    cat2: "MM",
    cat3: "",
    artifactType: "book",
    pageViewType: "NormalView",
    bookHtmlFolder: book.folder,
    stepCount: steps.length,
    chapters: [{ id: chapterId, courseId: book.id, chapterIndex: 0, title: book.title, steps }],
  };
}

// Load export data
const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);
const template = exportData.courses.find((course) => course.id === "narnia-nephew");
if (!template) {
  console.error("Could not find template course");
  process.exit(1);
}

const firstCourseIndex = Math.max(0, ...exportData.courses.map((course) => course.courseIndex ?? 0)) + 1;
const updatedCourses = [];

for (const book of newBooks) {
  const epubPath = path.join(root, "book_html", book.folder, "book.epub");
  if (!fs.existsSync(epubPath)) {
    console.warn(`Skipping ${book.id}: EPUB not found at ${epubPath}`);
    continue;
  }

  try {
    const epubStructure = readEpubStructure(epubPath);
    const course = buildCourse(book, template, epubStructure, firstCourseIndex + updatedCourses.length);
    updatedCourses.push(course);
    console.log(`Created course for ${book.id}: ${course.stepCount} pages`);
  } catch (err) {
    console.error(`Failed to parse ${book.id}:`, err.message);
  }
}

if (updatedCourses.length === 0) {
  console.log("No courses to import");
  process.exit(0);
}

// Update export
const updatedById = new Map(updatedCourses.map((course) => [course.id, course]));
exportData.courses = exportData.courses.filter((course) => !updatedById.has(course.id));
exportData.courses.push(...updatedCourses);
exportData.exportedAt = new Date().toISOString();
writeJson(exportPath, exportData, true);

// Update deploy export
const deployPath = "deploy/indexeddb-export.json";
const deployData = readJson(deployPath);
deployData.courses = deployData.courses.filter((course) => !updatedById.has(course.id));
deployData.courses.push(...updatedCourses);
deployData.exportedAt = exportData.exportedAt;
writeJson(deployPath, deployData, true);

// Update home catalog
const summaryKeys = [
  "id", "title", "description", "color", "coverColorStart", "coverColorMiddle", "coverColorEnd",
  "coverWidth", "coverHeight", "coverImageUrl", "icon", "iconColorStart", "iconColorMiddle",
  "iconColorEnd", "iconSize", "iconPosition", "courseIndex", "scIndex", "sIndex", "authorName",
  "category", "isPublished", "cat1", "cat2", "cat3", "cat4", "pIndex", "artifactType",
  "bookHtmlFolder", "stepCount", "pageViewType",
];
const homePath = "public/data/home-catalog.json";
const homeCatalog = readJson(homePath);
homeCatalog.courses = homeCatalog.courses.filter((course) => !updatedById.has(course.id));
homeCatalog.courses.push(...updatedCourses.map((course) => Object.fromEntries(summaryKeys
  .filter((key) => course[key] !== undefined)
  .map((key) => [key, course[key]]))));
const popularCourses = homeCatalog.courses.filter((course) => typeof course.pIndex === "number" && course.pIndex > 0)
  .sort((left, right) => left.pIndex - right.pIndex || (left.courseIndex ?? 0) - (right.courseIndex ?? 0));
const otherCourses = homeCatalog.courses.filter((course) => !(typeof course.pIndex === "number" && course.pIndex > 0))
  .sort((left, right) => (left.courseIndex ?? 0) - (right.courseIndex ?? 0));
homeCatalog.courses = [...popularCourses, ...otherCourses];
homeCatalog.exportedAt = exportData.exportedAt;
writeJson(homePath, homeCatalog, true);

// Update course details
for (const course of updatedCourses) {
  writeJson(`public/data/course-details/${encodeURIComponent(course.id)}.json`, course);
}

// Update catalog version
writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:new-epub-books`,
  courseCount: exportData.courses.length,
});

console.log(`\nImported ${updatedCourses.length} books successfully`);
console.log("Next steps:");
console.log("1. Generate cover thumbnails (if you have cover images)");
console.log("2. Run: node scripts/generate-course-details.cjs");
console.log("3. Refresh your browser's IndexedDB to see the new books");
