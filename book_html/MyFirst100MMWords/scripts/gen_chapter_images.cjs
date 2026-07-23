#!/usr/bin/env node
/* Embed chapter PNG/JPG slots: seg1–3 (main), exp1–3 (explained), hero (legacy) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const OUT = path.join(DIR, "_mmwords-chapter-images.js");

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-data.js"), "utf8"), sandbox);
const IDS = sandbox.window.MM_CHAPTERS.map((c) => c.id);

const SLOTS = ["seg1", "seg2", "seg3", "exp1", "exp2", "exp3", "hero", "explained"];
const LEGACY = {
  family: { seg1: "family-photo.png", hero: "family-photo.png" }
};

function toDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function findImage(id, slot) {
  const names = [`${id}-${slot}.png`, `${id}-${slot}.jpg`, `${id}-${slot}.jpeg`];
  if (LEGACY[id] && LEGACY[id][slot]) names.unshift(LEGACY[id][slot]);
  if (slot === "hero" && LEGACY[id] && LEGACY[id].hero) names.push(LEGACY[id].hero);
  for (const name of names) {
    const p = path.join(ASSETS, name);
    if (fs.existsSync(p)) return toDataUri(p);
  }
  /* Fallback chain: seg2→seg1, seg3→seg1, exp*→matching seg or seg1 */
  const fallbacks = {
    seg2: ["seg1", "hero"],
    seg3: ["seg1", "hero"],
    exp1: ["seg1", "hero"],
    exp2: ["seg2", "seg1", "hero"],
    exp3: ["seg3", "seg1", "hero"],
    explained: ["exp1", "seg1", "hero"]
  };
  for (const fb of fallbacks[slot] || []) {
    const uri = findImageDirect(id, fb);
    if (uri) return uri;
  }
  return null;
}

function findImageDirect(id, slot) {
  const names = [`${id}-${slot}.png`, `${id}-${slot}.jpg`];
  if (LEGACY[id] && LEGACY[id][slot]) names.unshift(LEGACY[id][slot]);
  for (const name of names) {
    const p = path.join(ASSETS, name);
    if (fs.existsSync(p)) return toDataUri(p);
  }
  return null;
}

const images = {};
IDS.forEach((id) => {
  images[id] = {};
  SLOTS.forEach((slot) => {
    images[id][slot] = findImage(id, slot);
  });
});

const js = `/* Chapter images — embedded PNG/JPG (generate: node scripts/gen_chapter_images.cjs) */
(function (w) {
  w.MM_CHAPTER_IMAGES = ${JSON.stringify(images)};

  function imgTag(uri, alt, cls) {
    return '<img class="' + cls + '" src="' + uri + '" alt="' + alt.replace(/"/g, "&quot;") + '" decoding="async">';
  }

  function pick(id, slot) {
    var ch = w.MM_CHAPTER_IMAGES[id];
    if (!ch) return null;
    return ch[slot] || null;
  }

  w.MMChapterImage = {
    render: function (id, slot, title) {
      var uri = pick(id, slot);
      if (!uri) return null;
      return imgTag(uri, (title || id) + " — " + slot, "chapter-hero-img");
    }
  };
})(window);
`;

fs.writeFileSync(OUT, js);
const count = IDS.reduce((n, id) => n + SLOTS.filter((s) => images[id][s]).length, 0);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024).toFixed(1) + " KB,", count, "slots)");
