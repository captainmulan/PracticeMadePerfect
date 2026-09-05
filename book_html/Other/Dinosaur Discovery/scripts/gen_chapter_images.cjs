#!/usr/bin/env node
/* Embed chapter PNGs as data URIs (Solar System style — single HTML, no fetch) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const OUT = path.join(DIR, "_dino-chapter-images.js");

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_dino-data.js"), "utf8"), sandbox);
const IDS = sandbox.window.DINO_CHAPTERS.map((c) => c.id);

function toDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function findImage(id, slot) {
  for (const name of [`${id}-${slot}.png`, `${id}-${slot}.jpg`, `${id}-${slot}.jpeg`]) {
    const p = path.join(ASSETS, name);
    if (fs.existsSync(p)) return toDataUri(p);
  }
  return null;
}

const images = {};
IDS.forEach((id) => {
  images[id] = {};
  for (let i = 1; i <= 3; i++) {
    images[id][`main-${i}`] = findImage(id, `main-${i}`);
    images[id][`explain-${i}`] = findImage(id, `explain-${i}`);
  }
});

const js = `/* Chapter images — embedded PNG/JPG (generate: node scripts/gen_chapter_images.cjs) */
(function (w) {
  w.DINO_CHAPTER_IMAGES = ${JSON.stringify(images)};

  function imgTag(uri, alt) {
    return '<img class="chapter-hero-img" src="' + uri + '" alt="' + alt.replace(/"/g, "&quot;") + '" decoding="async">';
  }

  w.DinoChapterImage = {
    render: function (id, slot, title) {
      var ch = w.DINO_CHAPTER_IMAGES[id];
      if (ch && ch[slot]) return imgTag(ch[slot], title + " — " + slot);
      return null;
    }
  };
})(window);
`;

fs.writeFileSync(OUT, js);
const count = IDS.reduce((n, id) => {
  return n + Object.values(images[id]).filter(Boolean).length;
}, 0);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + " MB)");
console.log("Embedded", count, "images across", IDS.length, "chapters");
