#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "public", "data", "indexeddb-export.json");
const outputRoots = [
  path.join(root, "public", "data", "course-details"),
  path.join(root, "dist", "data", "course-details"),
];

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Missing catalog export: ${sourcePath}`);
}

const exportData = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const courses = Array.isArray(exportData.courses) ? exportData.courses : [];
for (const outputRoot of outputRoots) {
  fs.mkdirSync(outputRoot, { recursive: true });
  for (const file of fs.readdirSync(outputRoot)) {
    if (file.endsWith(".json")) fs.unlinkSync(path.join(outputRoot, file));
  }
}

for (const course of courses) {
  if (!course?.id) continue;
  const fileName = `${encodeURIComponent(course.id)}.json`;
  const payload = JSON.stringify(course);
  for (const outputRoot of outputRoots) {
    fs.writeFileSync(path.join(outputRoot, fileName), payload + "\n", "utf8");
  }
}

console.log(`Wrote ${courses.length} per-course detail files.`);
