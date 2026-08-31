#!/usr/bin/env node
/* Renumber Ocean Adventure HTML after inserting Hadal Zone triplet at 020-022 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;

const renames = [
  ["032-Congratulations.html", "035-Congratulations.html"],
  ["031-Outro-OceanTreasureRush.html", "034-Outro-OceanTreasureRush.html"],
  ["030-Ocean-Overall-Quiz.html", "033-Ocean-Overall-Quiz.html"],
  ["029-Conclusion.html", "032-Conclusion.html"],
  ["028-Fish-Quiz.html", "031-Fish-Quiz.html"],
  ["027-Fish-Explained.html", "030-Fish-Explained.html"],
  ["026-Fish.html", "029-Fish.html"],
  ["025-Marine-Mammals-Quiz.html", "028-Marine-Mammals-Quiz.html"],
  ["024-Marine-Mammals-Explained.html", "027-Marine-Mammals-Explained.html"],
  ["023-Marine-Mammals.html", "026-Marine-Mammals.html"],
  ["022-Coral-Reefs-Quiz.html", "025-Coral-Reefs-Quiz.html"],
  ["021-Coral-Reefs-Explained.html", "024-Coral-Reefs-Explained.html"],
  ["020-Coral-Reefs.html", "023-Coral-Reefs.html"],
];

renames.forEach(([from, to]) => {
  const src = path.join(DIR, from);
  const dst = path.join(DIR, to);
  if (!fs.existsSync(src)) {
    console.warn("Skip missing:", from);
    return;
  }
  if (fs.existsSync(dst)) fs.unlinkSync(dst);
  fs.renameSync(src, dst);
  console.log(from, "->", to);
});
console.log("Renumber complete — slots 020-022 free for Hadal Zone");
