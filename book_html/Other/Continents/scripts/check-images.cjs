#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const CURSOR = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-65966-PracticeMadePerfect/assets"
);

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_continents-data.js"), "utf8"), sandbox);
const IDS = sandbox.window.CONTINENT_CHAPTERS.map((c) => c.id);

const needed = [];
IDS.forEach((id) => {
  ["main-1", "main-2", "main-3", "explain-1", "explain-2", "explain-3"].forEach((s) =>
    needed.push(`${id}-${s}.png`)
  );
  if (id === "overview") {
    ["view-1", "view-2", "view-3", "view-4"].forEach((s) => needed.push(`${id}-${s}.png`));
  }
});

const missing = needed.filter((n) => !fs.existsSync(path.join(ASSETS, n)));
console.log("Needed:", needed.length);
console.log("In assets:", needed.length - missing.length);
console.log("Missing from assets:", missing);
if (missing.length && fs.existsSync(CURSOR)) {
  const inCursor = missing.filter((n) => fs.existsSync(path.join(CURSOR, n)));
  console.log("Available in Cursor assets:", inCursor);
}
