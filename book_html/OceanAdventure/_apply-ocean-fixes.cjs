/**
 * Align Ocean Adventure HTML chapters with Solar System structure.
 * Run: node book_html/OceanAdventure/_apply-ocean-fixes.cjs
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const playerScript = fs.readFileSync(path.join(DIR, "_ocean-player.js"), "utf8").trim();
const playerTag = `<script>\n${playerScript}\n</script>`;

const AUDIT_MARKER = "/* ocean-ui-audit-overrides */";
const BIG_PLANET_MARKER = "/* big-ocean-first-view */";

const READING_PAGE_CSS = `
body.reading-page {
  overflow-x: hidden;
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100%;
  -webkit-overflow-scrolling: touch;
}
body.reading-page .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
}`;

const BIG_PLANET_PAGE_CSS = `
${BIG_PLANET_MARKER}
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
  overflow: visible !important;
  display: block;
  padding: 8px 10px 32px;
}
body.big-planet-page .header { margin-bottom: 8px; }
body.big-planet-page .header h1 { font-size: 24px; margin-bottom: 4px; }
body.big-planet-page .ocean-display,
body.big-planet-page .sun-display,
body.big-planet-page .twilight-display,
body.big-planet-page .midnight-display,
body.big-planet-page .abyss-display,
body.big-planet-page .coral-display,
body.big-planet-page .mammal-display,
body.big-planet-page .fish-display {
  margin: 10px 0 8px;
  height: min(72vw, calc(100svh - 220px));
  min-height: min(56vw, 240px);
  max-height: min(78vw, 320px);
}
body.big-planet-page .scroll-cue {
  text-align: center;
  color: #80deea;
  font-size: 13px;
  margin: 6px 0 10px;
  opacity: 0.9;
}
body.big-planet-page .card { margin-bottom: 10px; }
body.big-planet-page .nav-hint {
  margin-top: 8px;
  padding-bottom: 8px;
  font-size: 12px;
  line-height: 1.45;
}`;

const AUDIT_OVERRIDE_CSS = `
${AUDIT_MARKER}
body.reading-page,
body.reading-page:has(.container),
body.reading-page:has(.quiz-card),
body.reading-page:has(.character-grid) {
  overflow-y: auto !important;
  height: auto !important;
}
body.reading-page .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: block;
}
body.reading-page:has(.character-grid) .container {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  justify-content: flex-start;
}
@media (max-width: 639px) {
  body.big-planet-page .ocean-display,
  body.big-planet-page .sun-display,
  body.big-planet-page .twilight-display,
  body.big-planet-page .midnight-display,
  body.big-planet-page .abyss-display,
  body.big-planet-page .coral-display,
  body.big-planet-page .mammal-display,
  body.big-planet-page .fish-display {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: min(78vw, calc(100svh - 220px)) !important;
    min-height: min(56vw, 220px) !important;
    box-sizing: border-box !important;
  }
  body.big-planet-page .container {
    overflow-x: hidden !important;
    max-width: 100% !important;
  }
  body.big-planet-page .planet-game .game-canvas,
  body:has(.planet-game) .game-canvas {
    height: min(48vh, 400px) !important;
    min-height: min(40vh, 280px) !important;
    max-height: min(52vh, 420px) !important;
  }
  .planet-game { padding: 10px !important; margin-top: 10px !important; }
  .planet-game h2 { margin-bottom: 8px !important; font-size: 17px !important; }
  .touch-controls { margin-top: 6px; gap: 6px; }
  .touch-btn { min-height: 48px; font-size: 18px; }
}
@media (min-width: 640px) {
  body.big-planet-page .ocean-display,
  body.big-planet-page .sun-display,
  body.big-planet-page .twilight-display,
  body.big-planet-page .midnight-display,
  body.big-planet-page .abyss-display,
  body.big-planet-page .coral-display,
  body.big-planet-page .mammal-display,
  body.big-planet-page .fish-display {
    max-height: min(92vw, calc(100svh - 156px)) !important;
    min-height: min(56vw, calc(100svh - 200px)) !important;
  }
}
body.big-planet-page .planet-game .game-canvas {
  width: 100% !important;
  height: min(50vh, 440px) !important;
  min-height: min(42vh, 300px) !important;
  max-height: min(56vh, 480px) !important;
}
body.big-planet-page .planet-game { margin-bottom: 8px !important; }
body.big-game-page:has(.game-shell) {
  overflow: hidden !important;
  height: 100% !important;
  min-height: 100% !important;
  max-height: 100% !important;
}
html:has(body.big-game-page) {
  height: 100% !important;
  min-height: 100% !important;
  overflow: hidden !important;
}
body.big-game-page:has(.game-shell) .game-shell {
  min-height: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}
body.big-game-page:has(.game-shell) .stage-wrap {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  align-items: center !important;
  justify-content: center !important;
}
body.big-game-page:has(.game-shell) .game-stage {
  flex: 1 1 auto !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  aspect-ratio: unset !important;
  margin: 0 !important;
}`;

const FIT_GAME_FRAME_SCRIPT = `<script>
/* ocean-ui-fit-frame */
(function () {
  function fitGameFrame() {
    if (!document.body.classList.contains("big-game-page")) return;
    const h = window.innerHeight + "px";
    document.documentElement.style.height = h;
    document.documentElement.style.minHeight = h;
    document.body.style.height = h;
    document.body.style.minHeight = h;
    const shell = document.querySelector(".game-shell");
    if (shell) { shell.style.height = h; shell.style.minHeight = h; }
  }
  fitGameFrame();
  window.addEventListener("resize", fitGameFrame);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(fitGameFrame).observe(document.documentElement);
  }
})();
</script>`;

const LOAD_PLAYER_IIFE = `(function loadPlayerInfo() {
  const userName = OceanPlayer.getUserName() || 'Explorer';
  const userCharacter = OceanPlayer.getCharacter() || '🤿';
  const playerName2 = document.getElementById('playerName2');
  const playerIcon = document.getElementById('playerIcon');
  const podiumChar = document.getElementById('podium-char-1');
  const podiumName = document.getElementById('podium-name-1');
  if (playerName2) playerName2.textContent = userName;
  if (playerIcon) playerIcon.textContent = userCharacter;
  if (podiumChar) podiumChar.textContent = userCharacter;
  if (podiumName) podiumName.textContent = userName;
})();`;

const ACTIVITY_FILES = new Set([
  "005-Ocean-Overview.html",
  "008-Sunlight-Zone.html",
  "011-Twilight-Zone.html",
  "014-Midnight-Zone.html",
  "017-Abyss-Zone.html",
  "020-Coral-Reefs.html",
  "023-Marine-Mammals.html",
  "026-Fish.html",
]);

function classifyPage(file, html) {
  if (file === "004-Intro-OceanReefDefender.html") return "intro-game";
  if (file === "031-Outro-OceanTreasureRush.html") return "outro-game";
  if (ACTIVITY_FILES.has(file) || html.includes('class="planet-game"')) return "activity";
  if (/Quiz\.html$/i.test(file)) return "quiz";
  if (file === "003-Character-Selection.html") return "character";
  return "reading";
}

function bodyClassForType(type, existing) {
  const want =
    type === "intro-game" || type === "outro-game"
      ? "big-game-page"
      : type === "activity"
        ? "big-planet-page"
        : type === "reading" || type === "quiz" || type === "character"
          ? "reading-page"
          : "";
  if (!want) return existing;
  const parts = new Set((existing || "").split(/\s+/).filter(Boolean));
  parts.add(want);
  if (type === "character") parts.add("character-select-page");
  return [...parts].join(" ");
}

function injectOceanPlayer(html, file) {
  if (file === "003-Character-Selection.html") return html;
  html = html.replace(/<script>\s*\(function \(w\) \{[\s\S]*?w\.OceanPlayer[\s\S]*?\}\)\(window\);\s*<\/script>\s*/g, "");
  if (html.includes("OceanPlayer.getUserName")) return html;
  if (html.includes("</head>")) return html.replace("</head>", `${playerTag}\n</head>`);
  return html;
}

function patchBodyClass(html, file) {
  const type = classifyPage(file, html);
  return html.replace(/<body([^>]*)>/, (_, attrs) => {
    const clsMatch = attrs.match(/class="([^"]*)"/);
    const existing = clsMatch ? clsMatch[1] : "";
    const nextClass = bodyClassForType(type, existing);
    if (clsMatch) return `<body${attrs.replace(/class="[^"]*"/, `class="${nextClass}"`)}>`;
    return `<body class="${nextClass}"${attrs}>`;
  });
}

function injectCssBlocks(html, file) {
  const type = classifyPage(file, html);
  let blocks = "";

  if (!html.includes(AUDIT_MARKER)) blocks += AUDIT_OVERRIDE_CSS;
  if ((type === "reading" || type === "quiz" || type === "character") && !html.includes("body.reading-page {")) {
    blocks += READING_PAGE_CSS;
  }
  if (type === "activity" && !html.includes(BIG_PLANET_MARKER)) blocks += BIG_PLANET_PAGE_CSS;

  if (blocks && html.includes("</style>")) {
    html = html.replace("</style>", `${blocks}\n  </style>`);
  }
  return html;
}

function patchQuizDom(html) {
  if (!html.includes("quiz-card")) return html;

  html = html.replace(
    /(<div class="subtitle">[^<]*<\/div>)\s*\n\s*\n\s*(<div class="competition-bar">)/,
    "$1\n  </div>\n\n  $2",
  );

  html = html.replace(
    /(<div class="competition-bar">[\s\S]*?<\/div>\s*\n)\s*<\/div>\s*\n\s*(<div class="quiz-card)/,
    "$1\n  $2",
  );

  if (!html.includes(".game-overlay.end-popup h3") && !html.includes("writing-mode:horizontal-tb")) {
    html = html.replace(
      "</style>",
      `    .game-overlay.end-popup{display:none;flex-direction:column;align-items:center;text-align:center;}
    .game-overlay.end-popup h3{color:#64ffda;margin-bottom:8px;font-size:22px;writing-mode:horizontal-tb;text-orientation:mixed;}
  </style>`,
    );
  }

  return html;
}

function fixOceanPlayerBlock(html) {
  const broken = /<script>\s*\(function \(w\) \{[\s\S]*?w\.OceanPlayer[\s\S]*?\}\)\(window\);\s*<\/script>/;
  if (broken.test(html) && html.includes("OceanPlayer.getUserName()")) {
    html = html.replace(broken, playerTag);
  }
  return html;
}

function patchQuizPlayer(html) {
  if (!html.includes("quiz-card") && !html.includes("scoreCard") && !html.includes("score-card")) return html;

  html = html.replace(/🧑‍🚀/g, "🤿");
  html = html.replace(/👨‍🚀/g, "🤿");

  html = html.replace(/localStorage\.getItem\('userName'\)/g, "OceanPlayer.getUserName()");
  html = html.replace(/localStorage\.getItem\("userName"\)/g, "OceanPlayer.getUserName()");
  html = html.replace(/localStorage\.getItem\('userCharacter'\)/g, "OceanPlayer.getCharacter()");
  html = html.replace(/localStorage\.getItem\("userCharacter"\)/g, "OceanPlayer.getCharacter()");

  html = html.replace(
    /function loadPlayerInfo\(\) \{[\s\S]*?\}\nloadPlayerInfo\(\);/,
    LOAD_PLAYER_IIFE,
  );

  if (html.includes("scoreCard") && !html.includes("OceanPlayer.getUserName()")) {
    html = html.replace(
      /const userName = localStorage\.getItem\([^)]+\)[^;]*;/g,
      "const userName = OceanPlayer.getUserName() || 'Explorer';",
    );
    html = html.replace(
      /const userCharacter = localStorage\.getItem\([^)]+\)[^;]*;/g,
      "const userCharacter = OceanPlayer.getCharacter() || '🤿';",
    );
  }

  html = html.replace(/\s*<button class="continue-btn" onclick="continueToNext\(\)">➡️ Continue<\/button>/g, "");
  html = html.replace(/function continueToNext\(\) \{[\s\S]*?\}\n\n/g, "");
  html = html.replace(/function continueToNext\(\) \{ alert\([^)]+\); \}\n/g, "");

  return html;
}

function patchGameCanvasSize(html) {
  return html
    .replace(
      /\.game-canvas\{position:relative;height:50vh;min-height:280px;max-height:420px;/g,
      ".game-canvas{position:relative;width:100%;height:280px;min-height:220px;max-height:280px;",
    )
    .replace(
      /\.game-wrap\{position:relative;height:52vh;min-height:320px;max-height:500px;/g,
      ".game-wrap,.game-stage{position:relative;width:100%;height:280px;min-height:220px;max-height:280px;",
    )
    .replace(
      /height:52vh;min-height:320px;max-height:500px;/g,
      "width:100%;height:280px;min-height:220px;max-height:280px;",
    );
}

function addScrollCue(html, file) {
  if (!ACTIVITY_FILES.has(file)) return html;
  if (html.includes('class="scroll-cue"')) return html;

  const cue = '  <p class="scroll-cue">↓ Scroll for facts and the mini-game</p>\n';

  if (/class="[a-z-]+-display"/.test(html)) {
    html = html.replace(
      /(<div class="[a-z-]+-display"[\s\S]*?<\/div>)\s*\n(\s*<div class="(?:controls|card)">)/,
      `$1\n${cue}$2`,
    );
    if (html.includes('class="scroll-cue"')) return html;
  }

  return html.replace(/(<div class="header">[\s\S]*?<\/div>)\s*\n/, `$1\n${cue}`);
}

function patchIntroGame(html, file) {
  if (file !== "004-Intro-OceanReefDefender.html") return html;

  if (!html.includes("big-game-page")) {
    html = html.replace("<body>", '<body class="big-game-page">');
  }

  if (!html.includes('<div class="bubbles">')) {
    html = html.replace("<body", '<body').replace(
      /(<body[^>]*>)\s*(<div class="game-shell">|<div class="container">)/,
      "$1\n<div class=\"bubbles\"></div>\n$2",
    );
  }

  if (!html.includes(".bubbles{")) {
    html = html.replace(
      "<style>",
      `<style>
    .bubbles{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(3px 3px at 30px 50px,rgba(255,255,255,.3),transparent),radial-gradient(4px 4px at 70px 90px,rgba(255,255,255,.2),transparent);background-size:900px 150px;animation:rise 8s ease-in-out infinite;}
    @keyframes rise{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`,
    );
  }

  html = html.replace(
    /function resize\(\) \{[\s\S]*?reefY = canvas\.height - 36;\s*\}/,
    `function resize() {
  const stage = document.getElementById('stage');
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  reefY = h - 36;
}`,
  );

  if (!html.includes("function drawEmojiSprite")) {
    html = html.replace(
      "function drawTrash() {",
      `function drawEmojiSprite(emoji, x, y, sizePx) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.font = 'bold ' + sizePx + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(emoji, x, y);
  ctx.restore();
}
function drawTrash() {`,
    );
    html = html.replace(
      /ctx\.font = '22px serif';[\s\S]*?trash\.forEach\(t => \{\s*ctx\.fillText\(t\.icon, t\.x, t\.y\);\s*\}\);/,
      "trash.forEach(t => drawEmojiSprite(t.icon, t.x, t.y, 26));",
    );
  }

  if (!html.includes("ocean-ui-fit-frame")) {
    html = html.replace("</body>", `${FIT_GAME_FRAME_SCRIPT}\n</body>`);
  }

  html = html.replace(
    /<body class="big-game-page">\s*<div class="game-shell">/,
    `<body class="big-game-page">
<div class="bubbles"></div>
<div class="game-shell">`,
  );

  return html;
}

function patchOutroGame(html, file) {
  if (file !== "031-Outro-OceanTreasureRush.html") return html;

  html = html.replace("<body>", '<body class="big-game-page reading-page">');
  html = html.replace('<body class="reading-page">', '<body class="big-game-page">');

  if (!html.includes('<div class="bubbles">')) {
    html = html.replace(
      /(<body[^>]*>)\s*<div class="container">/,
      `$1
<div class="bubbles"></div>
<div class="game-shell">
<div class="container">`,
    );
    html = html.replace(
      /<\/div>\s*\n<script>/,
      `</div>
</div>
<script>`,
    );
  }

  if (!html.includes(".bubbles{")) {
    html = html.replace(
      "<style>",
      `<style>
    .bubbles{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(3px 3px at 30px 50px,rgba(255,255,255,.3),transparent),radial-gradient(4px 4px at 70px 90px,rgba(255,255,255,.2),transparent);background-size:900px 150px;animation:rise 8s ease-in-out infinite;}
    @keyframes rise{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
    .game-shell{max-width:720px;margin:0 auto;padding:10px;position:relative;z-index:1;}`,
    );
  }

  html = html.replace(
    /function resize\(\) \{[\s\S]*?player\.y = canvas\.height - 48;\s*\}/,
    `function resize() {
  const wrap = document.getElementById('wrap');
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  player.x = w / 2;
  player.y = h - 48;
}`,
  );

  if (!html.includes("function drawEmojiSprite")) {
    html = html.replace(
      "function draw() {",
      `function drawEmojiSprite(emoji, x, y, sizePx) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.font = 'bold ' + sizePx + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(emoji, x, y);
  ctx.restore();
}
function draw() {`,
    );
    html = html.replace(
      /ctx\.font = '24px serif';[\s\S]*?ctx\.font = '28px serif'; ctx\.fillText\(localStorage[\s\S]*?\);/,
      `items.forEach(it => drawEmojiSprite(it.icon, it.x, it.y, 28));
  hazards.forEach(h => drawEmojiSprite(h.icon, h.x, h.y, 28));
  drawEmojiSprite(OceanPlayer.getCharacter() || '🤿', player.x, player.y, 32);`,
    );
  }

  html = html.replace(
    /<button class="touch-btn" id="jumpBtn" type="button">⬆️<\/button>\s*/,
    "",
  );

  html = html.replace(
    /\.touch-row\{display:grid;grid-template-columns:1fr 1fr 1fr;/,
    ".touch-row{display:grid;grid-template-columns:1fr 1fr;",
  );

  if (!html.includes("ocean-ui-fit-frame")) {
    html = html.replace("</body>", `${FIT_GAME_FRAME_SCRIPT}\n</body>`);
  }

  return html;
}

function patchCharacterPage(html, file) {
  if (file !== "003-Character-Selection.html") return html;
  if (!html.includes("character-select-page")) {
    html = html.replace("<body>", '<body class="reading-page character-select-page">');
  }
  return html;
}

function patchFactPopups(html) {
  if (!html.includes("showZoneInfo")) return html;
  if (html.includes("const zoneFacts")) return html;

  html = html.replace(
    /function showZoneInfo\([^)]*\) \{[\s\S]*?\n\}/,
    `const zoneFacts = {
  sunlight: { title: '☀️ Sunlight Zone', fact: 'The top layer where sunlight reaches — home to coral reefs and most ocean life!' },
  twilight: { title: '🌅 Twilight Zone', fact: 'Dim blue light — many creatures glow with bioluminescence here!' },
  midnight: { title: '🌙 Midnight Zone', fact: 'No sunlight at all — amazing deep-sea animals create their own light!' },
  abyss: { title: '🕳️ Abyss Zone', fact: 'Extreme cold and pressure — mysterious creatures still being discovered!' }
};

function showZoneInfo(zone) {
  const info = zoneFacts[zone];
  if (!info) return;
  let panel = document.getElementById('oceanInfoPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'oceanInfoPanel';
    panel.className = 'ocean-info-panel';
    document.querySelector('.container').appendChild(panel);
  }
  panel.innerHTML = '<strong>' + info.title + '</strong><br>' + info.fact;
  panel.style.display = 'block';
}`,
  );

  if (!html.includes(".ocean-info-panel")) {
    html = html.replace(
      "</style>",
      `    .ocean-info-panel{display:none;margin:10px 0;padding:12px 14px;background:rgba(255,255,255,0.1);border-radius:12px;border-left:4px solid #64ffda;font-size:14px;line-height:1.55;}
    .ocean-info-panel strong{color:#64ffda;font-size:15px;}
  </style>`,
    );
  }

  return html;
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html"));
let changed = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  html = patchBodyClass(html, file);
  html = injectCssBlocks(html, file);
  html = patchQuizDom(html);
  html = patchQuizPlayer(html);
  html = patchGameCanvasSize(html);
  html = addScrollCue(html, file);
  html = patchIntroGame(html, file);
  html = patchOutroGame(html, file);
  html = patchCharacterPage(html, file);
  html = patchFactPopups(html);
  html = injectOceanPlayer(html, file);
  html = fixOceanPlayerBlock(html);

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    changed++;
    console.log("updated", file);
  }
}

console.log("done:", changed, "files");
