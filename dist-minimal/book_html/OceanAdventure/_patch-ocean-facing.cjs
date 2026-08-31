/**
 * Patch Ocean Adventure HTML games: animals face movement direction.
 * Run: node book_html/OceanAdventure/_patch-ocean-facing.cjs
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;

const OGD_ICON_OLD = `function ogDrawIcon(x, y, icon, size, ring) {
  const rad = size * 0.52;
  ogCtx.beginPath();
  ogCtx.arc(x, y, rad + 5, 0, Math.PI * 2);
  ogCtx.fillStyle = ring || 'rgba(0,20,40,0.72)';
  ogCtx.fill();
  ogCtx.strokeStyle = 'rgba(255,255,255,0.9)';
  ogCtx.lineWidth = 2;
  ogCtx.stroke();
  ogCtx.font = 'bold ' + size + 'px ' + OG_FONT;
  ogCtx.fillStyle = '#ffffff';
  ogCtx.fillText(icon, x, y + 1);
}`;

const OGD_ICON_NEW = `function ogDrawIcon(x, y, icon, size, ring, flipX) {
  const rad = size * 0.52;
  ogCtx.beginPath();
  ogCtx.arc(x, y, rad + 5, 0, Math.PI * 2);
  ogCtx.fillStyle = ring || 'rgba(0,20,40,0.72)';
  ogCtx.fill();
  ogCtx.strokeStyle = 'rgba(255,255,255,0.9)';
  ogCtx.lineWidth = 2;
  ogCtx.stroke();
  ogCtx.save();
  ogCtx.font = 'bold ' + size + 'px ' + OG_FONT;
  ogCtx.fillStyle = '#ffffff';
  ogCtx.textAlign = 'center';
  ogCtx.textBaseline = 'middle';
  const faceRe = /🐠|🐟|🐡|🦈|🐙|🦑|🐢|🐬|🐳|🦭|🐋|🦐|🤿/;
  if (flipX && faceRe.test(icon)) {
    ogCtx.translate(x, y + 1);
    ogCtx.scale(-1, 1);
    ogCtx.fillText(icon, 0, 0);
  } else {
    ogCtx.fillText(icon, x, y + 1);
  }
  ogCtx.restore();
}`;

const PLAYER_DRAW_OLD = `if (ogPlayer && OG_CFG.mode !== 'tap') ogDrawIcon(ogPlayer.x, ogPlayer.y, ogPlayer.icon, 38, 'rgba(0,60,100,0.85)');`;
const PLAYER_DRAW_NEW = `if (ogPlayer && OG_CFG.mode !== 'tap') ogDrawIcon(ogPlayer.x, ogPlayer.y, ogPlayer.icon, 38, 'rgba(0,60,100,0.85)', ogPlayer.vx < -0.4);`;

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html"));

let patched = 0;
for (const file of files) {
  const fp = path.join(DIR, file);
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;
  if (html.includes(OGD_ICON_OLD)) {
    html = html.replace(OGD_ICON_OLD, OGD_ICON_NEW);
    changed = true;
  }
  if (html.includes(PLAYER_DRAW_OLD)) {
    html = html.replace(PLAYER_DRAW_OLD, PLAYER_DRAW_NEW);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(fp, html);
    patched++;
    console.log("patched:", file);
  }
}
console.log("Done. Patched", patched, "files.");
