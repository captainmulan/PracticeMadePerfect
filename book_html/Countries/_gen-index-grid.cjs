const chapters = [
  ["001", "📖", "Book Briefing", "Introduction"],
  ["002", "📑", "Index", "Chapter List"],
  ["003", "🧳", "Character Selection", "Choose Traveler"],
  ["004", "🎮", "World Map Maker", "Intro Game"],
  ["005", "🌍", "World Overview", "Activity"],
  ["006", "📖", "World Explained", "Reading"],
  ["007", "❓", "World Quiz", "Quiz Time"],
  ["008", "🌏", "Asia", "Activity"],
  ["009", "📖", "Asia Explained", "Reading"],
  ["010", "❓", "Asia Quiz", "Quiz Time"],
  ["011", "🏰", "Europe", "Activity"],
  ["012", "📖", "Europe Explained", "Reading"],
  ["013", "❓", "Europe Quiz", "Quiz Time"],
  ["014", "🦁", "Africa", "Activity"],
  ["015", "📖", "Africa Explained", "Reading"],
  ["016", "❓", "Africa Quiz", "Quiz Time"],
  ["017", "🗽", "North America", "Activity"],
  ["018", "📖", "North America Explained", "Reading"],
  ["019", "❓", "North America Quiz", "Quiz Time"],
  ["020", "🌎", "South America", "Activity"],
  ["021", "📖", "South America Explained", "Reading"],
  ["022", "❓", "South America Quiz", "Quiz Time"],
  ["023", "🦘", "Australia & Oceania", "Activity"],
  ["024", "📖", "Australia Explained", "Reading"],
  ["025", "❓", "Australia Quiz", "Quiz Time"],
  ["026", "🐧", "Antarctica", "Activity"],
  ["027", "📖", "Antarctica Explained", "Reading"],
  ["028", "❓", "Antarctica Quiz", "Quiz Time"],
  ["029", "🗿", "Famous Landmarks", "Activity"],
  ["030", "📖", "Landmarks Explained", "Reading"],
  ["031", "❓", "Landmarks Quiz", "Quiz Time"],
  ["032", "📚", "Conclusion", "Summary"],
  ["033", "🏆", "Overall Quiz", "Final Quiz"],
  ["034", "✈️", "Globe Rush", "Outro Game"],
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
