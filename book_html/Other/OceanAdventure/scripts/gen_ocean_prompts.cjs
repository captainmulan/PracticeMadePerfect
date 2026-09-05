#!/usr/bin/env node
/* Photorealistic prompts for Ocean Adventure chapter images — used with GenerateImage */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_ocean-data.js"), "utf8"), sandbox);

const STYLE =
  "Photorealistic underwater photograph, National Geographic documentary style, natural cinematic lighting, sharp detail, authentic marine life, 16:9 widescreen, no text, no labels, no cartoon, no illustration";

const SCENE_HINTS = {
  overview: {
    "main-1": "Vast open ocean horizon from research boat deck, endless blue water meeting sky, sense of scale showing Earth is mostly ocean, gentle waves, distant seabirds",
    "main-2": "Cross-section style deep ocean layers in one dramatic photoreal scene: sunlit turquoise surface fading through twilight blue to midnight black abyss, visible depth gradient",
    "main-3": "Satellite-style ocean currents map rendered as realistic aerial photo of swirling blue currents connecting Pacific and Atlantic waters, global ocean connectivity",
    "explain-1": "Microscopic phytoplankton bloom near sunlit surface with golden rays, oxygen bubbles rising, tiny green plants in clear blue water macro photography",
    "explain-2": "Real humpback whale singing underwater with sound ripples visualized as light, deep blue water, whale communication, salt crystals on seawater macro",
    "explain-3": "Underwater plastic pollution near coral reef with volunteer diver collecting trash, conservation message, contrast healthy reef and debris",
  },
  sunlight: {
    "main-1": "Crystal clear turquoise epipelagic zone 0-200m, golden sun rays penetrating water, tropical reef fish and sea turtle in sunlit open water",
    "main-2": "Macro photoreal phytoplankton bloom shimmering like green snow in sunlit water column, microscopic plants visible as glowing specks",
    "main-3": "Vibrant living coral reef city: clownfish in anemone, sea turtle gliding, colorful hard corals teeming with tropical fish",
    "explain-1": "Sun-warmed ocean surface layer with gentle waves and light mixing, warm tropical sea near surface thermometer research scene underwater",
    "explain-2": "Ocean food chain photoreal: phytoplankton to krill to whale feeding in sunlit water, energy ladder from tiny to giant",
    "explain-3": "Coral bleaching documentary photo: pale white stressed coral next to small patch of healthy colorful coral, conservation tone",
  },
  twilight: {
    "main-1": "Mesopelagic twilight zone 200-1000m, dusky blue-purple water, large-eyed squid in dim faint light from above, mysterious deep atmosphere",
    "main-2": "Bioluminescent jellyfish and squid glowing green-blue in dark twilight water, firefly-like lights in deep ocean",
    "main-3": "Diel vertical migration: massive cloud of zooplankton and small fish rising toward dim surface at dusk, largest migration on Earth",
    "explain-1": "Close-up photoreal of large-eyed twilight zone fish and squid adapted for dim light, oversized eyes catching faint photons",
    "explain-2": "Counter-illumination camouflage: fish belly glowing to match pale surface light above, predator view from below",
    "explain-3": "Submarine hull at twilight depth showing pressure gauges, cold blue water, slow gelatinous deep-sea creatures",
  },
  midnight: {
    "main-1": "Bathypelagic midnight zone 1000-4000m total darkness with bioluminescent sparks of blue and green everywhere, deep-sea bristlemouth fish",
    "main-2": "Terrifying photoreal anglerfish with bioluminescent lure dangling in pitch black water, deep-sea predator hunting",
    "main-3": "Marine snow falling like underwater snowflakes: organic particles drifting down through dark water column",
    "explain-1": "Giant deep-sea squid and large-mouth predator silhouettes in midnight zone darkness, scarce food rare giants",
    "explain-2": "Red deep-sea shrimp appearing black under blue bioluminescent light, red camouflage in midnight zone",
    "explain-3": "High-pressure deep-sea environment, slow-moving gelatinous fish, crushing depth atmosphere near 3000m",
  },
  abyss: {
    "main-1": "Vast abyssal plain seafloor 4000-6000m, flat muddy bottom stretching to horizon, pale deep-sea shrimp on rock",
    "main-2": "Hydrothermal vent chimney spewing mineral-rich black smoker plumes, tube worms and crabs clustered around vent",
    "main-3": "Weird abyss creatures: transparent-head barreleye fish, sea cucumbers on mud, bizarre deep-sea adaptations",
    "explain-1": "Marine snow settling on abyssal mud, deposit-feeding sea cucumbers and scavengers on seafloor",
    "explain-2": "White crabs and chemosynthetic bacteria around hydrothermal vent, chemical energy food web no sunlight",
    "explain-3": "Robotic submersible mapping unexplored abyss seafloor with sonar, deep ocean exploration frontier",
  },
  hadal: {
    "main-1": "Mariana Trench V-shaped canyon deeper than Everest, Challenger Deep hadal zone below 6000m, pale snailfish at porthole",
    "main-2": "Extreme pressure hadal depth gauges on submersible, flexible gelatinous snailfish surviving crushing force",
    "main-3": "Hadal trench floor with amphipods and ghostly snailfish, remote deepest ocean life including pollution debris",
    "explain-1": "Hadal snailfish close-up gelatinous body no scales, deepest living fish record holder in trench",
    "explain-2": "Tectonic subduction trench map as dramatic underwater photo of Mariana Trench geology, plate collision",
    "explain-3": "Robotic lander video from Challenger Deep: pale sediment tracks and lone fish, Earth's last frontier",
  },
  "coral-reefs": {
    "main-1": "Brain coral and fan coral towers, reef shark patrolling, apartment-block reef full of holes and tenants",
    "main-2": "Coral polyp symbiosis macro: pink gold coral head with zooxanthellae algae visible as golden glow inside tissue",
    "main-3": "Reef cleaning station: cleaner wrasse removing parasites from grouper, symbiotic relationships on reef",
    "explain-1": "Macro coral polyp with stinging tentacles laying limestone skeleton, reef building grain by grain",
    "explain-2": "Fringing reef breaking waves protecting tropical coastline village beach from storms, natural sea wall",
    "explain-3": "Reef conservation: diver using reef-safe practices, healthy recovering coral, marine protected area",
  },
  "marine-mammals": {
    "main-1": "Dolphin leaping beside boat, humpback whale surfacing with misty blowhole spout, warm mammal encounter",
    "main-2": "Humpback whale singing underwater, sound waves visualized, whale communication across ocean basin",
    "main-3": "Dolphin pod cooperatively herding bait ball of fish, teamwork and social intelligence",
    "explain-1": "Sperm whale deep dive one breath, flexible ribs and oxygen stores, hunting squid in deep water",
    "explain-2": "Whale blubber layer cross-section concept, thick insulating fat for cold ocean migration",
    "explain-3": "Ship strike and fishing net threat to whales, marine sanctuary protected waters conservation",
  },
  fish: {
    "main-1": "Silver blue fish close-up showing gills fins and shimmering scales, classic ocean swimmer anatomy",
    "main-2": "Massive school of sardines or herring moving as one shimmering cloud, predator confusion strategy",
    "main-3": "Ocean fish diversity: flat ray on sand, moray eel in hole, streamlined tuna in open water",
    "explain-1": "Fish gills macro photograph showing red feathery filaments, oxygen extraction from water",
    "explain-2": "Salmon migration between river and ocean, freshwater and saltwater fish adaptation",
    "explain-3": "Sustainable fishing scene: responsible catch size, healthy fish stocks, reef habitat protection",
  },
};

const prompts = [];
sandbox.window.OCEAN_CHAPTERS.forEach((ch) => {
  const hints = SCENE_HINTS[ch.id] || {};
  [...ch.mainSegments, ...ch.explainedSegments].forEach((seg) => {
    const hint = hints[seg.slot] || seg.storyTitle;
    prompts.push({
      file: `${ch.id}-${seg.slot}.png`,
      chapter: ch.id,
      slot: seg.slot,
      title: seg.storyTitle,
      prompt: `${hint}. ${STYLE}`,
    });
  });
});

const OUT = path.join(DIR, "scripts", "ocean-image-prompts.json");
fs.writeFileSync(OUT, JSON.stringify(prompts, null, 2));
console.log("Wrote", prompts.length, "prompts to", path.basename(OUT));
prompts.forEach((p) => console.log(p.file));
