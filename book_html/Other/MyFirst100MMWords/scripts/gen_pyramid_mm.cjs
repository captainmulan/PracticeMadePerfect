#!/usr/bin/env node
/* Generate pyramidMm triples for explainedSentences — run from MyFirst100MMWords folder */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
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

const ALIAS = { grandma: "grandmother", grandpa: "grandfather" };

function normalizeWord(s) {
  return String(s || "").toLowerCase().replace(/[,]/g, "");
}

function lookupWord(text, words) {
  const tokens = String(text || "").replace(/[!?.]+$/, "").trim().split(/\s+/);
  for (const raw of tokens) {
    let t = normalizeWord(raw);
    if (ALIAS[t]) t = ALIAS[t];
    for (const w of words) {
      if (normalizeWord(w.en) === t) return w;
    }
  }
  for (const w of words) {
    if (String(text).toLowerCase().includes(w.en.toLowerCase())) return w;
  }
  return null;
}

function inferMmMid(enMid, enFull, fullMm, mm1, words) {
  if (enMid.replace(/[!?.]/g, "").trim() === enFull.replace(/[!?.]/g, "").trim()) return fullMm;

  if (/\blives?\b/i.test(enMid) && fullMm.includes("က")) {
    const idx = fullMm.indexOf("က");
    return fullMm.slice(0, idx + 1).trim();
  }

  if (/ is /i.test(enMid) && fullMm.includes("က")) {
    const base = fullMm.replace(/!$/, "။");
    return base.endsWith("။") ? base : base + "။";
  }

  if (/^the\s+/i.test(enMid) && fullMm.includes("က")) {
    const idx = fullMm.indexOf("က");
    return fullMm.slice(0, idx + 1).trim();
  }

  if (/^my\s+/i.test(enMid)) {
    const w = lookupWord(enMid, words);
    if (w) return w.mm;
  }

  if (fullMm.includes("、")) {
    const parts = fullMm.split("、");
    return parts.length > 1 ? parts[0] + "、" + parts[1].replace(/!$/, "") : fullMm;
  }

  const w = lookupWord(enMid, words);
  if (w) return w.mm;

  if (fullMm.includes("။")) {
    const first = fullMm.split("။")[0];
    if (first.length >= mm1.length && first.length < fullMm.length) return first + "။";
  }

  return mm1;
}

const MANUAL_OVERRIDES = {
  "family:This is my mother.": ["မေမေ", "အမေ", "ဒါက ကျွန်မအမေပါ။"],
  "family:This is my father.": ["အဖေ", "အဖေ", "ဒါက ကျွန်မအဖေပါ။"],
  "family:Uncle is funny!": ["ဦးလေး", "ဦးလေးက ရယ်စရာကောင်းတယ်။", "ဦးလေးက ရယ်စရာကောင်းတယ်!"],
  "family:I play with my cousin.": ["ဝမ်းကွဲ", "ကျွန်မဝမ်းကွဲ", "ဝမ်းကွဲနဲ့ ကစားတယ်။"],
  "family:The baby is sleeping.": ["ကလေး", "ကလေးက", "ကလေးက အိပ်နေတယ်။"],
  "food:We eat rice every day.": ["ထမင်း", "ထမင်းစားတယ်", "နေ့တိုင်း ထမင်းစားတယ်။"],
  "food:The mango is sweet.": ["သရက်သီး", "သရက်သီး ချိုတယ်။", "သရက်သီး ချိုတယ်။"],
  "food:Fish comes from the river.": ["ငါး", "ငါးက", "ငါးက မြစ်ကနေ ရတယ်။"]
};

function pyramidMmFor(item, words, chapterId) {
  const key = chapterId + ":" + item.en;
  if (MANUAL_OVERRIDES[key]) return MANUAL_OVERRIDES[key];
  if (item.pyramidMm && item.pyramidMm.length >= 3) return item.pyramidMm.slice(0, 3);
  const fullMm = item.mm;
  const wFull = lookupWord(item.en, words);
  const wFirst = lookupWord(item.en.split(/\s+/)[0], words) || wFull;
  const mm1 = (lookupWord(item.en, words) && lookupWord(item.en, words).mm) || wFirst?.mm || fullMm;

  // Load buildPyramid from generator
  const genSrc = fs.readFileSync(path.join(DIR, "_generate-book.cjs"), "utf8");
  const buildPart = genSrc.slice(genSrc.indexOf("const PYRAMID_STOP"), genSrc.indexOf("function capWord"));
  const capPart = genSrc.match(/function capWord[\s\S]*?^}/m)[0];
  eval(buildPart + capPart + genSrc.match(/function buildPyramid[\s\S]*?^}/m)[0]);

  const steps = buildPyramid(item.en, item.pyramid);
  const mm1step = lookupWord(steps[0].text, words)?.mm || mm1;
  const mm3 = fullMm;
  const mm2 = inferMmMid(steps[1].text, steps[2].text, fullMm, mm1step, words);
  return [mm1step, mm2, mm3];
}

const out = {};
for (const ch of CHAPTERS) {
  out[ch.id] = {};
  const items = [];
  if (ch.explainedGroups && ch.explainedGroups.length) {
    for (const group of ch.explainedGroups) {
      for (const line of group.sentences || []) items.push(line);
    }
  } else {
    items.push(...(ch.explainedSentences || []));
  }
  for (const item of items) {
    out[ch.id][item.en] = pyramidMmFor(item, ch.words || [], ch.id);
  }
}

const js =
  "/* Auto-generated pyramid MM for explained pages — scripts/gen_pyramid_mm.cjs */\n" +
  "(function (w) {\n  w.MM_PYRAMID_MM = " +
  JSON.stringify(out, null, 2) +
  ";\n})(window);\n";

fs.writeFileSync(path.join(DIR, "_mmwords-pyramid-mm.js"), js);
console.log("Wrote _mmwords-pyramid-mm.js for", CHAPTERS.length, "chapters");
