#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");

const books = [
  { id: "percy-jackson-mm-5b7d743d4f", title: "Percy Jackson MM 1", color: "#7c3aed" },
  { id: "percy-jackson-mm-91395c68e0", title: "Percy Jackson MM 2", color: "#7c3aed" },
  { id: "percy-jackson-mm-972d2163dc", title: "Percy Jackson MM 3", color: "#7c3aed" },
  { id: "percy-jackson-mm-ce6c21e4e5", title: "Percy Jackson MM 4", color: "#7c3aed" },
  { id: "percy-jackson-mm-e3a342a38f", title: "Percy Jackson MM 5", color: "#7c3aed" },
  { id: "percy-jackson-mm-fd1b30aa76", title: "Percy Jackson MM 6", color: "#7c3aed" },
  { id: "khin-khin-htoo-16fae0f98b", title: "Khin Khin Htoo 1", color: "#ef4444" },
  { id: "khin-khin-htoo-7e3baff1dc", title: "Khin Khin Htoo 2", color: "#ef4444" },
  { id: "khin-khin-htoo-7f4297305f", title: "Khin Khin Htoo 3", color: "#ef4444" },
  { id: "khin-khin-htoo-91da446dff", title: "Khin Khin Htoo 4", color: "#ef4444" },
  { id: "khin-khin-htoo-9b37c2cf92", title: "Khin Khin Htoo 5", color: "#ef4444" },
  { id: "khin-khin-htoo-a18e0f5039", title: "Khin Khin Htoo 6", color: "#ef4444" },
  { id: "khin-khin-htoo-bde6eaf37d", title: "Khin Khin Htoo 7", color: "#ef4444" },
  { id: "khin-khin-htoo-dae256f361", title: "Khin Khin Htoo 8", color: "#ef4444" },
  { id: "khin-khin-htoo-e8a58f7721", title: "Khin Khin Htoo 9", color: "#ef4444" },
];

function generateSvgCover(title, color) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="360" height="540" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="540" fill="${color}"/>
  <rect x="20" y="20" width="320" height="500" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
  <text x="180" y="250" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
  <text x="180" y="290" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle">📖</text>
</svg>`);
}

const coversDir = path.join(root, "public", "book_covers", "thumbs");
fs.mkdirSync(coversDir, { recursive: true });

async function generateCovers() {
  for (const book of books) {
    const svg = generateSvgCover(book.title, book.color);
    const webpPath = path.join(coversDir, `${book.id}.webp`);
    
    try {
      await sharp(svg)
        .resize(360, 540)
        .webp({ quality: 84 })
        .toFile(webpPath);
      console.log(`Generated WebP cover for ${book.id}`);
    } catch (err) {
      console.error(`Failed to generate cover for ${book.id}:`, err);
    }
  }
}

generateCovers().then(() => {
  const exportPath = "public/data/indexeddb-export.json";
  const exportData = JSON.parse(fs.readFileSync(path.join(root, exportPath), "utf8"));

  for (const book of books) {
    const course = exportData.courses.find(c => c.id === book.id);
    if (course) {
      course.coverImageUrl = `/book_covers/thumbs/${book.id}.webp`;
      course.coverColorStart = book.color;
      course.coverColorMiddle = book.color;
      course.coverColorEnd = book.color;
    }
  }

  fs.writeFileSync(path.join(root, exportPath), JSON.stringify(exportData, null, 2) + "\n", "utf8");

  const deployPath = "deploy/indexeddb-export.json";
  const deployData = JSON.parse(fs.readFileSync(path.join(root, deployPath), "utf8"));
  for (const book of books) {
    const course = deployData.courses.find(c => c.id === book.id);
    if (course) {
      course.coverImageUrl = `/book_covers/thumbs/${book.id}.webp`;
      course.coverColorStart = book.color;
      course.coverColorMiddle = book.color;
      course.coverColorEnd = book.color;
    }
  }
  fs.writeFileSync(path.join(root, deployPath), JSON.stringify(deployData, null, 2) + "\n", "utf8");

  const homePath = "public/data/home-catalog.json";
  const homeCatalog = JSON.parse(fs.readFileSync(path.join(root, homePath), "utf8"));
  for (const book of books) {
    const course = homeCatalog.courses.find(c => c.id === book.id);
    if (course) {
      course.coverImageUrl = `/book_covers/thumbs/${book.id}.webp`;
      course.coverColorStart = book.color;
      course.coverColorMiddle = book.color;
      course.coverColorEnd = book.color;
    }
  }
  homeCatalog.exportedAt = new Date().toISOString();
  fs.writeFileSync(path.join(root, homePath), JSON.stringify(homeCatalog, null, 2) + "\n", "utf8");

  for (const book of books) {
    const course = exportData.courses.find(c => c.id === book.id);
    if (course) {
      fs.writeFileSync(
        path.join(root, `public/data/course-details/${encodeURIComponent(book.id)}.json`),
        JSON.stringify(course, null, 2) + "\n",
        "utf8"
      );
    }
  }

  fs.writeFileSync(
    path.join(root, "public/data/catalog-version.json"),
    JSON.stringify({
      exportedAt: `${new Date().toISOString()}:covers-added`,
      courseCount: exportData.courses.length,
    }),
    "utf8"
  );

  console.log("\nGenerated covers and updated all metadata files");
  console.log("Next: Clear IndexedDB in browser to see changes");
});
