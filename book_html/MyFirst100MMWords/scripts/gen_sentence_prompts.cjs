#!/usr/bin/env node
/* Photorealistic prompts for Sentences page images — unique scenes, not reused from Words (seg) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-data.js"), "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-stories.js"), "utf8"), sandbox);

const STYLE =
  "Detailed realistic digital painting, Myanmar Burmese village and daily life, warm golden natural light, rich textures, premium children's educational picture book quality, cinematic 16:9 widescreen composition, no text, no labels, no watermark, no cartoon emoji";

const SCENES = {
  family: [
    "Dawn in a Myanmar teak wooden house: Burmese mother stirring rice over a clay stove, father sweeping the yard, grandmother feeding chickens near a fence, grandfather with tea on the porch, roosters and misty green hills, multigenerational family morning",
    "Thadingyut full-moon festival night at a Myanmar home: paper lanterns glowing, young Burmese girl bowing and offering a candle to smiling grandmother, aunt carrying sweet rice cakes, baby watching colored lights, warm family candlelight indoors",
    "Evening Myanmar family feast under a thatched roof: uncle laughing at table, grandfather unrolling a hand-drawn family tree chart, parents clearing dishes, cousins playing nearby, oil lamps and happy multi-generational gathering"
  ],
  food: [
    "Sunrise Myanmar village gate: mother scooping rice into alms bowls, father pouring water for barefoot monks in maroon robes walking past, steam from soup pot, misty morning kindness and sharing",
    "Busy Burmese tea shop at dawn: steam rising from mohinga noodle pots, warm bread on counter, fried egg sizzling, farmers trading vegetables outside, girl sipping sweet milk tea, vibrant market street",
    "Myanmar family dinner circle on a mat: shared rice bowl in center, fish and soup dishes, grandmother slicing ripe mango, grandfather holding tea cup, guests being served water, warm communal meal"
  ],
  animals: [
    "Shaded Myanmar village under a large tamarind tree: gentle elephant at field edge, sleeping cat in sun, dog chasing butterfly, birds in branches, buffalo in distant mud, peaceful rural animal scene",
    "Monsoon rain at Myanmar pond: cat curled on lap inside wooden house, dog shaking wet fur on porch, fish ripples in pond, frog on steps, horse waiting in rain, lush green storm atmosphere",
    "After-storm Myanmar school outing to a village pond: children watching fish, ducks paddling, teacher pointing at story scroll with tiger illustration, ox cart passing, respectful nature learning"
  ],
  colors: [
    "Myanmar sunrise over golden Shwedagon-style pagoda, red festival ribbons on a girl's hair, pale blue sky, green rice paddies below, marigold orange flowers at market stall, vibrant color study",
    "Burmese village path at dusk: pink bougainvillea on fence, purple shadows under trees, brown puppy and sandals, grandmother's grey shawl, silver kite flashing in sunset sky",
    "Indoor Myanmar craft scene: grandmother and girl mixing paints, pink lotus petals and green leaves on paper, gold pagoda roof painted on canvas, art supplies and jasmine flowers"
  ],
  numbers: [
    "Myanmar market stall with neatly counted mangoes in baskets numbered one to ten, Burmese girl counting coins with vendor, bright tropical fruit piles, polite bargaining scene",
    "Home interior Myanmar: coins laid on woven mat for counting lesson, father teaching with fingers, grandmother quizzing numbers, baby clapping, warm family math moment",
    "Night sky from Myanmar wooden house balcony: girl counting stars, oil lamp nearby, quiet village below, peaceful numeracy and gratitude mood"
  ],
  body: [
    "Myanmar school hall dance warm-up: girls stretching arms and fingers, tapping feet, looking in mirror touching nose and ears, teacher guiding posture, bright community school",
    "Myanmar home care scene: mother washing child's hands before meal, brushing teeth after mango, bandaged knee from small scrape, gentle body-care lesson at kitchen door",
    "School show day Myanmar: proud girl singing on small stage, hand on chest, audience of families, gold afternoon light through windows, celebration of voice and body"
  ],
  home: [
    "Monsoon on Myanmar teak house: rain on tin roof, girl reading in cozy room, water on door step, ginger smell from kitchen, steam on bathroom mirror, safe home atmosphere",
    "Myanmar family chores: sweeping floor, folding bed linens, father fixing window latch, mother arranging chairs in hall, teamwork maintaining a welcoming house",
    "Guests arriving at Myanmar home during rain: wide open door, water offered in kitchen, neighbors in living area, warm hospitality and dry shelter"
  ],
  school: [
    "Myanmar village path to school at dawn: girl with backpack and friend walking past teacher's garden, roosters crowing, golden pagoda in distance, morning journey to learn",
    "Bilingual Myanmar classroom: teacher at whiteboard with English and Myanmar lines, girl raising hand, classmate sharing pencil, library corner with books, focused learning",
    "Afternoon Myanmar classroom: girl reading aloud to classmates, teacher marking star by name, friends clapping, windows glowing gold, proud literacy moment"
  ],
  feelings: [
    "Myanmar village festival day: crowded colorful street, girl smiling then tired, lost ribbon found by brother, fireworks glow, mix of joy and excitement in crowd",
    "Quiet Myanmar home interior: girl mending toy with tape after anger, hug from mother after cousin leaves, shy hello to new teacher, gentle emotional learning",
    "Thadingyut evening lights: girl proudly sharing new words, friend encouraging after mistake, peaceful crickets at bedtime, lantern glow on faces"
  ],
  festivals: [
    "Thingyan water festival Myanmar street: children splashing water joyfully, drums and flower bowls, everyone wet and laughing, golden pagoda visible, New Year celebration energy",
    "Thadingyut candlelight procession Myanmar: girl carrying candle to elder's home, full moon above pagoda, paths lined with lights, families reuniting with sweet cakes",
    "Tazaungdaing night Myanmar hills: paper fire balloons rising into dark sky, monks at monastery, children weaving small lantern, stars and community wishes"
  ]
};

const stories = sandbox.window.MM_EXPLAINED_STORIES;
const out = [];

for (const ch of sandbox.window.MM_CHAPTERS) {
  const hints = SCENES[ch.id];
  const secs = stories[ch.id] || [];
  if (!hints) continue;
  hints.forEach((scene, i) => {
    const title = (secs[i] && secs[i].title) || `Part ${i + 1}`;
    out.push({
      chapter: ch.id,
      chapterTitle: ch.title,
      slot: `sent${i + 1}`,
      file: `${ch.id}-sent${i + 1}.png`,
      title,
      prompt: `${scene}. ${STYLE}`
    });
  });
}

const jsonPath = path.join(DIR, "scripts", "sentence-image-prompts.json");
fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2));
console.log("Wrote", out.length, "prompts to", path.basename(jsonPath));
