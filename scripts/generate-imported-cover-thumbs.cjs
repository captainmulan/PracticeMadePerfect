#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "public", "data", "indexeddb-export.json");
const coversRoot = path.join(root, "public", "book_covers");
const thumbsRoot = path.join(coversRoot, "thumbs");
const ids = process.argv.slice(2);

async function main() {
  if (ids.length === 0) throw new Error("Pass one or more catalog book IDs.");
  const sharp = require("sharp");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const booksById = new Map((catalog.courses || []).map((course) => [course.id, course]));
  fs.mkdirSync(thumbsRoot, { recursive: true });

  for (const id of ids) {
    const course = booksById.get(id);
    if (!course) throw new Error(`Book not found in local catalog: ${id}`);
    const coverUrl = String(course.coverImageUrl || "");
    const match = coverUrl.match(/^\/book_covers\/([^/]+\.(?:png|jpe?g|webp))$/i);
    if (!match) {
      if (!coverUrl) continue;
      throw new Error(`Unsupported cover path for ${id}: ${coverUrl}`);
    }

    const source = path.join(coversRoot, match[1]);
    if (!fs.existsSync(source)) throw new Error(`Missing source cover for ${id}: ${source}`);
    const destination = path.join(thumbsRoot, `${id}.webp`);
    await sharp(fs.readFileSync(source))
      .rotate()
      .resize({ width: 360, withoutEnlargement: false, fit: "inside" })
      .webp({ quality: 58, effort: 6 })
      .toFile(destination);
    console.log(`${id}: wrote book_covers/thumbs/${id}.webp`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});