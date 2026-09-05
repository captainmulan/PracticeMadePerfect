const chapters = [
  ["001", "📖", "Book Briefing", "Introduction"],
  ["002", "📑", "Index", "Chapter List"],
  ["003", "🤿", "Character Selection", "Choose Diver"],
  ["004", "🎮", "Reef Defender", "Intro Game"],
  ["005", "🌊", "Ocean Overview", "Activity"],
  ["006", "📖", "Ocean Explained", "Reading"],
  ["007", "❓", "Ocean Quiz", "Quiz Time"],
  ["008", "☀️", "Sunlight Zone", "Activity"],
  ["009", "📖", "Sunlight Explained", "Reading"],
  ["010", "❓", "Sunlight Quiz", "Quiz Time"],
  ["011", "🌅", "Twilight Zone", "Activity"],
  ["012", "📖", "Twilight Explained", "Reading"],
  ["013", "❓", "Twilight Quiz", "Quiz Time"],
  ["014", "🌙", "Midnight Zone", "Activity"],
  ["015", "📖", "Midnight Explained", "Reading"],
  ["016", "❓", "Midnight Quiz", "Quiz Time"],
  ["017", "🕳️", "Abyss Zone", "Activity"],
  ["018", "📖", "Abyss Explained", "Reading"],
  ["019", "❓", "Abyss Quiz", "Quiz Time"],
  ["019b", "🤿", "Zone Dive", "Mid-Book Game"],
  ["020", "⛰️", "Hadal Zone", "Activity"],
  ["021", "📖", "Hadal Explained", "Reading"],
  ["022", "❓", "Hadal Quiz", "Quiz Time"],
  ["023", "🪸", "Coral Reefs", "Activity"],
  ["024", "📖", "Coral Explained", "Reading"],
  ["025", "❓", "Coral Quiz", "Quiz Time"],
  ["026", "🐬", "Marine Mammals", "Activity"],
  ["027", "📖", "Mammals Explained", "Reading"],
  ["028", "❓", "Mammals Quiz", "Quiz Time"],
  ["029", "🐟", "Fish", "Activity"],
  ["030", "📖", "Fish Explained", "Reading"],
  ["031", "❓", "Fish Quiz", "Quiz Time"],
  ["032", "📚", "Conclusion", "Summary"],
  ["033", "🏆", "Overall Quiz", "Final Quiz"],
  ["034", "💎", "Treasure Rush", "Outro Game"],
  ["035", "🎉", "Congratulations", "You Did It!"],
];
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "002-Index.html");
let html = fs.readFileSync(file, "utf8");
const grid = chapters
  .map(
    (c) =>
      `    <div class="chapter-card"><div class="chapter-number">${c[0]}</div><div class="chapter-emoji">${c[1]}</div><div class="chapter-title">${c[2]}</div><div class="chapter-concept">${c[3]}</div></div>`,
  )
  .join("\n\n");
html = html.replace(/<div class="chapter-grid">[\s\S]*?<\/div>\s*\n<div class="nav-hint">/, `<div class="chapter-grid">\n${grid}\n  </div>\n\n<div class="nav-hint">`);
fs.writeFileSync(file, html);
console.log("updated index");
