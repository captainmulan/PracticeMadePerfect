import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceEpub = process.argv[2] ?? "C:\\Users\\65966\\Downloads\\comic\\02-Oct-26\\Percy\\Percy Jackson - The Complete_.epub";
const bookFolder = "Other/Percy_Jackson_Complete";
const epubName = "Percy Jackson - The Complete_.epub";
const assetPath = `/book_html/${bookFolder}/${epubName}`;
const books = [
  { id: "percy-jackson-lightning-thief", tocTitle: "Percy Jackson and the Lightning Thief", title: "Percy Jackson - The Lightning Thief", coverEntry: "index-9_1.jpg" },
  { id: "percy-jackson-sea-of-monsters", tocTitle: "Percy Jackson and the Sea of Monsters", title: "Percy Jackson - The Sea of Monsters", coverEntry: "index-267_1.jpg" },
  { id: "percy-jackson-titans-curse", tocTitle: "Percy Jackson and the Titan’s Curse", title: "Percy Jackson - The Titan’s Curse", coverEntry: "index-463_1.jpg" },
  { id: "percy-jackson-battle-of-the-labyrinth", tocTitle: "Percy Jackson and the Battle of the Labyrinth", title: "Percy Jackson - The Battle of the Labyrinth", coverEntry: "index-676_1.jpg" },
  { id: "percy-jackson-last-olympian", tocTitle: "Percy Jackson and the Last Olympian", title: "Percy Jackson - The Last Olympian", coverEntry: "index-923_1.jpg" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

function readEpubContents() {
  const escapedPath = path.resolve(sourceEpub).replace(/'/g, "''");
  const powershell = `
    $ErrorActionPreference = 'Stop'
    $OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead('${escapedPath}')
    try {
      $reader = [System.IO.StreamReader]::new($archive.GetEntry('toc.ncx').Open())
      try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
      $books = [System.Collections.Generic.List[object]]::new()
      foreach ($node in $xml.SelectNodes('//*[local-name()="navMap"]/*[local-name()="navPoint"]')) {
        $label = $node.SelectSingleNode('./*[local-name()="navLabel"]/*[local-name()="text"]')
        $content = $node.SelectSingleNode('./*[local-name()="content"]')
        $books.Add(@{ title = ($label.InnerText -replace '\\s+', ' ').Trim(); href = $content.GetAttribute('src') })
      }
      $pages = [ordered]@{}
      foreach ($entry in $archive.Entries | Where-Object { $_.FullName -match 'index_split_\\d+\\.html$' }) {
        $pageReader = [System.IO.StreamReader]::new($entry.Open())
        try { $html = $pageReader.ReadToEnd() } finally { $pageReader.Dispose() }
        foreach ($match in [regex]::Matches($html, 'id=["''](p\\d+)["'']')) {
          $pages[$match.Groups[1].Value] = $entry.FullName
        }
      }
      $covers = [ordered]@{}
      foreach ($name in @('index-9_1.jpg', 'index-267_1.jpg', 'index-463_1.jpg', 'index-676_1.jpg', 'index-923_1.jpg')) {
        $coverEntry = $archive.GetEntry($name)
        if (-not $coverEntry) { throw "Missing embedded cover image: $name" }
        $coverReader = [System.IO.BinaryReader]::new($coverEntry.Open())
        try { $covers[$name] = [Convert]::ToBase64String($coverReader.ReadBytes([int]$coverEntry.Length)) } finally { $coverReader.Dispose() }
      }
      $result = @{ books = $books.ToArray(); pages = $pages; covers = $covers }
      [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(($result | ConvertTo-Json -Depth 8 -Compress)))
    } finally { $archive.Dispose() }
  `;
  const encoded = Buffer.from(powershell, "utf16le").toString("base64");
  const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], { encoding: "utf8" }).trim();
  return JSON.parse(Buffer.from(output, "base64").toString("utf8"));
}

function buildCourse(book, template, toc, pageLocations, courseIndex) {
  const tocIndex = toc.findIndex((entry) => entry.title === book.tocTitle);
  if (tocIndex < 0) throw new Error(`Missing EPUB TOC entry: ${book.tocTitle}`);
  const start = /#p(\d+)$/.exec(toc[tocIndex].href);
  if (!start) throw new Error(`EPUB TOC entry has no page anchor: ${book.tocTitle}`);
  const nextStart = toc.slice(tocIndex + 1).find((entry) => /^Percy Jackson and the /.test(entry.title));
  const endPage = nextStart ? Number(/#p(\d+)$/.exec(nextStart.href)?.[1]) : Infinity;
  const firstPage = Number(start[1]);
  const pageNumbers = Object.keys(pageLocations)
    .map((pageId) => Number(pageId.slice(1)))
    .filter((pageNumber) => pageNumber >= firstPage && pageNumber < endPage)
    .sort((left, right) => left - right);
  if (pageNumbers.length === 0) throw new Error(`No EPUB pages found for ${book.title}.`);

  const chapterId = `${book.id}-epub-chapter-001`;
  const steps = pageNumbers.map((pageNumber, index) => {
    const pageId = `p${pageNumber}`;
    const nextPageId = `p${pageNumbers[index + 1]}`;
    return {
      id: `${book.id}-epub-page-${String(index + 1).padStart(3, "0")}`,
      courseId: book.id,
      chapterId,
      chapterTitle: book.title,
      chapterIndex: 0,
      stepIndex: index + 1,
      stepType: "epub",
      title: `${book.title} - Page ${index + 1}`,
      description: "",
      contentHtml: `${assetPath}#${pageLocations[pageId]}#${pageId}`,
      ...(nextPageId ? { epubNextLocation: `${pageLocations[nextPageId]}#${nextPageId}` } : {}),
    };
  });

  return {
    ...template,
    id: book.id,
    title: book.title,
    authorName: "Rick Riordan",
    coverImageUrl: `/book_covers/thumbs/${book.id}.webp`,
    courseIndex,
    category: "Kid",
    cat1: "Kid",
    cat2: "JuniorNovel",
    cat3: "Percy Jackson",
    scIndex: courseIndex - 229,
    artifactType: "book",
    pageViewType: "NormalView",
    bookHtmlFolder: bookFolder,
    stepCount: steps.length,
    chapters: [{ id: chapterId, courseId: book.id, chapterIndex: 0, title: book.title, steps }],
  };
}

if (!fs.existsSync(sourceEpub)) throw new Error(`Missing source EPUB: ${sourceEpub}`);

const contents = readEpubContents();
const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);
const template = exportData.courses.find((course) => course.id === "narnia-nephew");
if (!template) throw new Error("Could not find the Narnia book template in the course export.");
const firstCourseIndex = Math.max(0, ...exportData.courses.map((course) => course.courseIndex ?? 0)) + 1;
const updatedCourses = books.map((book, index) => buildCourse(book, template, contents.books, contents.pages, firstCourseIndex + index));
const updatedById = new Map(updatedCourses.map((course) => [course.id, course]));
exportData.courses = exportData.courses.filter((course) => !updatedById.has(course.id));
exportData.courses.push(...updatedCourses);
exportData.exportedAt = new Date().toISOString();

const epubDestination = path.join(root, "book_html", bookFolder, epubName);
fs.mkdirSync(path.dirname(epubDestination), { recursive: true });
fs.copyFileSync(sourceEpub, epubDestination);
const thumbDirectory = path.join(root, "public", "book_covers", "thumbs");
fs.mkdirSync(thumbDirectory, { recursive: true });
for (const book of books) {
  const coverBytes = Buffer.from(contents.covers[book.coverEntry], "base64");
  const thumbnail = await sharp(coverBytes)
    .rotate()
    .resize({ width: 360, height: 540, fit: "inside" })
    .webp({ quality: 84, effort: 6 })
    .toBuffer();
  fs.writeFileSync(path.join(thumbDirectory, `${book.id}.webp`), thumbnail);
}
writeJson(exportPath, exportData, true);
const deployPath = "deploy/indexeddb-export.json";
const deployData = readJson(deployPath);
deployData.courses = deployData.courses.filter((course) => !updatedById.has(course.id));
deployData.courses.push(...updatedCourses);
deployData.exportedAt = exportData.exportedAt;
writeJson(deployPath, deployData, true);

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

for (const course of updatedCourses) {
  writeJson(`public/data/course-details/${encodeURIComponent(course.id)}.json`, course);
}
writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:shelf-index-v2`,
  courseCount: exportData.courses.length,
});

console.log(`Imported ${updatedCourses.length} Percy Jackson books from one EPUB.`);
for (const course of updatedCourses) console.log(`${course.id}: ${course.stepCount} pages`);