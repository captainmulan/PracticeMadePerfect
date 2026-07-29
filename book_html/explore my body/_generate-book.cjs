#!/usr/bin/env node
/* Generate activity / explained / quiz HTML — Ocean + MM Words pattern */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = __dirname;
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_body-data.js"), "utf8"), sandbox);
const CHAPTERS = sandbox.window.BODY_CHAPTERS;

const BODY_WORDS = {
  heart: {
    "main-1": ["heart", "pulse", "heartbeat", "muscle"],
    "main-2": ["blood", "oxygen", "pump", "cells"],
    "main-3": ["chambers", "atria", "ventricles", "lungs"]
  },
  brain: {
    "main-1": ["brain", "control centre", "nerves", "think"],
    "main-2": ["left hemisphere", "right hemisphere", "creativity", "logic"],
    "main-3": ["memory", "sleep", "hippocampus", "learn"]
  },
  bones: {
    "main-1": ["skeleton", "bones", "support", "206"],
    "main-2": ["calcium", "marrow", "grow", "heal"],
    "main-3": ["joints", "elbow", "hinge", "shoulder"]
  },
  muscles: {
    "main-1": ["muscle", "contract", "tendon", "pull"],
    "main-2": ["skeletal", "smooth", "cardiac", "heart muscle"],
    "main-3": ["warm up", "stretch", "exercise", "flex"]
  },
  lungs: {
    "main-1": ["lungs", "breathe", "oxygen", "carbon dioxide"],
    "main-2": ["alveoli", "diaphragm", "air sacs", "chest"],
    "main-3": ["inhale", "exhale", "breathing", "rib cage"]
  },
  stomach: {
    "main-1": ["stomach", "digest", "food", "acid"],
    "main-2": ["enzymes", "mucus", "protect", "mix"],
    "main-3": ["small intestine", "nutrients", "absorb", "energy"]
  },
  eyes: {
    "main-1": ["eyes", "retina", "light", "see"],
    "main-2": ["rods", "cones", "colour", "night vision"],
    "main-3": ["blink", "tears", "cornea", "protect"]
  },
  ears: {
    "main-1": ["ears", "sound", "vibration", "hear"],
    "main-2": ["eardrum", "ossicles", "cochlea", "balance"],
    "main-3": ["inner ear", "dizzy", "semicircular canals", "movement"]
  }
};

const BODY_TIPS = {
  heart: "After exercise, help your child find their pulse on the wrist. Count beats for 15 seconds and multiply by 4 — compare resting vs after running!",
  brain: "Play memory games at bedtime: \"What did we do today?\" Sleep helps the brain file memories.",
  bones: "Dairy, leafy greens, and outdoor play build strong bones. Point out hinge joints when opening doors together.",
  muscles: "Before sport, do five minutes of gentle stretches together — name the muscles as you move.",
  lungs: "Practice belly breathing: hand on tummy, breathe in slowly through the nose, out through the mouth.",
  stomach: "Chew each bite 10 times at one meal this week — talk about how digestion starts in the mouth.",
  eyes: "Try the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds during screen time.",
  ears: "Whisper a direction from behind — can they point where the sound came from? Protect ears at loud events."
};

const CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Comic Sans MS','Comic Neue',system-ui,sans-serif;background:linear-gradient(180deg,#fff5f5 0%,#ffe8e8 35%,#ffd6d6 70%,#ffcdd2 100%);color:#5d4037;min-height:100vh;position:relative;overflow-x:hidden;}
.hearts{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(3px 3px at 30px 50px,rgba(244,67,54,0.2),transparent),radial-gradient(4px 4px at 80px 100px,rgba(233,30,99,0.15),transparent),radial-gradient(2px 2px at 140px 40px,rgba(255,107,107,0.2),transparent);background-size:900px 150px;animation:float 14s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
.container{max-width:680px;margin:0 auto;padding:16px 14px 32px;position:relative;z-index:1;}
.header,.top-bar{text-align:center;margin-bottom:16px;}
h1{font-size:clamp(22px,5vw,30px);color:#c62828;margin-bottom:6px;}
.subtitle{color:#ad1457;font-size:15px;line-height:1.45;}
.pill-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px;}
.pill{background:rgba(255,255,255,0.85);color:#ad1457;font-size:11px;font-weight:bold;padding:5px 12px;border-radius:999px;border:1px solid rgba(198,40,40,0.25);}
.segment{margin-bottom:24px;}
.segment-label{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.08em;color:#ad1457;margin-bottom:8px;}
.scene-wrap{margin-bottom:10px;}
.scene-card{position:relative;width:100%;border-radius:16px;border:2px solid rgba(198,40,40,0.35);background:#fff8f8;overflow:hidden;box-shadow:0 8px 28px rgba(198,40,40,0.12);}
.scene-card-hero.chapter-photo-hero{aspect-ratio:16/9;max-height:min(calc(100svh - 160px),420px);}
.chapter-hero-img{width:100%;height:100%;object-fit:cover;display:block;}
.card{background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border-radius:16px;padding:18px;margin-bottom:12px;border:1px solid rgba(198,40,40,0.2);box-shadow:0 4px 16px rgba(0,0,0,0.06);}
.card h2{color:#c62828;font-size:18px;margin-bottom:10px;}
.story-box{background:rgba(255,235,238,0.9);border-left:4px solid #ef5350;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.75;color:#4e342e;}
.explain-box{background:rgba(255,243,224,0.95);border-left:4px solid #ff9800;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.7;color:#5d4037;margin-top:10px;}
.hear-row{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(198,40,40,0.25);}
.hear-label{display:block;font-size:12px;font-weight:bold;color:#ad1457;margin-bottom:8px;}
.speak-chips{display:flex;flex-wrap:wrap;gap:8px;}
.speak-chip{padding:8px 14px;border:2px solid rgba(239,83,80,0.45);border-radius:999px;background:rgba(255,235,238,0.8);color:#5d4037;font-family:inherit;font-size:13px;font-weight:bold;cursor:pointer;touch-action:manipulation;}
.speak-chip:active,.speak-chip.pressed{background:linear-gradient(135deg,#ef5350,#e53935);color:#fff;border-color:#c62828;}
.tip-card{background:linear-gradient(135deg,#fff8e1,#ffecb3);border:1px solid rgba(255,193,7,0.5);}
.tip-card h2{color:#e65100;font-size:17px;margin-bottom:8px;}
.tip-card p{font-size:15px;line-height:1.65;color:#5d4037;}
.tip-tag{display:inline-block;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.06em;color:#f57c00;margin-bottom:8px;}
.scroll-cue{text-align:center;color:#ad1457;font-size:13px;margin:8px 0 12px;}
.nav-hint{margin-top:16px;text-align:center;font-size:12px;color:#ad1457;background:rgba(255,255,255,0.7);padding:12px;border-radius:10px;line-height:1.5;}
.competition-bar{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.9);border-radius:14px;padding:12px;margin-bottom:14px;border:1px solid rgba(198,40,40,0.25);}
.competitor{text-align:center;flex:1;}
.competitor-icon{font-size:36px;}
.competitor-name{font-size:12px;color:#ad1457;margin-top:4px;}
.competitor-score{font-size:22px;font-weight:bold;color:#c62828;}
.vs-divider{font-size:20px;font-weight:bold;color:#ff9800;margin:0 8px;}
.quiz-card{background:rgba(255,255,255,0.92);border-radius:16px;padding:18px;margin-bottom:12px;border:1px solid rgba(198,40,40,0.2);display:none;}
.quiz-card.active{display:block;}
.question{font-size:17px;font-weight:bold;margin-bottom:14px;color:#4e342e;}
.options{display:flex;flex-direction:column;gap:10px;}
.option{padding:12px 16px;background:rgba(255,255,255,0.95);border:2px solid rgba(198,40,40,0.25);border-radius:12px;cursor:pointer;font-size:15px;color:#5d4037;transition:.15s;}
.option:hover{background:rgba(255,235,238,0.9);border-color:#ef5350;}
.option.correct{background:rgba(76,175,80,0.25);border-color:#4caf50;}
.option.wrong{background:rgba(244,67,54,0.2);border-color:#f44336;}
.feedback{margin-top:12px;padding:10px;border-radius:10px;font-size:14px;display:none;}
.feedback.show{display:block;}
.feedback.correct{background:rgba(76,175,80,0.2);color:#2e7d32;}
.feedback.wrong{background:rgba(244,67,54,0.15);color:#c62828;}
.score-card{display:none;background:linear-gradient(135deg,#ffebee,#ffcdd2);border-radius:24px;padding:20px;text-align:center;margin-top:16px;border:4px solid #ef5350;}
.score-card.show{display:block;}
.score-card h2{color:#b71c1c;font-size:22px;margin-bottom:12px;}
.podium{display:flex;justify-content:center;align-items:flex-end;gap:14px;margin:16px 0;}
.podium-place{text-align:center;flex:1;max-width:110px;}
.podium-character{font-size:32px;margin-bottom:6px;}
.podium-bar{height:60px;border-radius:8px 8px 0 0;width:72px;margin:0 auto;background:rgba(93,64,55,0.2);display:flex;align-items:flex-start;justify-content:center;padding-top:6px;font-size:13px;font-weight:bold;color:#5d4037;}
.podium-bar.first{height:90px;background:linear-gradient(180deg,#ffd700,#ff9800);}
.podium-bar.second{height:70px;background:linear-gradient(180deg,#b0bec5,#78909c);}
.podium-name{font-size:11px;color:#5d4037;margin-top:6px;}
.message{margin:10px 0;font-size:15px;color:#4e342e;font-weight:bold;}
.retry-btn{padding:12px 22px;border:none;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer;font-family:inherit;background:#c62828;color:#fff;}
body.reading-page .container{height:auto!important;max-height:none!important;}
`;

function pad(n) { return String(n).padStart(3, "0"); }
function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " "); }

function head(title) {
  const scripts = ["_body-player.js", "_body-data.js", "_body-scenes.js", "_body-speak.js"];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Explore My Body - ${title}</title>
<style>${CSS}</style>
${scripts.map((s) => `<script src="${s}"></script>`).join("\n")}
</head>`;
}

function navHint() {
  return `<div class="nav-hint"><div>💡 Use the ← → arrows in the top navigation bar to go to the next chapter.</div><div>💡 Use the 🏠 button in the top navigation bar to go back to the Home page.</div></div>`;
}

function segmentWords(ch, seg) {
  return seg.words || (BODY_WORDS[ch.id] && BODY_WORDS[ch.id][seg.slot]) || [];
}

function hearRow(ch, seg) {
  const words = segmentWords(ch, seg);
  if (!words.length) return "";
  const chips = words
    .map(
      (w) =>
        `<button type="button" class="speak-chip" data-word="${esc(w)}" data-chapter="${ch.id}" onclick="BodySpeak.chip(this)">${w}</button>`
    )
    .join("");
  return `<div class="hear-row"><span class="hear-label">🔊 Press words to hear:</span><div class="speak-chips">${chips}</div></div>`;
}

function tipCard(ch) {
  const tip = ch.tip || BODY_TIPS[ch.id];
  if (!tip) return "";
  return `
  <div class="card tip-card">
    <span class="tip-tag">💡 Parent tip</span>
    <h2>Try at home</h2>
    <p>${tip}</p>
  </div>`;
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
      ${kind === "main" ? hearRow(ch, seg) : ""}
    </div>
  </div>`;
}

function bootScenesScript(ch, segments) {
  return `<script>
document.addEventListener("DOMContentLoaded", function() {
${segments.map((s, i) => `  BodyScene.boot({ containerId: "scene-${s.slot}", chapterId: "${ch.id}", slot: "${s.slot}", title: "${esc(ch.title)}"${i === 0 ? ", eager: true" : ""} });`).join("\n")}
});
</script>`;
}

function genActivity(ch) {
  const fname = `${pad(ch.num)}-${ch.slug}-Activity.html`;
  const segs = ch.mainSegments.map((s) => segmentHtml(ch, s, "main")).join("\n");
  const html = `${head(ch.title + " Activity")}
<body class="reading-page">
<div class="hearts"></div>
<div class="container">
  <div class="header">
    <h1>${ch.emoji} ${ch.title}</h1>
    <div class="subtitle">Picture · story · explanation · press words to hear × 3</div>
    <div class="pill-row"><span class="pill">🖼️ Scene art</span><span class="pill">🔊 Tap vocabulary</span></div>
  </div>
  <p class="scroll-cue">↓ Scroll — each section has its own picture, story, explanation, and words to hear</p>
  ${segs}
  ${tipCard(ch)}
  ${navHint()}
</div>
${bootScenesScript(ch, ch.mainSegments)}
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
  return fname;
}

function genExplained(ch) {
  const fname = `${pad(ch.num + 1)}-${ch.slug}-Explained.html`;
  const segs = ch.explainedSegments.map((s) => segmentHtml(ch, s, "explained")).join("\n");
  const html = `${head(ch.title + " Explained")}
<body class="reading-page">
<div class="hearts"></div>
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
  const fname = `${pad(ch.num + 2)}-${ch.slug}-QuizTime.html`;
  const opp = ch.opponent;
  const quiz = ch.quiz.slice(0, 5);
  const cards = quiz
    .map(
      (q, i) => `
  <div class="quiz-card${i === 0 ? " active" : ""}" id="quizCard-${i + 1}">
    <div class="question">${i + 1}. ${q.q}</div>
    <div class="options">
      ${q.options.map((opt, j) => `<div class="option" onclick="checkAnswer(this, ${i + 1}, ${j === q.correct})">${opt}</div>`).join("\n      ")}
    </div>
    <div class="feedback" id="feedback-${i + 1}"></div>
  </div>`
    )
    .join("\n");

  const html = `${head(ch.title + " Quiz")}
<body class="reading-page">
<div class="hearts"></div>
<div class="container">
  <div class="header">
    <h1>❓ ${ch.title} Quiz</h1>
    <div class="subtitle">Beat ${opp.name}!</div>
  </div>
  <div class="competition-bar" id="liveScoreBar">
    <div class="competitor">
      <div class="competitor-icon" id="playerIcon">🧒</div>
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
var playerScore = 0, opponentScore = 0, currentQ = 1, totalQ = ${quiz.length}, answered = false;
var playerName = "Explorer", playerIcon = "🧒", opponentName = "${esc(opp.name)}", opponentIcon = "${opp.icon}";

function loadPlayerInfo() {
  if (window.BodyPlayer) {
    playerName = BodyPlayer.getUserName();
    playerIcon = BodyPlayer.getCharacter();
  }
  document.getElementById("playerName").textContent = playerName;
  document.getElementById("playerIcon").textContent = playerIcon;
}

function checkAnswer(el, qNum, correct) {
  if (answered) return;
  answered = true;
  var fb = document.getElementById("feedback-" + qNum);
  el.parentElement.querySelectorAll(".option").forEach(function(o) { o.style.pointerEvents = "none"; });
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
  [1, 0].forEach(function(idx, pi) {
    var c = competitors[idx];
    var place = document.createElement("div");
    place.className = "podium-place";
    place.innerHTML = '<div class="podium-character">' + c.icon + '</div><div class="podium-bar ' + (pi === 1 ? "first" : "second") + '">' + c.score + '</div><div class="podium-name">' + c.name + '</div>';
    podium.appendChild(place);
  });
  document.getElementById("scoreMessage").textContent = playerScore >= opponentScore
    ? "Amazing! You know your ${esc(ch.title.toLowerCase())}!"
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
