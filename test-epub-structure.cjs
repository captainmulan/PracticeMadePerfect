#!/usr/bin/env node
// Test script to verify EPUB import structure
const fs = require("fs");
const path = require("path");

console.log("Checking existing EPUB book structure (Narnia)...");
const narniaData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "public/data/course-details/narnia-lion.json"), "utf8")
);

console.log(`Narnia book structure:`);
console.log(`- Chapters: ${narniaData.chapters.length}`);
console.log(`- Steps in chapter 0: ${narniaData.chapters[0].steps.length}`);
console.log(`- Total stepCount: ${narniaData.stepCount}`);
console.log(`- Chapter 0 title: ${narniaData.chapters[0].title}`);
console.log(`- Step 0 title: ${narniaData.chapters[0].steps[0].title}`);
console.log(`- Step 0 content: ${narniaData.chapters[0].steps[0].contentHtml.substring(0, 100)}...`);

console.log("\n✓ Expected structure: 1 chapter with multiple steps (all in one chapter)");
console.log("  This allows the EPUB viewer to handle pagination internally.");
