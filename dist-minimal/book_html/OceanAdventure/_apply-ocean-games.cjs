/**
 * Inject canvas minigames into Ocean Adventure activity chapters.
 * Run: node book_html/OceanAdventure/_apply-ocean-games.cjs
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;

const GAME_CSS = `
    .planet-game{background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border-radius:20px;padding:20px;margin:20px 0;border:1px solid rgba(100,255,218,0.35);}
    .planet-game h2{color:#64ffda;margin-bottom:8px;font-size:20px;text-align:center;}
    .planet-game .game-desc{text-align:center;color:#80deea;font-size:14px;margin-bottom:12px;line-height:1.5;padding:0 6px;}
    .game-hud-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:10px;font-size:13px;font-weight:bold;flex-wrap:wrap;}
    .game-hud-row span{background:rgba(0,0,0,0.35);padding:6px 10px;border-radius:8px;color:#ffeb3b;}
    .game-canvas{position:relative;height:50vh;min-height:280px;max-height:420px;background:#062035;border-radius:16px;overflow:hidden;border:2px solid rgba(100,255,218,0.35);touch-action:none;}
    .game-canvas canvas{display:block;width:100%;height:100%;}
    .game-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,20,36,0.92);text-align:center;padding:20px;z-index:5;}
    .game-overlay h3{color:#64ffda;font-size:22px;margin-bottom:8px;}
    .game-overlay p{color:#cce7ff;font-size:14px;line-height:1.5;margin-bottom:14px;max-width:320px;}
    .overlay-btn{padding:11px 24px;border:none;border-radius:12px;background:linear-gradient(135deg,#64ffda,#00bcd4);color:#062035;font-size:15px;font-weight:bold;cursor:pointer;}
    .touch-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;margin:12px auto 0;}
    .touch-btn{padding:14px;border-radius:12px;border:2px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.12);font-size:22px;cursor:pointer;touch-action:manipulation;}`;

const CHAPTERS = [
  {
    file: "005-Ocean-Overview.html",
    title: "🌊 Zone Collector",
    desc: "Move ← → to catch zone icons ☀️🌅🌙🕳️. Avoid trash! Reach 60 points.",
    config: { mode: "collect", goal: 60, time: 60, lives: 3, good: ["☀️", "🌅", "🌙", "🕳️"], bad: ["🗑️", "🛢️"], player: "🤿", bgTop: "#4fc3f7", bgBot: "#002171" },
  },
  {
    file: "008-Sunlight-Zone.html",
    title: "☀️ Sunshine Catch",
    desc: "Move ← → to catch sea friends 🐠🦀. Dodge pollution!",
    config: { mode: "collect", goal: 70, time: 60, lives: 3, good: ["🐠", "🦀", "🐡", "🐢"], bad: ["🛢️", "🥤"], player: "🤿", bgTop: "#81d4fa", bgBot: "#0288d1" },
  },
  {
    file: "011-Twilight-Zone.html",
    title: "🌅 Glow Hunt",
    desc: "Tap glowing creatures ✨🦑 before they fade! Don't tap 🦈!",
    config: { mode: "tap", goal: 55, time: 55, lives: 3, good: ["✨", "🦑", "🔦"], bad: ["🦈"], player: "🤿", bgTop: "#1a4480", bgBot: "#051525" },
  },
  {
    file: "014-Midnight-Zone.html",
    title: "🌙 Biolume Blink",
    desc: "Tap the lights in the dark! Catch ⭐✨ — avoid the angler 🐟!",
    config: { mode: "tap", goal: 50, time: 55, lives: 3, good: ["⭐", "✨", "💫"], bad: ["🐟"], player: "🤿", bgTop: "#0a1830", bgBot: "#020810" },
  },
  {
    file: "017-Abyss-Zone.html",
    title: "🕳️ Abyss Dodge",
    desc: "Move ← → to dodge falling rocks and anchors. Survive 45 seconds!",
    config: { mode: "survive", goal: 0, time: 45, lives: 3, good: [], bad: ["🪨", "⚓", "🗿"], player: "🤿", bgTop: "#0a1020", bgBot: "#000008" },
  },
  {
    file: "020-Coral-Reefs.html",
    title: "🪸 Reef Rescue",
    desc: "Tap coral 🪸🐠 to grow the reef! Don't tap trash 🗑️!",
    config: { mode: "tap", goal: 60, time: 60, lives: 3, good: ["🪸", "🐠", "🦐"], bad: ["🗑️", "🛢️"], player: "🤿", bgTop: "#00695c", bgBot: "#004d40" },
  },
  {
    file: "023-Marine-Mammals.html",
    title: "🐬 Dolphin Dash",
    desc: "Move ← → to catch fish 🐟 for dolphins. Avoid jellyfish 🪼!",
    config: { mode: "collect", goal: 65, time: 60, lives: 3, good: ["🐟", "🦐", "🦑"], bad: ["🪼", "🛢️"], player: "🐬", bgTop: "#0277bd", bgBot: "#01579b" },
  },
  {
    file: "026-Fish.html",
    title: "🐟 Plankton Feast",
    desc: "Move ← → to eat plankton 🫧🦐. Dodge sharks 🦈!",
    config: { mode: "collect", goal: 75, time: 60, lives: 3, good: ["🫧", "🦐", "🌿"], bad: ["🦈", "🎣"], player: "🐠", bgTop: "#0288d1", bgBot: "#004d73" },
  },
];

function gameHtml(ch) {
  const controls =
    ch.config.mode === "tap"
      ? ""
      : `<div class="touch-controls"><button class="touch-btn" id="ogLeftBtn" type="button">⬅️</button><button class="touch-btn" id="ogRightBtn" type="button">➡️</button></div>`;
  return `
  <div class="planet-game">
    <h2>${ch.title}</h2>
    <p class="game-desc">${ch.desc}</p>
    <div class="game-hud-row"><span id="ogScore">⭐ 0</span><span id="ogTimer">⏱ ${ch.config.time}s</span><span id="ogLives">❤️❤️❤️</span></div>
    <div class="game-canvas" id="ogCanvasBox">
      <canvas id="ogCanvas"></canvas>
      <div class="game-overlay" id="ogStart"><h3>${ch.title}</h3><p>${ch.desc}</p><button class="overlay-btn" type="button" onclick="ogStartGame()">▶️ Start</button></div>
      <div class="game-overlay" id="ogEnd" style="display:none;"><h3 id="ogEndTitle">🎉 Great job!</h3><p id="ogEndStats"></p><button class="overlay-btn" type="button" onclick="ogStartGame()">🔄 Play Again</button></div>
    </div>
    ${controls}
  </div>`;
}

function gameScript(config) {
  return `
<script>
const OG_CFG = ${JSON.stringify(config)};
let ogCanvas, ogCtx, ogRunning = false, ogScore = 0, ogTime = OG_CFG.time, ogLives = OG_CFG.lives;
let ogTimerId, ogAnimId, ogPlayer, ogItems = [], ogMoveL = false, ogMoveR = false, ogSpawn = 0;

function ogResize() {
  const box = document.getElementById('ogCanvasBox');
  ogCanvas = document.getElementById('ogCanvas');
  ogCtx = ogCanvas.getContext('2d');
  ogCanvas.width = box.clientWidth;
  ogCanvas.height = box.clientHeight;
  if (ogPlayer) { ogPlayer.x = Math.min(Math.max(ogPlayer.x, 24), ogCanvas.width - 24); ogPlayer.y = ogCanvas.height - 44; }
}
function ogDrawBg() {
  const g = ogCtx.createLinearGradient(0, 0, 0, ogCanvas.height);
  g.addColorStop(0, OG_CFG.bgTop || '#0a3050');
  g.addColorStop(1, OG_CFG.bgBot || '#041525');
  ogCtx.fillStyle = g;
  ogCtx.fillRect(0, 0, ogCanvas.width, ogCanvas.height);
  for (let i = 0; i < 16; i++) {
    ogCtx.fillStyle = 'rgba(255,255,255,' + (0.06 + (i % 3) * 0.04) + ')';
    ogCtx.beginPath();
    ogCtx.arc((i * 83) % ogCanvas.width, (i * 53 + Date.now() * 0.015) % ogCanvas.height, 1.1, 0, Math.PI * 2);
    ogCtx.fill();
  }
}
function ogHud() {
  document.getElementById('ogScore').textContent = '⭐ ' + ogScore;
  document.getElementById('ogTimer').textContent = '⏱ ' + ogTime + 's';
  document.getElementById('ogLives').textContent = '❤️'.repeat(Math.max(0, ogLives));
}
function ogEnd(won) {
  ogRunning = false;
  clearInterval(ogTimerId);
  cancelAnimationFrame(ogAnimId);
  document.getElementById('ogEndTitle').textContent = won ? '🎉 Great job!' : '💫 Try again!';
  const goalTxt = OG_CFG.mode === 'survive' ? 'You survived!' : 'Goal: ' + OG_CFG.goal;
  document.getElementById('ogEndStats').textContent = 'Score: ' + ogScore + ' | ' + goalTxt + ' | Time left: ' + ogTime + 's';
  document.getElementById('ogEnd').style.display = 'flex';
}
function ogSpawnItem() {
  if (OG_CFG.mode === 'tap') {
    const bad = Math.random() < 0.22 && OG_CFG.bad.length;
    const pool = bad ? OG_CFG.bad : OG_CFG.good;
    const icon = pool[Math.floor(Math.random() * pool.length)];
    ogItems.push({ x: 30 + Math.random() * (ogCanvas.width - 60), y: 40 + Math.random() * (ogCanvas.height - 100), icon: icon, bad: bad, life: 90 + Math.random() * 40, r: 22 });
    return;
  }
  const bad = OG_CFG.mode === 'survive' || (Math.random() < 0.32 && OG_CFG.bad.length);
  const pool = bad ? OG_CFG.bad : OG_CFG.good;
  if (!pool.length) return;
  ogItems.push({
    x: 20 + Math.random() * (ogCanvas.width - 40),
    y: -20,
    icon: pool[Math.floor(Math.random() * pool.length)],
    bad: bad,
    speed: 1.4 + Math.random() * 1.6,
    r: 18
  });
}
function ogLoop() {
  if (!ogRunning) return;
  ogSpawn++;
  if (ogSpawn > (OG_CFG.mode === 'tap' ? 55 : 42)) { ogSpawn = 0; ogSpawnItem(); }
  if (OG_CFG.mode !== 'tap' && ogPlayer) {
    if (ogMoveL) ogPlayer.vx = -5.5;
    else if (ogMoveR) ogPlayer.vx = 5.5;
    else ogPlayer.vx *= 0.75;
    ogPlayer.x = Math.max(24, Math.min(ogCanvas.width - 24, ogPlayer.x + ogPlayer.vx));
  }
  ogItems.forEach((it, i) => {
    if (OG_CFG.mode === 'tap') {
      it.life--;
      if (it.life <= 0) ogItems.splice(i, 1);
    } else {
      it.y += it.speed;
      const py = ogPlayer.y, px = ogPlayer.x;
      if (Math.hypot(px - it.x, py - it.y) < it.r + 16) {
        ogItems.splice(i, 1);
        if (it.bad) { ogLives--; if (ogLives <= 0) { ogEnd(false); return; } }
        else { ogScore += 10; if (OG_CFG.goal && ogScore >= OG_CFG.goal) { ogEnd(true); return; } }
        ogHud();
      } else if (it.y > ogCanvas.height + 24) ogItems.splice(i, 1);
    }
  });
  ogDrawBg();
  ogCtx.font = '24px serif';
  ogCtx.textAlign = 'center';
  ogCtx.textBaseline = 'middle';
  ogItems.forEach(it => {
    if (OG_CFG.mode === 'tap' && it.life < 25) ogCtx.globalAlpha = it.life / 25;
    ogCtx.fillText(it.icon, it.x, it.y);
    ogCtx.globalAlpha = 1;
  });
  if (ogPlayer && OG_CFG.mode !== 'tap') ogCtx.font = '28px serif', ogCtx.fillText(ogPlayer.icon, ogPlayer.x, ogPlayer.y);
  ogAnimId = requestAnimationFrame(ogLoop);
}
function ogTapHit(x, y) {
  for (let i = ogItems.length - 1; i >= 0; i--) {
    const it = ogItems[i];
    if (Math.hypot(x - it.x, y - it.y) < it.r + 6) {
      ogItems.splice(i, 1);
      if (it.bad) { ogLives--; if (ogLives <= 0) { ogEnd(false); return; } }
      else { ogScore += 10; if (ogScore >= OG_CFG.goal) { ogEnd(true); return; } }
      ogHud();
      return;
    }
  }
}
function ogStartGame() {
  ogResize();
  ogRunning = true;
  ogScore = 0;
  ogTime = OG_CFG.time;
  ogLives = OG_CFG.lives;
  ogItems = [];
  ogSpawn = 0;
  ogPlayer = { x: ogCanvas.width / 2, y: ogCanvas.height - 44, vx: 0, icon: OG_CFG.player || '🤿' };
  document.getElementById('ogStart').style.display = 'none';
  document.getElementById('ogEnd').style.display = 'none';
  ogHud();
  clearInterval(ogTimerId);
  ogTimerId = setInterval(function () {
    if (!ogRunning) return;
    ogTime--;
    ogHud();
    if (ogTime <= 0) {
      if (OG_CFG.mode === 'survive') ogEnd(true);
      else ogEnd(ogScore >= OG_CFG.goal);
    }
  }, 1000);
  ogLoop();
}
function ogBindControls() {
  const L = document.getElementById('ogLeftBtn');
  const R = document.getElementById('ogRightBtn');
  if (L && R && !L._og) {
    L._og = R._og = true;
    L.addEventListener('touchstart', e => { e.preventDefault(); ogMoveL = true; });
    L.addEventListener('touchend', () => { ogMoveL = false; });
    R.addEventListener('touchstart', e => { e.preventDefault(); ogMoveR = true; });
    R.addEventListener('touchend', () => { ogMoveR = false; });
    L.addEventListener('mousedown', () => { ogMoveL = true; });
    L.addEventListener('mouseup', () => { ogMoveL = false; });
    R.addEventListener('mousedown', () => { ogMoveR = true; });
    R.addEventListener('mouseup', () => { ogMoveR = false; });
  }
  const c = document.getElementById('ogCanvas');
  if (c && !c._ogTap && OG_CFG.mode === 'tap') {
    c._ogTap = true;
    const hit = e => {
      if (!ogRunning) return;
      const r = c.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      ogTapHit((p.clientX - r.left) * (c.width / r.width), (p.clientY - r.top) * (c.height / r.height));
    };
    c.addEventListener('click', hit);
    c.addEventListener('touchstart', e => { e.preventDefault(); hit(e); }, { passive: false });
  }
  document.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') ogMoveL = true; if (e.key === 'ArrowRight') ogMoveR = true; });
  document.addEventListener('keyup', e => { if (e.key === 'ArrowLeft') ogMoveL = false; if (e.key === 'ArrowRight') ogMoveR = false; });
}
ogBindControls();
window.addEventListener('resize', () => { if (ogRunning) ogResize(); });
</script>`;
}

function patchFile(ch) {
  const fp = path.join(DIR, ch.file);
  if (!fs.existsSync(fp)) return false;
  let html = fs.readFileSync(fp, "utf8");
  if (html.includes('class="planet-game"')) {
    console.log("skip (already has game):", ch.file);
    return false;
  }
  if (!html.includes(".planet-game{")) {
    html = html.replace("</style>", GAME_CSS + "\n  </style>");
  }
  html = html.replace(/<div class="nav-hint">/, gameHtml(ch) + "\n\n<div class=\"nav-hint\">");
  if (html.includes("</body>")) {
    html = html.replace("</body>", gameScript(ch.config) + "\n</body>");
  }
  fs.writeFileSync(fp, html);
  console.log("updated:", ch.file);
  return true;
}

let n = 0;
CHAPTERS.forEach(ch => { if (patchFile(ch)) n++; });
console.log("done:", n, "files");
