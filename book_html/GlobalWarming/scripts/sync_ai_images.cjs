#!/usr/bin/env node
/* Copy AI-generated chapter PNGs from Cursor assets into book_html/GlobalWarming/assets */
const fs = require("fs");
const path = require("path");

const SRC = path.join(process.env.USERPROFILE || "", ".cursor", "projects", "c-Users-65966-PracticeMadePerfect", "assets");
const DST = path.join(__dirname, "..", "assets");

const CHAPTERS = [
  "overview",
  "greenhouse",
  "carbon-dioxide",
  "fossil-fuels",
  "renewable-energy",
  "melting-ice",
  "rising-seas",
  "wildlife",
  "green-future",
];
const SLOTS = ["main-1", "main-2", "main-3", "explain-1", "explain-2", "explain-3", "view-1", "view-2", "view-3", "view-4"];

if (!fs.existsSync(DST)) fs.mkdirSync(DST, { recursive: true });

let copied = 0;
CHAPTERS.forEach((ch) => {
  SLOTS.forEach((slot) => {
    const name = `${ch}-${slot}.png`;
    const src = path.join(SRC, name);
    const dst = path.join(DST, name);
    if (!fs.existsSync(src)) return;
    fs.copyFileSync(src, dst);
    copied++;
    console.log("Copied", name);
  });
});
console.log("Done —", copied, "images synced");
