const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const exportPath = path.join(root, "public", "data", "indexeddb-export.json");
const versionPath = path.join(root, "public", "data", "catalog-version.json");
const outPath = path.join(root, "public", "data", "home-catalog.json");

const SUMMARY_KEYS = [
  "id",
  "title",
  "description",
  "color",
  "coverColorStart",
  "coverColorMiddle",
  "coverColorEnd",
  "coverWidth",
  "coverHeight",
  "coverImageUrl",
  "icon",
  "iconColorStart",
  "iconColorMiddle",
  "iconColorEnd",
  "iconSize",
  "iconPosition",
  "courseIndex",
    "authorName",
    "category",
  "pIndex",
  "artifactType",
  "bookHtmlFolder",
  "stepCount",
];

function pickSummary(course) {
  const out = {};
  for (const key of SUMMARY_KEYS) {
    if (Object.prototype.hasOwnProperty.call(course, key) && course[key] !== undefined) {
      out[key] = course[key];
    }
  }
  return out;
}

function isPopular(course) {
  return typeof course.pIndex === "number" && course.pIndex > 0;
}

function sortCourses(courses) {
  const popular = courses.filter(isPopular).sort((a, b) => {
    if (a.pIndex !== b.pIndex) return a.pIndex - b.pIndex;
    return (a.courseIndex ?? 0) - (b.courseIndex ?? 0);
  });
  const rest = courses.filter((c) => !isPopular(c)).sort((a, b) => {
    return (a.courseIndex ?? 0) - (b.courseIndex ?? 0);
  });
  return [...popular, ...rest];
}

if (!fs.existsSync(exportPath)) {
  console.error("Missing export:", exportPath);
  process.exit(1);
}

const exportData = JSON.parse(fs.readFileSync(exportPath, "utf8"));
let exportedAt = exportData.exportedAt;
if (fs.existsSync(versionPath)) {
  try {
    const version = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    if (version.exportedAt) exportedAt = version.exportedAt;
  } catch (err) {
    console.warn("Could not read catalog-version.json, using export exportedAt");
  }
}

const courses = sortCourses((exportData.courses || []).map(pickSummary));
const catalog = { exportedAt, courses };

fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log("Wrote", outPath);
console.log("courses:", courses.length);
console.log("exportedAt:", exportedAt);
