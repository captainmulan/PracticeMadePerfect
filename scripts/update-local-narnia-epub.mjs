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
      $starts = [ordered]@{}
      foreach ($node in $xml.SelectNodes('//*[local-name()="navMap"]/*[local-name()="navPoint"]')) {
        $title = $node.SelectSingleNode('./*[local-name()="navLabel"]/*[local-name()="text"]').InnerText.Trim()
        if ($title -match '^(The Magician|The Lion,|The Horse and|Prince Caspian|The Voyage|The Silver Chair|The Last Battle|Boxen)') {
          $starts[$title] = $node.SelectSingleNode('./*[local-name()="content"]').GetAttribute('src')
          $entries = [System.Collections.Generic.List[object]]::new()
          Add-Entries $node $entries
          $books[$title] = $entries.ToArray()
        }
      }
      $result = @{ books = $books; starts = $starts }
      [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(($result | ConvertTo-Json -Depth 12 -Compress)))
    } finally { $archive.Dispose() }
  `;
  const encodedCommand = Buffer.from(powershell, "utf16le").toString("base64");
  const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encodedCommand], { encoding: "utf8" }).trim();
  return JSON.parse(Buffer.from(output, "base64").toString("utf8"));
}

function readEpubPageLocations() {
  const assetFile = path.join(root, assetPath.replace(/^\/book_html\//, "book_html/"));
  const powershell = `
    $ErrorActionPreference = 'Stop'
    $OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead('${assetFile.replace(/'/g, "''")}')
    try {
      $pages = [ordered]@{}
      foreach ($entry in $archive.Entries | Where-Object { $_.FullName -match 'index_split_\\d+\\.html$' }) {
        $reader = [System.IO.StreamReader]::new($entry.Open())
        try { $html = $reader.ReadToEnd() } finally { $reader.Dispose() }
        foreach ($match in [regex]::Matches($html, 'id=["''](p\\d+)["'']')) {
          $pages[$match.Groups[1].Value] = $entry.FullName
        }
      }
      [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(($pages | ConvertTo-Json -Compress)))
    } finally { $archive.Dispose() }
  `;
  const encodedCommand = Buffer.from(powershell, "utf16le").toString("base64");
  const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encodedCommand], { encoding: "utf8" }).trim();
  return JSON.parse(Buffer.from(output, "base64").toString("utf8"));
}

function buildPageLocations(startHref, endHref, pageLocations) {
  const start = /^(.*)#p(\d+)$/.exec(startHref);
  const end = /^(.*)#p(\d+)$/.exec(endHref ?? "");
  if (!start || !end) return [startHref];

  const pages = [];
  for (let pageNumber = Number(start[2]); pageNumber < Number(end[2]); pageNumber += 1) {
    const file = pageLocations[`p${pageNumber}`];
    if (!file) throw new Error(`Missing EPUB page anchor p${pageNumber}.`);
    pages.push(`${file}#p${pageNumber}`);
  }
  if (pages.length === 0) throw new Error(`No EPUB pages found between ${startHref} and ${endHref}.`);
  return pages;
}

function buildEpubCourse(course, tocByTitle, bookStarts, pageLocations) {
  const entries = tocByTitle[courseTocTitles[course.id]];
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`No EPUB TOC entries found for ${course.title}.`);
  }
  const courseEntries = course.id === "narnia-lion"
    ? entries.filter((entry) => /^Chapter\s/i.test(entry.title))
    : entries;
  if (courseEntries.length === 0) throw new Error(`No story chapters found for ${course.title}.`);
  if (course.id === "narnia-lion") {
    courseEntries.unshift({ title: course.title, href: bookStarts[courseTocTitles[course.id]] });
  }

  let stepIndex = 0;
  const chapters = courseEntries.map((entry, index) => {
    const chapterId = `${course.id}-epub-chapter-${String(index + 1).padStart(3, "0")}`;
    const nextChapterHref = courseEntries[index + 1]?.href ?? tocByTitle[nextBookTocTitles[course.id]]?.[0]?.href;
    const chapterPages = course.id === "narnia-lion"
      ? buildPageLocations(entry.href, nextChapterHref, pageLocations)
      : [entry.href];
    const steps = chapterPages.map((href, pageIndex) => {
      stepIndex += 1;
      const pageNumber = /#p(\d+)$/.exec(href)?.[1];
      const nextHref = chapterPages[pageIndex + 1] ?? nextChapterHref;
      return {
        id: `${course.id}-epub-${course.id === "narnia-lion" ? "page" : "step"}-${String(stepIndex).padStart(3, "0")}`,
        courseId: course.id,
        chapterId,
        chapterTitle: entry.title,
        chapterIndex: index,
        stepIndex,
        stepType: "epub",
        title: pageNumber ? `${entry.title} - ${pageNumber}` : entry.title,
        description: "",
        contentHtml: `${assetPath}#${href}`,
        epubNextLocation: nextHref,
      };
    });
    return { id: chapterId, courseId: course.id, chapterIndex: index, title: entry.title, steps };
  });
  return {
    ...course,
    bookHtmlFolder: "Other/Narnia_Complete",
    stepCount: chapters.reduce((count, chapter) => count + chapter.steps.length, 0),
    chapters,
  };
}

const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);
const tocData = readEpubToc();
const tocByTitle = tocData.books;
const bookStarts = tocData.starts;
const pageLocations = readEpubPageLocations();
const targetCourseId = process.argv[2];
if (targetCourseId && !Object.hasOwn(courseTocTitles, targetCourseId)) {
  throw new Error(`Unknown Narnia course: ${targetCourseId}.`);
}
const matchedCourses = exportData.courses.filter((course) =>
  Object.hasOwn(courseTocTitles, course.id) && (!targetCourseId || course.id === targetCourseId),
);
if (matchedCourses.length === 0) throw new Error(`No matching Narnia course found for ${targetCourseId ?? "update"}.`);

const updatedById = new Map(matchedCourses.map((course) => [course.id, buildEpubCourse(course, tocByTitle, bookStarts, pageLocations)]));
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
