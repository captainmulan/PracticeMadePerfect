#!/usr/bin/env node
/* Generate chapter HTML — 3× (picture · story · explanation · words) + game; Solar-style quiz */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = __dirname;
const ASSETS = path.join(DIR, "assets");
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-data.js"), "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-groups.js"), "utf8"), sandbox);
const EXPLAINED_GROUPS = sandbox.window.MM_EXPLAINED_GROUPS || {};
const CHAPTERS = sandbox.window.MM_CHAPTERS.map((ch) => {
  if (EXPLAINED_GROUPS[ch.id]) {
    return Object.assign({}, ch, { explainedGroups: EXPLAINED_GROUPS[ch.id] });
  }
  return ch;
});
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-pyramid-mm.js"), "utf8"), sandbox);
const PYRAMID_MM = sandbox.window.MM_PYRAMID_MM || {};

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
      imgCache[key] = `assets/${name}`;
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

const CHAPTER_CSS = `.container{max-width:680px;margin:0 auto;padding:22px 18px 36px;position:relative;z-index:1;}
body.main-chapter-page{padding:8px;height:100dvh;max-height:100dvh;overflow:hidden;}
.main-chapter-page .manuscript-bg,.main-chapter-page .container{
  min-height:0;max-height:100%;display:flex;flex-direction:column;overflow:hidden;
}
.main-chapter-page .manuscript-bg{width:100%;height:100%;align-items:stretch;}
.main-chapter-page .container{flex:1 1 auto;height:auto;max-width:100%;width:100%;margin:0;padding:8px 14px 10px;}
@media(min-width:1024px){
  body.main-chapter-page{height:auto;min-height:100dvh;max-height:none;overflow-y:auto;}
  .main-chapter-page .manuscript-bg,.main-chapter-page .container{max-height:none;overflow:visible;}
  .main-chapter-page .manuscript-bg{height:auto;min-height:100dvh;}
}
.explained-page{overflow:hidden;}
body.explained-page{padding:8px;}
@media(min-width:768px){body.explained-page{padding:10px 12px;}}
.explained-page .manuscript-bg,.explained-page .container{
  height:100dvh;max-height:100dvh;display:flex;flex-direction:column;overflow:hidden;
}
.explained-page .manuscript-bg{width:100%;align-items:stretch;}
.explained-page .container{max-width:100%;width:100%;margin:0;padding:10px 18px 8px;}`;

function pad(n) { return String(n).padStart(3, "0"); }
function slug(title) { return title.replace(/\s+/g, "-"); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wordOptionLabel(opt) {
  return opt.en || "";
}

function buildHearPickQuestions(words, count) {
  if (!words || !words.length) return [];
  return shuffle(words).slice(0, Math.min(count, words.length)).map((correct) => {
    const others = shuffle(words.filter((w) => w.en !== correct.en)).slice(0, 3);
    const options = shuffle([correct, ...others]);
    return {
      type: "hear",
      mm: correct.mm,
      hint: correct.hint || correct.en,
      emoji: correct.emoji || "🔊",
      correctEn: correct.en,
      options: options.map((o) => ({ en: o.en, emoji: o.emoji || "", mm: o.mm || "" }))
    };
  });
}

function sentencePoolFor(ch) {
  const seen = new Set();
  const out = [];
  const add = (list) => {
    (list || []).forEach((s) => {
      if (!s || !s.en || !s.mm || seen.has(s.en)) return;
      seen.add(s.en);
      out.push(s);
    });
  };
  add(ch.explainedSentences);
  add(ch.practiceSentences);
  (ch.words || []).forEach((w) => {
    if (w.useEn && w.useMm) add([{ en: w.useEn, mm: w.useMm }]);
  });
  return out;
}

function sentenceAboutLabel(en, words) {
  const s = en.toLowerCase();
  const kidNames = { Mother: "Mom", Father: "Dad", Grandmother: "Grandma", Grandfather: "Grandpa" };
  const nickMap = {
    grandmother: ["grandma", "grandmother"],
    grandfather: ["grandpa", "grandfather"],
    mother: ["mother", "mom"],
    father: ["father", "dad"]
  };
  const sorted = (words || []).slice().sort((a, b) => b.en.length - a.en.length);
  for (const w of sorted) {
    const key = w.en.toLowerCase();
    const terms = nickMap[key] || [key];
    if (terms.some((t) => s.includes(t))) {
      return "This is about " + (kidNames[w.en] || w.en);
    }
  }
  return "This is about: " + en.replace(/\.$/, "");
}

function buildSentencePickQuestions(ch, count) {
  const pool = sentencePoolFor(ch);
  if (!pool.length || count <= 0) return [];
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picked.map((correct) => {
    const correctLabel = sentenceAboutLabel(correct.en, ch.words);
    const usedLabels = new Set([correctLabel]);
    const options = [correct];
    for (const s of shuffle(pool.filter((s) => s.en !== correct.en))) {
      const label = sentenceAboutLabel(s.en, ch.words);
      if (usedLabels.has(label)) continue;
      usedLabels.add(label);
      options.push(s);
      if (options.length >= 4) break;
    }
    while (options.length < 4) {
      const extra = pool.find((s) => !options.some((o) => o.en === s.en));
      if (!extra) break;
      options.push(extra);
    }
    const shuffled = shuffle(options.slice(0, 4));
    return {
      type: "hear-sentence",
      mm: correct.mm,
      hint: correct.hint || "",
      correctEn: correct.en,
      options: shuffled.map((s) => ({
        label: sentenceAboutLabel(s.en, ch.words),
        en: s.en
      }))
    };
  });
}

function quizCompetitionBarHtml() {
  return `
  <div class="competition-bar" id="liveScoreBar">
    <div class="competitor">
      <div class="competitor-icon" id="playerIcon">🧒</div>
      <div class="competitor-name" id="playerName2">Explorer</div>
      <div class="competitor-score" id="playerScore">0</div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="competitor">
      <div class="competitor-icon" id="botIcon">👩‍🏫</div>
      <div class="competitor-name" id="botName">Professor M</div>
      <div class="competitor-score" id="computerScore">0</div>
    </div>
  </div>`;
}

function quizScoreCardHtml() {
  return `
  <div class="score-card" id="scoreCard">
    <h2 id="scoreMessage"></h2>
    <div class="podium" id="podium">
      <div class="podium-place" id="podium-second">
        <div class="podium-character" id="podium-char-2">👩‍🏫</div>
        <div class="podium-bar second"><span class="rank-badge">🥈</span></div>
        <div class="podium-score" id="podium-score-2">0</div>
        <div class="podium-name" id="podium-name-2">Professor M</div>
      </div>
      <div class="podium-place" id="podium-first">
        <div class="podium-character" id="podium-char-1">🧒</div>
        <div class="podium-bar first"><span class="rank-badge">🥇</span></div>
        <div class="podium-score" id="podium-score-1">0</div>
        <div class="podium-name" id="podium-name-1">Explorer</div>
      </div>
    </div>
    <p class="message" id="scoreDetail"></p>
    <button type="button" class="retry-btn" id="quizRetryBtn">🔄 Try Again</button>
  </div>`;
}

function buildOverallSentencePickQuestions(count) {
  const megaPool = [];
  CHAPTERS.forEach((ch) => {
    sentencePoolFor(ch).forEach((s) => {
      megaPool.push({ ...s, words: ch.words });
    });
  });
  if (!megaPool.length || count <= 0) return [];
  const picked = shuffle(megaPool).slice(0, Math.min(count, megaPool.length));
  return picked.map((correct) => {
    const correctLabel = sentenceAboutLabel(correct.en, correct.words);
    const usedLabels = new Set([correctLabel]);
    const options = [correct];
    for (const s of shuffle(megaPool.filter((x) => x.en !== correct.en))) {
      const label = sentenceAboutLabel(s.en, s.words);
      if (usedLabels.has(label)) continue;
      usedLabels.add(label);
      options.push(s);
      if (options.length >= 4) break;
    }
    while (options.length < 4) {
      const extra = megaPool.find((s) => !options.some((o) => o.en === s.en));
      if (!extra) break;
      options.push(extra);
    }
    const shuffled = shuffle(options.slice(0, 4));
    return {
      type: "hear-sentence",
      mm: correct.mm,
      hint: correct.hint || "",
      correctEn: correct.en,
      options: shuffled.map((s) => ({
        label: sentenceAboutLabel(s.en, s.words),
        en: s.en
      }))
    };
  });
}

function genOverallQuiz() {
  const wordCount = 5;
  const sentenceCount = 1;
  const allWords = CHAPTERS.flatMap((ch) => ch.words || []);
  const megaPoolLen = CHAPTERS.reduce((n, ch) => n + sentencePoolFor(ch).length, 0);
  const wordQs = buildHearPickQuestions(allWords, wordCount);
  const sentenceQs = buildOverallSentencePickQuestions(megaPoolLen ? sentenceCount : 0);
  const questions = [...wordQs, ...sentenceQs];
  const cards = questions
    .map((q, i) => {
      const active = i === 0;
      if (q.type === "hear-sentence") return sentenceHearQuizCard(q, i, active);
      return hearQuizCard(q, i, active);
    })
    .join("");

  const html = `${chapterHead("Overall Quiz")}
<body class="quiz-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>Overall Quiz</h1>
    <div class="subtitle">Beat Professor M · ${wordQs.length} words · ${sentenceQs.length} sentence${sentenceQs.length === 1 ? "" : "s"} · all chapters</div>
  </div>
  ${quizCompetitionBarHtml()}
  <div id="quizArea">${cards}</div>
  ${quizScoreCardHtml()}
  <div class="nav-hint">Win against Professor M to earn the Myanmar Word Champion badge!</div>
</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  MMGame.bootHybridQuiz({ badge: "Myanmar Word Champion", opponent: { name: "Professor M", icon: "👩‍🏫" } });
});
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, "036-Overall-Quiz.html"), html);
}

function chapterHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My First 100 Myanmar Words - ${esc(title)}</title>
<link rel="stylesheet" href="_mmwords-theme.css">
<style>${CHAPTER_CSS}</style>
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
    "Start at the top of the pyramid — one word. Say it, then tap 🔊.",
    "Add a little more each step — do not rush to the full sentence.",
    "Say the full sentence, then tap hear again if you need help."
  ];
}

function explainedSentencesFor(ch) {
  if (ch.explainedSentences && ch.explainedSentences.length) return ch.explainedSentences;
  return (ch.words || [])
    .filter((w) => w.useEn)
    .slice(0, 9)
    .map((w) => ({ en: w.useEn, mm: w.useMm || w.mm }));
}

function explainedGroupsFor(ch) {
  if (ch.explainedGroups && ch.explainedGroups.length) return ch.explainedGroups;
  const pool = explainedSentencesFor(ch);
  const wordsWithUse = (ch.words || []).filter((w) => w.useEn).slice(0, 10);
  return wordsWithUse.map((w, i) => {
    const related = pool.filter(
      (s) => s.en !== w.useEn && s.en.toLowerCase().includes(w.en.toLowerCase())
    );
    const s2 = related[0] || pool[i * 2] || { en: w.useEn, mm: w.useMm || w.mm };
    const s3 = related[1] || pool[i * 2 + 1] || pool[(i + 1) % pool.length] || s2;
    return {
      title: w.en,
      tip: ch.didYouKnow || (ch.heritage && ch.heritage.text) || "Practice these sentences with someone at home.",
      sentences: [
        { en: w.useEn, mm: w.useMm || w.mm },
        { en: s2.en, mm: s2.mm },
        { en: s3.en, mm: s3.mm }
      ]
    };
  });
}

function splitList(list) {
  const n = list.length;
  const a = Math.ceil(n / 3);
  const b = Math.ceil((n - a) / 2);
  return [list.slice(0, a), list.slice(a, a + b), list.slice(a + b)];
}

const PYRAMID_STOP = new Set([
  "this", "is", "my", "the", "a", "an", "i", "we", "please", "look", "at", "in", "on", "for", "to",
  "with", "our", "your", "me", "let", "s", "and", "not", "too", "give", "open", "close", "turn", "use"
]);

function mkPyramid(l1, l2, l3) {
  const fix = (s) => String(s || "").trim();
  return [
    { step: 1, label: "Step 1 · One word", text: fix(l1) },
    { step: 2, label: "Step 2 · A little more", text: fix(l2) },
    { step: 3, label: "Step 3 · Full sentence", text: fix(l3) }
  ];
}

const TRAIL_STOP = new Set(["in", "on", "at", "with", "to", "for", "the", "a", "an", "my", "and", "is", "are", "of"]);

function trimTrailWords(words) {
  const w = words.slice();
  while (w.length > 1 && TRAIL_STOP.has(w[w.length - 1].toLowerCase().replace(/[,]/g, ""))) w.pop();
  return w;
}

function endPunct(full, fallback) {
  return full.match(/[!?.]$/)?.[0] || fallback || ".";
}

function buildPyramid(sentenceEn, customPyramid) {
  if (customPyramid && customPyramid.length >= 3) {
    return customPyramid.map((text, i) => ({
      step: i + 1,
      label: ["Step 1 · One word", "Step 2 · A little more", "Step 3 · Full sentence"][i] || `Step ${i + 1}`,
      text
    }));
  }

  const full = sentenceEn.trim();
  const punct = endPunct(full, ".");
  const clean = full.replace(/[!?.]+$/, "").trim();
  const words = clean.split(/\s+/);
  const lower = words.map((w) => w.toLowerCase().replace(/[,]/g, ""));

  if (words.length === 1) {
    return mkPyramid(full, full, full);
  }

  if (words.length === 2) {
    const w0 = capWord(words[0].replace(/[,]/g, ""));
    return mkPyramid(w0 + endPunct(full, "."), full, full);
  }

  if (lower[0] === "this" && lower[1] === "is" && lower[2] === "my" && words.length >= 4) {
    const noun = words.slice(3).join(" ");
    const first = noun.split(" ")[0].replace(/[,]/g, "");
    return mkPyramid(capWord(first) + ".", "My " + noun + ".", full);
  }

  if (lower[0] === "my" && words.length >= 3) {
    const first = words[1].replace(/[,]/g, "");
    const mid = trimTrailWords(words.slice(0, Math.max(3, words.length - 1)));
    const l2 = (mid.length ? mid : words.slice(0, 2)).join(" ") + endPunct(full, ".");
    return mkPyramid(capWord(first) + ".", l2, full);
  }

  const myIdx = lower.indexOf("my");
  if (myIdx >= 0 && myIdx < words.length - 1) {
    const key = words[myIdx + 1].replace(/[,]/g, "");
    const l2 = capWord(words[myIdx]) + " " + key + ".";
    return mkPyramid(capWord(key) + ".", l2, full);
  }

  if (lower[1] === "is" && words.length >= 3) {
    const adj = words.slice(2).join(" ").replace(/[!?]+$/, "");
    return mkPyramid(
      capWord(words[0].replace(/[,]/g, "")) + ".",
      capWord(words[0]) + " is " + adj + ".",
      full
    );
  }

  if (lower[0] === "the" && words.length >= 3) {
    const noun = words[1].replace(/[,]/g, "");
    const mid = trimTrailWords(words.slice(0, Math.max(2, words.length - 1)));
    return mkPyramid(capWord(noun) + ".", mid.join(" ") + endPunct(full, "."), full);
  }

  if (lower[0] === "i" && words.length >= 2) {
    const key = words[words.length - 1].replace(/[,!]/g, "");
    const mid = trimTrailWords(words.slice(0, Math.max(2, words.length - 1)));
    return mkPyramid(capWord(key) + ".", mid.join(" ") + endPunct(full, "."), full);
  }

  if (lower[0] === "we" && words.length >= 2) {
    const key = words[1].replace(/[,]/g, "");
    const mid = trimTrailWords(words.slice(0, Math.max(2, words.length - 1)));
    return mkPyramid(capWord(key) + ".", mid.join(" ") + endPunct(full, "."), full);
  }

  if (words[0].includes(",") && words.length >= 2) {
    const name = words[0].replace(/[,]/g, "");
    return mkPyramid(name + ".", words.slice(0, 2).join(" ") + endPunct(full, punct), full);
  }

  const keyIdx = words.findIndex((w) => !PYRAMID_STOP.has(w.toLowerCase().replace(/[,]/g, "")));
  const key = (keyIdx >= 0 ? words[keyIdx] : words[0]).replace(/[,]/g, "");
  const mid = trimTrailWords(words.slice(0, Math.max(2, words.length - 1)));
  return mkPyramid(capWord(key) + ".", mid.join(" ") + endPunct(full, "."), full);
}

function capWord(w) {
  if (!w) return w;
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function stepMyanmar(stepText, item, words, stepIndex) {
  if (item.pyramidMm && item.pyramidMm[stepIndex]) return item.pyramidMm[stepIndex];
  if (stepIndex === 2) return item.mm;
  const tokens = stepText.replace(/[!?.]+$/, "").trim().split(/\s+/).map((t) => t.replace(/[,]/g, "").toLowerCase());
  for (let t = tokens.length - 1; t >= 0; t--) {
    for (const w of words) {
      if (w.en.toLowerCase() === tokens[t]) return w.mm;
    }
  }
  for (const w of words) {
    if (stepText.toLowerCase().includes(w.en.toLowerCase())) return w.mm;
  }
  return item.mm;
}

function pyramidMmTexts(item, chapterId, words, enSteps) {
  const mapped = PYRAMID_MM[chapterId] && PYRAMID_MM[chapterId][item.en];
  if (mapped && mapped.length >= 3) return mapped.slice(0, 3);
  if (item.pyramidMm && item.pyramidMm.length >= 3) return item.pyramidMm.slice(0, 3);
  return enSteps.map((s, i) => stepMyanmar(s.text, item, words, i));
}

function pyramidPairHtml(en, mm) {
  return `<div class="pyramid-lines"><div class="pyramid-line pyramid-line-en">${esc(en)}</div><div class="pyramid-line pyramid-line-mm">${esc(mm)}</div></div>`;
}

function whiteboardLineHtml(text, lang) {
  const attr = lang === "en" ? "data-en" : "data-mm";
  const label = lang === "en" ? "Hear English" : "Hear Myanmar";
  return `
            <div class="wb-line wb-line-${lang}">
              <span class="wb-text wb-text-${lang}">${esc(text)}</span>
              <button type="button" class="wb-speak-btn btn-speak speak-btn-${lang}" ${attr}="${esc(text)}" onclick="tapPhrase(this,'${lang}')" aria-label="${label}">
                <span class="wb-speak-icon">🔊</span>
              </button>
            </div>`;
}

function sentencePairHtml(en, mm) {
  return `
        <div class="wb-sentence-pair">
          ${whiteboardLineHtml(en, "en")}
          ${whiteboardLineHtml(mm, "mm")}
        </div>`;
}

function defaultGroupTip(group, ch) {
  if (group.tip) return group.tip;
  if (ch.didYouKnow) return ch.didYouKnow;
  if (ch.heritage && ch.heritage.text) return ch.heritage.text;
  return "Practice these sentences with someone at home.";
}

function pyramidGroupContentHtml(group, si, ch, activeClass) {
  const sentences = (group.sentences || []).slice(0, 3);
  const rows = sentences.map((line) => sentencePairHtml(line.en, line.mm)).join("");
  const tip = defaultGroupTip(group, ch);

  return `
        <div class="wizard-panel pyramid-group-panel${activeClass}" id="pw-group-${si}" data-sentence="${si + 1}" data-group="${si}" data-topic="${esc(tip)}">
          <p class="whiteboard-heading">${esc(group.title)}</p>
          <div class="whiteboard-lines">${rows}</div>
        </div>`;
}

function classroomShelfHtml() {
  const pot = `<div class="classroom-pot"><img src="assets/flower-pot.png" alt="" decoding="async"></div>`;
  return `<div class="classroom-pots-row" aria-hidden="true">${pot}${pot}${pot}${pot}</div>`;
}

function explainedWizardHtml(ch, groups) {
  const contentPanels = groups
    .map((group, si) => pyramidGroupContentHtml(group, si, ch, si === 0 ? " active" : ""))
    .join("");

  const groupDots = groups
    .map(
      (_, si) =>
        `<button type="button" class="wizard-dot pyramid-group-dot" data-group="${si}" aria-label="Word group ${si + 1}"></button>`
    )
    .join("");

  const firstTip = defaultGroupTip(groups[0] || {}, ch);

  return `
  <div class="wizard-shell pyramid-wizard card" id="pyramid-wizard" data-groups="${groups.length}">
    <div class="pyramid-wizard-head">
      <span class="wizard-progress-text" id="pw-progress">Group 1 of ${groups.length}</span>
      <div class="wizard-dots pyramid-wizard-dots pyramid-group-dots" id="pw-group-dots">${groupDots}</div>
    </div>
    <div class="pyramid-wizard-stage">
      <div class="classroom-scene">
        <div class="classroom-room">
          <div class="classroom-wall">
            <div class="wb-frame-outer">
              <span class="wb-screw wb-screw-l" aria-hidden="true"></span>
              <span class="wb-screw wb-screw-r" aria-hidden="true"></span>
              <div class="wb-frame-inner">
                <div class="wb-surface">
                  <div class="whiteboard-content-stack">${contentPanels}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="classroom-floor">
            ${classroomShelfHtml()}
          </div>
        </div>
      </div>
    </div>
    <div class="pyramid-wizard-foot">
      <div class="sentences-control-bar">
        <button type="button" class="wizard-btn wizard-btn-back" id="pw-back">← Back</button>
        <p class="sentences-hint">Tap 🔊 · Read aloud</p>
        <button type="button" class="wizard-btn wizard-btn-next" id="pw-next">Next →</button>
      </div>
      <div class="wizard-topic-foot" id="pw-topic-foot">
        <span class="topic-foot-emoji" aria-hidden="true">${ch.emoji || "📖"}</span>
        <p class="topic-foot-text" id="pw-topic-text">${esc(firstTip)}</p>
      </div>
    </div>
  </div>`;
}

function explainedWizardScript() {
  return `
<script>
document.addEventListener('DOMContentLoaded', function() {
  var wizard = document.getElementById('pyramid-wizard');
  if (!wizard) return;
  var panels = wizard.querySelectorAll('.pyramid-group-panel');
  var back = document.getElementById('pw-back');
  var next = document.getElementById('pw-next');
  var progress = document.getElementById('pw-progress');
  var groupDots = wizard.querySelectorAll('.pyramid-group-dot');
  var topicText = document.getElementById('pw-topic-text');
  var groupIdx = 0;
  var totalGroups = panels.length;

  function fitWhiteboard() {
    var surface = wizard.querySelector('.wb-surface');
    var stack = wizard.querySelector('.whiteboard-content-stack');
    if (!surface || !stack) return;
    var panel = stack.querySelector('.pyramid-group-panel.active');
    stack.style.transform = '';
    if (!panel) return;
    var available = surface.clientHeight - 12;
    var needed = panel.scrollHeight;
    if (needed > available && available > 0) {
      var scale = Math.max(0.78, available / needed);
      stack.style.transform = 'scale(' + scale + ')';
      stack.style.transformOrigin = 'top center';
    }
  }

  function updateUI() {
    panels.forEach(function(p, i) { p.classList.toggle('active', i === groupIdx); });
    groupDots.forEach(function(d, i) {
      d.classList.toggle('active', i === groupIdx);
      d.classList.toggle('done', i < groupIdx);
    });
    progress.textContent = 'Group ' + (groupIdx + 1) + ' of ' + totalGroups;
    back.disabled = groupIdx === 0;
    next.textContent = groupIdx === totalGroups - 1 ? 'Finish ✓' : 'Next →';
    if (topicText && panels[groupIdx]) {
      topicText.textContent = panels[groupIdx].getAttribute('data-topic') || '';
    }
    requestAnimationFrame(fitWhiteboard);
  }

  back.addEventListener('click', function() {
    if (groupIdx > 0) {
      groupIdx--;
      updateUI();
    }
  });

  next.addEventListener('click', function() {
    if (groupIdx < totalGroups - 1) {
      groupIdx++;
      updateUI();
    }
  });

  groupDots.forEach(function(d) {
    d.addEventListener('click', function() {
      groupIdx = parseInt(d.getAttribute('data-group'), 10);
      updateUI();
    });
  });

  updateUI();
  window.addEventListener('resize', fitWhiteboard);
});
</script>`;
}

function wordGridHtml(words, chapterId) {
  return words
    .map((w) => {
      const id = w.en.toLowerCase().replace(/\s+/g, "-");
      const emoji = w.emoji || "🔤";
      return `
    <div class="word-card-item word-card" id="word-${id}" data-en="${esc(w.en)}" data-mm="${esc(w.mm)}" data-hint="${esc(w.hint || w.en)}">
      <div class="word-card-label word-card-emoji">${emoji}</div>
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

function cleanPartTitle(title) {
  return String(title || "")
    .replace(/^Part\s+(one|two|three|\d+)\s*·\s*/i, "")
    .trim();
}

function mainWizardPanelHtml(ch, idx, story, words, titles, active) {
  const slot = "seg" + (idx + 1);
  const pic = imgHtml(ch.id, slot, ch.title + " — part " + (idx + 1));
  return `
    <div class="wizard-panel chapter-panel${active ? " active" : ""}" id="cw-part-${idx}" data-part="${idx + 1}">
      <div class="chapter-panel-inner">
        <div class="scene-wrap chapter-scene"><div class="scene-card scene-card-hero chapter-photo-hero scene-static">${pic}</div></div>
        <div class="story-row">
          <div class="card story-card">
            <h2>${esc(titles[idx])}</h2>
            <div class="story-box">${esc(story)}</div>
          </div>
        </div>
        <div class="chapter-words-block">
          <div class="section-head">Press words to hear</div>
          <div class="word-grid chapter-word-grid">${wordGridHtml(words, ch.id)}</div>
        </div>
      </div>
    </div>`;
}

function mainGamePanelHtml(ch) {
  const target = ch.gameTarget || 8;
  const hint = ch.gameHint || "Have fun and earn your badge!";
  const isLantern = ch.gameType === "lantern-run";
  const progressLabel = isLantern
    ? `Level 1 / ${target}  ⏱ 22s  ❤️❤️❤️  ·  Reach family!`
    : `0 / ${target}`;
  const progressCaption = isLantern ? "Progress:" : "Score:";
  const startMsg = isLantern
    ? "Tap Start — jump past wolves & thieves! Reach each family member before time runs out."
    : "Tap Start — use buttons below to play!";
  return `
    <div class="wizard-panel chapter-panel chapter-game-panel" id="cw-game" data-part="game">
      <div class="game-section chapter-game-inner action-game-wrap">
        <h2>${esc(ch.gameTitle)}</h2>
        <p class="game-meta game-hint">${esc(hint)}</p>
        <p class="game-meta">${progressCaption} <strong id="action-score">${esc(progressLabel)}</strong></p>
        <div class="action-game-stage">
          <canvas id="action-canvas" class="game-canvas action-canvas"></canvas>
          <div class="action-overlay" id="action-start-overlay">
            <p>${esc(startMsg)}</p>
            <button type="button" class="game-start-btn" id="action-start-btn">▶ Start game</button>
          </div>
        </div>
        <div class="action-controls" id="action-controls"></div>
        <div class="challenge-box">Earn badge: <strong>${esc(ch.badge)}</strong></div>
      </div>
    </div>`;
}

function mainChapterWizardHtml(ch, panels) {
  const dots = [0, 1, 2]
    .map(
      (i) =>
        `<button type="button" class="wizard-dot chapter-wizard-dot" data-part="${i}" aria-label="Story part ${i + 1}"></button>`
    )
    .join("");

  return `
  <div class="wizard-shell chapter-wizard card" id="chapter-wizard" data-parts="3">
    <div class="chapter-wizard-head">
      <span class="wizard-progress-text" id="cw-progress">Story 1 of 3</span>
      <div class="wizard-dots chapter-wizard-dots" id="cw-dots">${dots}</div>
    </div>
    <div class="chapter-wizard-stage">
      ${panels}
    </div>
    <div class="chapter-wizard-foot">
      <button type="button" class="wizard-btn wizard-btn-back" id="cw-back">← Back</button>
      <button type="button" class="wizard-btn wizard-btn-next" id="cw-next">Next →</button>
    </div>
  </div>`;
}

function mainChapterWizardScript() {
  return `
<script>
document.addEventListener('DOMContentLoaded', function() {
  var wizard = document.getElementById('chapter-wizard');
  if (!wizard) return;
  var panels = wizard.querySelectorAll('.chapter-panel');
  var back = document.getElementById('cw-back');
  var next = document.getElementById('cw-next');
  var progress = document.getElementById('cw-progress');
  var dots = wizard.querySelectorAll('.chapter-wizard-dot');
  var stepIdx = 0;
  var totalSteps = panels.length;

  function fitPanel() {
    var panel = wizard.querySelector('.chapter-panel.active .chapter-panel-inner');
    var stage = wizard.querySelector('.chapter-wizard-stage');
    if (!panel || !stage) return;
    panel.style.transform = '';
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    var available = stage.clientHeight - 2;
    var needed = panel.scrollHeight;
    if (needed > available && available > 0) {
      var scale = Math.max(0.75, available / needed);
      panel.style.transform = 'scale(' + scale + ')';
      panel.style.transformOrigin = 'top center';
    }
  }

  function scheduleFit() {
    requestAnimationFrame(function() {
      requestAnimationFrame(fitPanel);
    });
  }

  function updateUI() {
    panels.forEach(function(p, i) { p.classList.toggle('active', i === stepIdx); });
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === stepIdx);
      d.classList.toggle('done', i < stepIdx);
    });
    back.disabled = stepIdx === 0;
    progress.textContent = 'Story ' + (stepIdx + 1) + ' of ' + totalSteps;
    next.textContent = stepIdx === totalSteps - 1 ? 'Finish ✓' : 'Next →';
    scheduleFit();
  }

  back.addEventListener('click', function() {
    if (stepIdx > 0) { stepIdx--; updateUI(); }
  });

  next.addEventListener('click', function() {
    if (stepIdx < totalSteps - 1) { stepIdx++; updateUI(); }
  });

  dots.forEach(function(d, i) {
    d.addEventListener('click', function() { stepIdx = i; updateUI(); });
  });

  updateUI();
  window.addEventListener('resize', scheduleFit);
  window.addEventListener('orientationchange', scheduleFit);
  wizard.querySelectorAll('.chapter-hero-img').forEach(function(img) {
    if (img.complete) scheduleFit();
    else img.addEventListener('load', scheduleFit);
  });
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(scheduleFit);
    ro.observe(wizard.querySelector('.chapter-wizard-stage'));
  }
});
</script>`;
}

function segmentTitles(ch, kind) {
  const key = kind === "explained" ? "explainedSegmentTitles" : "segmentTitles";
  if (ch[key] && ch[key].length >= 3) {
    return ch[key].slice(0, 3).map(cleanPartTitle);
  }
  const base = ch.storyTitle || ch.title + " tale";
  return [base, "The lesson deepens", "The moral"];
}

function genActivity(ch) {
  const stories = splitThree(ch.story);
  const titles = segmentTitles(ch, "main");
  const wordGroups = splitWords(ch.words);
  const panels = [0, 1, 2]
    .map((i) => mainWizardPanelHtml(ch, i, stories[i], wordGroups[i], titles, i === 0))
    .join("");
  const wizardHtml = mainChapterWizardHtml(ch, panels);

  const fname = `${pad(ch.num)}-${slug(ch.title)}.html`;
  const html = `${chapterHead(ch.title + " — Learn")}
<body class="main-chapter-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>${ch.title}</h1>
  </div>
  ${wizardHtml}
</div>
</div>
${mainChapterWizardScript()}
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

function genExplained(ch) {
  const groups = explainedGroupsFor(ch);
  const wizardHtml = explainedWizardHtml(ch, groups);

  const fname = `${pad(ch.num + 1)}-${slug(ch.title)}-Explained.html`;
  const html = `${chapterHead(ch.title + " — Sentences")}
<body class="explained-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>Sentences</h1>
  </div>
  ${wizardHtml}
</div>
</div>
${explainedWizardScript()}
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

function hearQuizCard(q, i, isActive) {
  const correctIdx = q.options.findIndex((o) => o.en === q.correctEn);
  const fixedOpts = q.options
    .map((opt, oi) => {
      const label = wordOptionLabel(opt);
      return `<div class="option" data-correct="${oi === correctIdx ? "1" : "0"}">${esc(label)}</div>`;
    })
    .join("");
  return `
  <div class="quiz-card${isActive ? " active" : ""}" id="quizCard-${i + 1}" data-quiz-type="hear" data-mm="${esc(q.mm)}" data-hint="${esc(q.hint)}">
    <div class="question">${i + 1}. Which English word did you hear?</div>
    <div class="hear-panel">
      <span class="hear-emoji" aria-hidden="true">🔊</span>
      <button type="button" class="hear-replay-btn">🔊 Hear word</button>
    </div>
    <p class="hear-hint-text">Tap 🔊 to hear Myanmar — then pick the matching English word (no peeking at emojis!).</p>
    <div class="options">${fixedOpts}</div>
    <div class="feedback" id="feedback-${i + 1}"></div>
  </div>`;
}

function sentenceHearQuizCard(q, i, isActive) {
  const correctIdx = q.options.findIndex((o) => o.en === q.correctEn);
  const fixedOpts = q.options
    .map((opt, oi) =>
      `<div class="option" data-correct="${oi === correctIdx ? "1" : "0"}">${esc(opt.label)}</div>`
    )
    .join("");
  return `
  <div class="quiz-card${isActive ? " active" : ""}" id="quizCard-${i + 1}" data-quiz-type="hear-sentence" data-mm="${esc(q.mm)}" data-hint="${esc(q.hint)}">
    <div class="question">${i + 1}. What is this sentence about?</div>
    <div class="hear-panel">
      <span class="hear-emoji" aria-hidden="true">💬</span>
      <button type="button" class="hear-replay-btn">🔊 Hear sentence</button>
    </div>
    <p class="hear-hint-text">Listen to the full Myanmar sentence — then pick what it is about (Mom, Aunt, Family…).</p>
    <div class="options">${fixedOpts}</div>
    <div class="feedback" id="feedback-${i + 1}"></div>
  </div>`;
}

function genQuiz(ch) {
  const wordCount = 5;
  const sentenceCount = 1;
  const sentencePool = sentencePoolFor(ch);
  const wordQs = buildHearPickQuestions(ch.words, wordCount);
  const sentenceQs = buildSentencePickQuestions(ch, sentencePool.length ? sentenceCount : 0);
  const questions = [...wordQs, ...sentenceQs];

  const cards = questions
    .map((q, i) => {
      const active = i === 0;
      if (q.type === "hear-sentence") return sentenceHearQuizCard(q, i, active);
      return hearQuizCard(q, i, active);
    })
    .join("");

  const fname = `${pad(ch.num + 2)}-${slug(ch.title)}-Quiz.html`;
  const html = `${chapterHead(ch.title + " — Quiz")}
<body class="quiz-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>${ch.title} Quiz</h1>
    <div class="subtitle">Beat Professor M · ${wordQs.length} words · ${sentenceQs.length} sentence${sentenceQs.length === 1 ? "" : "s"} · hear Myanmar, answer in English</div>
  </div>
  ${quizCompetitionBarHtml()}
  <div id="quizArea">${cards}</div>
  ${quizScoreCardHtml()}
  ${navHint()}
</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  MMGame.bootHybridQuiz({ badge: ${JSON.stringify(ch.badge + " Quiz")}, opponent: { name: "Professor M", icon: "👩‍🏫" } });
});
</script>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

const mode = process.argv[2] || "all";

CHAPTERS.forEach((ch) => {
  if (mode === "all" || mode === "learn") genActivity(ch);
  if (mode === "all" || mode === "explained") genExplained(ch);
  if (mode === "all" || mode === "quiz") genQuiz(ch);
});
if (mode === "all" || mode === "quiz") genOverallQuiz();
const count =
  mode === "quiz" ? CHAPTERS.length + 1 :
  mode === "learn" || mode === "explained" ? CHAPTERS.length :
  CHAPTERS.length * 3;
console.log("Generated", count, mode === "all" ? "chapter files (3-segment layout)." : mode + " file(s).");
