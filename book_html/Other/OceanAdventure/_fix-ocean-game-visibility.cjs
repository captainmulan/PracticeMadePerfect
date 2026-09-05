/**
 * Fix ocean minigame visibility — larger icons, dark halos, sharper canvas, darker bg.
 * node book_html/OceanAdventure/_fix-ocean-game-visibility.cjs
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const FILES = [
  "005-Ocean-Overview.html",
  "008-Sunlight-Zone.html",
  "011-Twilight-Zone.html",
  "014-Midnight-Zone.html",
  "017-Abyss-Zone.html",
  "020-Coral-Reefs.html",
  "023-Marine-Mammals.html",
  "026-Fish.html",
];

const BG_FIXES = [
  [/("bgTop":"#4fc3f7")/, '"bgTop":"#1565c0"'],
  [/("bgTop":"#81d4fa")/, '"bgTop":"#1976d2"'],
  [/("bgTop":"#1a4480")/, '"bgTop":"#0d2b52"'],
  [/("bgTop":"#0a1830")/, '"bgTop":"#050d18"'],
  [/("bgTop":"#0a1020")/, '"bgTop":"#040810"'],
  [/("bgTop":"#00695c")/, '"bgTop":"#004d40"'],
  [/("bgTop":"#0277bd")/, '"bgTop":"#01579b"'],
  [/("bgTop":"#0288d1")/, '"bgTop":"#015a7a"'],
];

const NEW_ENGINE = `const OG_CFG = __CFG__;
const OG_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
let ogCanvas, ogCtx, ogRunning = false, ogScore = 0, ogTime = OG_CFG.time, ogLives = OG_CFG.lives;
let ogTimerId, ogAnimId, ogPlayer, ogItems = [], ogMoveL = false, ogMoveR = false, ogSpawn = 0;

function ogViewSize() {
  const r = document.getElementById('ogCanvasBox').getBoundingClientRect();
  return { w: Math.max(280, r.width), h: Math.max(220, r.height) };
}
function ogResize() {
  const box = document.getElementById('ogCanvasBox');
  ogCanvas = document.getElementById('ogCanvas');
  ogCtx = ogCanvas.getContext('2d');
  const vs = ogViewSize();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ogCanvas.width = Math.floor(vs.w * dpr);
  ogCanvas.height = Math.floor(vs.h * dpr);
  ogCanvas.style.width = vs.w + 'px';
  ogCanvas.style.height = vs.h + 'px';
  ogCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (ogPlayer) {
    ogPlayer.x = Math.min(Math.max(ogPlayer.x, 30), vs.w - 30);
    ogPlayer.y = vs.h - 36;
  }
}
function ogDrawIcon(x, y, icon, size, ring) {
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
}
function ogDrawBg() {
  const vs = ogViewSize();
  const g = ogCtx.createLinearGradient(0, 0, 0, vs.h);
  g.addColorStop(0, OG_CFG.bgTop || '#0a3050');
  g.addColorStop(1, OG_CFG.bgBot || '#041525');
  ogCtx.fillStyle = g;
  ogCtx.fillRect(0, 0, vs.w, vs.h);
  ogCtx.fillStyle = 'rgba(0,0,0,0.35)';
  ogCtx.fillRect(0, vs.h - 32, vs.w, 32);
  ogCtx.fillStyle = 'rgba(100,255,218,0.35)';
  ogCtx.fillRect(0, vs.h - 32, vs.w, 3);
  for (let i = 0; i < 14; i++) {
    ogCtx.fillStyle = 'rgba(255,255,255,' + (0.12 + (i % 3) * 0.08) + ')';
    ogCtx.beginPath();
    ogCtx.arc((i * 83) % vs.w, (i * 53 + Date.now() * 0.02) % vs.h, 1.4 + (i % 2), 0, Math.PI * 2);
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
  const vs = ogViewSize();
  if (OG_CFG.mode === 'tap') {
    const bad = Math.random() < 0.22 && OG_CFG.bad.length;
    const pool = bad ? OG_CFG.bad : OG_CFG.good;
    const icon = pool[Math.floor(Math.random() * pool.length)];
    ogItems.push({ x: 36 + Math.random() * (vs.w - 72), y: 36 + Math.random() * (vs.h - 90), icon: icon, bad: bad, life: 100 + Math.random() * 50, r: 24 });
    return;
  }
  const bad = OG_CFG.mode === 'survive' || (Math.random() < 0.34 && OG_CFG.bad.length);
  const pool = bad ? OG_CFG.bad : OG_CFG.good;
  if (!pool.length) return;
  ogItems.push({
    x: 28 + Math.random() * (vs.w - 56),
    y: -28,
    icon: pool[Math.floor(Math.random() * pool.length)],
    bad: bad,
    speed: 1.8 + Math.random() * 1.8,
    r: 22
  });
}
function ogLoop() {
  if (!ogRunning) return;
  ogSpawn++;
  if (ogSpawn > (OG_CFG.mode === 'tap' ? 38 : 24)) { ogSpawn = 0; ogSpawnItem(); }
  const vs = ogViewSize();
  if (OG_CFG.mode !== 'tap' && ogPlayer) {
    if (ogMoveL) ogPlayer.vx = -6;
    else if (ogMoveR) ogPlayer.vx = 6;
    else ogPlayer.vx *= 0.72;
    ogPlayer.x = Math.max(30, Math.min(vs.w - 30, ogPlayer.x + ogPlayer.vx));
    ogPlayer.y = vs.h - 36;
  }
  ogItems.forEach((it, i) => {
    if (OG_CFG.mode === 'tap') {
      it.life--;
      if (it.life <= 0) ogItems.splice(i, 1);
    } else {
      it.y += it.speed;
      if (ogPlayer && Math.hypot(ogPlayer.x - it.x, ogPlayer.y - it.y) < it.r + 18) {
        ogItems.splice(i, 1);
        if (it.bad) { ogLives--; if (ogLives <= 0) { ogEnd(false); return; } }
        else { ogScore += 10; if (OG_CFG.goal && ogScore >= OG_CFG.goal) { ogEnd(true); return; } }
        ogHud();
      } else if (it.y > vs.h + 30) ogItems.splice(i, 1);
    }
  });
  ogDrawBg();
  ogCtx.textAlign = 'center';
  ogCtx.textBaseline = 'middle';
  ogItems.forEach(it => {
    if (OG_CFG.mode === 'tap' && it.life < 30) ogCtx.globalAlpha = Math.max(0.35, it.life / 30);
    ogDrawIcon(it.x, it.y, it.icon, 34, it.bad ? 'rgba(120,20,20,0.75)' : 'rgba(0,40,80,0.78)');
    ogCtx.globalAlpha = 1;
  });
  if (ogPlayer && OG_CFG.mode !== 'tap') ogDrawIcon(ogPlayer.x, ogPlayer.y, ogPlayer.icon, 38, 'rgba(0,60,100,0.85)');
  ogAnimId = requestAnimationFrame(ogLoop);
}
function ogTapHit(x, y) {
  for (let i = ogItems.length - 1; i >= 0; i--) {
    const it = ogItems[i];
    if (Math.hypot(x - it.x, y - it.y) < it.r + 8) {
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
  ogSpawn = 20;
  const vs = ogViewSize();
  ogPlayer = { x: vs.w / 2, y: vs.h - 36, vx: 0, icon: OG_CFG.player || '🤿' };
  document.getElementById('ogStart').style.display = 'none';
  document.getElementById('ogEnd').style.display = 'none';
  ogHud();
  if (OG_CFG.mode !== 'tap') { ogSpawnItem(); ogSpawnItem(); }
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
window.addEventListener('resize', () => { if (ogRunning) ogResize(); });`;

function patch(fp) {
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes("const OG_CFG")) return false;

  html = html.replace(
    /\.game-canvas canvas\{display:block;width:100%;height:100%;\}/,
    ".game-canvas canvas{position:absolute;inset:0;display:block;width:100%;height:100%;}",
  );

  BG_FIXES.forEach(([re, rep]) => {
    html = html.replace(re, rep);
  });

  const m = html.match(/const OG_CFG = (\{[\s\S]*?\});[\s\S]*?window\.addEventListener\('resize', \(\) => \{ if \(ogRunning\) ogResize\(\); \}\);/);
  if (!m) return false;
  const cfg = m[1];
  const engine = NEW_ENGINE.replace("__CFG__", cfg);
  html = html.replace(m[0], engine);
  fs.writeFileSync(fp, html);
  return true;
}

let n = 0;
FILES.forEach(f => {
  const fp = path.join(DIR, f);
  if (patch(fp)) {
    console.log("fixed:", f);
    n++;
  }
});
console.log("done:", n);
