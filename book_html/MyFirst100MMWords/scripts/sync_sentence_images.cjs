#!/usr/bin/env node
/* Copy seg PNGs to sent slots — realistic chapter art for Sentences pages */
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets");
const CHAPTERS = [
  "family", "food", "animals", "colors", "numbers",
  "body", "home", "school", "feelings", "festivals"
];

let copied = 0;
for (const id of CHAPTERS) {
  for (let n = 1; n <= 3; n++) {
    const src = path.join(ASSETS, `${id}-seg${n}.png`);
    const dest = path.join(ASSETS, `${id}-sent${n}.png`);
    if (!fs.existsSync(src)) {
      console.warn("Missing", src);
      continue;
    }
    fs.copyFileSync(src, dest);
    copied++;
  }
}
console.log("Copied", copied, "seg → sent PNG files");
