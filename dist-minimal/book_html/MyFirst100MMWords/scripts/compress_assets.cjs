#!/usr/bin/env node
/* Compress chapter PNGs to JPG for smaller embeds (max width 1280, q=78) */
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Run: npm install sharp --no-save  (from repo root or this folder)");
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS).filter((f) => /\.(png|jpe?g)$/i.test(f));
  let saved = 0;
  for (const file of files) {
    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) continue;
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
    console.log(file, "→", base + ".jpg", "(" + (after / 1024).toFixed(0) + " KB)");
  }
  console.log("Saved ~" + (saved / 1024 / 1024).toFixed(1) + " MB vs PNG sources");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
