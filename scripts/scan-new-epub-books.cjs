#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const bookHtmlPath = path.join(root, "book_html", "Other");
const exportPath = path.join(root, "public", "data", "indexeddb-export.json");

// List of new book folders (from the screenshot)
const newBookFolders = [
  "percy-jackson-mm-5b7d743d4f",
  "percy-jackson-mm-91395c68e0",
  "percy-jackson-mm-972d2163dc",
  "percy-jackson-mm-ce6c21e4e5",
  "percy-jackson-mm-e3a342a38f",
  "percy-jackson-mm-fd1b30aa76",
  "khin-khin-htoo-16fae0f98b",
  "khin-khin-htoo-7e3baff1dc",
  "khin-khin-htoo-7f4297305f",
  "khin-khin-htoo-91da446dff",
  "khin-khin-htoo-9b37c2cf92",
  "khin-khin-htoo-a18e0f5039",
  "khin-khin-htoo-bde6eaf37d",
  "khin-khin-htoo-dae256f361",
  "khin-khin-htoo-e8a58f7721",
];

// Read existing export (handle UTF-16)
let exportData;
try {
  const buffer = fs.readFileSync(exportPath);
  // Try UTF-16LE first
  const text16 = buffer.toString("utf16le");
  if (text16.startsWith("{") || text16.startsWith("\ufeff{")) {
    exportData = JSON.parse(text16.replace(/^\ufeff/, ""));
  } else {
    // Fallback to UTF-8
    exportData = JSON.parse(buffer.toString("utf8"));
  }
} catch (err) {
  console.error("Failed to read indexeddb-export.json:", err.message);
  process.exit(1);
}

const existingCourseIds = new Set((exportData.courses || []).map(c => c.id));
const newCourses = [];
let courseIndex = Math.max(0, ...(exportData.courses || []).map(c => c.courseIndex || 0)) + 1;

for (const folder of newBookFolders) {
  if (existingCourseIds.has(folder)) {
    console.log(`Skipping existing course: ${folder}`);
    continue;
  }

  const folderPath = path.join(bookHtmlPath, folder);
  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    continue;
  }

  const epubPath = path.join(folderPath, "book.epub");
  if (!fs.existsSync(epubPath)) {
    console.warn(`EPUB not found: ${epubPath}`);
    continue;
  }

  // Determine book type from folder name
  const isPercyJackson = folder.startsWith("percy-jackson-mm");
  const isKhinKhinHtoo = folder.startsWith("khin-khin-htoo");
  
  let title, category, language, authorName, description;

  if (isPercyJackson) {
    title = "Percy Jackson";
    category = "Fantasy, MM";
    language = "MM";
    authorName = "Rick Riordan";
    description = "Percy Jackson series in Myanmar language";
  } else if (isKhinKhinHtoo) {
    title = "Khin Khin Htoo Stories";
    category = "Kids, MM";
    language = "MM";
    authorName = "Khin Khin Htoo";
    description = "Children's stories in Myanmar language";
  } else {
    title = folder.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    category = "Other";
    language = "Eng";
    authorName = "Unknown";
    description = `Book: ${title}`;
  }

  // Generate a simple EPUB course structure
  const chapterId = `${folder}-ch-0`;
  const stepId = `${chapterId}-step-0`;
  
  const course = {
    id: folder,
    title: title,
    description: description,
    isPublished: true,
    authorName: authorName,
    authorPicture: "",
    color: "#3b82f6",
    coverColorStart: "#3b82f6",
    coverColorMiddle: "#8b5cf6",
    coverColorEnd: "#ec4899",
    coverWidth: 300,
    coverHeight: 450,
    coverImageUrl: "",
    icon: "📚",
    iconColorStart: "#3b82f6",
    iconColorMiddle: "#8b5cf6",
    iconColorEnd: "#ec4899",
    iconSize: 64,
    iconPosition: "top-center",
    titleFontSize: 24,
    titleFontWeight: "bold",
    titleColor: "#ffffff",
    titlePosition: "center",
    titleAlignment: "center",
    courseIndex: courseIndex++,
    category: category,
    language: language,
    cat1: "",
    cat2: "",
    cat3: "",
    cat4: "",
    pIndex: 0,
    scIndex: 0,
    sIndex: 0,
    artifactType: "book",
    pageViewType: "book",
    bookHtmlFolder: `Other/${folder}`,
    stepCount: 1,
    chapters: [
      {
        id: chapterId,
        courseId: folder,
        chapterIndex: 0,
        title: "Read Book",
        steps: [
          {
            id: stepId,
            courseId: folder,
            chapterId: chapterId,
            chapterTitle: "Read Book",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "epub",
            title: "Read EPUB",
            description: "",
            contentHtml: `https://magiclibrary-daw.pages.dev/${folder}/book.epub`,
            epubNextLocation: "",
            epubImageIndex: 0
          }
        ]
      }
    ]
  };

  newCourses.push(course);
  console.log(`Created course entry for: ${folder}`);
}

if (newCourses.length === 0) {
  console.log("No new courses to add.");
  process.exit(0);
}

// Merge new courses into export
exportData.courses = [...(exportData.courses || []), ...newCourses];
exportData.exportedAt = new Date().toISOString();

// Write back as UTF-8 (standard format)
const outputPath = path.join(root, "public", "data", "indexeddb-export.json");
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2) + "\n", "utf8");
console.log(`\nUpdated ${outputPath} with ${newCourses.length} new courses`);
console.log("Run the following commands to update the catalog:");
console.log("  node scripts/generate-home-catalog.cjs");
console.log("  node scripts/generate-course-details.cjs");
