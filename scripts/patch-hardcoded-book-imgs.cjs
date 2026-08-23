#!/usr/bin/env node
/**
 * Patch hard-coded chapter <img src="assets/....jpg|png"> to prefer .webp with fallbacks.
 * Safe: leaves original path in data-fallbacks chain.
 *
 *   node scripts/patch-hardcoded-book-imgs.cjs --book=MyFirst100MMWords
 *   node scripts/patch-hardcoded-book-imgs.cjs --all
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "book_html");
const BOOKS = [
  "MyFirst100MMWords",
  "OceanAdventure",
  "GlobalWarming",
  "Continents",
  "Countries",
  "Dinosaur Discovery",
  "explore my body",
  "MudraGoesToGrandmaVillage",
  "Mudra goes to Bagan",
  "သံပါးစပ်",
];

const args = process.argv.slice(2);
const all = args.includes("--all");
const bookArg = args.find((a) => a.startsWith("--book="));
const books = all ? BOOKS : bookArg ? [bookArg.slice("--book=".length)] : null;

if (!books) {
  console.error("Pass --book=Name or --all");
  process.exit(1);
}

function patchFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  let count = 0;
  const html = raw.replace(
    /<img\b[^>]*>/gi,
    (tag) => {
      if (!/\bsrc=["']assets\/[^"']+\.(png|jpe?g)["']/i.test(tag)) return tag;
      if (/data-fallbacks=/i.test(tag)) return tag;
      const srcMatch = tag.match(/\bsrc=["'](assets\/[^"']+)\.(png|jpe?g)["']/i);
      if (!srcMatch) return tag;
      count += 1;
      const base = srcMatch[1];
      const ext = srcMatch[2].toLowerCase() === "jpeg" ? "jpg" : srcMatch[2].toLowerCase();
      const webp = `${base}.webp`;
      const original = `${base}.${ext}`;
      const chain = [original, `${base}.jpg`, `${base}.png`].filter(
        (v, i, a) => a.indexOf(v) === i,
      );
      let next = tag.replace(/\bsrc=["']assets\/[^"']+\.(png|jpe?g)["']/i, `src="${webp}"`);
      next = next.replace(/\s*\/?>$/, "");
      next += ` data-fallbacks="${chain.join("|")}" onerror="var f=(this.dataset.fallbacks||'').split('|').filter(Boolean);if(f.length){this.src=f.shift();this.dataset.fallbacks=f.join('|');}else{this.onerror=null;}">`;
      if (/\/>$/.test(tag.trim())) {
        next = next.replace(/>$/, " />");
      }
      return next;
    },
  );
  if (count > 0 && html !== raw) {
    fs.writeFileSync(filePath, html, "utf8");
  }
  return count;
}

let total = 0;
for (const book of books) {
  const dir = path.join(ROOT, book);
  if (!fs.existsSync(dir)) {
    console.warn("Skip missing", book);
    continue;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
  let bookCount = 0;
  for (const file of files) {
    bookCount += patchFile(path.join(dir, file));
  }
  console.log(book, "patched imgs:", bookCount);
  total += bookCount;
}
console.log("Total img tags patched:", total);