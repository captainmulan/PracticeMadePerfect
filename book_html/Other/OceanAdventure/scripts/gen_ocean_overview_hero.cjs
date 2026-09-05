#!/usr/bin/env node
/* Embed ocean overview hero PNG — standalone like Solar System planet textures */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..");
const SRC = path.join(DIR, "assets", "ocean-overview-hero.png");
const OUT = path.join(DIR, "_ocean-overview-hero.js");

if (!fs.existsSync(SRC)) {
  console.error("Missing:", SRC);
  process.exit(1);
}

const b64 = fs.readFileSync(SRC).toString("base64");
const uri = "data:image/png;base64," + b64;

const js = `/* Ocean overview View1 hero — embedded PNG (no external fetch) */
(function (w) {
  w.OCEAN_OVERVIEW_HERO = "${uri}";
})(window);
`;

fs.writeFileSync(OUT, js);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + " MB)");
