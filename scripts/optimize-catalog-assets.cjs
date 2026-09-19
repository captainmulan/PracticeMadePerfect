#!/usr/bin/env node
/**
 * Extract embedded catalog covers into small WebP files and rewrite catalog URLs.
 * The source export remains unchanged; public/dist receive deployable URL-based copies.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "deploy", "indexeddb-export.json");
const targets = [
  path.join(root, "public", "data", "indexeddb-export.json"),
  path.join(root, "dist", "data", "indexeddb-export.json"),
];
const coverRoot = path.join(root, "public", "book_covers");
const distCoverRoot = path.join(root, "dist", "book_covers");
const MAX_WIDTH = 360;
const QUALITY = 58;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function safeFilePart(value) {
  return String(value || "cover")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "cover";
}

function dataUrlToBuffer(value) {
  const match = String(value).match(/^data:[^;]+;base64,(.+)$/s);
  return match ? Buffer.from(match[1], "base64") : null;
}

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Install sharp first: npm install");
    process.exit(1);
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source export: ${sourcePath}`);
  }

  const source = readJson(sourcePath);
  const courses = Array.isArray(source.courses) ? source.courses : [];
  fs.mkdirSync(path.join(coverRoot, "thumbs"), { recursive: true });
  fs.mkdirSync(path.join(distCoverRoot, "thumbs"), { recursive: true });

  let extracted = 0;
  let savedBytes = 0;
  const usedNames = new Set();
  for (const course of courses) {
    const buffer = dataUrlToBuffer(course.coverImageUrl);
    if (!buffer) continue;

    let name = `catalog-${safeFilePart(course.id)}`;
    let suffix = 2;
    while (usedNames.has(name)) name = `catalog-${safeFilePart(course.id)}-${suffix++}`;
    usedNames.add(name);

    const outputName = `${name}.webp`;
    const publicOutput = path.join(coverRoot, "thumbs", outputName);
    const distOutput = path.join(distCoverRoot, "thumbs", outputName);
    const encoded = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: false, fit: "inside" })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer();
    fs.writeFileSync(publicOutput, encoded);
    fs.mkdirSync(path.dirname(distOutput), { recursive: true });
    fs.copyFileSync(publicOutput, distOutput);
    course.coverImageUrl = `/book_covers/thumbs/${outputName}`;
    extracted += 1;
    savedBytes += encoded.length;
  }

  for (const target of targets) {
    if (fs.existsSync(target)) writeJson(target, source);
  }

  console.log(`Extracted ${extracted} embedded covers as WebP.`);
  console.log(`Compressed cover payload: ${Math.round(savedBytes / 1024)} KB total.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
