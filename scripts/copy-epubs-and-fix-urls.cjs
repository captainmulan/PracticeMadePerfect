#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// Copy Khin Khin Htoo EPUBs
const khinKhinHtooBooks = [
  { id: "khin-khin-htoo-16fae0f98b", epubFile: "ကြာဆစ်ကြိုး.epub" },
  { id: "khin-khin-htoo-7e3baff1dc", epubFile: "ခမည်းကြိုး.epub" },
  { id: "khin-khin-htoo-7f4297305f", epubFile: "ဆူးပန်းခွေ.epub" },
  { id: "khin-khin-htoo-91da446dff", epubFile: "တောမင်းသမီး.epub" },
  { id: "khin-khin-htoo-9b37c2cf92", epubFile: "ပန်းကြာဝတ်မှုန်.epub" },
  { id: "khin-khin-htoo-a18e0f5039", epubFile: "မင်္ဂလာလှည်း.epub" },
  { id: "khin-khin-htoo-bde6eaf37d", epubFile: "မအိမ်ကံ.epub" },
  { id: "khin-khin-htoo-dae256f361", epubFile: "အညာသူအညာသား ကျွန်မဆွေမျိုးများ.epub" },
  { id: "khin-khin-htoo-e8a58f7721", epubFile: "အဝေးကမှန်းဟိုရွာလမ်း ထီးတန်းကြီးလှပါဘိ.epub" },
];

const sourceDir = "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo";

for (const book of khinKhinHtooBooks) {
  const sourceEpub = path.join(sourceDir, book.epubFile);
  const destEpub = path.join(root, "book_html", "Other", book.id, "book.epub");
  
  if (!fs.existsSync(sourceEpub)) {
    console.warn(`Source not found: ${sourceEpub}`);
    continue;
  }
  
  fs.mkdirSync(path.dirname(destEpub), { recursive: true });
  fs.copyFileSync(sourceEpub, destEpub);
  console.log(`Copied ${book.epubFile} to ${book.id}`);
}

console.log("\nEPUB files copied");
console.log("Next: Clear IndexedDB in browser to see changes");
