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

const chapters = [
  ["မိတ်ဆက်", "page-4.xhtml"],
  ["အခန်း (၁) - Docker နှင့် Install ပြုလုပ်ခြင်း", "page-10.xhtml"],
  ["အခန်း (၂) - NPM နှင့် Install ပြုလုပ်ခြင်း", "page-29.xhtml"],
  ["အခန်း (၃) - JSON", "page-33.xhtml"],
  ["အခန်း (၄) - API", "page-36.xhtml"],
  ["အခန်း (၅) - First Workflow", "page-44.xhtml"],
  ["အခန်း (၆) - Weather Chat", "page-61.xhtml"],
  ["အခန်း (၇) - Invoice & Reminder Workflow", "page-77.xhtml"],
  ["အခန်း (၈) - Support Ticket Workflow", "page-106.xhtml"],
  ["အခန်း (၉) - AI Agent Workflow", "page-126.xhtml"],
  ["အခန်း (၁၀) - AI နှင့် Workflow များဖန်တီးခြင်း", "page-150.xhtml"],
  ["အခန်း (၁၁) - ngrok နှင့် အသုံးပြုခြင်း", "page-159.xhtml"],
  ["နိဂုံးချုပ်", "page-173.xhtml"],
];

if (!fs.existsSync(epubPath)) {
  throw new Error(`Missing EPUB asset: ${epubPath}`);
}

const data = JSON.parse(fs.readFileSync(deployExportPath, "utf8"));
const course = data.courses?.find((item) => item.id === "n8n-book");
if (!course) {
  throw new Error("Course n8n-book was not found in the deployment export.");
}

course.bookHtmlFolder = "Other/n8n-book";
course.stepCount = chapters.length;
course.chapters = chapters.map(([title, href], index) => {
  const chapterIndex = index;
  const stepIndex = index + 1;
  const chapterId = `n8n-book-epub-chapter-${String(stepIndex).padStart(2, "0")}`;
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
        contentHtml: `${epubUrl}#${href}`,
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
console.log(`Updated n8n-book to ${chapters.length} EPUB TOC chapters.`);