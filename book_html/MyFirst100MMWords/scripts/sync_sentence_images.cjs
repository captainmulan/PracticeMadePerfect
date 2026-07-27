#!/usr/bin/env node
/* Copy seg PNGs to sent slots — rotated so Sentences ≠ Words at same section */
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const CHAPTERS = [
  "family", "food", "animals", "colors", "numbers",
  "body", "home", "school", "feelings", "festivals"
];

/** Words part N uses segN; Sentences part N uses a different seg image */
const SENT_FROM_SEG = { 1: 2, 2: 3, 3: 1 };

let copied = 0;
for (const id of CHAPTERS) {
  for (let n = 1; n <= 3; n++) {
    const srcSeg = SENT_FROM_SEG[n];
    const src = path.join(ASSETS, `${id}-seg${srcSeg}.png`);
    const dest = path.join(ASSETS, `${id}-sent${n}.png`);
    if (!fs.existsSync(src)) {
      console.warn("Missing", src);
      continue;
    }
    fs.copyFileSync(src, dest);
    copied++;
    console.log(`${id}-sent${n}.png ← seg${srcSeg}.png`);
  }
}
console.log("Copied", copied, "rotated seg → sent PNG files");
