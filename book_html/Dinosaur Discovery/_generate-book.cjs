#!/usr/bin/env node
/* Generate Dinosaur Discovery chapter HTML (004–038 activity/explained/quiz) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = __dirname;

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_dino-data.js"), "utf8"), sandbox);
const CHAPTERS = sandbox.window.DINO_CHAPTERS;

const CSS = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Comic Sans MS','Comic Neue',system-ui,sans-serif;background:linear-gradient(180deg,#2d1b0e 0%,#4a2c2a 50%,#5c3d3a 100%);color:#f5e6d3;min-height:100vh;position:relative;overflow-x:hidden;}
.leaves{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;background-image:radial-gradient(4px 4px at 40px 60px,rgba(76,175,80,0.3),transparent),radial-gradient(5px 5px at 80px 100px,rgba(139,195,74,0.2),transparent),radial-gradient(3px 3px at 140px 50px,rgba(76,175,80,0.3),transparent);background-size:900px 150px;animation:fall 10s linear infinite;z-index:0;}
@keyframes fall{0%{transform:translateY(-100%);}100%{transform:translateY(100%);}}
.container{max-width:680px;margin:auto;padding:24px 16px 40px;position:relative;z-index:1;}
.header{text-align:center;margin-bottom:20px;}
h1{font-size:clamp(22px,5vw,32px);color:#8bc34a;margin-bottom:8px;}
.subtitle{color:#a5d6a7;font-size:15px;}
.pill-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px;}
.pill{background:rgba(139,195,74,0.2);color:#c5e1a5;font-size:11px;font-weight:bold;padding:5px 12px;border-radius:999px;border:1px solid rgba(139,195,74,0.4);}
.block{margin-bottom:28px;}
.block-label{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.08em;color:#a5d6a7;margin-bottom:10px;}
.scene-wrap{margin-bottom:12px;}
.scene-card{position:relative;width:100%;border-radius:16px;border:2px solid rgba(139,195,74,0.45);background:#1a1208;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.35);}
.scene-card-hero.chapter-photo-hero{aspect-ratio:16/9;max-height:min(calc(100svh - 160px),420px);}
.chapter-hero-img{width:100%;height:100%;object-fit:cover;display:block;}
.scene-placeholder{width:100%;height:100%;min-height:200px;display:flex;align-items:center;justify-content:center;color:#a5d6a7;font-size:14px;padding:20px;text-align:center;}
.card{background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border-radius:16px;padding:20px;margin-bottom:12px;border:2px solid rgba(139,195,74,0.3);}
.card h2{color:#8bc34a;font-size:19px;margin-bottom:10px;}
.card p,.card li{font-size:15px;line-height:1.7;color:#f5e6d3;}
.story-box{background:rgba(255,193,7,0.12);border-left:5px solid #ffc107;border-radius:12px;padding:16px;font-size:15px;line-height:1.75;white-space:pre-line;}
.explain-box{background:rgba(139,195,74,0.12);border-left:5px solid #8bc34a;border-radius:12px;padding:16px;font-size:15px;line-height:1.7;}
.game-section{background:rgba(255,255,255,0.1);border:2px solid rgba(139,195,74,0.35);border-radius:16px;padding:20px;margin-top:8px;}
.game-section h2{color:#8bc34a;font-size:19px;margin-bottom:8px;}
.game-canvas{width:100%;height:min(42vh,260px);border-radius:12px;background:rgba(0,0,0,0.25);display:block;touch-action:none;border:1px solid rgba(139,195,74,0.3);cursor:pointer;}
.game-start-btn{display:inline-flex;align-items:center;gap:6px;margin:8px 0 12px;padding:11px 20px;border:none;border-radius:999px;background:#689f38;color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:inherit;}
.game-start-btn:active{transform:scale(.98);}
.nav-hint{margin-top:20px;text-align:center;font-size:13px;color:#a5d6a7;background:rgba(165,214,167,0.1);padding:12px;border-radius:10px;}
.competition-bar{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.1);border-radius:14px;padding:12px;margin-bottom:16px;border:2px solid rgba(139,195,74,0.3);}
.competitor{text-align:center;flex:1;}
.competitor-icon{font-size:40px;}
.competitor-name{font-size:13px;margin-top:4px;color:#a5d6a7;}
.competitor-score{font-size:22px;font-weight:bold;color:#8bc34a;}
.vs-divider{font-size:22px;font-weight:bold;color:#ff9800;margin:0 10px;}
.quiz-card{background:rgba(255,255,255,0.1);border-radius:16px;padding:20px;margin-bottom:12px;border:2px solid rgba(139,195,74,0.3);display:none;}
.quiz-card.active{display:block;}
.question{font-size:17px;font-weight:bold;margin-bottom:14px;color:#fff;}
.options{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.option{padding:12px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.2);border-radius:10px;cursor:pointer;font-size:14px;text-align:center;transition:.15s;}
.option:hover{border-color:#8bc34a;}
.option.correct{background:rgba(76,175,80,0.35);border-color:#4caf50;}
.option.wrong{background:rgba(244,67,54,0.3);border-color:#f44336;}
.feedback{margin-top:12px;font-size:15px;font-weight:bold;min-height:22px;}
.feedback.correct{color:#8bc34a;}
.feedback.wrong{color:#ff8a80;}
.score-card{display:none;background:rgba(255,255,255,0.12);border-radius:16px;padding:24px;text-align:center;border:2px solid rgba(139,195,74,0.4);}
.score-card.show{display:block;}
.score-card h2{color:#ffc107;margin-bottom:16px;}
.podium{display:flex;justify-content:center;align-items:flex-end;gap:16px;margin:20px 0;}
.podium-place{text-align:center;flex:1;max-width:120px;}
.podium-character{font-size:36px;margin-bottom:6px;}
.podium-bar{height:60px;border-radius:8px 8px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:6px;margin:0 auto;width:80px;background:rgba(139,195,74,0.3);}
.podium-bar.first{height:90px;background:rgba(255,193,7,0.35);}
.podium-bar.second{height:70px;}
.podium-score{font-size:20px;font-weight:bold;color:#8bc34a;margin-top:6px;}
.podium-name{font-size:12px;color:#a5d6a7;}
.message{margin:12px 0;font-size:15px;color:#f5e6d3;}
.retry-btn{padding:10px 20px;border:none;border-radius:999px;background:#689f38;color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:inherit;}
@media(max-width:480px){.options{grid-template-columns:1fr;}}
`;

function pad(n) { return String(n).padStart(3, "0"); }
function slug(title) { return title.replace(/\s+/g, "-"); }

function head(title, extraScripts) {
  const scripts = [
    "_dino-player.js",
    "_dino-data.js",
    "_dino-chapter-images.js",
    "_dino-scenes.js",
    "_dino-games.js",
  ].concat(extraScripts || []);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dinosaur Discovery - ${title}</title>
<style>${CSS}</style>
${scripts.map((s) => `<script src="${s}"></script>`).join("\n")}
</head>`;
}

function navHint() {
  return `<div class="nav-hint"><div>💡 Use ← → in the top bar for next chapter.</div><div>🏠 Home button returns to the library.</div></div>`;
}

function blockHtml(ch, block, slotPrefix, i) {
  const slot = `${slotPrefix}-${i}`;
  const sceneId = `scene-${slotPrefix}-${ch.id}-${i}`;
  return `
  <div class="block">
    <div class="block-label">Picture ${i}</div>
    <div class="scene-wrap"><div id="${sceneId}" class="scene-card scene-card-hero"></div></div>
    <div class="card">
      <h2>📖 ${block.storyTitle}</h2>
      <div class="story-box">${block.story}</div>
    </div>
    <div class="card">
      <h2>💡 ${block.explanationTitle}</h2>
      <div class="explain-box">${block.explanation}</div>
    </div>
  </div>`;
}

function sceneBootScript(ch, blocks, slotPrefix) {
  return blocks
    .map((_, i) => {
      const slot = `${slotPrefix}-${i + 1}`;
      const sceneId = `scene-${slotPrefix}-${ch.id}-${i + 1}`;
      return `DinoScene.boot({ containerId: ${JSON.stringify(sceneId)}, chapterId: ${JSON.stringify(ch.id)}, slot: ${JSON.stringify(slot)}, title: ${JSON.stringify(ch.title)} });`;
    })
    .join("\n  ");
}

function gameFacts(ch) {
  const facts = [];
  ch.mainBlocks.forEach((b) => {
    facts.push(b.explanation.split(".")[0] + ".");
  });
  ch.explainBlocks.forEach((b) => {
    facts.push(b.explanation.split(".")[0] + ".");
  });
  ch.quiz.forEach((q) => {
    facts.push(q.opts[q.correct]);
  });
  return [...new Set(facts)].slice(0, 12);
}

function genActivity(ch) {
  const fname = `${pad(ch.num)}-${slug(ch.title)}-Activity.html`;
  const blocks = ch.mainBlocks
    .map((b, i) => blockHtml(ch, b, "main", i + 1))
    .join("");
  const html = `${head(ch.title + " Activity")}
<body>
<div class="leaves"></div>
<div class="container">
  <div class="header">
    <h1>${ch.emoji} ${ch.title}</h1>
    <div class="subtitle">Picture · story · explanation × 3 · mini game</div>
    <div class="pill-row"><span class="pill">🖼️ PNG scenes</span><span class="pill">🎮 Game below</span></div>
  </div>
  ${blocks}
  <div class="game-section">
    <h2>🎮 ${ch.gameTitle}</h2>
    <p style="font-size:14px;color:#a5d6a7;margin-bottom:4px;">Tap the TRUE fact · Score: <strong id="game-score">0</strong></p>
    <button type="button" class="game-start-btn" id="game-start">▶ Start game</button>
    <canvas id="game-canvas" class="game-canvas"></canvas>
  </div>
  ${navHint()}
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  ${sceneBootScript(ch, ch.mainBlocks, "main")}
  DinoGame.bootTapFacts({
    canvasId: 'game-canvas',
    scoreId: 'game-score',
    startBtnId: 'game-start',
    facts: ${JSON.stringify(gameFacts(ch))},
    duration: 45
  });
});
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

function genExplained(ch) {
  const fname = `${pad(ch.num + 1)}-${slug(ch.title)}-Explained.html`;
  const blocks = ch.explainBlocks
    .map((b, i) => blockHtml(ch, b, "explain", i + 1))
    .join("");
  const html = `${head(ch.title + " Explained")}
<body>
<div class="leaves"></div>
<div class="container">
  <div class="header">
    <h1>${ch.emoji} ${ch.title} — Explained</h1>
    <div class="subtitle">Picture · story · explanation × 3</div>
  </div>
  ${blocks}
  ${navHint()}
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  ${sceneBootScript(ch, ch.explainBlocks, "explain")}
});
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

function genQuiz(ch) {
  if (ch.hasQuiz === false || !ch.quiz.length) return;
  const fname = `${pad(ch.num + 2)}-${slug(ch.title)}-QuizTime.html`;
  const cards = ch.quiz
    .map(
      (q, i) => `
  <div class="quiz-card${i === 0 ? " active" : ""}" id="quizCard-${i + 1}">
    <div class="question">${i + 1}. ${q.q}</div>
    <div class="options">
      ${q.opts
        .map(
          (opt, j) =>
            `<div class="option" onclick="checkAnswer(this, ${i + 1}, ${j === q.correct})">${opt}</div>`
        )
        .join("")}
    </div>
    <div class="feedback" id="feedback-${i + 1}"></div>
  </div>`
    )
    .join("");

  const html = `${head(ch.title + " Quiz Time")}
<body>
<div class="leaves"></div>
<div class="container">
  <div class="header"><h1>❓ ${ch.title} Quiz</h1></div>
  <div class="competition-bar" id="liveScoreBar">
    <div class="competitor">
      <div class="competitor-icon" id="playerIcon">🦕</div>
      <div class="competitor-name" id="playerName2">Explorer</div>
      <div class="competitor-score" id="playerScore">0</div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="competitor">
      <div class="competitor-icon" id="botIcon">${ch.botEmoji}</div>
      <div class="competitor-name" id="botName">${ch.botName}</div>
      <div class="competitor-score" id="computerScore">0</div>
    </div>
  </div>
  ${cards}
  <div class="score-card" id="scoreCard">
    <h2>🎉 Quiz Complete!</h2>
    <div class="podium" id="podium">
      <div class="podium-place" id="podium-second">
        <div class="podium-character" id="podium-char-2">${ch.botEmoji}</div>
        <div class="podium-bar second"><span>🥈</span></div>
        <div class="podium-score" id="podium-score-2">0</div>
        <div class="podium-name" id="podium-name-2">${ch.botName}</div>
      </div>
      <div class="podium-place" id="podium-first">
        <div class="podium-character" id="podium-char-1">🦕</div>
        <div class="podium-bar first"><span>🥇</span></div>
        <div class="podium-score" id="podium-score-1">0</div>
        <div class="podium-name" id="podium-name-1">Explorer</div>
      </div>
    </div>
    <div class="message" id="scoreMessage"></div>
    <button class="retry-btn" onclick="location.reload()">🔄 Try Again</button>
  </div>
  ${navHint()}
</div>
<script>
var score = 0, currentQuestion = 1, computerScore = 0;
var totalQuestions = ${ch.quiz.length};

(function loadPlayer() {
  var icon = document.getElementById('playerIcon');
  var name = document.getElementById('playerName2');
  if (icon) icon.textContent = DinoPlayer.getCharacter();
  if (name) name.textContent = DinoPlayer.getUserName();
  document.getElementById('podium-char-1').textContent = DinoPlayer.getCharacter();
  document.getElementById('podium-name-1').textContent = DinoPlayer.getUserName();
})();

function checkAnswer(el, qNum, isCorrect) {
  var parent = el.parentElement;
  parent.querySelectorAll('.option').forEach(function(o){ o.style.pointerEvents='none'; });
  var fb = document.getElementById('feedback-' + qNum);
  if (Math.random() < 0.65) {
    computerScore++;
    document.getElementById('computerScore').textContent = computerScore;
  }
  if (isCorrect) {
    el.classList.add('correct');
    fb.textContent = '✅ Correct! Great job!';
    fb.className = 'feedback correct';
    score++;
    document.getElementById('playerScore').textContent = score;
  } else {
    el.classList.add('wrong');
    fb.textContent = '❌ Not quite. ${ch.botName} gets this one!';
    fb.className = 'feedback wrong';
  }
  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  document.getElementById('quizCard-' + currentQuestion).classList.remove('active');
  currentQuestion++;
  if (currentQuestion <= totalQuestions) {
    document.getElementById('quizCard-' + currentQuestion).classList.add('active');
  } else {
    showScore();
  }
}

function showScore() {
  document.getElementById('liveScoreBar').style.display = 'none';
  document.querySelectorAll('.quiz-card').forEach(function(c){ c.style.display='none'; });
  var sc = document.getElementById('scoreCard');
  sc.classList.add('show');
  var userName = DinoPlayer.getUserName();
  var userChar = DinoPlayer.getCharacter();
  var competitors = [
    { name: userName, character: userChar, score: score },
    { name: ${JSON.stringify(ch.botName)}, character: ${JSON.stringify(ch.botEmoji)}, score: computerScore }
  ].sort(function(a,b){ return b.score - a.score; });
  document.getElementById('podium-char-1').textContent = competitors[0].character;
  document.getElementById('podium-name-1').textContent = competitors[0].name;
  document.getElementById('podium-score-1').textContent = competitors[0].score;
  document.getElementById('podium-char-2').textContent = competitors[1].character;
  document.getElementById('podium-name-2').textContent = competitors[1].name;
  document.getElementById('podium-score-2').textContent = competitors[1].score;
  document.getElementById('scoreMessage').textContent = score >= computerScore
    ? '🏆 You beat ' + ${JSON.stringify(ch.botName)} + '!'
    : '🦕 ' + ${JSON.stringify(ch.botName)} + ' wins this round — try again!';
}
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

CHAPTERS.forEach((ch) => {
  genActivity(ch);
  genExplained(ch);
  genQuiz(ch);
});

console.log("Generated", CHAPTERS.length, "topics →", CHAPTERS.reduce((n, c) => n + (c.hasQuiz === false ? 2 : 3), 0), "HTML files");
