#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "public", "data", "indexeddb-export.json");
const outputRoot = path.join(root, "public", "data", "course-details");
const ids = process.argv.slice(2);

if (ids.length === 0) throw new Error("Pass one or more catalog book IDs.");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const booksById = new Map((catalog.courses || []).map((course) => [course.id, course]));
fs.mkdirSync(outputRoot, { recursive: true });

for (const id of ids) {
  const course = booksById.get(id);
  if (!course) throw new Error(`Book not found in local catalog: ${id}`);
  const fileName = `${encodeURIComponent(course.id)}.json`;
  fs.writeFileSync(path.join(outputRoot, fileName), `${JSON.stringify(course)}\n`, "utf8");
  console.log(`${id}: wrote data/course-details/${fileName}`);
}