#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ocean = fs.readFileSync(
  path.join(__dirname, "../../OceanAdventure/_ocean-games.js"),
  "utf8"
);

let g = ocean
  .replace(/Ocean Adventure/g, "Continents Adventure")
  .replace(/OceanGame/g, "ContinentGame");

g = g.replace(
  "  var ZONE_ORDER = ['☀️', '🌅', '🌙', '🕳️', '⛰️'];",
  `  var DEFAULT_ORDER = ['☀️', '🌅', '🌙', '🕳️', '⛰️'];
  function zoneOrder() {
    return S.cfg.good && S.cfg.good.length >= 3 ? S.cfg.good : DEFAULT_ORDER;
  }`
);
g = g.replace(/ZONE_ORDER/g, "zoneOrder()");

const out = path.join(__dirname, "..", "_continents-games.js");
fs.mkdirSync(path.join(__dirname, "..", "assets"), { recursive: true });
fs.writeFileSync(out, g);
console.log("Wrote", out, "- ContinentGame:", g.includes("ContinentGame"));
