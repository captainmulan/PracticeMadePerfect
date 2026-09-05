#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const src = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-65966-PracticeMadePerfect/assets/continents-cover.png"
);
const destDir = path.join(__dirname, "../../../public/book_covers");
fs.mkdirSync(destDir, { recursive: true });
if (!fs.existsSync(src)) {
  console.error("Missing cover at", src);
  process.exit(1);
}
fs.copyFileSync(src, path.join(destDir, "continents.png"));
fs.copyFileSync(src, path.join(destDir, "continents.webp"));
console.log("Wrote continents.png and continents.webp to", destDir);
console.log("Sizes:", fs.statSync(path.join(destDir, "continents.webp")).size);
