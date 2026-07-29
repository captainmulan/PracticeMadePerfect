const chapters = [
  ["001", "📖", "Book Briefing", "Introduction"],
  ["002", "📑", "Index", "Chapter List"],
  ["003", "🌍", "Character Selection", "Choose Hero"],
  ["004", "🎮", "Intro Eco Garden", "Intro Game"],
  ["005", "🌍", "Climate Overview", "Activity"],
  ["006", "📖", "Climate Explained", "Reading"],
  ["007", "❓", "Climate Quiz", "Quiz Time"],
  ["008", "🏠", "Greenhouse Effect", "Activity"],
  ["009", "📖", "Greenhouse Explained", "Reading"],
  ["010", "❓", "Greenhouse Quiz", "Quiz Time"],
  ["011", "💨", "Carbon Dioxide", "Activity"],
  ["012", "📖", "Carbon Explained", "Reading"],
  ["013", "❓", "Carbon Quiz", "Quiz Time"],
  ["014", "⛽", "Fossil Fuels", "Activity"],
  ["015", "📖", "Fossil Explained", "Reading"],
  ["016", "❓", "Fossil Quiz", "Quiz Time"],
  ["017", "☀️", "Renewable Energy", "Activity"],
  ["018", "📖", "Renewable Explained", "Reading"],
  ["019", "❓", "Renewable Quiz", "Quiz Time"],
  ["019b", "🌍", "Climate Rescue", "Mid-Book Game"],
  ["020", "🧊", "Melting Ice", "Activity"],
  ["021", "📖", "Ice Explained", "Reading"],
  ["022", "❓", "Ice Quiz", "Quiz Time"],
  ["023", "🌊", "Rising Seas", "Activity"],
  ["024", "📖", "Seas Explained", "Reading"],
  ["025", "❓", "Seas Quiz", "Quiz Time"],
  ["026", "🐻", "Wildlife at Risk", "Activity"],
  ["027", "📖", "Wildlife Explained", "Reading"],
  ["028", "❓", "Wildlife Quiz", "Quiz Time"],
  ["029", "🌱", "Green Future", "Activity"],
  ["030", "📖", "Future Explained", "Reading"],
  ["031", "❓", "Future Quiz", "Quiz Time"],
  ["032", "📚", "Conclusion", "Summary"],
  ["033", "🏆", "Overall Quiz", "Final Quiz"],
  ["034", "🌱", "Eco Planet Rush", "Outro Game"],
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
html = html.replace(/<div class="chapter-grid">[\s\S]*?<\/div>\s*\n\s*<div class="nav-hint">/, `<div class="chapter-grid">\n${grid}\n  </div>\n\n  <div class="nav-hint">`);
fs.writeFileSync(file, html);
console.log("updated index");
