#!/usr/bin/env node
/**
 * Compress book_html/<book>/assets images to WebP (max width 1280, quality 80).
 * Keeps source jpg/png for fallback until QA + --remove-source.
 *
 * Usage (from repo root):
 *   node scripts/compress-book-assets.cjs --book=OceanAdventure
 *   node scripts/compress-book-assets.cjs --book=GlobalWarming
 *   node scripts/compress-book-assets.cjs --all
 *   node scripts/compress-book-assets.cjs --book=OceanAdventure --dry-run
 *   node scripts/compress-book-assets.cjs --book=OceanAdventure --remove-source
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "book_html");
const MAX_WIDTH = 1280;
const QUALITY = 80;

const BOOK_ORDER = [
  "OceanAdventure",
  "GlobalWarming",
  "MyFirst100MMWords",
  "Continents",
  "Countries",
  "Dinosaur Discovery",
  "explore my body",
  "MudraGoesToGrandmaVillage",
  "Mudra goes to Bagan",
  "သံပါးစပ်",
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const removeSource = args.includes("--remove-source");
const all = args.includes("--all");
const bookArg = args.find((a) => a.startsWith("--book="));
const bookName = bookArg ? bookArg.slice("--book=".length) : null;

async function compressDir(assetsDir, label) {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Install sharp first: npm install sharp --no-save");
    process.exit(1);
  }

  if (!fs.existsSync(assetsDir)) {
    console.warn("Skip (no assets):", label);
    return { converted: 0, saved: 0 };
  }

  const files = fs
    .readdirSync(assetsDir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f));

  let converted = 0;
  let saved = 0;

  for (const file of files) {
    const src = path.join(assetsDir, file);
    const base = file.replace(/\.(png|jpe?g)$/i, "");
    const dest = path.join(assetsDir, base + ".webp");

    if (fs.existsSync(dest)) {
      const srcStat = fs.statSync(src);
      const destStat = fs.statSync(dest);
      if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size > 0) {
        continue;
      }
    }

    const before = fs.statSync(src).size;
    if (dryRun) {
      console.log("[dry-run]", label, file, "→", base + ".webp");
      converted += 1;
      continue;
    }

    await sharp(src)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dest);

    const after = fs.statSync(dest).size;
    saved += Math.max(0, before - after);
    converted += 1;
    console.log(
      label,
      file,
      "→",
      base + ".webp",
      `(${(after / 1024).toFixed(0)} KB, was ${(before / 1024).toFixed(0)} KB)`,
    );

    if (removeSource) {
      fs.unlinkSync(src);
    }
  }

  return { converted, saved };
}

async function main() {
  const books = all ? BOOK_ORDER : bookName ? [bookName] : null;
  if (!books) {
    console.error("Pass --book=Name or --all");
    process.exit(1);
  }

  let totalConverted = 0;
  let totalSaved = 0;

  for (const book of books) {
    const assetsDir = path.join(ROOT, book, "assets");
    const result = await compressDir(assetsDir, book);
    totalConverted += result.converted;
    totalSaved += result.saved;
  }

  console.log(
    "\nDone.",
    totalConverted,
    "webp files.",
    "Saved vs sources ~" + (totalSaved / 1024 / 1024).toFixed(1) + " MB",
    dryRun ? "(dry-run)" : "",
    removeSource ? "(sources removed)" : "(sources kept for fallback)",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
