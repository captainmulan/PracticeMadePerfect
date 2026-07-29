#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../../OceanAdventure/_ocean-action-games.js");
let g = fs.readFileSync(src, "utf8");

const pairs = [
  [/Ocean Adventure/g, "Continents Adventure"],
  [/OceanActionGame/g, "ContinentActionGame"],
  [/OceanPlayer/g, "ContinentPlayer"],
  [/ocean-action-game/g, "continent-action-game"],
  [/ocean-book-game/g, "continent-book-game"],
  [/#64ffda/g, "#aed581"],
  [/#00bcd4/g, "#689f38"],
  [/#80deea/g, "#ffe082"],
  [/#cce7ff/g, "#fff3e0"],
  [/#062035/g, "#1b2e0a"],
  [/#0a3050/g, "#33691e"],
  [/#041525/g, "#3e2723"],
  [/zone-dive/g, "continent-trek"],
  [/treasure-rush/g, "globe-rush"],
  [/Zone Dive/g, "Continent Trek"],
  [/Zone Dive Hero/g, "Continent Trek Hero"],
  [/drawOceanBg/g, "drawEarthBg"],
  [/depth levels/g, "continent levels"],
  [/🤿/g, "🧭"],
  [/🦈/g, "🌋"],
  [/🪼/g, "🏜️"],
  [/🛢️/g, "🗑️"],
  [/💎/g, "🌍"],
  [/🦪/g, "🗺️"],
  [/Treasure Master/g, "Globe Master"],
  [/Keep Diving/g, "Keep Exploring"],
  [/\["☀️", "🌅", "🌙", "🕳️", "⛰️"\]/g, '["🦁", "🐼", "🏰", "🦅", "🦙", "🐧", "🦘"]'],
  [/\['☀️', '🌅', '🌙', '🕳️', '⛰️'\]/g, "['🦁','🐼','🏰','🦅','🦙','🐧','🦘']"],
  [/var FACE = \/🐠\|🐟\|🐡\|🦈\|🐙\|🦑\|🐢\|🐬\|🐳\|🦭\|🐋\|🦐\|🤿\|🧜\/;/g,
    "var FACE = /🦁|🐼|🏰|🦅|🦙|🐧|🦘|🧭|🗺️|🌍|🦒|🐯|🦓|🐨/;"],
];

pairs.forEach(([re, rep]) => {
  g = g.replace(re, rep);
});

// Continent trek zone colors (earth tones per continent band)
g = g.replace(
  /\["#1565c0", "#1a4480", "#051525", "#040810", "#020208"\]/,
  '["#558b2f", "#f9a825", "#5d4037", "#1565c0", "#90a4ae", "#eceff1", "#ef6c00"]'
);
g = g.replace(
  /\["#0288d1", "#051525", "#020810", "#000008", "#000004"\]/,
  '["#33691e", "#ef6c00", "#3e2723", "#0d47a1", "#546e7a", "#b0bec5", "#bf360c"]'
);

const out = path.join(__dirname, "..", "_continents-action-games.js");
fs.writeFileSync(out, g);
console.log(
  "Wrote",
  out,
  "| ContinentActionGame:",
  g.includes("ContinentActionGame"),
  "| trek:",
  g.includes("continent-trek"),
  "| rush:",
  g.includes("globe-rush")
);
