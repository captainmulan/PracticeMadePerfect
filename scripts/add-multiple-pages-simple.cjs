#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// Assign reasonable page counts based on book content
const bookPageCounts = {
  "khin-khin-htoo-16fae0f98b": 47,
  "khin-khin-htoo-7e3baff1dc": 10,
  "khin-khin-htoo-7f4297305f": 160,
  "khin-khin-htoo-91da446dff": 40,
  "khin-khin-htoo-9b37c2cf92": 100,
  "khin-khin-htoo-a18e0f5039": 260,
  "khin-khin-htoo-bde6eaf37d": 80,
  "khin-khin-htoo-dae256f361": 40,
  "khin-khin-htoo-e8a58f7721": 51,
  "percy-jackson-mm-5b7d743d4f": 26,
  "percy-jackson-mm-91395c68e0": 34,
  "percy-jackson-mm-972d2163dc": 31,
  "percy-jackson-mm-ce6c21e4e5": 26,
  "percy-jackson-mm-e3a342a38f": 30,
  "percy-jackson-mm-fd1b30aa76": 29,
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

// Load export
const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);

for (const [bookId, pageCount] of Object.entries(bookPageCounts)) {
  const course = exportData.courses.find(c => c.id === bookId);
  if (!course) continue;
  
  // Build chapters with page-based anchors
  const chapters = [];
  for (let i = 0; i < pageCount; i++) {
    const chapterId = `${bookId}-epub-page-${String(i + 1).padStart(3, "0")}`;
    const stepId = `${chapterId}-step`;
    const pageNum = i + 1;
    
    chapters.push({
      id: chapterId,
      courseId: bookId,
      chapterIndex: i,
      title: `Page ${pageNum}`,
      steps: [{
        id: stepId,
        courseId: bookId,
        chapterId,
        chapterTitle: `Page ${pageNum}`,
        chapterIndex: i,
        stepIndex: pageNum,
        stepType: "epub",
        title: `Page ${pageNum}`,
        description: "",
        contentHtml: `/book_html/Other/${bookId}/book.epub#page-${pageNum}.xhtml`,
      }]
    });
  }
  
  course.chapters = chapters;
  course.stepCount = pageCount;
  console.log(`Added ${pageCount} pages to ${bookId}`);
}

// Save export
exportData.exportedAt = new Date().toISOString();
writeJson(exportPath, exportData, true);

// Update deploy
const deployPath = "deploy/indexeddb-export.json";
const deployData = readJson(deployPath);
for (const bookId of Object.keys(bookPageCounts)) {
  const course = deployData.courses.find(c => c.id === bookId);
  const updated = exportData.courses.find(c => c.id === bookId);
  if (course && updated) {
    course.chapters = updated.chapters;
    course.stepCount = updated.stepCount;
  }
}
deployData.exportedAt = exportData.exportedAt;
writeJson(deployPath, deployData, true);

// Update home catalog
const homePath = "public/data/home-catalog.json";
const homeCatalog = readJson(homePath);
for (const bookId of Object.keys(bookPageCounts)) {
  const course = homeCatalog.courses.find(c => c.id === bookId);
  const updated = exportData.courses.find(c => c.id === bookId);
  if (course && updated) {
    course.stepCount = updated.stepCount;
  }
}
homeCatalog.exportedAt = exportData.exportedAt;
writeJson(homePath, homeCatalog, true);

// Update course details
for (const bookId of Object.keys(bookPageCounts)) {
  const course = exportData.courses.find(c => c.id === bookId);
  if (course) {
    writeJson(`public/data/course-details/${encodeURIComponent(bookId)}.json`, course);
  }
}

// Update catalog version
writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:multi-page-structure`,
  courseCount: exportData.courses.length,
});

console.log("\nAdded multiple pages to all books");
console.log("Next: Clear IndexedDB in browser to see changes");
