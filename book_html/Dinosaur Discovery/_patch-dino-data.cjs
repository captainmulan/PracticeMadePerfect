#!/usr/bin/env node
/* Add Ocean/MMWords fields: segments, words, opponent, parentTip, quiz options */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FILE = path.join(__dirname, "_dino-data.js");
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(FILE, "utf8"), sandbox);
const chapters = sandbox.window.DINO_CHAPTERS;

const WORDS = {
  "what-are-dinosaurs": [
    ["dinosaur", "Mesozoic", "reptile", "fossil"],
    ["fossil", "skeleton", "paleontologist", "bones"],
    ["birds", "theropod", "feathers", "evolution"]
  ],
  triassic: [
    ["Pangea", "Triassic", "desert", "continent"],
    ["footprints", "Coelophysis", "tracks", "hunter"],
    ["mammals", "survival", "burrow", "dry"]
  ],
  jurassic: [
    ["Jurassic", "ferns", "forest", "humid"],
    ["Brachiosaurus", "sauropod", "long neck", "giant"],
    ["Stegosaurus", "plates", "thagomizer", "herbivore"]
  ],
  cretaceous: [
    ["flowers", "Cretaceous", "angiosperms", "plants"],
    ["T-Rex", "predator", "tyrannosaur", "bite"],
    ["Triceratops", "horns", "frill", "herd"]
  ],
  fossils: [
    ["fossil", "remains", "rock", "preserved"],
    ["layers", "strata", "geology", "time"],
    ["imprint", "trace fossil", "fern", "mold"]
  ],
  paleontology: [
    ["excavation", "dig site", "brush", "map"],
    ["tools", "GPS", "notebook", "field"],
    ["laboratory", "prepare", "scan", "specimen"]
  ],
  "dinosaur-eggs": [
    ["nest", "eggs", "clutch", "brood"],
    ["hatching", "egg tooth", "baby", "shell"],
    ["incubation", "shape", "porous", "warm"]
  ],
  "plant-eaters": [
    ["herbivore", "Brachiosaurus", "plants", "graze"],
    ["Triceratops", "display", "horns", "defense"],
    ["Stegosaurus", "spikes", "tail", "armor"]
  ],
  "meat-eaters": [
    ["theropod", "T-Rex", "predator", "teeth"],
    ["Velociraptor", "feathers", "claws", "speed"],
    ["Spinosaurus", "river", "fish", "sail"]
  ],
  extinction: [
    ["asteroid", "impact", "Chicxulub", "extinction"],
    ["dust", "food chain", "darkness", "winter"],
    ["ash", "Mesozoic", "end", "silence"]
  ],
  "famous-dinosaurs": [
    ["T-Rex", "icon", "museum", "star"],
    ["Stegosaurus", "plates", "Jurassic", "classic"],
    ["Brachiosaurus", "giant", "sauropod", "neck"]
  ],
  "prehistoric-world": [
    ["continents", "Pangea", "plates", "Earth"],
    ["climate", "warm", "Mesozoic", "poles"],
    ["plants", "ferns", "conifers", "flowers"]
  ]
};

const TIPS = {
  "what-are-dinosaurs": "Visit a natural history museum and ask your child to spot which skeletons walk on straight legs under the body — those are dinosaurs!",
  triassic: "Lay out a world map and show how continents fit together like puzzle pieces — that's Pangea during the Triassic.",
  jurassic: "Compare a giraffe's neck to a sauropod poster. Ask: why might long necks help plant-eaters?",
  cretaceous: "Look at flowering plants in a garden. They spread during the Cretaceous — the last dinosaur age.",
  fossils: "Press a leaf into clay to make a fossil imprint at home. Talk about how real fossils form over millions of years.",
  paleontology: "Give your child a paintbrush and let them \"excavate\" a toy bone buried in sand — patience matters!",
  "dinosaur-eggs": "Compare chicken eggs at breakfast to dinosaur egg fossils in a book. Both come from the same ancient family tree.",
  "plant-eaters": "At the zoo, watch giraffes or elephants eat — today's giants remind us how huge plant-eaters live.",
  "meat-eaters": "Look at a bird's foot — three toes forward is the same pattern many theropod dinosaurs had.",
  extinction: "Talk about how small, flexible survivors (birds, mammals) endured change — a lesson in adaptation.",
  "famous-dinosaurs": "Pick one famous dinosaur per week. Read the story, say the name aloud, and draw it together.",
  "prehistoric-world": "Spin a globe together and say: dinosaurs walked where our home is now — Earth remembers."
};

function slug(title) {
  return title.replace(/\s+/g, "-");
}

chapters.forEach((ch) => {
  ch.slug = ch.slug || slug(ch.title);
  ch.opponent = ch.opponent || { name: ch.botName || "Dr. Rex", icon: ch.botEmoji || "🦴" };
  ch.parentTip = ch.parentTip || TIPS[ch.id] || "Read each story aloud, then tap the vocabulary chips so your child hears key words.";

  const mainSrc = ch.mainSegments || ch.mainBlocks || [];
  ch.mainSegments = mainSrc.map((s, i) => ({
    slot: s.slot || "main-" + (i + 1),
    storyTitle: s.storyTitle,
    story: s.story,
    explanation: s.explanation || "",
    words: s.words || (WORDS[ch.id] && WORDS[ch.id][i]) || ["dinosaur", "fossil", "Mesozoic", "prehistoric"]
  }));

  const exSrc = ch.explainedSegments || ch.explainBlocks || [];
  ch.explainedSegments = exSrc.map((s, i) => ({
    slot: s.slot || "explain-" + (i + 1),
    storyTitle: s.storyTitle,
    story: s.story,
    explanation: s.explanation || ""
  }));

  ch.quiz = (ch.quiz || []).map((q) => ({
    q: q.q,
    options: q.options || q.opts,
    correct: q.correct
  }));

  delete ch.mainBlocks;
  delete ch.explainBlocks;
  delete ch.botName;
  delete ch.botEmoji;
  delete ch.gameTitle;
  delete ch.gameType;
});

const out = `/* Dinosaur Discovery — chapter content (generate: node _generate-book.cjs) */
(function (w) {
  w.DINO_CHAPTERS = ${JSON.stringify(chapters, null, 2)};
})(window);
`;

fs.writeFileSync(FILE, out);
console.log("Patched", chapters.length, "chapters in _dino-data.js");
