#!/usr/bin/env node
/* Add storyLong (iPad landscape) to _mmwords-explained-stories.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-stories.js"), "utf8"), sandbox);
const STORIES = sandbox.window.MM_EXPLAINED_STORIES;

const EXTRA = {
  family: [
    " Su listened to pots clatter and elders plan the day in soft voices. She traced each family name in her notebook — mother, father, grandmother — like a song she would carry to school.",
    " Later, cousins chased fireflies while Aunt hummed and Parents washed dishes in warm water. Su practiced every family word aloud until the baby fell asleep in Grandmother's arms.",
    " Uncle drew a family tree in the dust and Cousin copied each branch. Su whispered thanks to her Parents and promised to greet every elder with a smile tomorrow."
  ],
  food: [
    " Su carried a tray of bowls to the gate and bowed as monks passed in the mist. She tasted the word rice on her tongue and felt how sharing food opens the heart.",
    " Steam rose from noodle pots while vendors called prices and children licked sticky mango juice from their fingers. Su wrote food words in her book between sips of tea.",
    " Grandfather saved the last mango slice for Su and Father poured tea for guests. She understood that Myanmar meals are prayers you can eat together."
  ],
  animals: [
    " A buffalo moved slowly through the mud while Su named each creature she saw. Grandmother said respect for animals teaches respect for life.",
    " When thunder rolled, Su stayed inside and drew the cat, dog, and bird from memory. Rain drummed while she practiced each animal word twice.",
    " The teacher smiled as Su pointed to fish, cow, and butterfly on her chart. Every name felt like a promise to care for the village and its living friends."
  ],
  colors: [
    " Su matched each color to something she could touch — red ribbon, blue sky, green leaf. The pagoda glowed gold while she copied words in neat lines.",
    " On the walk home she found pink flowers, purple shadows, and brown puppy paws in the dust. Her brother's silver kite flashed once before the sun hid.",
    " Grandmother mixed paints with Su until their fingers were stained like festival flags. The finished picture hung where every guest could read each color aloud."
  ],
  numbers: [
    " Su counted coins for limes and mangoes while the seller praised her polite voice. Numbers, she learned, are tools for fairness as well as math.",
    " Baby clapped at ten and Grandmother laughed until tears shone. Su missed six once, tried again, and felt numbers become friendly faces.",
    " That night she counted blessings instead of stars — one for Mother, two for Father, on and on until sleep arrived gently."
  ],
  body: [
    " Su touched nose, ears, and eyes in the mirror and giggled at her reflection. The teacher said knowing body words is knowing the map of yourself.",
    " Mother bandaged Su's knee and reminded her to wash hands and brush teeth every day. Even small parts of the body deserve gentle care.",
    " On show day Su sang a song using every body word from head to toes. The class clapped and Su bowed with a heart that beat like a drum."
  ],
  home: [
    " Rain tapped the roof while Su listed each room — kitchen, bathroom, bed — and felt safe under one wooden roof. Home words sounded like shelter.",
    " She swept the floor, folded blankets, and watched Father oil a sticky window. Every room had a job, and Su wanted to help each one.",
    " When guests arrived Su opened the door wide and offered water from the kitchen. The house felt bigger when she spoke its places in Myanmar."
  ],
  school: [
    " Su's bag bounced as she passed the teacher's garden and waved at friends by the gate. School, she thought, is where new words become wings.",
    " She raised her hand, shared a pencil, and read one line aloud in a steady voice. Recess bells rang while she copied English and Myanmar side by side.",
    " Before leaving, Su read to the class and earned a star beside her name. She looked back at glowing windows and felt proud to belong."
  ],
  feelings: [
    " Su named each feeling as it visited — happy, tired, nervous — and breathed until she knew what to do next. Festival drums faded into evening crickets.",
    " Grandmother said feelings are guests: some stay long, some pass quickly. Su felt angry, then calm, then loved, and thanked each lesson.",
    " Under lantern light Su felt proud sharing new words and hopeful after a wrong answer. At bedtime peaceful crickets sang her to sleep."
  ],
  festivals: [
    " Drums beat while Su splashed friends and laughed until her clothes dripped. Grandmother said the water washes old worries away for a bright new year.",
    " Su carried candles along a path of lights to Grandmother's porch and bowed with sweet cakes in both hands. The full moon hung above like a silver bowl.",
    " Paper balloons rose over hills while monks chanted and Su helped weave a small lantern. Festival words, she decided, are wishes spoken aloud with joy."
  ]
};

for (const [chId, sections] of Object.entries(STORIES)) {
  const extras = EXTRA[chId] || [];
  sections.forEach((sec, i) => {
    sec.storyLong = sec.story + (extras[i] || "");
  });
}

function fmt(obj, indent) {
  const pad = " ".repeat(indent);
  const pad2 = " ".repeat(indent + 2);
  const lines = ["{"];
  for (const [k, sections] of Object.entries(obj)) {
    lines.push(`${pad2}${k}: [`);
    sections.forEach((sec) => {
      lines.push(`${pad2}  {`);
      lines.push(`${pad2}    title: ${JSON.stringify(sec.title)},`);
      lines.push(`${pad2}    story:`);
      lines.push(`${pad2}      ${JSON.stringify(sec.story)},`);
      lines.push(`${pad2}    storyLong:`);
      lines.push(`${pad2}      ${JSON.stringify(sec.storyLong)}`);
      lines.push(`${pad2}  },`);
    });
    lines.push(`${pad2}],`);
  }
  lines.push(`${pad}}`);
  return lines.join("\n");
}

const out = `/* Medium stories for Sentences pages — one story per scroll section (3 per chapter) */
(function (w) {
  w.MM_EXPLAINED_STORIES = ${fmt(STORIES, 4)};
})(window);
`;

fs.writeFileSync(path.join(DIR, "_mmwords-explained-stories.js"), out);
console.log("Extended stories with storyLong");
