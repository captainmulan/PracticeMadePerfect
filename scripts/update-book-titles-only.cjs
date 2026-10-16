#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// Update titles only
const bookUpdates = [
  { id: "khin-khin-htoo-16fae0f98b", title: "ကြာဆစ်ကြိုး", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-7e3baff1dc", title: "ခမည်းကြိုး", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-7f4297305f", title: "ဆူးပန်းခွေ", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-91da446dff", title: "တောမင်းသမီး", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-9b37c2cf92", title: "ပန်းကြာဝတ်မှုန်", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-a18e0f5039", title: "မင်္ဂလာလှည်း", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-bde6eaf37d", title: "မအိမ်ကံ", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-dae256f361", title: "အညာသူအညာသား ကျွန်မဆွေမျိုးများ", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-e8a58f7721", title: "အဝေးကမှန်းဟိုရွာလမ်း ထီးတန်းကြီးလှပါဘိ", author: "Khin Khin Htoo" },
  { id: "percy-jackson-mm-5b7d743d4f", title: "ပါစီဂျက်ဆန် နှင့် အိုလံပစ် နတ်ဘုရားများ - ကမ္ဘာဦးကျိန်စာ", author: "Rick Riordan" },
  { id: "percy-jackson-mm-91395c68e0", title: "ပါစီဂျက်ဆန် နှင့် အိုလံပစ် နတ်ဘုရားများ - ဒမ်မီဂေါ့မှတ်စုများ", author: "Rick Riordan" },
  { id: "percy-jackson-mm-972d2163dc", title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ် နတ်ဘုရားများ မိစ္ဆာပင်လယ်", author: "Rick Riordan" },
  { id: "percy-jackson-mm-ce6c21e4e5", title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ် နတ်ဘုရားများ မိုးကြိုးခိုးသူ", author: "Rick Riordan" },
  { id: "percy-jackson-mm-e3a342a38f", title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ်နတ်ဘုရားများ - ကျိန်စာသင့်ဓား", author: "Rick Riordan" },
  { id: "percy-jackson-mm-fd1b30aa76", title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ်နတ်ဘုရားများ - မှော်ဝင်္ကပါတိုက်ပွဲ", author: "Rick Riordan" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

// Load export
const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);

for (const update of bookUpdates) {
  const course = exportData.courses.find(c => c.id === update.id);
  if (course) {
    course.title = update.title;
    course.description = `${update.title} by ${update.author}`;
    course.authorName = update.author;
    console.log(`Updated ${update.id}: ${update.title}`);
  }
}

// Save export
exportData.exportedAt = new Date().toISOString();
writeJson(exportPath, exportData, true);

// Update deploy
const deployPath = "deploy/indexeddb-export.json";
const deployData = readJson(deployPath);
for (const update of bookUpdates) {
  const course = deployData.courses.find(c => c.id === update.id);
  const updated = exportData.courses.find(c => c.id === update.id);
  if (course && updated) {
    course.title = updated.title;
    course.description = updated.description;
    course.authorName = updated.author;
  }
}
deployData.exportedAt = exportData.exportedAt;
writeJson(deployPath, deployData, true);

// Update home catalog
const homePath = "public/data/home-catalog.json";
const homeCatalog = readJson(homePath);
for (const update of bookUpdates) {
  const course = homeCatalog.courses.find(c => c.id === update.id);
  const updated = exportData.courses.find(c => c.id === update.id);
  if (course && updated) {
    course.title = updated.title;
    course.description = updated.description;
  }
}
homeCatalog.exportedAt = exportData.exportedAt;
writeJson(homePath, homeCatalog, true);

// Update course details
for (const update of bookUpdates) {
  const course = exportData.courses.find(c => c.id === update.id);
  if (course) {
    writeJson(`public/data/course-details/${encodeURIComponent(update.id)}.json`, course);
  }
}

// Update catalog version
writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:real-titles`,
  courseCount: exportData.courses.length,
});

console.log("\nUpdated all book titles to real Myanmar names");
console.log("Next: Clear IndexedDB in browser to see changes");
