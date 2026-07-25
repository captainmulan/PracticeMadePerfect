#!/usr/bin/env node
/* Copy AI-generated chapter PNGs from Cursor assets into book_html/OceanAdventure/assets */
const fs = require("fs");
const path = require("path");

const SRC = path.join(process.env.USERPROFILE || "", ".cursor", "projects", "c-Users-65966-PracticeMadePerfect", "assets");
const DST = path.join(__dirname, "..", "assets");

const CHAPTERS = [
  "sunlight",
  "twilight",
  "midnight",
  "abyss",
  "hadal",
  "coral-reefs",
  "marine-mammals",
  "fish",
];
const SLOTS = ["main-1", "main-2", "main-3", "explain-1", "explain-2", "explain-3"];

if (!fs.existsSync(DST)) fs.mkdirSync(DST, { recursive: true });

let copied = 0;
CHAPTERS.forEach((ch) => {
  SLOTS.forEach((slot) => {
    const name = `${ch}-${slot}.png`;
    const src = path.join(SRC, name);
    const dst = path.join(DST, name);
    if (!fs.existsSync(src)) {
      console.warn("Missing:", name);
      return;
    }
    fs.copyFileSync(src, dst);
    copied++;
    console.log("Copied", name);
  });
});
console.log("Done —", copied, "images synced (overview unchanged)");
