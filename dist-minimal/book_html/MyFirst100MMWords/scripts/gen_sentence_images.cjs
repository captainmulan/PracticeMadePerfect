#!/usr/bin/env node
/* Generate sentence-section scene images: {chapter}-sent1.svg … sent3.svg */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const ASSETS = path.join(DIR, "assets");
const sandbox = { window: {}, console };

vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-data.js"), "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-groups.js"), "utf8"), sandbox);
const CHAPTERS = sandbox.window.MM_CHAPTERS;
const GROUPS = sandbox.window.MM_EXPLAINED_GROUPS || {};

const PALETTES = {
  family: ["#FDE68A", "#FCA5A5", "#BAE6FD"],
  food: ["#FEF3C7", "#FDBA74", "#BBF7D0"],
  animals: ["#A7F3D0", "#86EFAC", "#6EE7B7"],
  colors: ["#FDE68A", "#F0ABFC", "#93C5FD"],
  numbers: ["#FEF08A", "#FDE047", "#FACC15"],
  body: ["#FECDD3", "#FBCFE8", "#DDD6FE"],
  home: ["#BAE6FD", "#7DD3FC", "#A5F3FC"],
  school: ["#C4B5FD", "#A78BFA", "#DDD6FE"],
  feelings: ["#FBCFE8", "#F9A8D4", "#FDE68A"],
  festivals: ["#FDE68A", "#F472B6", "#818CF8"]
};

function splitList(list) {
  const n = list.length;
  const a = Math.ceil(n / 3);
  const b = Math.ceil((n - a) / 2);
  return [list.slice(0, a), list.slice(a, a + b), list.slice(a + b)];
}

function wordEmoji(title, chapterId) {
  const ch = CHAPTERS.find((c) => c.id === chapterId);
  const w = (ch && ch.words || []).find((x) => x.en === title);
  return (w && w.emoji) || "✨";
}

function svgScene(chapterId, partIdx, groups, title) {
  const palette = PALETTES[chapterId] || ["#BAE6FD", "#A78BFA", "#F9A8D4"];
  const sky = palette[partIdx] || palette[0];
  const ground = "#4ADE80";
  const emojis = groups.slice(0, 6).map((g) => wordEmoji(g.title, chapterId));
  while (emojis.length < 4) emojis.push("✨");

  const positions = [
    [320, 340, 96],
    [560, 360, 88],
    [800, 330, 92],
    [1040, 350, 86],
    [460, 430, 72],
    [900, 420, 74]
  ];

  const emojiNodes = emojis
    .slice(0, 6)
    .map((e, i) => {
      const [x, y, size] = positions[i];
      return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${e}</text>`;
    })
    .join("\n    ");

  const labels = groups
    .slice(0, 4)
    .map((g, i) => {
      const x = 240 + i * 280;
      return `<text x="${x}" y="520" font-size="28" fill="#1E293B" font-family="Comic Sans MS, sans-serif" text-anchor="middle" font-weight="700">${escapeXml(g.title)}</text>`;
    })
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky}"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86EFAC"/>
      <stop offset="100%" stop-color="${ground}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>
  <ellipse cx="1080" cy="120" rx="70" ry="70" fill="#FBBF24" opacity="0.95"/>
  <path d="M0 460 Q320 380 640 440 T1280 420 L1280 720 L0 720 Z" fill="url(#hill)"/>
  <path d="M0 520 Q400 470 800 510 T1280 490 L1280 720 L0 720 Z" fill="#22C55E" opacity="0.85"/>
  <g font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">
    ${emojiNodes}
  </g>
  ${labels}
  <text x="640" y="620" font-size="34" fill="#6D28D9" font-family="Comic Sans MS, sans-serif" text-anchor="middle" font-weight="700">${escapeXml(title)}</text>
  <text x="640" y="660" font-size="22" fill="#64748B" font-family="Comic Sans MS, sans-serif" text-anchor="middle">Myanmar Words · Sentences</text>
</svg>
`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

let count = 0;
CHAPTERS.forEach((ch) => {
  const groups = GROUPS[ch.id];
  if (!groups || !groups.length) return;
  const parts = splitList(groups);
  vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-stories.js"), "utf8"), sandbox);
  const stories = sandbox.window.MM_EXPLAINED_STORIES[ch.id] || [];
  parts.forEach((partGroups, idx) => {
    const title = (stories[idx] && stories[idx].title) || `Part ${idx + 1}`;
    const svg = svgScene(ch.id, idx, partGroups, title);
    const out = path.join(ASSETS, `${ch.id}-sent${idx + 1}.svg`);
    fs.writeFileSync(out, svg, "utf8");
    count++;
  });
});

console.log("Generated", count, "sentence scene SVG(s) in assets/");
