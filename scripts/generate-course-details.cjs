#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "public", "data", "indexeddb-export.json");
const outputRoots = [
  path.join(root, "public", "data", "course-details"),
  path.join(root, "dist", "data", "course-details"),
];

function courseDetailFileName(courseId) {
  const encodedId = encodeURIComponent(courseId);
  if (/^[\x00-\x7F]*$/.test(courseId) && encodedId.length <= 180) return `${encodedId}.json`;

  let firstHash = 2166136261;
  let secondHash = 2166136261 ^ 0x9e3779b9;
  for (let index = 0; index < courseId.length; index += 1) {
    const codeUnit = courseId.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ codeUnit, 16777619) >>> 0;
    secondHash = Math.imul(secondHash ^ codeUnit, 16777619) >>> 0;
  }
  const hash = `${firstHash.toString(16).padStart(8, "0")}${secondHash.toString(16).padStart(8, "0")}`;
  return `id-${hash}.json`;
}

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
  const fileName = courseDetailFileName(course.id);
  const payload = JSON.stringify(course);
  for (const outputRoot of outputRoots) {
    fs.writeFileSync(path.join(outputRoot, fileName), payload + "\n", "utf8");
  }
}

console.log(`Wrote ${courses.length} per-course detail files.`);
