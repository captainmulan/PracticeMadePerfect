/**
 * Replace boring collect/tap/survive clones with unique OceanGame modes.
 * Run: node book_html/OceanAdventure/_replace-ocean-minigames.cjs
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const GAMES_JS = "_ocean-games.js";

const CHAPTERS = [
  {
    file: "005-Ocean-Overview.html",
    panelClass: "minigame-panel",
    title: "🌊 Zone Sort",
    desc: "Catch zones in order ☀️ → 🌅 → 🌙 → 🕳️. Golden rings = correct next zone!",
    controls: "lr",
    hint: true,
    boot: {
      game: "zone-sort",
      goal: 60,
      time: 60,
      lives: 3,
      good: ["☀️", "🌅", "🌙", "🕳️"],
      bad: ["🗑️", "🛢️"],
      player: "🤿",
      bgTop: "#1565c0",
      bgBot: "#002171",
    },
  },
  {
    file: "008-Sunlight-Zone.html",
    title: "☀️ Sunbeam Snap",
    desc: "Sea friends swim across — tap only when they cross the bright sunbeam!",
    controls: "tap",
    hint: true,
    boot: {
      game: "sunbeam-snap",
      goal: 72,
      time: 55,
      lives: 3,
      good: ["🐠", "🦀", "🐡", "🐢"],
      bad: ["🛢️", "🥤", "🦈"],
      bgTop: "#81d4fa",
      bgBot: "#0288d1",
    },
  },
  {
    file: "011-Twilight-Zone.html",
    title: "🌅 Glow Rhythm",
    desc: "Tap glowing creatures when the pulse is brightest — not too early!",
    controls: "tap",
    hint: true,
    boot: {
      game: "glow-rhythm",
      goal: 55,
      time: 55,
      lives: 3,
      good: ["✨", "🦑", "🔦"],
      bad: ["🦈"],
      bgTop: "#1a4480",
      bgBot: "#051525",
    },
  },
  {
    file: "014-Midnight-Zone.html",
    title: "🌙 Sonar Ping",
    desc: "Dark screen! Tap creatures the moment sonar reveals them.",
    controls: "tap",
    hint: true,
    boot: {
      game: "sonar-ping",
      goal: 48,
      time: 55,
      lives: 3,
      good: ["⭐", "✨", "💫"],
      bad: ["🐟"],
      bgTop: "#050d18",
      bgBot: "#020810",
    },
  },
  {
    file: "017-Abyss-Zone.html",
    title: "🕳️ Trench Pilot",
    desc: "Steer ⬆️⬇️ through rocky trench gaps. Travel far to win!",
    controls: "ud",
    hint: true,
    boot: {
      game: "trench-pilot",
      goal: 50,
      time: 45,
      lives: 3,
      good: [],
      bad: ["🪨", "⚓", "🗿"],
      winText: "Distance goal: 50",
      bgTop: "#040810",
      bgBot: "#000008",
    },
  },
  {
    file: "020-Coral-Reefs.html",
    title: "🪸 Reef Match",
    desc: "Flip cards and find matching reef pairs before time runs out!",
    controls: "tap",
    hint: true,
    boot: {
      game: "reef-match",
      goal: 80,
      time: 70,
      lives: 3,
      good: ["🐠", "🪸", "🦐", "🐙"],
      bad: [],
      winText: "Match all pairs!",
      bgTop: "#00695c",
      bgBot: "#004d40",
    },
  },
  {
    file: "023-Marine-Mammals.html",
    title: "🐬 Breath Dive",
    desc: "Dolphin dive ⬇️ for fish, surface ⬆️ for air. Watch the O₂ bar!",
    controls: "ud",
    hint: true,
    boot: {
      game: "breath-dive",
      goal: 60,
      time: 60,
      lives: 3,
      good: ["🐟", "🦐", "🦑"],
      bad: ["🪼", "🛢️"],
      player: "🐬",
      bgTop: "#0277bd",
      bgBot: "#01579b",
    },
  },
  {
    file: "026-Fish.html",
    title: "🐟 School Run",
    desc: "Switch lanes ⬅️➡️ — gobble plankton, dodge sharks!",
    controls: "lr",
    hint: true,
    boot: {
      game: "school-run",
      goal: 64,
      time: 55,
      lives: 3,
      good: ["🫧", "🦐", "🌿"],
      bad: ["🦈", "🎣"],
      player: "🐠",
      bgTop: "#015a7a",
      bgBot: "#004d73",
    },
  },
];

function controlsHtml(kind) {
  if (kind === "lr") {
    return `<div class="touch-controls"><button class="touch-btn" id="ogLeftBtn" type="button">⬅️</button><button class="touch-btn" id="ogRightBtn" type="button">➡️</button></div>`;
  }
  if (kind === "ud") {
    return `<div class="touch-controls" style="grid-template-columns:1fr 1fr;max-width:200px;"><button class="touch-btn" id="ogUpBtn" type="button">⬆️</button><button class="touch-btn" id="ogDownBtn" type="button">⬇️</button></div>`;
  }
  return "";
}

function gameBlock(ch) {
  const wrap = ch.panelClass === "minigame-panel" ? "panel minigame-panel" : "planet-game";
  const hint = ch.hint
    ? `<p id="ogHint" style="text-align:center;color:#80deea;font-size:12px;margin:0 0 8px;min-height:18px;line-height:1.4;"></p>`
    : "";
  return `
  <div class="${wrap}">
    <h2>${ch.title}</h2>
    <p class="game-desc">${ch.desc}</p>
    <div class="game-hud-row"><span id="ogScore">⭐ 0</span><span id="ogTimer">⏱ ${ch.boot.time}s</span><span id="ogLives">❤️❤️❤️</span></div>
    ${hint}
    <div class="game-canvas" id="ogCanvasBox">
      <canvas id="ogCanvas"></canvas>
      <div class="game-overlay" id="ogStart"><h3>${ch.title}</h3><p>${ch.desc}</p><button class="overlay-btn" type="button" onclick="ogStartGame()">▶️ Start</button></div>
      <div class="game-overlay" id="ogEnd" style="display:none;"><h3 id="ogEndTitle">🎉 Great job!</h3><p id="ogEndStats"></p><button class="overlay-btn" type="button" onclick="ogStartGame()">🔄 Play Again</button></div>
    </div>
    ${controlsHtml(ch.controls)}
  </div>`;
}

function bootScript(boot) {
  return `
<script src="${GAMES_JS}"></script>
<script>
OceanGame.boot(${JSON.stringify(boot, null, 2)});
</script>`;
}

function stripOldGameScript(html) {
  html = html.replace(/<script>\s*const OG_CFG =[\s\S]*?<\/script>\s*/g, "");
  html = html.replace(/ogBindControls\(\);\s*window\.addEventListener\('resize'[\s\S]*?<\/script>\s*/g, "");
  return html;
}

function replaceGamePanel(html, ch) {
  const block = gameBlock(ch);
  if (html.includes('class="minigame-panel"')) {
    return html.replace(
      /<div class="panel minigame-panel">[\s\S]*?<div class="touch-controls">[\s\S]*?<\/div>\s*<\/div>\s*(?=<div class="nav-hint">)/,
      block + "\n\n"
    );
  }
  return html.replace(
    /<div class="planet-game">[\s\S]*?(?:<div class="touch-controls"[\s\S]*?<\/div>\s*)?<\/div>\s*(?=<div class="nav-hint">)/,
    block + "\n\n"
  );
}

function patchFile(ch) {
  const fp = path.join(DIR, ch.file);
  if (!fs.existsSync(fp)) {
    console.log("missing:", ch.file);
    return false;
  }
  let html = fs.readFileSync(fp, "utf8");
  html = stripOldGameScript(html);
  html = html.replace(/<script src="_ocean-games\.js"><\/script>\s*<script>\s*OceanGame\.boot\([\s\S]*?<\/script>\s*/g, "");
  html = replaceGamePanel(html, ch);
  if (!html.includes("_ocean-games.js")) {
    html = html.replace("</body>", bootScript(ch.boot) + "\n</body>");
  }
  fs.writeFileSync(fp, html);
  console.log("updated:", ch.file, "->", ch.boot.game);
  return true;
}

CHAPTERS.forEach(patchFile);
console.log("Done — unique mini-games installed.");
