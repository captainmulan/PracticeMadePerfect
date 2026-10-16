#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");

// Books to fix
const books = [
  { id: "percy-jackson-mm-5b7d743d4f", folder: "Other/percy-jackson-mm-5b7d743d4f", title: "Percy Jackson MM 1" },
  { id: "percy-jackson-mm-91395c68e0", folder: "Other/percy-jackson-mm-91395c68e0", title: "Percy Jackson MM 2" },
  { id: "percy-jackson-mm-972d2163dc", folder: "Other/percy-jackson-mm-972d2163dc", title: "Percy Jackson MM 3" },
  { id: "percy-jackson-mm-ce6c21e4e5", folder: "Other/percy-jackson-mm-ce6c21e4e5", title: "Percy Jackson MM 4" },
  { id: "percy-jackson-mm-e3a342a38f", folder: "Other/percy-jackson-mm-e3a342a38f", title: "Percy Jackson MM 5" },
  { id: "percy-jackson-mm-fd1b30aa76", folder: "Other/percy-jackson-mm-fd1b30aa76", title: "Percy Jackson MM 6" },
  { id: "khin-khin-htoo-16fae0f98b", folder: "Other/khin-khin-htoo-16fae0f98b", title: "Khin Khin Htoo 1" },
  { id: "khin-khin-htoo-7e3baff1dc", folder: "Other/khin-khin-htoo-7e3baff1dc", title: "Khin Khin Htoo 2" },
  { id: "khin-khin-htoo-7f4297305f", folder: "Other/khin-khin-htoo-7f4297305f", title: "Khin Khin Htoo 3" },
  { id: "khin-khin-htoo-91da446dff", folder: "Other/khin-khin-htoo-91da446dff", title: "Khin Khin Htoo 4" },
  { id: "khin-khin-htoo-9b37c2cf92", folder: "Other/khin-khin-htoo-9b37c2cf92", title: "Khin Khin Htoo 5" },
  { id: "khin-khin-htoo-a18e0f5039", folder: "Other/khin-khin-htoo-a18e0f5039", title: "Khin Khin Htoo 6" },
  { id: "khin-khin-htoo-bde6eaf37d", folder: "Other/khin-khin-htoo-bde6eaf37d", title: "Khin Khin Htoo 7" },
  { id: "khin-khin-htoo-dae256f361", folder: "Other/khin-khin-htoo-dae256f361", title: "Khin Khin Htoo 8" },
  { id: "khin-khin-htoo-e8a58f7721", folder: "Other/khin-khin-htoo-e8a58f7721", title: "Khin Khin Htoo 9" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

function parseEpubPages(epubPath) {
  const escapedPath = path.resolve(epubPath).replace(/'/g, "''");
  const powershell = `
    $ErrorActionPreference = 'Stop'
    $OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead('${escapedPath}')
    try {
      $pages = @()
      foreach ($entry in $archive.Entries) {
        if ($entry.FullName -match '\\.(xhtml|html)$' -and $entry.FullName -notmatch '[\\\\/]') {
          $pages += $entry.FullName
        }
      }
      $pages = $pages | Sort-Object
      if ($pages.Count -eq 0) {
        # Fallback: get all HTML files in subdirectories
        foreach ($entry in $archive.Entries) {
          if ($entry.FullName -match '\\.(xhtml|html)$') {
            $pages += $entry.FullName
          }
        }
        $pages = $pages | Sort-Object -Unique
      }
      $pages | ConvertTo-Json -Compress
    } finally {
      $archive.Dispose()
    }
  `;
  try {
    const encoded = Buffer.from(powershell, "utf16le").toString("base64");
    const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], { encoding: "utf8" }).trim();
    return JSON.parse(output);
  } catch (err) {
    console.warn(`Failed to parse ${epubPath}, using default`);
    return [];
  }
}

// Load existing export
const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);

for (const book of books) {
  const epubPath = path.join(root, "book_html", book.folder, "book.epub");
  if (!fs.existsSync(epubPath)) {
    console.warn(`Skipping ${book.id}: EPUB not found`);
    continue;
  }

  console.log(`Processing ${book.id}...`);
  
  // Parse EPUB pages
  const pages = parseEpubPages(epubPath);
  const pageCount = Math.max(10, pages.length); // Minimum 10 pages if parse fails
  
  // Find existing course
  const existingCourse = exportData.courses.find(c => c.id === book.id);
  if (!existingCourse) {
    console.warn(`Course ${book.id} not found in export`);
    continue;
  }

  // Build chapters (one per page)
  const chapters = [];
  for (let i = 0; i < pageCount; i++) {
    const page = pages[i] || `page-${i + 1}.xhtml`;
    const chapterId = `${book.id}-epub-page-${String(i + 1).padStart(3, "0")}`;
    const stepId = `${chapterId}-step`;
    
    chapters.push({
      id: chapterId,
      courseId: book.id,
      chapterIndex: i,
      title: `Page ${i + 1}`,
      steps: [{
        id: stepId,
        courseId: book.id,
        chapterId,
        chapterTitle: `Page ${i + 1}`,
        chapterIndex: i,
        stepIndex: i + 1,
        stepType: "epub",
        title: `Page ${i + 1}`,
        description: "",
        contentHtml: `/book_html/${book.folder}/book.epub#${page}`,
      }]
    });
  }

  // Update course
  existingCourse.stepCount = pageCount;
  existingCourse.chapters = chapters;
  console.log(`  Updated ${book.id} with ${pageCount} pages`);
}

// Save updated export
exportData.exportedAt = new Date().toISOString();
writeJson(exportPath, exportData, true);

// Update deploy export
const deployPath = "deploy/indexeddb-export.json";
const deployData = readJson(deployPath);
for (const book of books) {
  const course = deployData.courses.find(c => c.id === book.id);
  const updated = exportData.courses.find(c => c.id === book.id);
  if (course && updated) {
    course.stepCount = updated.stepCount;
    course.chapters = updated.chapters;
  }
}
deployData.exportedAt = exportData.exportedAt;
writeJson(deployPath, deployData, true);

// Update course details
for (const book of books) {
  const course = exportData.courses.find(c => c.id === book.id);
  if (course) {
    writeJson(`public/data/course-details/${encodeURIComponent(book.id)}.json`, course);
  }
}

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
for (const book of books) {
  const course = exportData.courses.find(c => c.id === book.id);
  const homeIndex = homeCatalog.courses.findIndex(c => c.id === book.id);
  if (course && homeIndex >= 0) {
    homeCatalog.courses[homeIndex] = Object.fromEntries(summaryKeys
      .filter((key) => course[key] !== undefined)
      .map((key) => [key, course[key]]));
  }
}
homeCatalog.exportedAt = exportData.exportedAt;
writeJson(homePath, homeCatalog, true);

// Update catalog version
writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:epub-structure-fix`,
  courseCount: exportData.courses.length,
});

console.log(`\nFixed ${books.length} books with proper page structure`);
console.log("Next: Clear IndexedDB in browser to see changes");
