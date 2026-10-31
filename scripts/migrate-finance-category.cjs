const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const categoryFields = ["cat1", "cat2", "cat3", "cat4"];
const exportPaths = [
  "deploy/indexeddb-export.json",
  "public/data/indexeddb-export.json",
  "cloudflare-dist/data/indexeddb-export.json",
];
const catalogPaths = [
  "public/data/home-catalog.json",
  "cloudflare-dist/data/home-catalog.json",
];
const detailDirectories = [
  "public/data/course-details",
  "cloudflare-dist/data/course-details",
];

function normalizeTag(tag) {
  const normalized = String(tag ?? "").trim();
  return normalized.toLowerCase() === "finance"
    ? "Personal Growth"
    : normalized;
}

function normalizeCourse(course) {
  let changed = false;
  if (typeof course.category === "string") {
    const seen = new Set();
    const tags = course.category
      .split(",")
      .map(normalizeTag)
      .filter((tag) => {
        const key = String(tag).toLowerCase();
        if (!tag || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const category = tags.join(", ");
    if (category !== course.category) {
      course.category = category;
      changed = true;
    }
  }
  for (const field of categoryFields) {
    if (typeof course[field] !== "string") continue;
    const value = normalizeTag(course[field]);
    if (value !== course[field]) {
      course[field] = value;
      changed = true;
    }
  }
  return changed;
}

function migrateJson(relativePath, isExport = false) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return 0;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const courses = Array.isArray(data) ? data : Array.isArray(data.courses) ? data.courses : [data];
  let changedCount = 0;
  for (const course of courses) {
    if (course && typeof course === "object" && normalizeCourse(course)) changedCount += 1;
  }
  if (changedCount > 0) {
    if (isExport && typeof data.exportedAt === "string") {
      data.exportedAt = `${data.exportedAt.replace(/:personal-growth-category$/, "")}:personal-growth-category`;
    }
    const isDetail = relativePath.includes(`${path.sep}course-details${path.sep}`);
    const serialized = isDetail ? JSON.stringify(data) : `${JSON.stringify(data, null, 2)}\n`;
    fs.writeFileSync(filePath, serialized, "utf8");
    console.log(`${relativePath}: normalized ${changedCount} course record(s)`);
  }
  return changedCount;
}

function walkJson(directory, callback) {
  const fullPath = path.join(root, directory);
  if (!fs.existsSync(fullPath)) return;
  for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkJson(relativePath, callback);
    else if (entry.name.endsWith(".json")) callback(relativePath);
  }
}

for (const relativePath of exportPaths) migrateJson(relativePath, true);
for (const relativePath of catalogPaths) migrateJson(relativePath);
for (const directory of detailDirectories) {
  walkJson(directory, (relativePath) => migrateJson(relativePath));
}

const migratedExportPath = path.join(root, "deploy/indexeddb-export.json");
const migratedExport = JSON.parse(fs.readFileSync(migratedExportPath, "utf8"));
const catalogVersion = {
  exportedAt: `${migratedExport.exportedAt}:shelf-index-v2`,
  courseCount: migratedExport.courses?.length ?? 0,
};
for (const relativePath of ["public/data/catalog-version.json", "cloudflare-dist/data/catalog-version.json"]) {
  const filePath = path.join(root, relativePath);
  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(catalogVersion), "utf8");
  }
}

require("./generate-home-catalog.cjs");
const cloudflareHomeCatalog = path.join(root, "cloudflare-dist/data/home-catalog.json");
if (fs.existsSync(cloudflareHomeCatalog)) {
  fs.copyFileSync(path.join(root, "public/data/home-catalog.json"), cloudflareHomeCatalog);
}