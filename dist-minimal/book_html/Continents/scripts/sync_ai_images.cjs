#!/usr/bin/env node
/* Copy AI-generated Continents PNGs from Cursor assets into assets/ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const SRC = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-65966-PracticeMadePerfect/assets"
);
const DEST = path.join(DIR, "assets");

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_continents-data.js"), "utf8"), sandbox);
const IDS = sandbox.window.CONTINENT_CHAPTERS.map((c) => c.id);

const slots = ["main-1", "main-2", "main-3", "explain-1", "explain-2", "explain-3", "view-1", "view-2", "view-3", "view-4"];
const expected = new Set();
IDS.forEach((id) => slots.forEach((s) => expected.add(`${id}-${s}.png`)));

if (!fs.existsSync(SRC)) {
  console.log("No Cursor assets folder at", SRC);
  process.exit(0);
}

fs.mkdirSync(DEST, { recursive: true });
let copied = 0;
expected.forEach((name) => {
  const srcPath = path.join(SRC, name);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(DEST, name));
    copied++;
  }
});
console.log("Copied", copied, "of", expected.size, "expected chapter PNGs to", DEST);
