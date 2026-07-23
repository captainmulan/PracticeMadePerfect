#!/usr/bin/env node
/* Generate Ocean Adventure activity / explained / quiz HTML */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = __dirname;
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_ocean-data.js"), "utf8"), sandbox);
const CHAPTERS = sandbox.window.OCEAN_CHAPTERS;

const ZONES = [
  { emoji: "☀️", name: "Sunlight Zone", fact: "Sunlight reaches all the way down! Coral reefs, dolphins, and sea turtles live here (0–200 m)." },
  { emoji: "🌅", name: "Twilight Zone", fact: "Dim blue light — squid, octopus, and jellyfish with big eyes hunt here (200–1,000 m)." },
  { emoji: "🌙", name: "Midnight Zone", fact: "No sunlight! Anglerfish, sharks, and bioluminescent jellies rule the dark (1,000–4,000 m)." },
  { emoji: "🕳️", name: "Abyss Zone", fact: "Cold abyssal plains and hydrothermal vents — strange life at 4,000–6,000 m." },
  { emoji: "⛰️", name: "Hadal Zone", fact: "The deepest trenches on Earth — below 6,000 m. Challenger Deep reaches ~11 km!" }
];

const CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Comic Sans MS','Comic Neue',system-ui,sans-serif;background:linear-gradient(180deg,#0a1628 0%,#1a365d 50%,#0f4c75 100%);color:#e0f4ff;min-height:100vh;position:relative;overflow-x:hidden;}
.bubbles{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(3px 3px at 30px 50px,rgba(255,255,255,0.28),transparent),radial-gradient(4px 4px at 70px 90px,rgba(255,255,255,0.18),transparent),radial-gradient(2px 2px at 120px 40px,rgba(255,255,255,0.25),transparent);background-size:900px 150px;animation:rise 8s ease-in-out infinite;}
@keyframes rise{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
.container{max-width:680px;margin:0 auto;padding:16px 14px 32px;position:relative;z-index:1;}
.header,.top-bar{text-align:center;margin-bottom:16px;}
h1{font-size:clamp(22px,5vw,30px);color:#64ffda;margin-bottom:6px;}
.subtitle{color:#80deea;font-size:15px;line-height:1.45;}
.pill-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px;}
.pill{background:rgba(100,255,218,0.12);color:#80deea;font-size:11px;font-weight:bold;padding:5px 12px;border-radius:999px;border:1px solid rgba(100,255,218,0.35);}
.segment,.block{margin-bottom:24px;}
.segment-label,.block-label{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.08em;color:#80deea;margin-bottom:8px;}
.scene-wrap{margin-bottom:10px;}
.scene-card{position:relative;width:100%;border-radius:16px;border:2px solid rgba(100,255,218,0.35);background:#041525;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.35);}
.scene-card-hero.chapter-photo-hero{aspect-ratio:16/9;max-height:min(calc(100svh - 160px),420px);}
.chapter-hero-img{width:100%;height:100%;object-fit:cover;display:block;}
.scene-placeholder{width:100%;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center;color:#80deea;font-size:14px;padding:20px;text-align:center;}
.card{background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border-radius:16px;padding:18px;margin-bottom:12px;border:1px solid rgba(100,255,218,0.25);}
.card h2{color:#64ffda;font-size:18px;margin-bottom:10px;}
.story-box{background:rgba(0,40,60,0.35);border-left:4px solid #64ffda;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.75;color:#e0f4ff;}
.explain-box{background:rgba(100,255,218,0.08);border-left:4px solid #00bcd4;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.7;color:#cce7ff;margin-top:10px;}
.hear-row{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(100,255,218,0.25);}
.hear-label{display:block;font-size:12px;font-weight:bold;color:#80deea;margin-bottom:8px;}
.speak-chips{display:flex;flex-wrap:wrap;gap:8px;}
.speak-chip{padding:8px 14px;border:2px solid rgba(100,255,218,0.45);border-radius:999px;background:rgba(100,255,218,0.1);color:#e0f4ff;font-family:inherit;font-size:13px;font-weight:bold;cursor:pointer;touch-action:manipulation;}
.speak-chip:active,.speak-chip.pressed{background:linear-gradient(135deg,#64ffda,#00bcd4);color:#062035;border-color:#64ffda;}
.scroll-cue{text-align:center;color:#80deea;font-size:13px;margin:8px 0 12px;}
.planet-game,.game-section{background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);border-radius:20px;padding:18px;margin:16px 0;border:1px solid rgba(100,255,218,0.35);}
.planet-game h2,.game-section h2{color:#64ffda;font-size:19px;text-align:center;margin-bottom:8px;}
.planet-game .game-desc,.game-desc{text-align:center;color:#80deea;font-size:14px;margin-bottom:12px;line-height:1.5;}
.game-hud-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:10px;font-size:13px;font-weight:bold;flex-wrap:wrap;}
.game-hud-row span{background:rgba(0,0,0,0.35);padding:6px 10px;border-radius:8px;color:#ffeb3b;}
.game-canvas{position:relative;width:100%;height:min(48vh,320px);min-height:220px;background:#062035;border-radius:16px;overflow:hidden;border:2px solid rgba(100,255,218,0.35);touch-action:none;}
.game-canvas canvas{position:absolute;inset:0;display:block;width:100%;height:100%;}
.game-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,20,36,0.92);text-align:center;padding:20px;z-index:5;}
.game-overlay h3{color:#64ffda;font-size:22px;margin-bottom:8px;}
.game-overlay p{color:#cce7ff;font-size:14px;line-height:1.5;margin-bottom:14px;max-width:320px;}
.overlay-btn{padding:11px 24px;border:none;border-radius:12px;background:linear-gradient(135deg,#64ffda,#00bcd4);color:#062035;font-size:15px;font-weight:bold;cursor:pointer;}
.touch-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;margin:12px auto 0;}
.touch-btn{padding:14px;border-radius:12px;border:2px solid rgba(100,255,218,0.4);background:rgba(100,255,218,0.12);font-size:22px;cursor:pointer;touch-action:manipulation;}
.nav-hint{margin-top:16px;text-align:center;font-size:12px;color:#80deea;background:rgba(128,222,234,0.1);padding:12px;border-radius:10px;line-height:1.5;}
.competition-bar{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.1);border-radius:14px;padding:12px;margin-bottom:14px;border:1px solid rgba(100,255,218,0.25);}
.competitor{text-align:center;flex:1;}
.competitor-icon{font-size:36px;}
.competitor-name{font-size:12px;color:#80deea;margin-top:4px;}
.competitor-score{font-size:22px;font-weight:bold;color:#64ffda;}
.vs-divider{font-size:20px;font-weight:bold;color:#ffeb3b;margin:0 8px;}
.quiz-card{background:rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.1);display:none;}
.quiz-card.active{display:block;}
.question{font-size:17px;font-weight:bold;margin-bottom:14px;color:#fff;}
.options{display:flex;flex-direction:column;gap:10px;}
.option{padding:12px 16px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.2);border-radius:12px;cursor:pointer;font-size:15px;transition:.15s;}
.option:hover{background:rgba(255,255,255,0.1);border-color:#64ffda;}
.option.correct{background:rgba(76,175,80,0.3);border-color:#4caf50;}
.option.wrong{background:rgba(244,67,54,0.3);border-color:#f44336;}
.feedback{margin-top:12px;padding:10px;border-radius:10px;font-size:14px;display:none;}
.feedback.show{display:block;}
.feedback.correct{background:rgba(76,175,80,0.2);color:#81c784;}
.feedback.wrong{background:rgba(244,67,54,0.2);color:#e57373;}
.score-card{display:none;background:linear-gradient(135deg,rgba(100,255,218,0.95),rgba(0,188,212,0.95));border-radius:24px;padding:20px;text-align:center;margin-top:16px;border:4px solid #80deea;}
.score-card.show{display:block;}
.score-card h2{color:#0a1628;font-size:22px;margin-bottom:12px;}
.podium{display:flex;justify-content:center;align-items:flex-end;gap:14px;margin:16px 0;}
.podium-place{text-align:center;flex:1;max-width:110px;}
.podium-character{font-size:32px;margin-bottom:6px;}
.podium-bar{height:60px;border-radius:8px 8px 0 0;width:72px;margin:0 auto;background:rgba(10,22,40,0.35);display:flex;align-items:flex-start;justify-content:center;padding-top:6px;font-size:13px;font-weight:bold;color:#0a1628;}
.podium-bar.first{height:90px;background:linear-gradient(180deg,#ffd700,#daa520);}
.podium-bar.second{height:70px;background:linear-gradient(180deg,#c0c0c0,#a0a0a0);}
.podium-score{font-size:18px;font-weight:bold;color:#0a1628;margin-top:6px;}
.podium-name{font-size:11px;color:#0a1628;}
.message{margin:10px 0;font-size:15px;color:#0a1628;font-weight:bold;}
.retry-btn,.continue-btn{padding:12px 22px;border:none;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer;font-family:inherit;margin:4px;}
.retry-btn{background:#0a1628;color:#64ffda;}
.continue-btn{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;}
.panel{background:rgba(255,255,255,0.08);border-radius:20px;padding:14px;margin-bottom:16px;border:1px solid rgba(100,255,218,0.25);}
.view-stage{position:relative;width:100%;height:min(98vw,calc(100svh - 118px));max-height:min(98vw,calc(100svh - 118px));aspect-ratio:1;margin:0 auto;border-radius:16px;overflow:hidden;background:#041525;box-shadow:inset 0 0 40px rgba(0,0,0,0.45);}
.view-layer{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .32s ease,visibility .32s;pointer-events:none;z-index:1;}
.view-layer.active{opacity:1;visibility:visible;pointer-events:auto;z-index:2;}
.view-photo{width:100%;height:100%;object-fit:cover;display:block;user-select:none;-webkit-user-drag:none;}
.view-tap-overlay{position:absolute;inset:0;cursor:pointer;}
.ctrl-row{display:flex;flex-wrap:nowrap;gap:6px;justify-content:center;margin-top:8px;}
.ctrl-btn{padding:8px 10px;border:none;border-radius:10px;background:linear-gradient(135deg,#0288d1,#01579b);color:#fff;font-family:inherit;font-size:12px;font-weight:bold;cursor:pointer;flex:1 1 0;min-width:0;white-space:nowrap;}
.ctrl-btn.active{background:linear-gradient(135deg,#64ffda,#00bcd4);color:#062035;}
.info-panel{margin-top:10px;padding:12px 14px;background:rgba(0,0,0,0.28);border-radius:14px;border-left:4px solid #64ffda;}
.info-panel h2{color:#64ffda;font-size:18px;margin-bottom:8px;}
.info-panel p{font-size:15px;line-height:1.65;color:#e0f4ff;}
body.all-zones-page{overflow-y:auto!important;height:auto!important;}
body.reading-page .container{height:auto!important;max-height:none!important;}
@media(max-width:639px){.game-canvas{height:min(44vh,300px)!important;}}
`;

function pad(n) { return String(n).padStart(3, "0"); }
function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " "); }

function head(title, scripts) {
  const list = [
    "_ocean-player.js",
    "_ocean-data.js",
    "_ocean-chapter-images.js",
    "_ocean-scenes.js",
    "_ocean-speak.js",
    ...(scripts || [])
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ocean Adventure - ${title}</title>
<style>${CSS}</style>
${list.map((s) => `<script src="${s}"></script>`).join("\n")}
</head>`;
}

function navHint() {
  return `<div class="nav-hint"><div>💡 Use the ← → arrows in the top navigation bar to go to the next chapter.</div><div>💡 Use the 🏠 button in the top navigation bar to go back to the Home page.</div></div>`;
}

function hearRow(words) {
  if (!words || !words.length) return "";
  const chips = words.map((w) => `<button type="button" class="speak-chip" data-word="${esc(w)}" onclick="OceanSpeak.chip(this)">${w}</button>`).join("");
  return `<div class="hear-row"><span class="hear-label">🔊 Press words to hear:</span><div class="speak-chips">${chips}</div></div>`;
}

function segmentHtml(ch, seg, kind) {
  const label = kind === "main" ? "Picture" : "Deep dive";
  return `
  <div class="segment">
    <div class="segment-label">${label} · ${seg.storyTitle}</div>
    <div class="scene-wrap"><div id="scene-${seg.slot}" class="scene-card scene-card-hero chapter-photo-hero"></div></div>
    <div class="card">
      <h2>📖 ${seg.storyTitle}</h2>
      <div class="story-box">${seg.story}</div>
      <div class="explain-box"><strong>💡 Explanation:</strong> ${seg.explanation}</div>
      ${kind === "main" ? hearRow(seg.words) : ""}
    </div>
  </div>`;
}

function bootScenesScript(ch, segments) {
  return `<script>
document.addEventListener("DOMContentLoaded", function() {
${segments.map((s) => `  OceanScene.boot({ containerId: "scene-${s.slot}", chapterId: "${ch.id}", slot: "${s.slot}", title: "${esc(ch.title)}" });`).join("\n")}
});
</script>`;
}

function gameBlock(ch) {
  const g = ch.game;
  const boot = JSON.stringify(g.boot, null, 2);
  const touch = g.boot.game === "zone-sort" || g.boot.game === "trench-pilot" || g.boot.game === "school-run"
    ? `<div class="touch-controls"><button class="touch-btn" id="ogLeftBtn" type="button">⬅️</button><button class="touch-btn" id="ogRightBtn" type="button">➡️</button></div>`
    : g.boot.game === "breath-dive"
    ? `<div class="touch-controls"><button class="touch-btn" id="ogUpBtn" type="button">⬆️ Surface</button><button class="touch-btn" id="ogDownBtn" type="button">⬇️ Dive</button></div>`
    : "";
  return `
  <div class="planet-game">
    <h2>${g.title}</h2>
    <p class="game-desc">${g.desc}</p>
    <div class="game-hud-row"><span id="ogScore">⭐ 0</span><span id="ogTimer">⏱ ${g.boot.time || 60}s</span><span id="ogLives">${"❤️".repeat(g.boot.lives || 3)}</span></div>
    <p id="ogHint" style="text-align:center;color:#80deea;font-size:12px;margin:0 0 8px;min-height:18px;"></p>
    <div class="game-canvas" id="ogCanvasBox">
      <canvas id="ogCanvas"></canvas>
      <div class="game-overlay" id="ogStart"><h3>${g.title}</h3><p>${g.desc}</p><button class="overlay-btn" type="button" onclick="ogStartGame()">▶️ Start</button></div>
      <div class="game-overlay" id="ogEnd" style="display:none;"><h3 id="ogEndTitle">🎉 Great job!</h3><p id="ogEndStats"></p><button class="overlay-btn" type="button" onclick="ogStartGame()">🔄 Play Again</button></div>
    </div>
    ${touch}
  </div>
  <script src="_ocean-games.js"></script>
  <script>OceanGame.boot(${boot});</script>`;
}

function explainedSlug(ch) {
  return ch.id === "overview" ? "Ocean-Explained" : ch.slug + "-Explained";
}

function quizSlug(ch) {
  return ch.id === "overview" ? "Ocean-Quiz" : ch.slug + "-Quiz";
}

function genActivity(ch) {
  if (ch.id === "overview") return genOverview(ch);
  const fname = `${pad(ch.num)}-${ch.slug}.html`;
  const segs = ch.mainSegments.map((s) => segmentHtml(ch, s, "main")).join("\n");
  const html = `${head(ch.title)}
<body class="big-planet-page reading-page">
<div class="bubbles"></div>
<div class="container">
  <div class="header">
    <h1>${ch.emoji} ${ch.title}</h1>
    <div class="subtitle">Picture · story · explanation · press words to hear × 3 · mini game</div>
    <div class="pill-row"><span class="pill">🖼️ PNG scenes</span><span class="pill">🔊 Tap vocabulary</span><span class="pill">🎮 Game below</span></div>
  </div>
  <p class="scroll-cue">↓ Scroll — each section has its own picture, story, explanation, and words to hear</p>
  ${segs}
  ${gameBlock(ch)}
  ${navHint()}
</div>
${bootScenesScript(ch, ch.mainSegments)}
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
  return fname;
}

function genOverview(ch) {
  const views = ch.viewLabels.map((v, i) => {
    const slot = `view-${i + 1}`;
    return `      <div class="view-layer view-layer-${v.id}${i === 0 ? " active" : ""}" data-layer="${v.id}" data-slot="${slot}">
        <img class="view-photo" id="viewImg-${v.id}" alt="${esc(v.label)}" decoding="async">
        <div class="view-tap-overlay" data-view="${v.id}" aria-label="Tap to learn about ocean zones"></div>
      </div>`;
  }).join("\n");

  const html = `${head("Ocean Overview")}
<body class="all-zones-page big-planet-page">
<div class="bubbles"></div>
<div class="container">
  <div class="header">
    <h1>🌊 Our Ocean</h1>
    <div class="subtitle">Four painted views — depth chart, surface, sonar map, and sub porthole</div>
  </div>
  <div class="panel ocean-panel">
    <div class="view-stage" id="viewStage">
${views}
    </div>
    <div class="ctrl-row">
      <button type="button" class="ctrl-btn" id="btnViewMode">👁️ View1</button>
      <button type="button" class="ctrl-btn" id="btnReset">🔄 Reset</button>
    </div>
    <div class="info-panel" id="infoPanel">
      <h2>🌊 ${ch.viewLabels[0].label}</h2>
      <p>${ch.viewLabels[0].desc}</p>
    </div>
  </div>
  <p class="scroll-cue">↓ Scroll for the Zone Sort mini-game</p>
  ${gameBlock(ch)}
  ${navHint()}
</div>
<script>
(function() {
  var VIEW_MODES = ${JSON.stringify(ch.viewLabels.map((v, i) => ({ id: v.id, slot: "view-" + (i + 1), label: v.label, desc: v.desc })))};
  var ZONES = ${JSON.stringify(ZONES)};
  var viewIdx = 0;
  var zoneIdx = 0;

  function loadViewImages() {
    VIEW_MODES.forEach(function(m) {
      var img = document.getElementById("viewImg-" + m.id);
      if (!img || !window.OceanChapterImage) return;
      var uri = OceanChapterImage.getUri("overview", m.slot);
      if (uri) img.src = uri;
    });
  }

  function showView() {
    var m = VIEW_MODES[viewIdx];
    document.querySelectorAll(".view-layer").forEach(function(el) {
      el.classList.toggle("active", el.dataset.layer === m.id);
    });
    document.getElementById("btnViewMode").textContent = "👁️ View" + (viewIdx + 1);
    document.getElementById("infoPanel").innerHTML = "<h2>🌊 " + m.label + "</h2><p>" + m.desc + "</p>";
  }

  function showZone(z) {
    document.getElementById("infoPanel").innerHTML = "<h2>" + z.emoji + " " + z.name + "</h2><p>" + z.fact + "</p>";
  }

  document.getElementById("btnViewMode").onclick = function() {
    viewIdx = (viewIdx + 1) % VIEW_MODES.length;
    showView();
  };
  document.getElementById("btnReset").onclick = function() {
    viewIdx = 0; zoneIdx = 0;
    showView();
  };

  document.querySelectorAll(".view-tap-overlay").forEach(function(ov) {
    ov.addEventListener("click", function(e) {
      var rect = ov.getBoundingClientRect();
      var rel = (e.clientY - rect.top) / rect.height;
      var zi = Math.min(ZONES.length - 1, Math.max(0, Math.floor(rel * ZONES.length)));
      zoneIdx = (zoneIdx + 1) % ZONES.length;
      if (ov.dataset.view === "deep") zoneIdx = zi;
      else if (rel >= 0 && rel <= 1) zi = Math.min(ZONES.length - 1, Math.max(0, Math.floor(rel * ZONES.length)));
      showZone(ZONES[zi]);
    });
  });

  document.addEventListener("DOMContentLoaded", loadViewImages);
  if (document.readyState !== "loading") loadViewImages();
  showView();
})();
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, `${pad(ch.num)}-${ch.slug}.html`), html);
  return `${pad(ch.num)}-${ch.slug}.html`;
}

function genExplained(ch) {
  const num = ch.num + 1;
  const fname = `${pad(num)}-${explainedSlug(ch)}.html`;
  const segs = ch.explainedSegments.map((s) => segmentHtml(ch, s, "explained")).join("\n");
  const html = `${head(ch.title + " Explained")}
<body class="reading-page">
<div class="bubbles"></div>
<div class="container">
  <div class="header">
    <h1>📚 ${ch.title} — Explained</h1>
    <div class="subtitle">Picture · story · explanation × 3</div>
  </div>
  <p class="scroll-cue">Scroll through three deeper sections with painted scenes</p>
  ${segs}
  ${navHint()}
</div>
${bootScenesScript(ch, ch.explainedSegments)}
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
  return fname;
}

function genQuiz(ch) {
  const num = ch.num + 2;
  const fname = `${pad(num)}-${quizSlug(ch)}.html`;
  const opp = ch.opponent;
  const cards = ch.quiz.map((q, i) => `
  <div class="quiz-card${i === 0 ? " active" : ""}" id="quizCard-${i + 1}">
    <div class="question">${i + 1}. ${q.q}</div>
    <div class="options">
      ${q.options.map((opt, j) => `<div class="option" onclick="checkAnswer(this, ${i + 1}, ${j === q.correct})">${opt}</div>`).join("\n      ")}
    </div>
    <div class="feedback" id="feedback-${i + 1}"></div>
  </div>`).join("\n");

  const html = `${head(ch.title + " Quiz")}
<body class="reading-page">
<div class="bubbles"></div>
<div class="container">
  <div class="header">
    <h1>❓ ${ch.title} Quiz</h1>
    <div class="subtitle">Beat ${opp.name}!</div>
  </div>
  <div class="competition-bar" id="liveScoreBar">
    <div class="competitor">
      <div class="competitor-icon" id="playerIcon">🤿</div>
      <div class="competitor-name" id="playerName">Explorer</div>
      <div class="competitor-score" id="playerScore">0</div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="competitor">
      <div class="competitor-icon">${opp.icon}</div>
      <div class="competitor-name">${opp.name}</div>
      <div class="competitor-score" id="opponentScore">0</div>
    </div>
  </div>
  <div id="quizArea">${cards}</div>
  <div class="score-card" id="scoreCard">
    <h2>🎉 Quiz Complete!</h2>
    <div class="podium" id="podium"></div>
    <p class="message" id="scoreMessage"></p>
    <button class="retry-btn" type="button" onclick="location.reload()">🔄 Try Again</button>
  </div>
  ${navHint()}
</div>
<script>
var playerScore = 0, opponentScore = 0, currentQ = 1, totalQ = ${ch.quiz.length}, answered = false;
var playerName = "Explorer", playerIcon = "🤿", opponentName = "${esc(opp.name)}", opponentIcon = "${opp.icon}";

function loadPlayerInfo() {
  if (window.OceanPlayer) {
    playerName = OceanPlayer.getUserName();
    playerIcon = OceanPlayer.getCharacter();
  }
  document.getElementById("playerName").textContent = playerName;
  document.getElementById("playerIcon").textContent = playerIcon;
}

function checkAnswer(el, qNum, correct) {
  if (answered) return;
  answered = true;
  var fb = document.getElementById("feedback-" + qNum);
  var opts = el.parentElement.querySelectorAll(".option");
  opts.forEach(function(o) { o.style.pointerEvents = "none"; });
  if (correct) {
    el.classList.add("correct");
    playerScore++;
    fb.textContent = "✅ Correct!";
    fb.className = "feedback show correct";
  } else {
    el.classList.add("wrong");
    if (Math.random() < 0.65) opponentScore++;
    fb.textContent = "❌ " + opponentName + " gets a point!";
    fb.className = "feedback show wrong";
  }
  document.getElementById("playerScore").textContent = playerScore;
  document.getElementById("opponentScore").textContent = opponentScore;
  setTimeout(function() {
    answered = false;
    if (qNum >= totalQ) showResults();
    else {
      document.getElementById("quizCard-" + qNum).classList.remove("active");
      currentQ = qNum + 1;
      document.getElementById("quizCard-" + currentQ).classList.add("active");
    }
  }, 1400);
}

function showResults() {
  document.getElementById("quizArea").style.display = "none";
  document.getElementById("liveScoreBar").style.display = "none";
  var competitors = [
    { name: playerName, icon: playerIcon, score: playerScore },
    { name: opponentName, icon: opponentIcon, score: opponentScore }
  ].sort(function(a, b) { return b.score - a.score; });
  var podium = document.getElementById("podium");
  podium.innerHTML = "";
  var order = competitors.length > 1 ? [1, 0] : [0];
  order.forEach(function(idx, pi) {
    var c = competitors[idx];
    var place = document.createElement("div");
    place.className = "podium-place " + (pi === 1 ? "first" : "second");
    place.innerHTML = '<div class="podium-character">' + c.icon + '</div><div class="podium-bar ' + (pi === 1 ? "first" : "second") + '">' + c.score + '</div><div class="podium-name">' + c.name + '</div>';
    podium.appendChild(place);
  });
  document.getElementById("scoreMessage").textContent = playerScore >= opponentScore
    ? "Amazing! You know " + "${esc(ch.title)}" + "!"
    : "Keep exploring — read the chapter again!";
  document.getElementById("scoreCard").classList.add("show");
}

loadPlayerInfo();
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
  return fname;
}

CHAPTERS.forEach((ch) => {
  console.log(genActivity(ch));
  console.log(genExplained(ch));
  console.log(genQuiz(ch));
});
console.log("Done —", CHAPTERS.length * 3, "chapter files regenerated");
