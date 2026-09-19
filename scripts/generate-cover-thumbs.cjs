#!/usr/bin/env node
/**
 * Write smaller WebP thumbs for home-shelf covers (max 360px wide).
 * Usage: node scripts/generate-cover-thumbs.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "public", "book_covers");
const OUT = path.join(ROOT, "thumbs");
const DIST_OUT = path.resolve(__dirname, "..", "dist", "book_covers", "thumbs");
const MAX_WIDTH = 360;
const QUALITY = 58;

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Install sharp first: npm install");
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const copyToDist = fs.existsSync(path.dirname(DIST_OUT));
  if (copyToDist) fs.mkdirSync(DIST_OUT, { recursive: true });
  const rootFiles = fs.readdirSync(ROOT).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
  const sourceDir = rootFiles.length > 0 ? ROOT : OUT;
  const files = fs.readdirSync(sourceDir).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
  let converted = 0;

  for (const file of files) {
    const src = path.join(sourceDir, file);
    const dest = path.join(OUT, file.replace(/\.(png|jpe?g)$/i, ".webp"));
    const before = fs.statSync(src).size;
    const sourceBytes = fs.readFileSync(src);
    const output = await sharp(sourceBytes)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: false, fit: "inside" })
      .webp({ quality: QUALITY, effort: 6 })
      .toBuffer();
    if (path.resolve(src) === path.resolve(dest)) {
      fs.writeFileSync(`${dest}.tmp`, output);
      fs.unlinkSync(dest);
      fs.renameSync(`${dest}.tmp`, dest);
    } else {
      fs.writeFileSync(dest, output);
    }
    if (copyToDist) fs.copyFileSync(dest, path.join(DIST_OUT, path.basename(dest)));
    const after = output.length;
    converted += 1;
    console.log(`${file}: ${Math.round(before / 1024)}KB → thumbs/${path.basename(dest)} ${Math.round(after / 1024)}KB`);
  }

  console.log(`Wrote ${converted} thumbs to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
