#!/usr/bin/env node
/* Embed overview story PNGs as data URIs */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const OUT = path.join(DIR, "_mmwords-overview-art.js");
const SLOTS = ["overview-story1", "overview-story2", "overview-story3"];

function toDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const images = {};
SLOTS.forEach((slot) => {
  const p = path.join(ASSETS, slot + ".png");
  if (fs.existsSync(p)) images[slot] = toDataUri(p);
  else console.warn("Missing:", p);
});

const js = `/* Overview images — embedded PNG (generate: node scripts/gen_overview_images.cjs) */
(function (w) {
  w.MM_OVERVIEW_IMAGES = ${JSON.stringify(images)};
  w.MMOverviewImage = {
    render: function (slot, alt) {
      var uri = w.MM_OVERVIEW_IMAGES[slot];
      if (!uri) return "";
      return '<img class="overview-hero-img" src="' + uri + '" alt="' + (alt || "").replace(/"/g, "&quot;") + '" decoding="async">';
    }
  };
})(window);
`;

fs.writeFileSync(OUT, js);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + " MB)");
console.log("Embedded:", Object.keys(images).join(", "));
