#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const bookIds = [
  "khin-khin-htoo-16fae0f98b",
  "khin-khin-htoo-7e3baff1dc",
  "khin-khin-htoo-7f4297305f",
  "khin-khin-htoo-91da446dff",
  "khin-khin-htoo-9b37c2cf92",
  "khin-khin-htoo-a18e0f5039",
  "khin-khin-htoo-bde6eaf37d",
  "khin-khin-htoo-dae256f361",
  "khin-khin-htoo-e8a58f7721",
  "percy-jackson-mm-5b7d743d4f",
  "percy-jackson-mm-91395c68e0",
  "percy-jackson-mm-972d2163dc",
  "percy-jackson-mm-ce6c21e4e5",
  "percy-jackson-mm-e3a342a38f",
  "percy-jackson-mm-fd1b30aa76",
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

async function main() {
  // Move covers from thumbs to main book_covers folder
  const thumbsDir = path.join(root, "public", "book_covers", "thumbs");
  const mainCoversDir = path.join(root, "public", "book_covers");

  for (const bookId of bookIds) {
    const sourceCover = path.join(thumbsDir, `${bookId}.webp`);
    const destCover = path.join(mainCoversDir, `${bookId}.webp`);
    
    if (fs.existsSync(sourceCover)) {
      fs.copyFileSync(sourceCover, destCover);
      console.log(`Moved cover for ${bookId}`);
    }
  }

  // Load export
  const exportPath = "public/data/indexeddb-export.json";
  const exportData = readJson(exportPath);

  for (const bookId of bookIds) {
    const course = exportData.courses.find(c => c.id === bookId);
    if (!course) continue;
    
    // Update cover URL to use main book_covers (no thumbs subfolder)
    course.coverImageUrl = `/book_covers/${bookId}.webp`;
    
    // Update contentHtml to use local book_html path (like n8n-book)
    for (const chapter of course.chapters) {
      for (const step of chapter.steps) {
        if (step.stepType === "epub") {
          step.contentHtml = `/book_html/Other/${bookId}/book.epub`;
        }
      }
    }
    
    console.log(`Fixed cover and URL for ${bookId}`);
  }

  // Save export
  exportData.exportedAt = new Date().toISOString();
  writeJson(exportPath, exportData, true);

  // Update deploy
  const deployPath = "deploy/indexeddb-export.json";
  const deployData = readJson(deployPath);
  for (const bookId of bookIds) {
    const course = deployData.courses.find(c => c.id === bookId);
    const updated = exportData.courses.find(c => c.id === bookId);
    if (course && updated) {
      course.coverImageUrl = updated.coverImageUrl;
      course.chapters = updated.chapters;
    }
  }
  deployData.exportedAt = exportData.exportedAt;
  writeJson(deployPath, deployData, true);

  // Update home catalog
  const homePath = "public/data/home-catalog.json";
  const homeCatalog = readJson(homePath);
  for (const bookId of bookIds) {
    const course = homeCatalog.courses.find(c => c.id === bookId);
    const updated = exportData.courses.find(c => c.id === bookId);
    if (course && updated) {
      course.coverImageUrl = updated.coverImageUrl;
    }
  }
  homeCatalog.exportedAt = exportData.exportedAt;
  writeJson(homePath, homeCatalog, true);

  // Update course details
  for (const bookId of bookIds) {
    const course = exportData.courses.find(c => c.id === bookId);
    if (course) {
      writeJson(`public/data/course-details/${encodeURIComponent(bookId)}.json`, course);
    }
  }

  // Update catalog version
  writeJson("public/data/catalog-version.json", {
    exportedAt: `${exportData.exportedAt}:final-fix`,
    courseCount: exportData.courses.length,
  });

  console.log("\nFixed cover paths and URLs to match existing book structure");
  console.log("Next: Clear IndexedDB in browser to see changes");
}

main();
