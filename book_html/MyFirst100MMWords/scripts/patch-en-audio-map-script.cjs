const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const needle = '<script src="_mmwords-audio-map.js"></script>';
const insert =
  '<script src="_mmwords-audio-map.js"></script>\n<script src="_mmwords-en-audio-map.js"></script>';
let n = 0;
for (const name of fs.readdirSync(root)) {
  if (!name.endsWith(".html")) continue;
  const p = path.join(root, name);
  let s = fs.readFileSync(p, "utf8");
  if (s.includes("_mmwords-en-audio-map.js")) continue;
  if (!s.includes(needle)) continue;
  fs.writeFileSync(p, s.split(needle).join(insert));
  n++;
}
console.log("patched html", n);
