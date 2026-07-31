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
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-stories.js"), "utf8"), sandbox);
const EXPLAINED_STORIES = sandbox.window.MM_EXPLAINED_STORIES || {};
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-sentence-lines.js"), "utf8"), sandbox);
const SENTENCE_LINES = sandbox.window.MM_SENTENCE_LINES || {};
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
  const isSent = /^sent\d+$/.test(slot);
  const names = isSent
    ? [`${chapterId}-${slot}.jpg`, `${chapterId}-${slot}.jpeg`, `${chapterId}-${slot}.png`]
    : [`${chapterId}-${slot}.jpg`, `${chapterId}-${slot}.jpeg`, `${chapterId}-${slot}.png`, `${chapterId}-${slot}.svg`];
  if (LEGACY_IMG[chapterId] && LEGACY_IMG[chapterId][slot]) names.unshift(LEGACY_IMG[chapterId][slot]);
  const fallbacks = {
    seg2: ["seg1"],
    seg3: ["seg1"],
    exp1: ["seg1"],
    exp2: ["seg2", "seg1"],
    exp3: ["seg3", "seg1"],
    sent1: ["exp1"],
    sent2: ["exp2"],
    sent3: ["exp3"]
  };
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

function imgHtml(chapterId, slot, alt, lazy) {
  const uri = loadImageUri(chapterId, slot);
  if (!uri) {
    return `<div class="scene-placeholder">Add assets/${chapterId}-${slot}.jpg</div>`;
  }
  const lazyAttr = lazy ? ' loading="lazy" fetchpriority="low"' : ' fetchpriority="high"';
  return `<img class="chapter-hero-img" src="${uri}" alt="${esc(alt)}" decoding="async"${lazyAttr}>`;
}

const CHAPTER_CSS = `.container{width:100%;max-width:100%;margin:0;padding:16px clamp(16px,3vw,40px) 28px;position:relative;z-index:1;}
@media(min-width:1200px){.container{max-width:1400px;margin:0 auto;}}
body.main-chapter-page{padding:0;min-height:100dvh;height:auto;overflow-x:hidden;overflow-y:auto;}
.main-chapter-page .manuscript-bg,.main-chapter-page .container{min-height:100dvh;height:auto;max-height:none;display:block;overflow:visible;}
.explained-page{overflow-x:hidden;overflow-y:auto;}
body.explained-page{padding:0;min-height:100dvh;height:auto;overflow-x:hidden;overflow-y:auto;}
.explained-page .manuscript-bg,.explained-page .container{min-height:100dvh;height:auto;max-height:none;display:block;overflow:visible;}
.explained-page .manuscript-bg{width:100%;}
.explained-page .container{width:100%;margin:0;padding:16px clamp(16px,3vw,40px) 28px;--chapter-pad-x:clamp(16px,3vw,40px);}`;

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

function wordOptionHtml(opt) {
  const en = esc(opt.en || "");
  const mm = esc(opt.mm || "");
  if (mm) return `${en} <span class="option-mm">(${mm})</span>`;
  return en;
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
  (ch.explainedGroups || []).forEach((g) => {
    const line = primarySentence(ch.id, g);
    if (line && line.en && line.mm) add([line]);
  });
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
<script src="_mmwords-audio-map.js"></script>
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

function explainedSectionMeta(ch, idx, groups) {
  const fromFile = EXPLAINED_STORIES[ch.id] && EXPLAINED_STORIES[ch.id][idx];
  const titles = segmentTitles(ch, "main");
  return {
    title: (fromFile && fromFile.title) || titles[idx] || "Part " + (idx + 1),
    story: (fromFile && fromFile.story) || defaultGroupTip(groups[0] || {}, ch),
    storyLong: (fromFile && fromFile.storyLong) || null
  };
}

function primarySentence(chId, group) {
  const fromFile = SENTENCE_LINES[chId] && SENTENCE_LINES[chId][group.title];
  if (fromFile && fromFile.en) return fromFile;
  const list = group.sentences || [];
  const skip = /^(This is|These are|That is|Look at)/i;
  const rich = list.filter((s) => s.en && s.mm && !skip.test(s.en.trim()));
  if (rich.length) return rich.sort((a, b) => a.en.length - b.en.length)[0];
  return list[list.length - 1] || list[0] || { en: "", mm: "" };
}

function sentenceGroupsBlockHtml(chId, groups) {
  return groups
    .map((group) => {
      const line = primarySentence(chId, group);
      const row = sentencePairHtml(line.en, line.mm);
      return `
    <div class="sentence-group-card">
      <div class="sentence-pairs-list">${row}</div>
    </div>`;
    })
    .join("");
}

function explainedScrollPartHtml(ch, idx, groups, titles) {
  const slot = "sent" + (idx + 1);
  const meta = explainedSectionMeta(ch, idx, groups);
  const pic = imgHtml(ch.id, slot, ch.title + " — " + meta.title, idx > 0);
  const storyLongHtml = meta.storyLong
    ? `<div class="story-box story-box-landscape">${esc(meta.storyLong)}</div>`
    : "";
  return `
    <section class="chapter-part sentences-part" id="sentences-part-${idx}" aria-labelledby="sentences-part-title-${idx}">
      <h2 class="chapter-part-title" id="sentences-part-title-${idx}">${esc(meta.title)}</h2>
      <div class="chapter-part-inner">
        <div class="sentences-media-col">
          <div class="scene-wrap chapter-scene"><div class="scene-card scene-card-hero chapter-photo-hero scene-static">${pic}</div></div>
          <div class="story-row">
            <div class="card story-card">
              <div class="story-box story-box-default">${esc(meta.story)}</div>
              ${storyLongHtml}
            </div>
          </div>
        </div>
        <div class="chapter-sentences-block">
          <div class="section-head">Tap 🔊 to hear each sentence</div>
          <div class="sentences-groups">${sentenceGroupsBlockHtml(ch.id, groups)}</div>
        </div>
      </div>
    </section>`;
}

function explainedChapterScrollHtml(panels) {
  return `<div class="chapter-scroll sentences-scroll">${panels}</div>`;
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

function mainScrollPartHtml(ch, idx, story, words, titles) {
  const slot = "seg" + (idx + 1);
  const pic = imgHtml(ch.id, slot, ch.title + " — part " + (idx + 1), idx > 0);
  return `
    <section class="chapter-part" id="chapter-part-${idx}" aria-labelledby="chapter-part-title-${idx}">
      <h2 class="chapter-part-title" id="chapter-part-title-${idx}">${esc(titles[idx])}</h2>
      <div class="chapter-part-inner">
        <div class="scene-wrap chapter-scene"><div class="scene-card scene-card-hero chapter-photo-hero scene-static">${pic}</div></div>
        <div class="story-row">
          <div class="card story-card">
            <div class="story-box">${esc(story)}</div>
          </div>
        </div>
        <div class="chapter-words-block">
          <div class="section-head">Press words to hear</div>
          <div class="word-grid chapter-word-grid">${wordGridHtml(words, ch.id)}</div>
        </div>
      </div>
    </section>`;
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

function mainChapterScrollHtml(panels) {
  return `<div class="chapter-scroll">${panels}</div>`;
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
    .map((i) => mainScrollPartHtml(ch, i, stories[i], wordGroups[i], titles))
    .join("");
  const scrollHtml = mainChapterScrollHtml(panels);

  const fname = `${pad(ch.num)}-${slug(ch.title)}.html`;
  const html = `${chapterHead(ch.title + " — Learn")}
<body class="main-chapter-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>${ch.title}</h1>
  </div>
  ${scrollHtml}
</div>
</div>
</body></html>`;
  fs.writeFileSync(path.join(DIR, fname), html);
}

function genExplained(ch) {
  const groups = explainedGroupsFor(ch);
  const groupParts = splitList(groups);
  const panels = [0, 1, 2]
    .map((i) => explainedScrollPartHtml(ch, i, groupParts[i]))
    .join("");
  const scrollHtml = explainedChapterScrollHtml(panels);

  const fname = `${pad(ch.num + 1)}-${slug(ch.title)}-Explained.html`;
  const html = `${chapterHead(ch.title + " — Sentences")}
<body class="explained-page">
<div class="manuscript-bg">
<div class="container">
  <div class="top-bar">
    <h1>Sentences</h1>
    <div class="subtitle">${esc(ch.title)} — scroll to practice</div>
  </div>
  ${scrollHtml}
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

function hearQuizCard(q, i, isActive) {
  const correctIdx = q.options.findIndex((o) => o.en === q.correctEn);
  const fixedOpts = q.options
    .map((opt, oi) => {
      const label = wordOptionHtml(opt);
      return `<div class="option" data-correct="${oi === correctIdx ? "1" : "0"}">${label}</div>`;
    })
    .join("");
  return `
  <div class="quiz-card${isActive ? " active" : ""}" id="quizCard-${i + 1}" data-quiz-type="hear" data-mm="${esc(q.mm)}" data-hint="${esc(q.hint)}">
    <div class="question">${i + 1}. Which word did you hear?</div>
    <div class="hear-panel">
      <span class="hear-emoji" aria-hidden="true">🔊</span>
      <button type="button" class="hear-replay-btn">🔊 Hear word</button>
    </div>
    <p class="hear-hint-text">Tap 🔊 to hear Myanmar — then pick the matching English word and Myanmar spelling.</p>
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
    <div class="subtitle">Beat Professor M · ${wordQs.length} words · ${sentenceQs.length} sentence${sentenceQs.length === 1 ? "" : "s"} · hear Myanmar, pick the word</div>
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
