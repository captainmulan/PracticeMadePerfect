#!/usr/bin/env node
/* Embed chapter PNGs as data URIs — full catalog + per-chapter standalone JS */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const OUT = path.join(DIR, "_ocean-chapter-images.js");

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_ocean-data.js"), "utf8"), sandbox);
const IDS = sandbox.window.OCEAN_CHAPTERS.map((c) => c.id);

const SLOTS = ["main-1", "main-2", "main-3", "explain-1", "explain-2", "explain-3", "view-1", "view-2", "view-3", "view-4"];

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

function buildJs(chapterImages) {
  return `/* Chapter images — embedded PNG/JPG (generate: node scripts/gen_chapter_images.cjs) */
(function (w) {
  w.OCEAN_CHAPTER_IMAGES = ${JSON.stringify(chapterImages)};

  function imgTag(uri, alt) {
    return '<img class="chapter-hero-img" src="' + uri + '" alt="' + alt.replace(/"/g, "&quot;") + '" decoding="async">';
  }

  w.OceanChapterImage = {
    render: function (id, slot, title) {
      var ch = w.OCEAN_CHAPTER_IMAGES[id];
      if (ch && ch[slot]) return imgTag(ch[slot], title + " — " + slot);
      return null;
    },
    getUri: function (id, slot) {
      var ch = w.OCEAN_CHAPTER_IMAGES[id];
      return ch && ch[slot] ? ch[slot] : null;
    }
  };
})(window);
`;
}

const images = {};
IDS.forEach((id) => {
  images[id] = {};
  SLOTS.forEach((slot) => {
    const uri = findImage(id, slot);
    if (uri) images[id][slot] = uri;
  });
});

fs.writeFileSync(OUT, buildJs(images));
const count = IDS.reduce((n, id) => n + Object.values(images[id]).filter(Boolean).length, 0);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + " MB)");

IDS.forEach((id) => {
  const slice = { [id]: images[id] };
  const perChapter = path.join(DIR, `_ocean-img-${id}.js`);
  fs.writeFileSync(perChapter, buildJs(slice));
  const mb = (fs.statSync(perChapter).size / 1024 / 1024).toFixed(2);
  const n = Object.values(images[id]).filter(Boolean).length;
  console.log("Wrote", path.basename(perChapter), `(${mb} MB, ${n} images)`);
});

console.log("Embedded", count, "images across", IDS.length, "chapters");
