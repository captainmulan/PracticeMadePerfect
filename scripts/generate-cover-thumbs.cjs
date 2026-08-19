#!/usr/bin/env node
/**
 * Write smaller WebP thumbs for home-shelf covers (max 360px wide).
 * Usage: node scripts/generate-cover-thumbs.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "public", "book_covers");
const OUT = path.join(ROOT, "thumbs");
const MAX_WIDTH = 360;
const QUALITY = 70;

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Install sharp first: npm install");
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(ROOT).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
  let converted = 0;

  for (const file of files) {
    const src = path.join(ROOT, file);
    const dest = path.join(OUT, file.replace(/\.(png|jpe?g)$/i, ".webp"));
    const before = fs.statSync(src).size;
    await sharp(src)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dest);
    const after = fs.statSync(dest).size;
    converted += 1;
    console.log(`${file}: ${Math.round(before / 1024)}KB → thumbs/${path.basename(dest)} ${Math.round(after / 1024)}KB`);
  }

  console.log(`Wrote ${converted} thumbs to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
