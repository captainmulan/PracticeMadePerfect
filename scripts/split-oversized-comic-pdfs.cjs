#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { PDFDocument } = require("pdf-lib");

const root = path.join(__dirname, "..");
const comicRoot = path.join(root, "book_html", "Comic");
const archiveRoot = path.join(root, "comic-source-pdfs");
const exportPath = path.join(root, "deploy", "indexeddb-export.json");
const maxFileBytes = 25 * 1024 * 1024;
const targetFileBytes = 23 * 1024 * 1024;

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function getSteps(course) {
  return (course.chapters ?? []).flatMap((chapter) => chapter.steps ?? []);
}

function findCourseForPdf(exportData, relativePdfPath) {
  const sourceUrl = `/book_html/Comic/${toPosix(relativePdfPath)}`;
  const matches = [];
  for (const course of exportData.courses ?? []) {
    const steps = getSteps(course);
    const matchingSteps = steps.filter((step) => {
      const value = step.contentHtml?.split("#", 1)[0];
      return value === sourceUrl;
    });
    if (matchingSteps.length > 0) matches.push({ course, matchingSteps });
  }
  if (matches.length !== 1) {
    throw new Error(`${sourceUrl} maps to ${matches.length} courses in the admin export.`);
  }
  return matches[0];
}

function getOriginalPage(step) {
  const match = step.contentHtml?.match(/#page=(\d+)$/i);
  const page = match ? Number(match[1]) : Number(step.stepIndex);
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`Could not resolve original PDF page for ${step.id}.`);
  }
  return page;
}

function validatePageMap(course, matchingSteps, pageCount) {
  const stepByPage = new Map();
  for (const step of matchingSteps) {
    const page = getOriginalPage(step);
    if (stepByPage.has(page)) throw new Error(`Duplicate page ${page} for ${course.id}.`);
    stepByPage.set(page, step);
  }
  if (stepByPage.size !== pageCount) {
    throw new Error(`${course.id}: admin maps ${stepByPage.size} pages, PDF has ${pageCount}.`);
  }
  for (let page = 1; page <= pageCount; page += 1) {
    if (!stepByPage.has(page)) throw new Error(`${course.id}: missing admin mapping for page ${page}.`);
  }
  return stepByPage;
}

async function savePageRange(sourceDocument, firstPage, pageCount) {
  const part = await PDFDocument.create();
  const indexes = Array.from({ length: pageCount }, (_, index) => firstPage - 1 + index);
  const pages = await part.copyPages(sourceDocument, indexes);
  for (const page of pages) part.addPage(page);
  return Buffer.from(await part.save({ useObjectStreams: true }));
}

async function splitPdf(sourcePath, relativePdfPath, exportData) {
  const sourceBytes = fs.readFileSync(sourcePath);
  const sourceDocument = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const pageCount = sourceDocument.getPageCount();
  const { course, matchingSteps } = findCourseForPdf(exportData, relativePdfPath);
  const stepByPage = validatePageMap(course, matchingSteps, pageCount);

  const directory = path.dirname(sourcePath);
  const stem = path.basename(sourcePath, path.extname(sourcePath));
  const archivePath = path.join(archiveRoot, relativePdfPath);
  if (fs.existsSync(archivePath)) throw new Error(`Original archive already exists: ${archivePath}`);

  const initialPageCount = Math.max(
    1,
    Math.floor((targetFileBytes * pageCount) / sourceBytes.length),
  );
  const parts = [];
  let firstPage = 1;
  while (firstPage <= pageCount) {
    let count = Math.min(initialPageCount, pageCount - firstPage + 1);
    let bytes;
    while (true) {
      bytes = await savePageRange(sourceDocument, firstPage, count);
      if (bytes.length < maxFileBytes) break;
      if (count === 1) {
        throw new Error(`${course.id} page ${firstPage} alone exceeds the Pages file cap.`);
      }
      count = Math.max(1, Math.floor((count * targetFileBytes) / bytes.length * 0.9));
    }

    const partNumber = parts.length + 1;
    const fileName = `${stem}-part-${String(partNumber).padStart(2, "0")}.pdf`;
    const outputPath = path.join(directory, fileName);
    if (fs.existsSync(outputPath)) throw new Error(`Refusing to overwrite existing part: ${outputPath}`);
    parts.push({ path: outputPath, fileName, firstPage, pageCount: count, bytes });
    firstPage += count;
  }

  for (const part of parts) {
    fs.writeFileSync(part.path, part.bytes, { flag: "wx" });
    for (let page = part.firstPage; page < part.firstPage + part.pageCount; page += 1) {
      const step = stepByPage.get(page);
      step.contentHtml = `/book_html/Comic/${toPosix(path.relative(comicRoot, part.path))}#page=${page - part.firstPage + 1}`;
    }
  }

  console.log(
    `${course.id}: ${pageCount} pages -> ${parts.length} parts; ` +
    parts.map((part) => `${part.fileName} ${(part.bytes.length / 1024 / 1024).toFixed(2)} MiB`).join(", "),
  );
  return { sourcePath, archivePath };
}

async function main() {
  if (!fs.existsSync(exportPath)) throw new Error(`Missing admin export: ${exportPath}`);
  const exportData = JSON.parse(fs.readFileSync(exportPath, "utf8"));
  const oversizedPdfs = [];
  for (const entry of fs.readdirSync(comicRoot, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".pdf") continue;
    const fullPath = path.join(entry.parentPath, entry.name);
    if (fs.statSync(fullPath).size >= maxFileBytes) oversizedPdfs.push(fullPath);
  }
  if (oversizedPdfs.length === 0) {
    console.log("No Comic PDF is at or above 25 MiB.");
    return;
  }

  for (const sourcePath of oversizedPdfs) {
    const relativePdfPath = path.relative(comicRoot, sourcePath);
    const sourceDocument = await PDFDocument.load(fs.readFileSync(sourcePath), { ignoreEncryption: true });
    const { course, matchingSteps } = findCourseForPdf(exportData, relativePdfPath);
    validatePageMap(course, matchingSteps, sourceDocument.getPageCount());
    const stem = path.basename(sourcePath, path.extname(sourcePath));
    const hasExistingPart = fs.readdirSync(path.dirname(sourcePath)).some((fileName) =>
      fileName.startsWith(`${stem}-part-`),
    );
    if (hasExistingPart) throw new Error(`Existing split parts found for ${course.id}; refusing to overwrite.`);
    const archivePath = path.join(archiveRoot, relativePdfPath);
    if (fs.existsSync(archivePath)) throw new Error(`Original archive already exists: ${archivePath}`);
  }

  const archivedSources = [];
  for (const sourcePath of oversizedPdfs) {
    const relativePdfPath = path.relative(comicRoot, sourcePath);
    archivedSources.push(await splitPdf(sourcePath, relativePdfPath, exportData));
  }

  exportData.exportedAt = new Date().toISOString();
  const serialized = `${JSON.stringify(exportData, null, 2)}\n`;
  const tempExportPath = `${exportPath}.tmp`;
  fs.writeFileSync(tempExportPath, serialized, "utf8");
  fs.renameSync(tempExportPath, exportPath);

  for (const { sourcePath, archivePath } of archivedSources) {
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });
    fs.renameSync(sourcePath, archivePath);
  }

  console.log(`Updated ${exportPath} and archived ${archivedSources.length} original PDFs in ${archiveRoot}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});