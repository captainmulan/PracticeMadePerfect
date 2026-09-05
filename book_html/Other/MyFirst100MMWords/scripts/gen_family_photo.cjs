#!/usr/bin/env node
/* Embed family hero PNG as data URI — standalone like Solar System planet textures */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..");
const SRC = path.join(DIR, "assets", "family-photo.png");
const OUT = path.join(DIR, "_mmwords-family-art.js");

if (!fs.existsSync(SRC)) {
  console.error("Missing:", SRC);
  process.exit(1);
}

const buf = fs.readFileSync(SRC);
const b64 = buf.toString("base64");
const uri = "data:image/png;base64," + b64;

const js = `/* Aye's Myanmar family photo — embedded PNG (no external fetch) */
(function (w) {
  w.MM_FAMILY_PHOTO = "${uri}";
  w.MMArtFamily = {
    render: function () {
      return '<img class="family-hero-img" src="' + w.MM_FAMILY_PHOTO + '" alt="Aye\\'s Myanmar family — grandparents, parents, aunt, uncle, cousins and baby" width="800" height="450" decoding="async">';
    }
  };
})(window);
`;

fs.writeFileSync(OUT, js);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024).toFixed(1) + " KB)");
