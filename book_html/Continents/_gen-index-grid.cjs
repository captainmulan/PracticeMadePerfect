const chapters = [
  ["001", "📖", "Book Briefing", "Introduction"],
  ["002", "📑", "Index", "Chapter List"],
  ["003", "🧭", "Character Selection", "Choose Explorer"],
  ["004", "🎮", "World Map Maker", "Intro Game"],
  ["005", "🌍", "Continents Overview", "Activity"],
  ["006", "📖", "Continents Explained", "Reading"],
  ["007", "❓", "Continents Quiz", "Quiz Time"],
  ["008", "🦁", "Africa", "Activity"],
  ["009", "📖", "Africa Explained", "Reading"],
  ["010", "❓", "Africa Quiz", "Quiz Time"],
  ["011", "🐼", "Asia", "Activity"],
  ["012", "📖", "Asia Explained", "Reading"],
  ["013", "❓", "Asia Quiz", "Quiz Time"],
  ["014", "🏰", "Europe", "Activity"],
  ["015", "📖", "Europe Explained", "Reading"],
  ["016", "❓", "Europe Quiz", "Quiz Time"],
  ["019b", "🗺️", "Continent Trek", "Mid Game"],
  ["017", "🦅", "North America", "Activity"],
  ["018", "📖", "N. America Explained", "Reading"],
  ["019", "❓", "N. America Quiz", "Quiz Time"],
  ["020", "🦙", "South America", "Activity"],
  ["021", "📖", "S. America Explained", "Reading"],
  ["022", "❓", "S. America Quiz", "Quiz Time"],
  ["023", "🐧", "Antarctica", "Activity"],
  ["024", "📖", "Antarctica Explained", "Reading"],
  ["025", "❓", "Antarctica Quiz", "Quiz Time"],
  ["026", "🦘", "Australia", "Activity"],
  ["027", "📖", "Australia Explained", "Reading"],
  ["028", "❓", "Australia Quiz", "Quiz Time"],
  ["029", "⛰️", "Landforms", "Activity"],
  ["030", "📖", "Landforms Explained", "Reading"],
  ["031", "❓", "Landforms Quiz", "Quiz Time"],
  ["032", "📚", "Conclusion", "Summary"],
  ["033", "🏆", "Overall Quiz", "Final Quiz"],
  ["034", "🗺️", "Globe Rush", "Outro Game"],
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
