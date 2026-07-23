#!/usr/bin/env node
/* Generate chapter HTML — 3× (picture · story · explanation · words) + game; Solar-style quiz */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = __dirname;
const ASSETS = path.join(DIR, "assets");
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-data.js"), "utf8"), sandbox);
const CHAPTERS = sandbox.window.MM_CHAPTERS;

const LEGACY_IMG = { family: { seg1: "family-photo.png" } };
const imgCache = {};

function loadImageUri(chapterId, slot) {
  const key = chapterId + ":" + slot;
  if (imgCache[key] !== undefined) return imgCache[key];
  const names = [`${chapterId}-${slot}.jpg`, `${chapterId}-${slot}.jpeg`, `${chapterId}-${slot}.png`];
  if (LEGACY_IMG[chapterId] && LEGACY_IMG[chapterId][slot]) names.unshift(LEGACY_IMG[chapterId][slot]);
  const fallbacks = { seg2: ["seg1"], seg3: ["seg1"], exp1: ["seg1"], exp2: ["seg2", "seg1"], exp3: ["seg3", "seg1"] };
  for (const fb of fallbacks[slot] || []) names.push(`${chapterId}-${fb}.jpg`, `${chapterId}-${fb}.png`);
  for (const name of names) {
    const p = path.join(ASSETS, name);
    if (fs.existsSync(p)) {
      const ext = path.extname(p).toLowerCase();
      const mime = ext === ".png" ? "image/png" : "image/jpeg";
      imgCache[key] = `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;
      return imgCache[key];
    }
  }
  imgCache[key] = null;
  return null;
}

function imgHtml(chapterId, slot, alt) {
  const uri = loadImageUri(chapterId, slot);
  if (!uri) {
    return `<div class="scene-placeholder">Add assets/${chapterId}-${slot}.jpg</div>`;
  }
  return `<img class="chapter-hero-img" src="${uri}" alt="${esc(alt)}" decoding="async">`;
}

const CSS = `
:root{--palm:#E6D5B8;--palm-dark:#C4A574;--ink:#2C1810;--lacquer:#6B1A1A;--lacquer-deep:#4A0E0E;--gold:#C9A227;--gold-light:#E8C547;--saffron:#D97706;--surface:#FDF8F0;--text:#2C1810;--text-muted:#5C4033;--border:rgba(107,26,26,.18);--shadow:0 2px 10px rgba(44,24,16,.1);--shadow-lg:0 8px 28px rgba(44,24,16,.16);--radius:14px;--radius-sm:10px;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Georgia,'Times New Roman',serif;background:var(--lacquer-deep);color:var(--text);min-height:100vh;overflow-x:hidden;line-height:1.6;-webkit-font-smoothing:antialiased;padding:10px;}
.manuscript-bg{min-height:calc(100vh - 20px);background:linear-gradient(180deg,rgba(0,0,0,.04),transparent 12%,transparent 88%,rgba(0,0,0,.06)),repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(44,24,16,.03) 3px,rgba(44,24,16,.03) 4px),linear-gradient(165deg,#EDE0C4 0%,var(--palm) 35%,#D9C49A 70%,#C9B082 100%);border:3px solid var(--gold);outline:5px solid var(--lacquer);outline-offset:-8px;box-shadow:inset 0 0 80px rgba(44,24,16,.1),0 8px 32px rgba(0,0,0,.4);position:relative;overflow:hidden;}
.manuscript-bg::before,.manuscript-bg::after{content:'';position:absolute;width:56px;height:56px;border:2px solid var(--gold);opacity:.45;pointer-events:none;}
.manuscript-bg::before{top:12px;left:12px;border-right:none;border-bottom:none;}
.manuscript-bg::after{bottom:12px;right:12px;border-left:none;border-top:none;}
.container{max-width:680px;margin:0 auto;padding:22px 18px 36px;position:relative;z-index:1;}
.top-bar{text-align:center;padding-bottom:18px;border-bottom:2px double var(--lacquer);margin-bottom:18px;}
.top-bar h1{font-size:clamp(20px,5vw,26px);font-weight:700;color:var(--lacquer-deep);margin-bottom:6px;}
.top-bar .subtitle{font-size:14px;color:var(--text-muted);font-style:italic;}
.pill-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:12px;}
.pill{display:inline-flex;align-items:center;gap:4px;background:rgba(201,162,39,.2);color:var(--lacquer-deep);font-size:11px;font-weight:700;padding:5px 12px;border-radius:999px;border:1px solid rgba(201,162,39,.45);}
.story-chapter{margin-bottom:28px;}
.chapter-label{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.chapter-label span{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--lacquer);white-space:nowrap;}
.chapter-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--gold),transparent);}
.scene-wrap{margin-bottom:10px;}
.scene-card{position:relative;width:100%;border-radius:var(--radius);border:2px solid var(--gold);background:var(--surface);box-shadow:var(--shadow-lg);overflow:hidden;}
.scene-card-hero{aspect-ratio:16/9;max-height:min(56vw,420px);background:#1a1008;}
.chapter-photo-hero{aspect-ratio:16/9;max-height:min(calc(100svh - 140px),480px);}
.chapter-hero-img{width:100%;height:100%;object-fit:cover;display:block;}
.scene-static{pointer-events:none;}
.scene-placeholder{display:flex;align-items:center;justify-content:center;min-height:180px;padding:20px;text-align:center;font-size:13px;color:var(--text-muted);font-style:italic;}
.card{background:rgba(253,248,240,.92);border-radius:var(--radius);padding:18px;margin-bottom:14px;border:1px solid var(--border);box-shadow:var(--shadow);}
.card h2{font-size:17px;font-weight:700;color:var(--lacquer-deep);margin-bottom:10px;}
.card p{font-size:15px;line-height:1.7;color:var(--text-muted);}
.story-box{font-size:15px;line-height:1.75;color:var(--ink);white-space:pre-line;}
.tip-card{background:rgba(201,162,39,.14);border:1px solid rgba(201,162,39,.4);}
.tip-tag{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--saffron);margin-bottom:8px;}
.section-head{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--lacquer);margin:16px 0 12px;display:flex;align-items:center;gap:8px;}
.section-head::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--gold),transparent);}
.legend{text-align:center;font-size:12px;color:var(--text-muted);margin-bottom:10px;font-style:italic;}
.word-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
.word-card-item{border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);background:rgba(253,248,240,.95);box-shadow:var(--shadow);}
.word-card-label{padding:14px 10px 10px;text-align:center;font-size:16px;font-weight:700;color:var(--lacquer-deep);background:rgba(255,255,255,.5);border-bottom:1px solid var(--border);}
.word-bridge{display:flex;align-items:stretch;}
.speak-btn{flex:1;border:none;padding:12px 8px;cursor:pointer;font-family:inherit;transition:transform .1s;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:64px;}
.speak-btn:active,.speak-btn.pressed{transform:scale(.96);}
.speak-btn-en{background:rgba(107,26,26,.08);color:var(--lacquer-deep);border-right:1px solid var(--border);}
.speak-btn-mm{background:rgba(201,162,39,.15);color:var(--lacquer);}
.speak-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;opacity:.75;}
.speak-icon{font-size:13px;font-weight:700;}
.game-section{margin-top:8px;background:rgba(253,248,240,.92);border:1px solid var(--border);border-radius:var(--radius);padding:18px;box-shadow:var(--shadow);}
.game-section h2{font-size:17px;font-weight:700;color:var(--lacquer-deep);margin-bottom:8px;}
.game-canvas{width:100%;height:min(42vh,280px);border-radius:var(--radius-sm);background:rgba(255,255,255,.45);display:block;touch-action:none;border:1px solid var(--border);}
.game-start-btn{display:inline-flex;align-items:center;gap:6px;margin:10px 0;padding:11px 20px;border:none;border-radius:999px;background:var(--lacquer);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}
.challenge-box{background:rgba(201,162,39,.15);border-radius:var(--radius-sm);padding:12px;margin-top:12px;text-align:center;font-size:14px;color:var(--lacquer-deep);border:1px solid rgba(201,162,39,.35);}
.nav-hint{padding:14px;text-align:center;font-size:12px;color:var(--text-muted);background:rgba(253,248,240,.85);border-radius:var(--radius-sm);border:1px solid var(--border);margin-top:16px;}
.quiz-card{display:none;background:rgba(253,248,240,.95);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:12px;box-shadow:var(--shadow);}
.quiz-card.active{display:block;}
.question{font-size:18px;font-weight:700;color:var(--lacquer-deep);margin-bottom:14px;line-height:1.45;}
.options{display:flex;flex-direction:column;gap:10px;}
.option{padding:12px 16px;background:rgba(255,255,255,.55);border:2px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-family:Georgia,serif;font-size:16px;text-align:left;line-height:1.4;transition:border-color .15s;}
.option.correct{background:rgba(201,162,39,.25);border-color:var(--gold);}
.option.wrong{background:rgba(107,26,26,.08);border-color:var(--lacquer);}
.feedback{margin-top:12px;font-size:15px;font-weight:700;min-height:24px;}
.feedback.correct{color:#166534;}
.feedback.wrong{color:var(--lacquer);}
.score-bar{text-align:center;font-size:17px;font-weight:700;color:var(--lacquer);padding:12px;margin-bottom:8px;}
.score-card{display:none;text-align:center;padding:24px;background:rgba(201,162,39,.15);border-radius:var(--radius);border:2px solid var(--gold);margin-top:16px;}
.score-card.show{display:block;}
@media(max-width:480px){.word-grid{gap:8px;}.speak-btn{min-height:58px;padding:10px 6px;}}
@media(max-width:360px){.word-grid{grid-template-columns:1fr;}}
`;

function pad(n) { return String(n).padStart(3, "0"); }
function slug(title) { return title.replace(/\s+/g, "-"); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

function chapterHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My First 100 Myanmar Words - ${esc(title)}</title>
<style>${CSS}</style>
<script src="_mmwords-player.js"></script>
<script src="_mmwords-data.js"></script>
<script src="_mmwords-games.js"></script>
</head>`;
}

function navHint() {
  return `<div class="nav-hint"><div>Use ← → in the top bar for the next chapter.</div><div>Home button returns to the library.</div></div>`;
}

function splitThree(text) {
  const parts = String(text || "").split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  while (parts.length < 3) parts.push(parts[parts.length - 1] || "");
  return parts.slice(0, 3);
}

function splitWords(words) {
  const n = words.length;
  const a = Math.ceil(n / 3);
  const b = Math.ceil((n - a) / 2);
  return [words.slice(0, a), words.slice(a, a + b), words.slice(a + b)];
}

function mainExplanations(ch) {
  if (ch.segmentExplanations && ch.segmentExplanations.length >= 3) return ch.segmentExplanations.slice(0, 3);
  return [
    ch.heritage ? `${ch.heritage.title} — ${ch.heritage.text}` : (ch.tip || "Every Myanmar tale carries a lesson for home and heart."),
    ch.tip || "Practice the words below by tapping Hear — your child listens first, reads English second.",
    ch.didYouKnow || "Stories passed under banyan trees taught children morals long before classrooms existed."
  ];
}

function explainedExplanations(ch) {
  if (ch.explainedExplanations && ch.explainedExplanations.length >= 3) return ch.explainedExplanations.slice(0, 3);
  return [
    ch.explainedTip || explainedTip(ch),
    ch.heritage ? ch.heritage.text : (ch.tip || ""),
    "Keep telling these tales — children remember words that arrive inside a story, not on a list."
  ];
}

function explainedTip(ch) {
  if (ch.explainedTip) return ch.explainedTip;
  if (ch.heritage) return ch.heritage.title + " — " + ch.heritage.text;
  return ch.tip || "";
}

function segmentTitles(ch, kind) {
  const key = kind === "explained" ? "explainedSegmentTitles" : "segmentTitles";
  if (ch[key] && ch[key].length >= 3) return ch[key].slice(0, 3);
  const base = kind === "explained" ? "Another tale" : (ch.storyTitle || ch.title + " tale");
  return [`Part one · ${base}`, "Part two · The lesson deepens", "Part three · The moral"];
}

function wordGridHtml(words, chapterId) {
  return words
    .map((w) => {
      const id = w.en.toLowerCase().replace(/\s+/g, "-");
      return `
    <div class="word-card-item word-card" id="word-${id}" data-en="${esc(w.en)}" data-mm="${esc(w.mm)}" data-hint="${esc(w.hint || w.en)}">
      <div class="word-card-label">${esc(w.en)}</div>
      <div class="word-bridge">
        <button type="button" class="speak-btn speak-btn-en" onclick="tapEn(this,'${chapterId}')">
          <span class="speak-label">English</span>
          <span class="speak-icon">🔊 Hear</span>
        </button>
        <button type="button" class="speak-btn speak-btn-mm" onclick="tapMm(this,'${chapterId}')">
          <span class="speak-label">Myanmar</span>
          <span class="speak-icon">🔊 Hear</span>
        </button>
      </div>
    </div>`;
    })
    .join("");
}

function mainSegmentHtml(ch, idx, story, explanation, words, titles) {
  const slot = "seg" + (idx + 1);
  const pic = imgHtml(ch.id, slot, ch.title + " — part " + (idx + 1));
  return `
  <section class="story-chapter">
    <div class="chapter-label"><span>Part ${idx + 1} of 3</span></div>
    <div class="scene-wrap"><div class="scene-card scene-card-hero chapter-photo-hero scene-static">${pic}</div></div>
    <div class="card">
      <h2>${esc(titles[idx])}</h2>
      <div class="story-box">${esc(story)}</div>
    </div>
    <div class="card tip-card">
      <span class="tip-tag">What this teaches</span>
      <p>${esc(explanation)}</p>
    </div>
    <div class="section-head">Press words to hear</div>
    <p class="legend">English labels only — tap 🔊 Hear for spoken Myanmar (no script shown)</p>
    <div class="word-grid">${wordGridHtml(words, ch.id)}</div>
  </section>`;
}

function explainedSegmentHtml(ch, idx, story, explanation, titles) {
  const slot = "exp" + (idx + 1);
  const pic = imgHtml(ch.id, slot, ch.title + " explained — part " + (idx + 1));
  return `
  <section class="story-chapter">
    <div class="chapter-label"><span>Deeper tale · Part ${idx + 1}</span></div>
    <div class="scene-wrap"><div class="scene-card scene-card-hero chapter-photo-hero scene-static">${pic}</div></div>
    <div class="card">
      <h2>${esc(titles[idx])}</h2>
      <div class="story-box">${esc(story)}</div>
    </div>
    <div class="card tip-card">
      <span class="tip-tag">What this teaches</span>
      <p>${esc(explanation)}</p>
    </div>
  </section>`;
}

function genActivity(ch) {
  const stories = splitThree(ch.story);
  const explanations = mainExplanations(ch);
  const titles = segmentTitles(ch, "main");
  const wordGroups = splitWords(ch.words);
  const segments = [0, 1, 2]
    .map((i) => mainSegmentHtml(ch, i, stories[i], explanations[i], wordGroups[i], titles))
    .join("");

  const fname = `${pad(ch.num)}-${slug(ch.title)}.html`;
  const html = `${chapterHead(ch.title + " — Learn")}
<body class="big-chapter-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>${ch.title}</h1>
    <div class="subtitle">Three ancient tales · ${ch.words.length} words · tap to hear Myanmar</div>
    <div class="pill-row">
      <span class="pill">${ch.words.length} words</span>
      <span class="pill">English stories · hear-only Myanmar</span>
    </div>
  </div>
  ${segments}
  <div class="game-section">
    <h2>${ch.gameTitle}</h2>
    <p style="font-size:14px;color:var(--text-muted);margin-bottom:4px;">Catch ${ch.words.length} words · Score: <strong id="catch-score">0</strong></p>
    <button type="button" class="game-start-btn">▶ Start game</button>
    <canvas id="catch-canvas" class="game-canvas"></canvas>
    <div class="challenge-box">Earn badge: <strong>${esc(ch.badge)}</strong></div>
  </div>
  ${navHint()}
</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  MMGame.bootCatch({
    canvasId: 'catch-canvas',
    scoreId: 'catch-score',
    words: ${JSON.stringify(ch.words)},
    badge: ${JSON.stringify(ch.badge)},
    chapterId: ${JSON.stringify(ch.id)}
  });
});
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

function genExplained(ch) {
  const stories = splitThree(ch.explainedStory || ch.story);
  const explanations = explainedExplanations(ch);
  const titles = segmentTitles(ch, "explained");
  const segments = [0, 1, 2]
    .map((i) => explainedSegmentHtml(ch, i, stories[i], explanations[i], titles))
    .join("");

  const fname = `${pad(ch.num + 1)}-${slug(ch.title)}-Explained.html`;
  const html = `${chapterHead(ch.title + " — Explained")}
<body class="big-chapter-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>${ch.title} — Explained</h1>
    <div class="subtitle">Three deeper tales · tradition &amp; moral · English only</div>
  </div>
  ${segments}
  ${navHint()}
</div>
</div>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

function defaultQuizQuestions(ch) {
  const h = ch.heritage && ch.heritage.title ? ch.heritage.title : ch.title;
  return [
    {
      q: `What tradition does the ${ch.title} chapter teach about?`,
      options: [h, "Space travel", "Modern video games", "Ice fishing"],
      correct: 0
    },
    {
      q: "How should children learn Myanmar words in this book?",
      options: [
        "Read Myanmar script first",
        "Hear words inside stories — English tales, tap to hear Myanmar",
        "Memorize lists without stories",
        "Skip the pictures"
      ],
      correct: 1
    },
    {
      q: "What kind of stories appear in this book?",
      options: ["Ancient moral tales", "Science fiction only", "Sports news", "Cooking shows"],
      correct: 0
    },
    {
      q: `What do you tap on word cards to hear Myanmar speech?`,
      options: ["The English label", "The 🔊 Hear button on Myanmar", "The page title", "Nothing — it auto-plays"],
      correct: 1
    },
    {
      q: "Why do Myanmar folktales often use animals?",
      options: [
        "To teach morals and friendship",
        "Because animals cannot talk",
        "To scare children",
        "To avoid mentioning people"
      ],
      correct: 0
    }
  ];
}

function genQuiz(ch) {
  const questions = (ch.quizQuestions && ch.quizQuestions.length >= 5)
    ? ch.quizQuestions.slice(0, 8)
    : defaultQuizQuestions(ch);

  const cards = questions
    .map((q, i) => {
      const opts = q.options
        .map(
          (opt, oi) =>
            `<div class="option" data-correct="${oi === q.correct ? "1" : "0"}" onclick="checkAnswer(this, ${i + 1}, ${oi === q.correct})">${esc(opt)}</div>`
        )
        .join("");
      return `
  <div class="quiz-card${i === 0 ? " active" : ""}" id="quizCard-${i + 1}">
    <div class="question">${i + 1}. ${esc(q.q)}</div>
    <div class="options">${opts}</div>
    <div class="feedback" id="feedback-${i + 1}"></div>
  </div>`;
    })
    .join("");

  const fname = `${pad(ch.num + 2)}-${slug(ch.title)}-Quiz.html`;
  const html = `${chapterHead(ch.title + " — Quiz")}
<body>
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>${ch.title} Quiz</h1>
    <div class="subtitle">Story &amp; tradition — all questions in English</div>
  </div>
  <div class="score-bar">Score: <span id="quiz-score">0</span> / ${questions.length}</div>
  ${cards}
  <div class="score-card" id="scoreCard">
    <h2 id="scoreMessage">Well done!</h2>
    <p id="scoreDetail"></p>
  </div>
  ${navHint()}
</div>
</div>
<script>
var currentQuestion = 1;
var totalQuestions = ${questions.length};
var score = 0;

function checkAnswer(element, questionNum, isCorrect) {
  var parent = element.parentElement;
  var options = parent.querySelectorAll('.option');
  var feedback = document.getElementById('feedback-' + questionNum);
  options.forEach(function(opt) { opt.style.pointerEvents = 'none'; });
  if (isCorrect) {
    element.classList.add('correct');
    feedback.textContent = 'Correct! Great job!';
    feedback.className = 'feedback correct';
    score++;
    document.getElementById('quiz-score').textContent = score;
  } else {
    element.classList.add('wrong');
    feedback.textContent = 'Not quite — read the story again!';
    feedback.className = 'feedback wrong';
    options.forEach(function(opt) {
      if (opt.dataset.correct === '1') opt.classList.add('correct');
    });
  }
  setTimeout(nextQuestion, 1400);
}

function nextQuestion() {
  var current = document.getElementById('quizCard-' + currentQuestion);
  if (current) current.classList.remove('active');
  currentQuestion++;
  if (currentQuestion <= totalQuestions) {
    document.getElementById('quizCard-' + currentQuestion).classList.add('active');
  } else {
    showScore();
  }
}

function showScore() {
  var card = document.getElementById('scoreCard');
  var msg = document.getElementById('scoreMessage');
  var detail = document.getElementById('scoreDetail');
  card.classList.add('show');
  if (score === totalQuestions) {
    msg.textContent = 'Perfect score!';
    detail.textContent = 'You understood the tales and traditions.';
    if (window.MMPlayer) MMPlayer.earnBadge(${JSON.stringify(ch.badge + " Quiz")});
  } else if (score >= totalQuestions - 1) {
    msg.textContent = 'Almost perfect!';
    detail.textContent = 'Score: ' + score + ' / ' + totalQuestions;
  } else {
    msg.textContent = 'Keep reading the stories!';
    detail.textContent = 'Score: ' + score + ' / ' + totalQuestions + ' — try the chapter again.';
  }
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
console.log("Generated", CHAPTERS.length * 3, "chapter files (3-segment layout).");
