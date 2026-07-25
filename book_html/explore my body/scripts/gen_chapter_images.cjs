#!/usr/bin/env node
/* Embed chapter PNGs as data URIs (Solar System / MM Words style) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const OUT = path.join(DIR, "_body-chapter-images.js");

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_body-data.js"), "utf8"), sandbox);
const IDS = sandbox.window.BODY_CHAPTERS.map((c) => c.id);
const SLOTS = ["main-1", "main-2", "main-3", "exp-1", "exp-2", "exp-3"];

function toDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function findImage(id, slot) {
  for (const name of [`${id}-${slot}.png`, `${id}-${slot}.jpg`]) {
    const p = path.join(ASSETS, name);
    if (fs.existsSync(p)) return toDataUri(p);
  }
  return null;
}

const images = {};
IDS.forEach((id) => {
  images[id] = {};
  SLOTS.forEach((slot) => {
    const uri = findImage(id, slot);
    if (uri) images[id][slot] = uri;
  });
});

const js = `/* Chapter images — embedded PNG (generate: node scripts/gen_chapter_images.cjs) */
(function (w) {
  w.BODY_CHAPTER_IMAGES = ${JSON.stringify(images)};

  function imgTag(uri, alt, cls) {
    return '<img class="' + cls + '" src="' + uri + '" alt="' + alt.replace(/"/g, "&quot;") + '" decoding="async">';
  }

  w.BodyChapterImage = {
    has: function (id, slot) {
      return !!(w.BODY_CHAPTER_IMAGES[id] && w.BODY_CHAPTER_IMAGES[id][slot]);
    },
    render: function (id, slot, title) {
      var slotMap = w.BODY_CHAPTER_IMAGES[id];
      if (slotMap && slotMap[slot]) {
        return imgTag(slotMap[slot], title + " — " + slot, "chapter-hero-img");
      }
      return null;
    }
  };
})(window);
`;

fs.writeFileSync(OUT, js);
const kb = fs.statSync(OUT).size / 1024;
console.log("Wrote", path.basename(OUT), "(" + kb.toFixed(1) + " KB)");
IDS.forEach((id) => {
  const n = SLOTS.filter((s) => images[id][s]).length;
  console.log(" ", id + ":", n + "/" + SLOTS.length, "images");
});
