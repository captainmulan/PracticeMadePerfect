import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const oldBlock = `html, body {
  height: 100%;
  min-height: 0 !important;
}
body:has(.character-grid),
body:has(.game-shell),
body:has(#solarSvg),
body:has(.fire-btn),
body:has(.planet-game) {
  overflow: hidden !important;
}
.container,
.game-shell {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}`;
const newBlock = `html {
  min-height: 100%;
}
body:has(.character-grid),
body:has(.game-shell),
body:has(#solarSvg),
body:has(.fire-btn),
body:has(.planet-game) {
  overflow: hidden !important;
  height: 100%;
  min-height: 0 !important;
}
body:not(:has(.character-grid)):not(:has(.game-shell)):not(:has(#solarSvg)):not(:has(.fire-btn)):not(:has(.planet-game)) {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 100%;
  height: auto;
}
.game-shell {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
body:has(.character-grid) .container,
body:has(.game-shell) .container,
body:has(#solarSvg) .container,
body:has(.fire-btn) .container,
body:has(.planet-game) .container {
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}`;

let changed = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".html")) continue;
  const fp = path.join(dir, file);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes("/* solar-desktop-fit */")) continue;
  if (!html.includes(oldBlock)) {
    console.log("skip (already patched?)", file);
    continue;
  }
  html = html.replace(oldBlock, newBlock);
  fs.writeFileSync(fp, html, "utf8");
  changed++;
  console.log("patched", file);
}
console.log("done", changed, "files");
