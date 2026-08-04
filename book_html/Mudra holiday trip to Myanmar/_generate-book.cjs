#!/usr/bin/env node
/* Generate Mudra holiday trip to Myanmar Story — 3 images per words/sentences page */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = __dirname;
const ASSETS = path.join(DIR, "assets");
const sandbox = { window: {}, console, global: {} };
function load(name) {
  vm.runInNewContext(fs.readFileSync(path.join(DIR, name), "utf8"), sandbox);
}
load("_speak-data.js");
load("_speak-sentence-lines.js");
load("_speak-explained-stories.js");

const CHAPTERS = sandbox.window.MM_CHAPTERS;
const BOOK = sandbox.window.MM_BOOK;
const SENTENCES = sandbox.window.MM_SENTENCE_LINES || {};
const EXPLAINED = sandbox.window.MM_EXPLAINED_STORIES || {};

function pad(n) {
  return String(n).padStart(3, "0");
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}
function slug(t) {
  return String(t).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** No reuse: only the exact slot file counts */
function imgSrc(chapterId, slot) {
  const names = [`${chapterId}-${slot}.jpg`, `${chapterId}-${slot}.png`, `${chapterId}-${slot}.webp`];
  for (const n of names) {
    if (fs.existsSync(path.join(ASSETS, n))) return `assets/${n}`;
  }
  return null;
}

function imgHtml(chapterId, slot, alt, lazy) {
  const uri = imgSrc(chapterId, slot);
  if (!uri) {
    return `<div class="scene-placeholder">Add unique art · assets/${esc(chapterId)}-${esc(slot)}.jpg<br><small>paper-craft diorama · do not reuse other scenes</small></div>`;
  }
  const lazyAttr = lazy ? ' loading="lazy" fetchpriority="low"' : ' fetchpriority="high"';
  return `<img class="chapter-hero-img" src="${uri}" alt="${esc(alt)}" decoding="async"${lazyAttr}>`;
}

function splitEvenly(items, groups) {
  const list = Array.isArray(items) ? items.slice() : [];
  const size = Math.ceil(list.length / groups);
  const out = [];
  for (let i = 0; i < groups; i++) out.push(list.slice(i * size, (i + 1) * size));
  return out;
}

function storyParagraphs(text) {
  return String(text || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function storyChunks(text, groups) {
  return splitEvenly(storyParagraphs(text), groups).map((parts) => parts.join("\n\n"));
}

function sceneMeta(ch, idx) {
  const scenes = EXPLAINED[ch.id] || [];
  return scenes[idx] || { title: `${ch.title} · Part ${idx + 1}`, story: "" };
}

function storyParagraphsHtml(text) {
  return String(text || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p class="story-p">${esc(p)}</p>`);
}

function storyHtml(text) {
  return storyParagraphsHtml(text).join("\n");
}

/** Split story into two cells for landscape-friendly reading under a full-width image */
function storyTwoCellsHtml(text) {
  const paras = storyParagraphsHtml(text);
  if (!paras.length) {
    return `<div class="story-block"><div class="section-head">Story</div><div class="story-cells"><div class="card story-card story-cell"><div class="story-box story-novel"></div></div></div></div>`;
  }
  if (paras.length === 1) {
    return `<div class="story-block"><div class="section-head">Story</div><div class="story-cells"><div class="card story-card story-cell story-cell-full"><div class="story-box story-novel">${paras[0]}</div></div></div></div>`;
  }
  const mid = Math.ceil(paras.length / 2);
  const left = paras.slice(0, mid).join("\n");
  const right = paras.slice(mid).join("\n");
  return `<div class="story-block">
    <div class="section-head">Story</div>
    <div class="story-cells">
      <div class="card story-card story-cell"><div class="story-box story-novel">${left}</div></div>
      <div class="card story-card story-cell"><div class="story-box story-novel">${right}</div></div>
    </div>
  </div>`;
}

function sceneSectionHtml(opts) {
  const title = opts.title ? `<h2 class="chapter-part-title scene-title">${esc(opts.title)}</h2>` : "";
  return `<section class="chapter-part scene-section session-block">
    ${title}
    <div class="chapter-part-inner">
      <div class="scene-wrap chapter-scene"><div class="scene-card scene-card-hero chapter-photo-hero scene-static">${opts.imageHtml}</div></div>
      ${opts.storyHtml || ""}
      ${opts.practiceHtml || ""}
    </div>
  </section>`;
}

const PAGE_CSS = `.container{width:100%;max-width:100%;margin:0;padding:16px clamp(16px,3vw,40px) 28px;position:relative;z-index:1;--chapter-pad-x:clamp(16px,3vw,40px);}
@media(min-width:1200px){.container{max-width:1400px;margin:0 auto;}}
body.main-chapter-page,body.explained-page,body.quiz-page{padding:0;min-height:100dvh;height:auto;overflow-x:hidden;overflow-y:auto;}
.manuscript-bg,.container{min-height:100dvh;height:auto;max-height:none;display:block;overflow:visible;}
.scene-placeholder{min-height:220px;display:grid;place-items:center;background:linear-gradient(135deg,#e0f2fe,#fef3c7);border-radius:18px;color:#64748b;font-weight:700;padding:24px;text-align:center;line-height:1.5;}
.beat-pill{display:inline-block;background:#fef3c7;color:#92400e;font-weight:800;font-size:.85rem;padding:6px 12px;border-radius:999px;margin-bottom:10px;}
.story-novel .story-p{margin:0 0 1em;font-size:clamp(17px,2.8vw,19px);line-height:1.75;font-weight:600;color:#1e293b;}
.story-novel .story-p:last-child{margin-bottom:0;}
.chapter-hero-img{width:100%;border-radius:18px;display:block;box-shadow:0 8px 24px rgba(15,23,42,.12);}
.scene-section{margin:24px 0 30px;}
.scene-title,.chapter-part-title{text-align:center;font-size:clamp(24px,4vw,34px);margin:0 0 14px;color:#7c3aed;}
.chapter-part-inner{display:flex;flex-direction:column;gap:14px;width:100%;}
.chapter-part-inner .chapter-scene{margin:0;width:100%;}
.chapter-part-inner .chapter-scene .scene-card-hero,
.chapter-part-inner .chapter-scene .chapter-photo-hero{width:100%;max-height:none;aspect-ratio:16/9;border-radius:18px;overflow:hidden;}
.chapter-part-inner .chapter-hero-img{width:100%;height:100%;max-height:min(48dvh,440px);aspect-ratio:16/9;object-fit:cover;object-position:center center;}
.story-block{width:100%;}
.story-cells{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:stretch;}
.story-cells .story-cell{margin:0;min-width:0;}
.story-cells .story-cell-full{grid-column:1/-1;}
.story-block .section-head{margin-top:0;}
.chapter-words-block,.chapter-sentences-block{min-width:0;}
.scene-word-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
.scene-word-grid .word-card-item{min-height:0;}
.scene-sentence-list{display:grid;gap:10px;}
.session-block{margin-bottom:22px;}
@media(max-width:700px){
  .story-cells{grid-template-columns:1fr;}
  .scene-word-grid{grid-template-columns:1fr;}
}
@media(orientation:landscape) and (min-width:768px){
  .chapter-part-inner .chapter-hero-img{max-height:min(42dvh,380px);}
  .story-cells{grid-template-columns:repeat(2,minmax(0,1fr));}
}`;

function scripts() {
  return `<script src="_speak-audio-map.js"></script>
<script src="_speak-en-audio-map.js"></script>
<script src="_speak-player.js"></script>
<script src="_speak-data.js"></script>`;
}

function wordGridHtml(words, chapterId) {
  return words
    .map((w) => {
      const id = w.en.toLowerCase().replace(/\s+/g, "-");
      return `
    <div class="word-card-item word-card" id="word-${id}" data-en="${esc(w.en)}" data-mm="${esc(w.mm)}" data-hint="${esc(w.hint || w.en)}">
      <div class="word-card-label word-card-emoji">${w.emoji || "💬"}</div>
      <div class="word-bridge">
        <button type="button" class="speak-btn speak-btn-en" onclick="tapEn(this,'${chapterId}')">
          <span class="speak-label speak-word-en">${esc(w.en)}</span>
          <span class="speak-icon">🔊 Hear</span>
        </button>
        <button type="button" class="speak-btn speak-btn-mm" onclick="tapMm(this,'${chapterId}')">
          <span class="speak-label speak-word-mm">${esc(w.mm)}</span>
          <span class="speak-icon">🔊 Hear</span>
        </button>
      </div>
    </div>`;
    })
    .join("");
}

function whiteboardLine(text, lang) {
  const attr = lang === "en" ? "data-en" : "data-mm";
  const cls = lang === "en" ? "wb-text-en" : "wb-text-mm";
  const fn = lang === "en" ? "en" : "mm";
  return `
            <div class="wb-line">
              <span class="wb-text ${cls}">${esc(text)}</span>
              <button type="button" class="wb-speak-btn btn-speak speak-btn-${fn}" ${attr}="${esc(text)}" onclick="tapPhrase(this,'${fn}')" aria-label="Hear">
                <span class="speak-icon">🔊</span>
              </button>
            </div>`;
}

function learnHtml(ch) {
  const slot = ch.learnImage || "learn";
  const chunks = storyChunks(ch.story, 3);
  const wordGroups = splitEvenly(ch.words || [], 3);
  const sections = [0, 1, 2]
    .map((idx) => {
      const meta = sceneMeta(ch, idx);
      const imageSlot = idx === 0 ? slot : `${slot}-${idx + 1}`;
      return sceneSectionHtml({
        title: meta.title,
        imageHtml: imgHtml(ch.id, imageSlot, `${ch.title} — story art ${idx + 1}`, idx > 0),
        storyHtml: storyTwoCellsHtml(chunks[idx] || ""),
        practiceHtml: `<div class="chapter-words-block">
            <div class="section-head">Press words to hear</div>
            <div class="scene-word-grid">${wordGridHtml(wordGroups[idx] || [], ch.id)}</div>
          </div>`,
      });
    })
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — ${esc(ch.title)}</title>
<link rel="stylesheet" href="_speak-theme.css">
<style>${PAGE_CSS}</style>
${scripts()}
</head>
<body class="main-chapter-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar"><h1>${esc(ch.emoji)} ${esc(ch.title)}</h1></div>
  <div class="beat-pill">Story beat · ${esc(ch.beat || "Chapter")}</div>
  <p class="page-tagline" style="margin:0 0 14px;font-weight:800;color:var(--purple-deep,#6d28d9);font-size:clamp(18px,3vw,22px);">${esc(ch.storyTitle || "")}</p>

  ${sections}

  ${ch.heritage ? `<div class="card" style="margin-top:8px;"><h2>${esc(ch.heritage.title)}</h2><p>${esc(ch.heritage.text)}</p></div>` : ""}
  ${ch.tip ? `<div class="card tip-card" style="margin-top:12px;"><strong>Try at home:</strong> ${esc(ch.tip)}</div>` : ""}
</div>
</div>
</body>
</html>`;
}

function explainedHtml(ch) {
  const slot = ch.sentImage || "sent";
  const lineMap = SENTENCES[ch.id] || {};
  const wordGroups = splitEvenly(ch.words || [], 3);
  const scenes = [0, 1, 2]
    .map((idx) => {
      const meta = sceneMeta(ch, idx);
      const imageSlot = idx === 0 ? slot : `${slot}-${idx + 1}`;
      const pairs = (wordGroups[idx] || [])
        .map((w) => {
          const line = lineMap[w.en] || { en: "Mudra learns: " + w.en + ".", mm: w.mm };
          return `
        <div class="wb-sentence-pair">
          ${whiteboardLine(line.en, "en")}
          ${whiteboardLine(line.mm, "mm")}
        </div>`;
        })
        .join("");
      const sceneStory = [meta.story, meta.storyLong].filter(Boolean).join("\n\n");
      return sceneSectionHtml({
        title: meta.title,
        imageHtml: imgHtml(ch.id, imageSlot, `${ch.title} — sentences art ${idx + 1}`, idx > 0),
        storyHtml: storyTwoCellsHtml(sceneStory),
        practiceHtml: `<div class="chapter-sentences-block">
            <div class="section-head">Press sentences to hear</div>
            <div class="sentence-group-card"><div class="scene-sentence-list">${pairs}</div></div>
          </div>`,
      });
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — ${esc(ch.title)} Sentences</title>
<link rel="stylesheet" href="_speak-theme.css">
<style>${PAGE_CSS}</style>
${scripts()}
</head>
<body class="explained-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar"><h1>${esc(ch.emoji)} ${esc(ch.title)} · Sentences</h1></div>
  <div class="beat-pill">Practice session · 3 picture story blocks</div>

  ${scenes}
</div>
</div>
</body>
</html>`;
}

function pickOptions(pool, answer, count, offset) {
  const others = pool.filter((item) => item.en !== answer.en);
  const picks = [answer];
  for (let i = 0; i < others.length && picks.length < count; i++) {
    const idx = (offset + i) % others.length;
    picks.push(others[idx]);
  }
  return picks.sort((a, b) => a.en.localeCompare(b.en));
}

function buildHearQuizItems(ch) {
  const baseWords = (ch.words || []).slice(0, Math.min(5, (ch.words || []).length));
  const lineMap = SENTENCES[ch.id] || {};
  const wordQuestions = baseWords.map((word, idx) => ({
    prompt: "Which word did you hear?",
    mm: word.mm,
    options: pickOptions(ch.words || [], word, 4, idx + 1).map((opt) => ({
      label: `${opt.en} (${opt.mm})`,
      correct: opt.en === word.en,
    })),
  }));
  const sentenceKey = baseWords[0] ? baseWords[0].en : null;
  const sentenceLine = sentenceKey ? lineMap[sentenceKey] : null;
  if (sentenceLine) {
    const distractors = baseWords.slice(1, 4).map((word) => lineMap[word.en]).filter(Boolean);
    const sentenceOptions = [sentenceLine].concat(distractors).slice(0, 4).sort((a, b) => a.en.localeCompare(b.en));
    wordQuestions.push({
      prompt: "Which sentence did you hear?",
      mm: sentenceLine.mm,
      options: sentenceOptions.map((opt) => ({
        label: `${opt.en} (${opt.mm})`,
        correct: opt.en === sentenceLine.en,
      })),
    });
  }
  return wordQuestions;
}

function quizHtml(ch) {
  const hearQs = buildHearQuizItems(ch);
  const cards = hearQs
    .map((q, i) => {
      const opts = (q.options || [])
        .map((o) => `<button type="button" class="quiz-option" data-correct="${o.correct ? "1" : "0"}">${esc(o.label)}</button>`)
        .join("");
      return `
  <div class="quiz-card${i === 0 ? " active" : ""}" id="quizCard-${i + 1}" data-quiz-type="hear" data-mm="${esc(q.mm)}">
    <div class="quiz-q">${esc(i + 1)}. ${esc(q.prompt)}</div>
    <div class="quiz-hear-box">
      <button type="button" class="btn-speak hear-mm-btn" onclick="tapPhrase(this,'mm')" data-mm="${esc(q.mm)}">🔊 Hear word</button>
      <div class="quiz-help">Tap 🔊 to hear Myanmar, then pick the matching English + Myanmar label.</div>
    </div>
    <div class="quiz-options">${opts}</div>
  </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — ${esc(ch.title)} Quiz</title>
<link rel="stylesheet" href="_speak-theme.css">
<style>${PAGE_CSS}
.quiz-card{display:none;background:#fff;border-radius:18px;padding:18px;margin:12px 0;box-shadow:0 4px 18px rgba(56,189,248,.15);}
.quiz-card.active{display:block;}
.quiz-q{font-weight:800;font-size:1.15rem;margin-bottom:12px;}
.quiz-hear-box{display:grid;place-items:center;gap:8px;padding:16px;border:2px dashed rgba(56,189,248,.25);border-radius:16px;background:#f0f9ff;margin-bottom:12px;}
.hear-mm-btn{padding:10px 18px;border:none;border-radius:999px;background:#d946ef;color:#fff;font-weight:800;cursor:pointer;}
.quiz-help{font-size:.95rem;color:#64748b;text-align:center;}
.quiz-options{display:grid;gap:10px;}
.quiz-option{text-align:left;padding:12px 14px;border-radius:14px;border:2px solid rgba(56,189,248,.25);background:#f0f9ff;cursor:pointer;font-weight:700;}
.quiz-option.correct{border-color:#22c55e;background:#f0fdf4;}
.quiz-option.wrong{border-color:#f43f5e;background:#fff1f2;}
</style>
${scripts()}
</head>
<body class="quiz-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar"><h1>${esc(ch.emoji)} ${esc(ch.title)} Quiz</h1></div>
  <p style="font-weight:700;color:#64748b;margin-bottom:8px;">Hear Myanmar, then choose the related English + MM answer from this chapter.</p>
  <div id="quizArea">${cards}</div>
  <p id="quizMsg" style="font-weight:800;margin-top:12px;"></p>
  <button type="button" class="retry-btn" id="nextBtn" style="margin-top:8px;padding:12px 18px;border:none;border-radius:999px;background:#0ea5e9;color:#fff;font-weight:800;cursor:pointer;">Next ▶</button>
</div>
</div>
<script>
(function(){
  var cards=[].slice.call(document.querySelectorAll('.quiz-card'));
  var i=0; var score=0;
  function show(){ cards.forEach(function(c,idx){ c.classList.toggle('active', idx===i); }); }
  document.getElementById('quizArea').addEventListener('click', function(e){
    var btn=e.target.closest('.quiz-option'); if(!btn) return;
    var card=btn.closest('.quiz-card'); if(card.dataset.done) return;
    card.dataset.done='1';
    var ok=btn.getAttribute('data-correct')==='1';
    btn.classList.add(ok?'correct':'wrong');
    if(ok) score++;
    else { var right=card.querySelector('[data-correct="1"]'); if(right) right.classList.add('correct'); }
  });
  document.getElementById('nextBtn').onclick=function(){
    if(i<cards.length-1){ i++; show(); }
    else { document.getElementById('quizMsg').textContent='You scored '+score+' / '+cards.length+' — Mudra is proud!'; this.disabled=true; }
  };
  show();
})();
</script>
</body>
</html>`;
}

function write(name, html) {
  fs.writeFileSync(path.join(DIR, name), html, "utf8");
  console.log("Wrote", name);
}

function introPages(pageMap) {
  const briefing = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — Book Briefing</title>
<link rel="stylesheet" href="_speak-intro.css">
</head>
<body class="mm-solar-intro">
<div class="mm-petals"></div>
<div class="mm-container">
  <div class="mm-cover">
    <div class="mm-logo">📖</div>
    <h1>${esc(BOOK.title)}</h1>
    <div class="mm-tagline">A Myanmar girl from Singapore — her first holiday home</div>
    <div class="mm-badges">
      <div class="mm-pill">🎂 Age ${esc(BOOK.age)}</div>
      <div class="mm-pill">👧 Mudra</div>
      <div class="mm-pill">📚 9 Chapters</div>
    </div>
  </div>
  <div class="mm-card">
    <h2>📖 About This Book</h2>
    <p><strong>${esc(BOOK.title)}</strong> follows Mudra, a 7-year-old Myanmar girl who lives and studies in Singapore, on her first holiday back to Grandma&apos;s village.</p>
    <p>Nine chapters take her from the airplane window to festival lanterns — family, tea shops, markets, farm, school, friends, pagoda, and celebration — with stories and tap-to-hear Myanmar words.</p>
  </div>
  <div class="mm-card">
    <h2>ℹ️ Book Details</h2>
    <div class="mm-meta-row">
      <div class="mm-meta-item"><div class="mm-meta-label">AUTHOR</div><div class="mm-meta-value">Jimmy Cooper</div></div>
      <div class="mm-meta-item"><div class="mm-meta-label">AGE</div><div class="mm-meta-value">${esc(BOOK.age)} years</div></div>
      <div class="mm-meta-item"><div class="mm-meta-label">PAGES</div><div class="mm-meta-value">31 pages</div></div>
      <div class="mm-meta-item"><div class="mm-meta-label">FORMAT</div><div class="mm-meta-value">Story + hear</div></div>
    </div>
  </div>
  <div class="mm-card">
    <h2>✍️ Author&apos;s Message</h2>
    <p>&ldquo;Many overseas Myanmar children know home through photos and phone calls. Mudra&apos;s holiday is for them — a warm junior story that lets kids hear and speak Myanmar inside family moments, one chapter at a time.&rdquo;</p>
    <p style="margin-top:10px;font-size:15px;color:#7C3AED;">— Jimmy Cooper</p>
  </div>
  <div class="mm-nav-hint">Ready? Use ← → in the top bar · Next: Table of Contents</div>
</div>
</body></html>`;

  const indexCards = pageMap
    .map(
      (p) =>
        `<div class="mm-chapter-card"><div class="mm-num-badge">${p.num}</div><div class="mm-chapter-emoji">${p.emoji}</div><div class="mm-chapter-info"><div class="mm-chapter-title">${esc(p.title)}</div><div class="mm-chapter-concept">${esc(p.concept)}</div></div></div>`
    )
    .join("\n");

  const index = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — Contents</title>
<link rel="stylesheet" href="_speak-intro.css">
</head>
<body class="mm-solar-intro">
<div class="mm-petals"></div>
<div class="mm-container">
  <div class="mm-index-header">
    <div class="mm-logo">📑</div>
    <h1>Mudra's Holiday · Contents</h1>
    <div class="mm-subtitle">Nine novel chapters · unique art each session</div>
  </div>
  <div class="mm-chapter-list">${indexCards}</div>
</div>
</body></html>`;

  const character = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — Choose learner</title>
<link rel="stylesheet" href="_speak-intro.css">
${scripts()}
</head>
<body class="mm-solar-intro">
<div class="mm-petals"></div>
<div class="mm-container">
  <div class="mm-cover"><h1>Who is reading with Mudra?</h1>
    <div class="mm-tagline">Pick a name and avatar — saved as you go</div>
  </div>
  <div class="mm-card">
    <label for="nm">Name</label>
    <input id="nm" value="Mudra" style="width:100%;padding:12px;border-radius:12px;border:2px solid #ddd;margin:8px 0 16px;font:inherit;">
    <div id="avs" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
  </div>
  <div class="mm-nav-hint">Use ← → in the top bar · Next: Chapter 1</div>
</div>
<script>
var selected='👧';
function persist(){
  if(window.MMPlayer) MMPlayer.save(document.getElementById('nm').value.trim()||'Mudra', selected, 'Learner');
}
function paintAvatars(){
  var root=document.getElementById('avs');
  root.innerHTML='';
  ['👧','🧒','🐯','🦋'].forEach(function(e){
    var b=document.createElement('button');
    b.type='button';
    b.textContent=e;
    b.setAttribute('aria-label','Choose '+e);
    b.style.cssText='font-size:2rem;padding:10px;border-radius:14px;border:2px solid '+(e===selected?'#7c3aed':'#ddd')+';background:'+(e===selected?'#ede9fe':'#fff')+';cursor:pointer';
    b.onclick=function(){ selected=e; paintAvatars(); persist(); };
    root.appendChild(b);
  });
}
document.getElementById('nm').addEventListener('input', persist);
paintAvatars();
persist();
</script>
</body></html>`;

  const congrats = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(BOOK.title)} — The End</title>
<link rel="stylesheet" href="_speak-intro.css">
</head>
<body class="mm-solar-intro">
<div class="mm-container">
  <div class="mm-cover">
    <div class="mm-logo">🏮</div>
    <h1>The village is home</h1>
    <div class="mm-tagline">Grandma: “Now you can speak Myanmar with everyone.”</div>
  </div>
  <div class="mm-card">
    <p>You finished Mudra's junior-novel holiday — from the airplane window to festival lanterns. You met family, ordered tea, shopped, helped the farm, found bravery at school, made friends, practiced pagoda manners, and celebrated.</p>
    <p>Read again anytime. Each chapter still has its own scenes, its own voices, and its own piece of Mudra's heart.</p>
  </div>
</div>
</body></html>`;

  write("001-Book-Briefing.html", briefing);
  write("002-Index.html", index);
  write("003-Character-Selection.html", character);
  return congrats;
}

function main() {
  const pageMap = [
    { num: "1", emoji: "📖", title: "Welcome", concept: "Intro" },
    { num: "2", emoji: "📑", title: "Contents", concept: "Chapters" },
    { num: "3", emoji: "🧒", title: "Character", concept: "Reader" },
  ];
  let page = 4;
  CHAPTERS.forEach((ch) => {
    write(`${pad(page)}-${slug(ch.title)}.html`, learnHtml(ch));
    pageMap.push({ num: String(page), emoji: ch.emoji, title: ch.title, concept: ch.beat + " · story" });
    page++;
    write(`${pad(page)}-${slug(ch.title)}-Sentences.html`, explainedHtml(ch));
    pageMap.push({ num: String(page), emoji: "📜", title: ch.title + " Sentences", concept: "Practice" });
    page++;
    write(`${pad(page)}-${slug(ch.title)}-Quiz.html`, quizHtml(ch));
    pageMap.push({ num: String(page), emoji: "❓", title: ch.title + " Quiz", concept: "Check" });
    page++;
  });
  pageMap.push({ num: String(page), emoji: "🎉", title: "The End", concept: "Ending" });
  const congratsHtml = introPages(pageMap);
  write(`${pad(page)}-Congratulations.html`, congratsHtml);
  console.log("Done. Chapters:", CHAPTERS.length, "Last page:", page);
  console.log("Images needed per chapter: {id}-learn.jpg, learn-2, learn-3 and {id}-sent.jpg, sent-2, sent-3");
}

main();
