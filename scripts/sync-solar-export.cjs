const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const solarDir = path.join(root, "book_html", "SolarSystem");
const exportPaths = [
  path.join(root, "public", "data", "indexeddb-export.json"),
  path.join(root, "deploy", "indexeddb-export.json"),
];

const htmlByPage = new Map();
for (const file of fs.readdirSync(solarDir)) {
  const match = file.match(/^(\d{3})-.*\.html$/i);
  if (!match) continue;
  const pageNum = Number.parseInt(match[1], 10);
  htmlByPage.set(pageNum, fs.readFileSync(path.join(solarDir, file), "utf8"));
}

for (const exportPath of exportPaths) {
  if (!fs.existsSync(exportPath)) {
    console.log("skip missing", exportPath);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(exportPath, "utf8"));
  const course = data.courses.find((item) => item.id === "solarsystem");
  if (!course) {
    console.log("solarsystem course not found in", exportPath);
    continue;
  }
  let updated = 0;
  for (const chapter of course.chapters) {
    for (const step of chapter.steps) {
      if (step.stepType !== "html") continue;
      const html = htmlByPage.get(step.stepIndex);
      if (!html) continue;
      if (step.contentHtml !== html) {
        step.contentHtml = html;
        updated += 1;
      }
    }
  }
  fs.writeFileSync(exportPath, JSON.stringify(data, null, 2), "utf8");
  console.log("updated", updated, "steps in", exportPath);
}
