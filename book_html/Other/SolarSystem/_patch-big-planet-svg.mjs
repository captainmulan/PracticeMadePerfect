import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const MARKER = "/* big-planet-first-view */";

const BIG_PLANET_CSS = `${MARKER}
body.big-planet-page {
  overflow-x: hidden;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100%;
  -webkit-overflow-scrolling: touch;
}
body.big-planet-page .container {
  height: auto !important;
  max-height: none !important;
  max-width: min(960px, 100%);
  overflow: visible !important;
  display: block;
  padding: 8px 10px 32px;
}
body.big-planet-page .header {
  margin-bottom: 8px;
}
body.big-planet-page .header h1 {
  font-size: 22px;
  margin-bottom: 4px;
}
body.big-planet-page .header .subtitle {
  font-size: 13px;
  line-height: 1.35;
}
body.big-planet-page .planet-svg-panel {
  margin: 0 0 10px;
  padding: 10px;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
body.big-planet-page .svg-viewport {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: min(calc(100svh - 168px), 100%);
  aspect-ratio: 1;
  margin: 0 auto;
  box-sizing: border-box;
}
body.big-planet-page .planet-info-panel {
  margin-top: 8px;
}
body.big-planet-page .svg-controls {
  margin-top: 10px;
}
body.big-planet-page .scroll-cue {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #a78bfa;
  opacity: 0.85;
}
@media (min-width: 640px) {
  body.big-planet-page .svg-viewport {
    width: min(92vw, 820px);
    height: min(92vw, calc(100svh - 156px));
    max-height: min(92vw, calc(100svh - 156px));
  }
}
@media (min-width: 900px) {
  body.big-planet-page .svg-viewport {
    width: min(88vw, 920px);
    height: min(78vh, 920px);
    max-height: min(78vh, 920px);
  }
}
body.big-planet-page:has(.planet-svg-panel) {
  overflow-y: auto !important;
  height: auto !important;
}
body.big-planet-page:has(.planet-svg-panel) .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
}
body.big-planet-page:has(.planet-svg-panel) .svg-viewport {
  flex: none !important;
}
body.big-planet-page:has(.planet-game) .container,
body.big-planet-page:has(.sun-game) .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
}
@media (min-width: 640px) {
  body.big-planet-page:has(.planet-svg-panel) .svg-viewport {
    max-height: min(92vw, calc(100svh - 156px)) !important;
  }
}
@media (min-width: 900px) {
  body.big-planet-page:has(.planet-svg-panel) .svg-viewport {
    max-height: min(78vh, 920px) !important;
  }
}`;

const SCROLL_CUE =
  '\n    <p class="scroll-cue">↓ Scroll for facts and the mini-game</p>';

const LOAD_PLAYER_FN = `function loadPlayerInfo() {
  const userName = SolarPlayer.getUserName() || 'Explorer';
  const userCharacter = SolarPlayer.getCharacter() || '👨‍🚀';
  const playerName2 = document.getElementById('playerName2');
  const playerIcon = document.getElementById('playerIcon');
  const podiumChar = document.getElementById('podium-char-1');
  const podiumName = document.getElementById('podium-name-1');
  if (playerName2) playerName2.textContent = userName;
  if (playerIcon) playerIcon.textContent = userCharacter;
  if (podiumChar) podiumChar.textContent = userCharacter;
  if (podiumName) podiumName.textContent = userName;
}
loadPlayerInfo();`;

const LOAD_PLAYER_IIFE = `(function loadPlayerInfo() {
  const userName = SolarPlayer.getUserName() || 'Explorer';
  const userCharacter = SolarPlayer.getCharacter() || '👨‍🚀';
  const playerName2 = document.getElementById('playerName2');
  const playerIcon = document.getElementById('playerIcon');
  const podiumChar = document.getElementById('podium-char-1');
  const podiumName = document.getElementById('podium-name-1');
  if (playerName2) playerName2.textContent = userName;
  if (playerIcon) playerIcon.textContent = userCharacter;
  if (podiumChar) podiumChar.textContent = userCharacter;
  if (podiumName) podiumName.textContent = userName;
})();`;

function pageNumber(file) {
  const m = file.match(/^(\d+)-/);
  return m ? parseInt(m[1], 10) : 0;
}

function patchPlanetPage(html, file) {
  if (!html.includes('class="planet-svg-panel"') && !html.includes("class='planet-svg-panel'")) {
    return html;
  }
  if (file === "005-OurSolarSystem-AllPlanets.html") return html;

  let next = html;

  if (!next.includes(MARKER)) {
    next = next.replace(/(\/\* solar-desktop-fit \*\/)/, `${BIG_PLANET_CSS}\n$1`);
  } else {
    next = next.replace(
      /\/\* big-planet-first-view \*\/[\s\S]*?(?=\/\* solar-desktop-fit \*\/)/,
      `${BIG_PLANET_CSS}\n`,
    );
  }

  if (!next.includes('class="big-planet-page"')) {
    next = next.replace(/<body>/, '<body class="big-planet-page">');
    next = next.replace(/<body class="([^"]*)">/, (m, cls) =>
      cls.includes("big-planet-page") ? m : `<body class="${cls} big-planet-page">`,
    );
  }

  if (!next.includes('class="scroll-cue"')) {
    next = next.replace(
      /(<div class="svg-controls">[\s\S]*?<\/div>\s*\n\s*<\/div>)(\s*\n\s*<div class="(?:card|planet-game|sun-game)">)/,
      `$1${SCROLL_CUE}$2`,
    );
    if (!next.includes('class="scroll-cue"')) {
      next = next.replace(
        /(<div class="svg-controls">[\s\S]*?<\/div>\s*\n\s*<\/div>)(\s*\n\s*<div class="nav-hint">)/,
        `$1${SCROLL_CUE}$2`,
      );
    }
  }

  next = next.replace(
    /let zoom = w <= 360 \? 1\.72 : w <= 480 \? 1\.5 : w <= 640 \? 1\.28 : 1\.12;/g,
    "let zoom = w <= 360 ? 1.88 : w <= 480 ? 1.65 : w <= 640 ? 1.45 : w <= 820 ? 1.28 : 1.15;",
  );

  return next;
}

function patchQuizPlayer(html, file) {
  if (!file.includes("Quiz")) return html;
  if (pageNumber(file) < 10) return html;

  let next = html;

  next = next.replace(
    /\/\/ Load player info[\s\S]*?loadPlayerInfo\(\);\s*\n/,
    `// Load player info from page 3 character selection\n${LOAD_PLAYER_FN}\n\n`,
  );

  next = next.replace(
    /\(function loadPlayerInfo\(\) \{[\s\S]*?\}\)\(\);\s*\n/,
    `${LOAD_PLAYER_IIFE}\n`,
  );

  next = next.replace(
    /const userName = SolarPlayer\.getUserName\(\) \|\| 'Ariel';/g,
    "const userName = SolarPlayer.getUserName() || 'Explorer';",
  );

  return next;
}

let changed = 0;
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".html")) continue;
  const fp = path.join(dir, file);
  let html = fs.readFileSync(fp, "utf8");
  const original = html;
  html = patchPlanetPage(html, file);
  html = patchQuizPlayer(html, file);
  if (html !== original) {
    fs.writeFileSync(fp, html, "utf8");
    changed++;
    console.log("patched", file);
  }
}
console.log("done", changed, "files");
