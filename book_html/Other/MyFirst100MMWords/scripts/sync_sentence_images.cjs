#!/usr/bin/env node
/* DEPRECATED: do not copy seg images. Use unique sent PNGs from scripts/sentence-image-prompts.json + GenerateImage. */
console.error("sync_sentence_images.cjs is deprecated.");
console.error("Generate unique art: node scripts/gen_sentence_prompts.cjs");
console.error("Then create assets/{chapter}-sent{1,2,3}.png (see scripts/sentence-image-prompts.json).");
process.exit(1);
