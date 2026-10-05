#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const deployExportPath = path.join(root, "deploy", "indexeddb-export.json");
const publicExportPath = path.join(root, "public", "data", "indexeddb-export.json");
const catalogVersionPath = path.join(root, "public", "data", "catalog-version.json");
const courseDetailPath = path.join(root, "public", "data", "course-details", "n8n-book.json");
const epubPath = path.join(root, "book_html", "Other", "n8n-book", "n8n-book.epub");
const epubUrl = "/book_html/Other/n8n-book/n8n-book.epub";
const pageCount = 177;

if (!fs.existsSync(epubPath)) {
  throw new Error(`Missing EPUB asset: ${epubPath}`);
}

const data = JSON.parse(fs.readFileSync(deployExportPath, "utf8"));
const course = data.courses?.find((item) => item.id === "n8n-book");
if (!course) {
  throw new Error("Course n8n-book was not found in the deployment export.");
}

course.bookHtmlFolder = "Other/n8n-book";
course.stepCount = pageCount;
course.chapters = Array.from({ length: pageCount }, (_, index) => {
  const pageNumber = index + 1;
  const title = `Page ${pageNumber}`;
  const chapterIndex = index;
  const stepIndex = pageNumber;
  const chapterId = `n8n-book-epub-page-${String(pageNumber).padStart(3, "0")}`;
  return {
    id: chapterId,
    courseId: course.id,
    chapterIndex,
    title,
    steps: [
      {
        id: `${chapterId}-step`,
        courseId: course.id,
        chapterId,
        chapterTitle: title,
        chapterIndex,
        stepIndex,
        stepType: "epub",
        title,
        description: "",
        contentHtml: `${epubUrl}#page-${pageNumber}.xhtml`,
      },
    ],
  };
});

data.exportedAt = new Date().toISOString();
const serialized = `${JSON.stringify(data, null, 2)}\n`;
fs.writeFileSync(deployExportPath, serialized, "utf8");
fs.writeFileSync(publicExportPath, serialized, "utf8");
fs.writeFileSync(
  catalogVersionPath,
  `${JSON.stringify({ exportedAt: `${data.exportedAt}:shelf-index-v2`, courseCount: data.courses.length })}\n`,
  "utf8",
);
fs.writeFileSync(courseDetailPath, `${JSON.stringify(course)}\n`, "utf8");
console.log(`Updated n8n-book to ${pageCount} sequential EPUB pages.`);