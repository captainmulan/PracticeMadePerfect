#!/usr/bin/env node
/* Compress chapter PNGs to JPG for faster page loads (max width 1280, q=78) */
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const REMOVE_PNG = process.argv.includes("--remove-png");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Run from repo root: npm install sharp --no-save");
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS).filter((f) => f.endsWith(".png"));
  let saved = 0;
  let converted = 0;

  for (const file of files) {
    const src = path.join(ASSETS, file);
    const base = file.replace(/\.png$/i, "");
    const dest = path.join(ASSETS, base + ".jpg");
    await sharp(src)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
    const before = fs.statSync(src).size;
    const after = fs.statSync(dest).size;
    saved += before - after;
    converted++;
    console.log(file, "→", base + ".jpg", "(" + (after / 1024).toFixed(0) + " KB, was " + (before / 1024).toFixed(0) + " KB)");
    if (REMOVE_PNG) fs.unlinkSync(src);
  }

  console.log("Converted", converted, "files. Saved ~" + (saved / 1024 / 1024).toFixed(1) + " MB vs PNG sources");
  if (REMOVE_PNG) console.log("Removed source PNG files (--remove-png)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
