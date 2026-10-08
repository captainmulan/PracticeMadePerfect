import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetPath = "/book_html/Other/Narnia_Complete/The-Chronicles-of-Narnia-Complete.epub";
const courseTocTitles = {
  "narnia-nephew": "The Magician’s Nephew",
  "narnia-lion": "The Lion, the Witch and the Wardrobe",
  "narnia-horse": "The Horse and His Boy",
  "narnia-prince": "Prince Caspian",
  "narnia-voyage": "The Voyage of the Dawn Treader",
  "narnia-chair": "The Silver Chair",
  "narnia-last": "The Last Battle",
  "narnia-boxen": "Boxen",
};
const nextBookTocTitles = {
  "narnia-nephew": "The Lion, the Witch and the Wardrobe",
  "narnia-lion": "The Horse and His Boy",
  "narnia-horse": "Prince Caspian",
  "narnia-prince": "The Voyage of the Dawn Treader",
  "narnia-voyage": "The Silver Chair",
  "narnia-chair": "The Last Battle",
  "narnia-last": "Boxen",
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

function readEpubToc() {
  const assetFile = path.join(root, assetPath.replace(/^\/book_html\//, "book_html/"));
  const powershell = `
    $ErrorActionPreference = 'Stop'
    $OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead('${assetFile.replace(/'/g, "''")}')
    try {
      $reader = [System.IO.StreamReader]::new($archive.GetEntry('toc.ncx').Open())
      try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
      function Add-Entries($node, $list) {
        $labelNode = $node.SelectSingleNode('./*[local-name()="navLabel"]/*[local-name()="text"]')
        $contentNode = $node.SelectSingleNode('./*[local-name()="content"]')
        if ($labelNode -and $contentNode) {
          $label = ($labelNode.InnerText -replace '\\s+', ' ').Trim()
          $href = $contentNode.GetAttribute('src')
          if ($label -and $href) { [void]$list.Add(@{ title = $label; href = $href }) }
        }
        foreach ($child in $node.SelectNodes('./*[local-name()="navPoint"]')) { Add-Entries $child $list }
      }
      $books = [ordered]@{}
      foreach ($node in $xml.SelectNodes('//*[local-name()="navMap"]/*[local-name()="navPoint"]')) {
        $title = $node.SelectSingleNode('./*[local-name()="navLabel"]/*[local-name()="text"]').InnerText.Trim()
        if ($title -match '^(The Magician|The Lion,|The Horse and|Prince Caspian|The Voyage|The Silver Chair|The Last Battle|Boxen)') {
          $entries = [System.Collections.Generic.List[object]]::new()
          Add-Entries $node $entries
          $books[$title] = $entries.ToArray()
        }
      }
      [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(($books | ConvertTo-Json -Depth 12 -Compress)))
    } finally { $archive.Dispose() }
  `;
  const encodedCommand = Buffer.from(powershell, "utf16le").toString("base64");
  const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encodedCommand], { encoding: "utf8" }).trim();
  return JSON.parse(Buffer.from(output, "base64").toString("utf8"));
}

function buildEpubCourse(course, tocByTitle) {
  const entries = tocByTitle[courseTocTitles[course.id]];
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`No EPUB TOC entries found for ${course.title}.`);
  }
  const chapters = entries.map((entry, index) => {
    const chapterId = `${course.id}-epub-chapter-${String(index + 1).padStart(3, "0")}`;
    const step = {
      id: `${course.id}-epub-step-${String(index + 1).padStart(3, "0")}`,
      courseId: course.id,
      chapterId,
      chapterTitle: entry.title,
      chapterIndex: index,
      stepIndex: index + 1,
      stepType: "epub",
      title: entry.title,
      description: "",
      contentHtml: `${assetPath}#${entry.href}`,
      epubNextLocation: entries[index + 1]?.href ?? tocByTitle[nextBookTocTitles[course.id]]?.[0]?.href,
    };
    return { id: chapterId, courseId: course.id, chapterIndex: index, title: entry.title, steps: [step] };
  });
  return {
    ...course,
    bookHtmlFolder: "Other/Narnia_Complete",
    stepCount: chapters.length,
    chapters,
  };
}

const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);
const tocByTitle = readEpubToc();
const matchedCourses = exportData.courses.filter((course) => Object.hasOwn(courseTocTitles, course.id));
if (matchedCourses.length !== Object.keys(courseTocTitles).length) {
  throw new Error(`Expected ${Object.keys(courseTocTitles).length} Narnia courses; found ${matchedCourses.length}.`);
}

const updatedById = new Map(matchedCourses.map((course) => [course.id, buildEpubCourse(course, tocByTitle)]));
exportData.courses = exportData.courses.map((course) => updatedById.get(course.id) ?? course);
exportData.exportedAt = new Date().toISOString();
writeJson(exportPath, exportData, true);

const catalogPath = "public/data/home-catalog.json";
const catalog = readJson(catalogPath);
catalog.exportedAt = exportData.exportedAt;
catalog.courses = catalog.courses.map((course) => {
  const updated = updatedById.get(course.id);
  return updated
    ? { ...course, bookHtmlFolder: updated.bookHtmlFolder, stepCount: updated.stepCount }
    : course;
});
writeJson(catalogPath, catalog, true);

for (const course of updatedById.values()) {
  writeJson(`public/data/course-details/${encodeURIComponent(course.id)}.json`, course);
}

writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:shelf-index-v2`,
  courseCount: exportData.courses.length,
});

console.log(`Updated ${updatedById.size} local Narnia courses to EPUB.`);
for (const course of updatedById.values()) {
  console.log(`${course.id}: ${course.title} (${course.stepCount} pages)`);
}
