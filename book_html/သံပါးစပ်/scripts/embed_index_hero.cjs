#!/usr/bin/env node
/* Embed hero portrait as data URI in 001_index.html (standalone) */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..");
const HTML = path.join(DIR, "001_index.html");
const IMAGE_CANDIDATES = [
  path.join(DIR, "assets", "thone-pa-sat-hero-v7.png"),
  path.join(DIR, "assets", "thone-pa-sat-hero-v6.png"),
  path.join(DIR, "assets", "thone-pa-sat-hero-v5.png"),
  path.join(DIR, "assets", "thone-pa-sat-hero-v4.png"),
  path.join(DIR, "assets", "thone-pa-sat-hero-v3.png"),
  path.join(DIR, "assets", "thone-pa-sat-hero.png"),
  "C:\\Users\\65966\\.cursor\\projects\\c-Users-65966-PracticeMadePerfect\\assets\\thone-pa-sat-hero-v4.png",
  "C:\\Users\\65966\\.cursor\\projects\\c-Users-65966-PracticeMadePerfect\\assets\\thone-pa-sat-hero-v2.png",
  "C:\\Users\\65966\\.cursor\\projects\\c-Users-65966-PracticeMadePerfect\\assets\\thone-pa-sat-hero.png",
];

const imagePath = IMAGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!imagePath) {
  console.error("Hero image not found. Tried:", IMAGE_CANDIDATES);
  process.exit(1);
}

const assetsDir = path.join(DIR, "assets");
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
const localImage = path.join(assetsDir, "thone-pa-sat-hero.png");
if (path.resolve(imagePath) !== path.resolve(localImage)) {
  fs.copyFileSync(imagePath, localImage);
}

const ext = path.extname(localImage).toLowerCase();
const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
const dataUri = `data:${mime};base64,${fs.readFileSync(localImage).toString("base64")}`;

let html = fs.readFileSync(HTML, "utf8");

if (html.includes('id="heroImg" src=""')) {
  html = html.replace(
    '<img class="hero-img" id="heroImg" src="" alt="သံပါးစပ် — ဝိမလ" decoding="async">',
    `<img class="hero-img" id="heroImg" src="${dataUri}" alt="သံပါးစပ် — ဝိမလ" decoding="async">`
  );
} else if (html.includes('class="hero-img"')) {
  html = html.replace(/<img class="hero-img"[^>]*src="[^"]*"[^>]*>/, `<img class="hero-img" id="heroImg" src="${dataUri}" alt="သံပါးစပ် — ဝိမလ" decoding="async">`);
} else {
  console.error("Could not find hero img placeholder in HTML");
  process.exit(1);
}

html = html.replace("<!-- HERO_IMAGE_EMBED -->", "");

fs.writeFileSync(HTML, html);
console.log("Embedded hero in", path.basename(HTML));
console.log("Source:", localImage, "(" + (fs.statSync(localImage).size / 1024).toFixed(0) + " KB)");
console.log("HTML size:", (fs.statSync(HTML).size / 1024 / 1024).toFixed(2), " MB");
