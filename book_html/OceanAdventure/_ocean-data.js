/* Ocean Adventure — chapter content (generate: node _generate-book.cjs) */
(function (w) {
  w.OCEAN_CHAPTERS = [
    {
      id: "overview",
      num: 5,
      slug: "Ocean-Overview",
      title: "Ocean Overview",
      emoji: "🌊",
      opponent: { name: "Captain Coral", icon: "🪸" },
      viewLabels: [
        {
          id: "vertical",
          label: "Depth Chart",
          desc: "Painted ocean cross-section — five zones from sunlit reef to the hadal trench. Tap each band to learn its creatures and depth."
        },
        {
          id: "surface",
          label: "Surface & Depth",
          desc: "Ships sail, seagulls fly, and waves roll — with all five ocean zones stacked below the surface."
        },
        {
          id: "reef",
          label: "Sonar Map",
          desc: "Top-down sonar scan — concentric depth rings from the surface to hadal trenches. Tap a ring to learn."
        },
        {
          id: "deep",
          label: "Sub Porthole",
          desc: "Look through a submarine window — one zone at a time, close up. Tap to peek at the next depth."
        }
      ],
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "A World Under Waves",
          story: "Kai stood on the dock and stared at the endless blue. Captain Coral tapped her compass and smiled. \"Most of Earth is ocean,\" she said. \"If you only explore land, you miss the biggest adventure on the planet.\"",
          explanation: "About 71% of Earth's surface is covered by ocean. Oceans hold most of our water and help control weather and climate around the world.",
          words: ["ocean", "Earth", "water", "climate"]
        },
        {
          slot: "main-2",
          storyTitle: "Layers of the Deep",
          story: "Captain Coral unrolled a glowing chart showing bands of color — sunny blue on top, midnight black at the bottom. \"The ocean has zones,\" she explained. \"Sunlight fades as you go deeper, and different creatures call each layer home.\"",
          explanation: "Ocean zones are named by how much sunlight reaches them: Sunlight, Twilight, Midnight, Abyss, and Hadal. Each zone has its own temperature, pressure, and life.",
          words: ["zones", "sunlight", "pressure", "creatures"]
        },
        {
          slot: "main-3",
          storyTitle: "One Connected Blue",
          story: "Kai traced currents swirling across the map like rivers in the sea. \"Does the Pacific talk to the Atlantic?\" he asked. Captain Coral nodded. \"All oceans are connected. What happens in one place can travel far away.\"",
          explanation: "Earth has five named oceans — Pacific, Atlantic, Indian, Southern, and Arctic — but they form one global ocean linked by currents that move heat, food, and animals.",
          words: ["currents", "Pacific", "Atlantic", "connected"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Why the Ocean Matters",
          story: "Back on the research boat, Kai learned the ocean does jobs we rarely see. It soaks up heat from the sun, feeds billions of people, and even makes the oxygen we breathe — thanks to tiny floating plants.",
          explanation: "Phytoplankton in the sunlit zone produce about half of Earth's oxygen. Ocean currents move warm and cool water, shaping storms, rain, and seasons on land."
        },
        {
          slot: "explain-2",
          storyTitle: "Salt and Sound",
          story: "Captain Coral let Kai taste a drop of seawater — surprisingly salty! \"Rivers carry minerals to the sea for millions of years,\" she said. Whales sing across whole oceans because sound travels far underwater.",
          explanation: "Ocean salinity comes from dissolved salts and minerals. Sound moves faster and farther in water than in air, which is why dolphins and whales use clicks and songs to communicate."
        },
        {
          slot: "explain-3",
          storyTitle: "Protecting Our Blue Home",
          story: "Kai spotted plastic tangled near the pier and frowned. Captain Coral handed him a reusable bottle. \"Every zone needs clean water,\" she said. \"Small choices on land protect life from reefs to the deepest trench.\"",
          explanation: "Pollution, overfishing, and warming water harm ocean habitats. Marine protected areas, reducing plastic waste, and learning about the sea help keep ecosystems healthy for future explorers."
        }
      ],
      game: {
        id: "zone-sort",
        title: "🌊 Zone Sort",
        desc: "Move ← → to catch zone icons in order ☀️ → 🌅 → 🌙 → 🕳️ → ⛰️. Avoid trash! Reach 60 points.",
        boot: {
          game: "zone-sort",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["☀️", "🌅", "🌙", "🕳️", "⛰️"],
          bad: ["🗑️", "🛢️"],
          player: "🤿",
          bgTop: "#1565c0",
          bgBot: "#002171"
        }
      },
      quiz: [
        { q: "About how much of Earth is covered by ocean?", options: ["About 30%", "About 50%", "About 71%", "About 95%"], correct: 2 },
        { q: "Which zone gets the most sunlight?", options: ["Midnight Zone", "Abyss Zone", "Sunlight Zone", "Hadal Zone"], correct: 2 },
        { q: "Tiny ocean plants that make oxygen are called…", options: ["Phytoplankton", "Seaweed only", "Coral rocks", "Sand grains"], correct: 0 },
        { q: "Earth's oceans are…", options: ["All separate with no connection", "Connected into one global ocean", "Only found near the equator", "Made of fresh water"], correct: 1 },
        { q: "What helps protect ocean life?", options: ["Dumping trash at sea", "Using less plastic and learning about the ocean", "Draining rivers into the sea", "Blocking all currents"], correct: 1 }
      ]
    },
    {
      id: "sunlight",
      num: 8,
      slug: "Sunlight-Zone",
      title: "Sunlight Zone",
      emoji: "☀️",
      opponent: { name: "Sunny Ray", icon: "🐠" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Bright Top Layer",
          story: "Kai dove into water so clear he could see his bubbles sparkle gold. Sunny Ray, a speedy fish with a sun-yellow tail, darted beside him. \"Welcome to my neighborhood!\" he chirped. \"The sun reaches all the way down here.\"",
          explanation: "The Sunlight Zone (epipelagic zone) extends from the surface to about 200 meters deep. Enough light shines through for plants to grow and for most familiar sea life to thrive.",
          words: ["Sunlight Zone", "surface", "light", "epipelagic"]
        },
        {
          slot: "main-2",
          storyTitle: "Forest of Tiny Plants",
          story: "Sunny Ray led Kai through a cloud of specks that shimmered like green snow. \"That's phytoplankton,\" he said. \"They're so small you need a microscope, but they're the base of the whole food web.\"",
          explanation: "Phytoplankton are microscopic plants that float near the surface. They use sunlight to make food and produce oxygen — feeding tiny animals, fish, and even giant whales.",
          words: ["phytoplankton", "food web", "microscopic", "oxygen"]
        },
        {
          slot: "main-3",
          storyTitle: "Reef City Life",
          story: "A coral wall burst with color — clownfish peeking from anemones, a turtle gliding past, and crabs marching over rocks. Kai whispered, \"It's like a busy city.\" Sunny Ray grinned. \"And every resident has a job!\"",
          explanation: "Coral reefs in the Sunlight Zone shelter thousands of species. Corals are animals that build hard skeletons; fish, crustaceans, and mammals depend on reefs for food and shelter.",
          words: ["coral reef", "clownfish", "species", "shelter"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Warm and Wavy",
          story: "Near the surface, waves mixed warm water with the air above. Captain Coral showed Kai a thermometer — the Sunlight Zone is the warmest ocean layer because the sun heats the top first.",
          explanation: "Sunlight warms the upper ocean, especially in tropical seas. Wind and waves mix the top layer, helping distribute heat and nutrients that support plankton blooms."
        },
        {
          slot: "explain-2",
          storyTitle: "From Plankton to Giants",
          story: "Sunny Ray pointed upward as a whale exhaled a misty spout. \"That whale might have eaten krill,\" he said, \"and krill ate phytoplankton. Energy climbs the ladder one bite at a time.\"",
          explanation: "Ocean food chains start with phytoplankton, move to zooplankton and small fish, and can end with sharks, seals, or whales. Removing one link weakens the whole chain."
        },
        {
          slot: "explain-3",
          storyTitle: "Reefs in Trouble",
          story: "Kai noticed pale coral that looked ghostly white. Captain Coral explained that stressed corals can expel their colorful algae partners — a warning sign that the reef needs help.",
          explanation: "Coral bleaching happens when water gets too warm or polluted. Healthy reefs protect coastlines from storms and support fisheries; keeping oceans clean and cool helps reefs survive."
        }
      ],
      game: {
        id: "sunbeam-snap",
        title: "☀️ Sunbeam Snap",
        desc: "Tap sea friends when they swim through the bright sunbeam! Avoid trash and sharks.",
        boot: {
          game: "sunbeam-snap",
          goal: 72,
          time: 55,
          lives: 3,
          good: ["🐠", "🦀", "🐡", "🐢"],
          bad: ["🛢️", "🥤", "🗑️"],
          bgTop: "#81d4fa",
          bgBot: "#0288d1"
        }
      },
      quiz: [
        { q: "How deep does the Sunlight Zone go (about)?", options: ["20 meters", "200 meters", "2,000 meters", "20,000 meters"], correct: 1 },
        { q: "Phytoplankton are…", options: ["Tiny ocean plants", "Large sharks", "Deep-sea crabs", "Volcanic rocks"], correct: 0 },
        { q: "Coral reefs are found mainly in the…", options: ["Hadal Zone", "Sunlight Zone", "Abyss with no light", "Underground caves only"], correct: 1 },
        { q: "What do phytoplankton need to grow?", options: ["Sunlight", "Total darkness", "Ice only", "Desert sand"], correct: 0 },
        { q: "Coral bleaching means corals…", options: ["Turn bright pink forever", "Lose their color and stress partners", "Grow on land", "Become metal"], correct: 1 }
      ]
    },
    {
      id: "twilight",
      num: 11,
      slug: "Twilight-Zone",
      title: "Twilight Zone",
      emoji: "🌅",
      opponent: { name: "Dusk Diver", icon: "🦑" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Dim Blue World",
          story: "Kai's sub lights flickered as blue water turned dusky purple. Dusk Diver, a calm squid with huge eyes, floated into view. \"Day and night blur here,\" she said. \"We call it the twilight zone — not bright, not fully dark.\"",
          explanation: "The Twilight Zone (mesopelagic) stretches from about 200 to 1,000 meters deep. Only faint blue light filters down, so many animals have large eyes to catch what little glow remains.",
          words: ["Twilight Zone", "mesopelagic", "dim", "depth"]
        },
        {
          slot: "main-2",
          storyTitle: "Creatures That Glow",
          story: "Suddenly tiny lights blinked on and off like fireflies underwater. Dusk Diver pulsed soft green along her arms. \"Bioluminescence,\" she whispered. \"We make our own light to hide, hunt, or say hello.\"",
          explanation: "Many twilight-zone animals produce light with special chemicals. Some use glows to confuse predators, attract mates, or lure prey in the dim water.",
          words: ["bioluminescence", "glow", "predators", "prey"]
        },
        {
          slot: "main-3",
          storyTitle: "Daily Commute",
          story: "At dusk, trillions of small animals rose toward the surface to feed. \"It's the largest migration on Earth,\" Dusk Diver said, \"and it happens every single day — even though humans rarely see it.\"",
          explanation: "The diel vertical migration moves zooplankton and small fish up at night to eat near the surface, then back down by day to hide from predators.",
          words: ["migration", "zooplankton", "surface", "daily"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Eyes Built for Shadows",
          story: "Dusk Diver let Kai compare eye sizes on a chart — twilight hunters often have eyes bigger than their stomachs need. In thin light, every photon counts.",
          explanation: "Large eyes and sensitive vision help twilight animals detect silhouettes against faint light from above. Some species also see bioluminescent flashes other creatures miss."
        },
        {
          slot: "explain-2",
          storyTitle: "Counter-Light Tricks",
          story: "A fish's belly glowed to match the pale surface above, making its outline vanish to predators below. \"That's counter-illumination,\" Dusk Diver explained. \"Hide by matching the light around you.\"",
          explanation: "Many mesopelagic fish and squid use ventral photophores to erase their shadow, blending with downwelling light — a clever camouflage in the open water."
        },
        {
          slot: "explain-3",
          storyTitle: "Cold and Quiet Pressure",
          story: "Kai noticed the sub's hull creak as they descended. Water pressed in from every side, and the temperature dropped. \"Life here is slow and careful,\" Dusk Diver said. \"Energy is precious.\"",
          explanation: "Twilight-zone water is cooler than the surface and under increasing pressure. Animals often grow slowly, live longer, and rely on gelatinous bodies or fat stores to survive."
        }
      ],
      game: {
        id: "glow-rhythm",
        title: "🌅 Glow Rhythm",
        desc: "Tap glowing creatures when the pulse is brightest — not too early! Avoid sharks.",
        boot: {
          game: "glow-rhythm",
          goal: 55,
          time: 55,
          lives: 3,
          good: ["✨", "🦑", "🔦"],
          bad: ["🦈"],
          bgTop: "#1a4480",
          bgBot: "#051525"
        }
      },
      quiz: [
        { q: "The Twilight Zone is also called the…", options: ["Epipelagic zone", "Mesopelagic zone", "Hadal zone", "Desert zone"], correct: 1 },
        { q: "About how deep is the Twilight Zone?", options: ["0–20 m", "200–1,000 m", "5,000–10,000 m", "Only at the beach"], correct: 1 },
        { q: "Bioluminescence means animals…", options: ["Make their own light", "Only reflect sunlight", "Cannot see at all", "Live on land"], correct: 0 },
        { q: "The daily rise and fall of plankton is called…", options: ["Vertical migration", "Mountain climbing", "River flooding", "Tidal surfing"], correct: 0 },
        { q: "Why do many twilight animals have big eyes?", options: ["To see in dim light", "To fly in the sky", "To dig tunnels", "To grow plants"], correct: 0 }
      ]
    },
    {
      id: "midnight",
      num: 14,
      slug: "Midnight-Zone",
      title: "Midnight Zone",
      emoji: "🌙",
      opponent: { name: "Midnight Molly", icon: "🐟" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "No Sun, No Problem",
          story: "Kai switched off the sub lights and gasped — the Midnight Zone was not empty. Sparks of blue and green flashed everywhere. Midnight Molly, a small bristlemouth fish, drifted past. \"Sunlight never reaches us,\" she said cheerfully. \"We make our own stars.\"",
          explanation: "The Midnight Zone (bathypelagic) lies roughly 1,000 to 4,000 meters deep. It is completely dark to human eyes, so bioluminescence replaces sunshine for finding food and friends.",
          words: ["Midnight Zone", "bathypelagic", "dark", "bioluminescence"]
        },
        {
          slot: "main-2",
          storyTitle: "The Angler's Lure",
          story: "A glowing rod bobbed in the blackness ahead. Midnight Molly pulled Kai back. \"That's an anglerfish lure,\" she warned. \"Some hunters fish with light — don't swim toward every sparkle.\"",
          explanation: "Anglerfish dangle a bioluminescent lure to attract prey in the dark. Many midnight predators use light traps, big mouths, and sharp teeth to catch scarce meals.",
          words: ["anglerfish", "lure", "predator", "prey"]
        },
        {
          slot: "main-3",
          storyTitle: "Snow from the Surface",
          story: "Fine flakes drifted down like underwater snow. \"Marine snow,\" Midnight Molly explained. \"Dead plankton and waste sink from above — our delivery of food from the sunny zone.\"",
          explanation: "Marine snow is falling organic material from upper layers. Deep animals depend on this slow rain of nutrients because no plants grow in permanent darkness.",
          words: ["marine snow", "nutrients", "plankton", "sink"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Giants in the Dark",
          story: "Midnight Molly showed Kai shadows of squid longer than a bus and jellyfish with trailing tentacles. \"Food is rare, so some hunters grow huge mouths and stretchy stomachs,\" she said.",
          explanation: "Many deep-sea predators can swallow prey larger than expected and survive long gaps between meals. Slow metabolism helps when dinner might be weeks away."
        },
        {
          slot: "explain-2",
          storyTitle: "Red Looks Black",
          story: "Kai shone a white light on a red shrimp and it seemed to vanish. \"Red light is absorbed quickly in deep water,\" Midnight Molly said. \"To us, red animals look black — perfect hiding.\"",
          explanation: "Red wavelengths do not travel far underwater, so red-colored animals appear dark in the midnight zone — a camouflage trick against bioluminescent searchlights."
        },
        {
          slot: "explain-3",
          storyTitle: "Pressure and Patience",
          story: "The sub's gauges showed crushing weight from the water above. Midnight Molly barely moved her fins. \"We save energy here,\" she said. \"Quick swimmers starve; patient hunters survive.\"",
          explanation: "High pressure and near-freezing temperatures shape midnight-zone life. Animals often move slowly, have gelatinous bodies, and live for many years on small rations."
        }
      ],
      game: {
        id: "sonar-ping",
        title: "🌙 Sonar Ping",
        desc: "Dark screen! Tap creatures the moment sonar reveals them. Avoid decoys!",
        boot: {
          game: "sonar-ping",
          goal: 48,
          time: 55,
          lives: 3,
          good: ["⭐", "✨", "💫"],
          bad: ["🐟"],
          bgTop: "#050d18",
          bgBot: "#020810"
        }
      },
      quiz: [
        { q: "Does sunlight reach the Midnight Zone?", options: ["Yes, all day", "No, it is completely dark", "Only in summer", "Only near reefs"], correct: 1 },
        { q: "The Midnight Zone is about…", options: ["1,000–4,000 m deep", "0–10 m deep", "Only in rivers", "On mountain tops"], correct: 0 },
        { q: "Anglerfish use a glowing lure to…", options: ["Attract prey", "Grow coral", "Make waves", "Warm the water"], correct: 0 },
        { q: "Marine snow is…", options: ["Ice from clouds", "Sinking bits of food and waste", "Salt crystals only", "Ship exhaust"], correct: 1 },
        { q: "Why might a deep-sea animal be red?", options: ["It looks black in the dark and hides well", "It glows brighter than the sun", "It can fly", "It lives on land"], correct: 0 }
      ]
    },
    {
      id: "abyss",
      num: 17,
      slug: "Abyss-Zone",
      title: "Abyss Zone",
      emoji: "🕳️",
      opponent: { name: "Abyss Ace", icon: "🦐" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Vast Plain",
          story: "Kai's sub touched down on a flat, muddy world that seemed to go on forever. Abyss Ace, a pale shrimp with long antennae, waved from a rock. \"Welcome to the abyssal plain,\" he said. \"Quiet, cold, and deeper than most mountains are tall.\"",
          explanation: "The Abyss Zone (abyssopelagic) covers ocean floor plains about 4,000 to 6,000 meters deep. It is one of the largest habitats on Earth, dark and near freezing.",
          words: ["Abyss Zone", "abyssal plain", "deep", "habitat"]
        },
        {
          slot: "main-2",
          storyTitle: "Smokers on the Seafloor",
          story: "Columns of cloudy water rose like underwater chimneys. \"Hydrothermal vents,\" Abyss Ace shouted over the rumble. \"Super-hot water from inside Earth meets icy sea — and strange life thrives with no sunlight at all.\"",
          explanation: "Hydrothermal vents release mineral-rich hot water. Bacteria use chemicals from the vents for energy, feeding worms, crabs, and other species in total darkness.",
          words: ["hydrothermal vent", "bacteria", "minerals", "energy"]
        },
        {
          slot: "main-3",
          storyTitle: "Creatures of the Mud",
          story: "Sea cucumbers marched slowly across the silt, and fish with see-through heads glided by. Kai whispered, \"Everything looks so… different.\" Abyss Ace smiled. \"Normal down here is weird to land folk.\"",
          explanation: "Abyss animals often have soft bodies, small eyes, and special adaptations for low food and high pressure — including bacteria farms in their gills or stomachs.",
          words: ["adaptations", "pressure", "sea cucumber", "bacteria"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Food from Falling Flakes",
          story: "Abyss Ace sifted marine snow through his claws. \"Most meals arrive from above as tiny flakes,\" he explained. \"We scrape mud, filter water, and wait — patience is survival.\"",
          explanation: "Abyssal plains receive sparse marine snow. Many animals are deposit feeders or scavengers, extracting nutrients from sediment that took weeks to sink from the surface."
        },
        {
          slot: "explain-2",
          storyTitle: "Chemosynthesis City",
          story: "Near a vent, Kai saw white crabs stacked like a living wall around warm water. \"Sunlight isn't the only energy source,\" Abyss Ace said. \"These bacteria run on chemicals — chemosynthesis powers the neighborhood.\"",
          explanation: "Chemosynthesis lets certain bacteria build food from hydrogen sulfide and other vent chemicals. Entire food webs can depend on chemical energy instead of sunlight."
        },
        {
          slot: "explain-3",
          storyTitle: "Mapping the Unknown",
          story: "Captain Coral showed sonar maps with blank patches bigger than countries. \"We've mapped Mars better than our own abyss,\" she admitted. \"Every dive can discover a species nobody has named.\"",
          explanation: "Much of the deep ocean floor remains unexplored. Robotic submersibles and sonar help scientists find new vents, species, and seafloor features in the abyss."
        }
      ],
      game: {
        id: "trench-pilot",
        title: "🕳️ Trench Pilot",
        desc: "Steer ⬆️⬇️ through rocky trench gaps. Travel far to win!",
        boot: {
          game: "trench-pilot",
          goal: 50,
          time: 45,
          lives: 3,
          good: [],
          bad: ["🪨", "⚓", "🗿"],
          winText: "Distance goal: 50",
          bgTop: "#040810",
          bgBot: "#000008"
        }
      },
      quiz: [
        { q: "The Abyss Zone is roughly…", options: ["4,000–6,000 m deep", "0–50 m deep", "Only in lakes", "Above the clouds"], correct: 0 },
        { q: "Hydrothermal vents release…", options: ["Hot, mineral-rich water", "Pure sunlight", "Desert sand", "Forest pollen"], correct: 0 },
        { q: "Chemosynthesis uses…", options: ["Chemicals instead of sunlight", "Only wind power", "Fire from volcanoes on land only", "Moonlight"], correct: 0 },
        { q: "Most food on the abyssal plain comes from…", options: ["Sinking marine snow from above", "Fast-growing trees", "Rain clouds", "Ice cream"], correct: 0 },
        { q: "Much of the abyss floor is…", options: ["Still unexplored by humans", "Fully paved with roads", "Dry desert with cactus", "Covered in grass"], correct: 0 }
      ]
    },
    {
      id: "coral-reefs",
      num: 20,
      slug: "Coral-Reefs",
      title: "Coral Reefs",
      emoji: "🪸",
      opponent: { name: "Reef Rex", icon: "🦈" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Rainbow Under the Sea",
          story: "Kai finned through towers of coral shaped like brains, fans, and antlers. Reef Rex, a reef patrol shark with a surprisingly gentle voice, circled slowly. \"This reef is a living apartment block,\" he rumbled. \"Every hole has a tenant.\"",
          explanation: "Coral reefs are underwater structures built by tiny coral polyps over thousands of years. They shelter more than a quarter of all marine species despite covering less than 1% of the ocean floor.",
          words: ["coral reef", "polyps", "species", "shelter"]
        },
        {
          slot: "main-2",
          storyTitle: "Partners in Color",
          story: "Reef Rex pointed to a coral head glowing pink and gold. \"Polyps host algae inside their tissues,\" he said. \"The algae feed the coral with sugars; the coral gives them a safe home. Teamwork!\"",
          explanation: "Most reef-building corals depend on zooxanthellae algae for food and color. When stressed by heat or pollution, corals may evict algae and bleach white.",
          words: ["zooxanthellae", "algae", "bleaching", "partnership"]
        },
        {
          slot: "main-3",
          storyTitle: "Cleaning Station",
          story: "A line of fish waited while tiny wrasse picked parasites off a grouper's scales. Kai laughed. \"Even sharks get spa days?\" Reef Rex nodded. \"Healthy reefs run on relationships — cleaners, builders, and guards.\"",
          explanation: "Reef ecosystems rely on symbiosis: cleaning fish remove pests, herbivores control algae, and predators keep populations balanced. Lose one partner and the whole reef can suffer.",
          words: ["symbiosis", "wrasse", "ecosystem", "balance"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Builders Grain by Grain",
          story: "Under a magnifier, Kai saw each polyp grab food with stinging tentacles and lay down a cup of limestone. \"Reefs grow slowly,\" Captain Coral said. \"Some formations took longer than the pyramids to build.\"",
          explanation: "Coral polyps secrete calcium carbonate skeletons. Over generations, these skeletons fuse into massive reef frameworks that buffer waves and create complex habitats."
        },
        {
          slot: "explain-2",
          storyTitle: "Reefs Protect Coasts",
          story: "From above, Kai saw waves break gently on a fringing reef before reaching a village beach. \"Reefs absorb energy,\" Reef Rex explained. \"They shield coasts from storms and erosion — free natural walls.\"",
          explanation: "Healthy reefs reduce wave energy, protecting shorelines and human communities. Mangroves and seagrass partner with reefs to form coastal defense systems."
        },
        {
          slot: "explain-3",
          storyTitle: "How We Can Help Reefs",
          story: "Kai joined a beach cleanup and chose reef-safe sunscreen. Captain Coral smiled. \"Avoid touching corals when diving, reduce pollution, and support marine parks — reefs bounce back when we give them space.\"",
          explanation: "Threats include warming seas, acidification, overfishing, and physical damage. Marine protected areas, sustainable fishing, and lowering carbon emissions help reefs recover."
        }
      ],
      game: {
        id: "reef-match",
        title: "🪸 Reef Match",
        desc: "Flip cards and find matching reef pairs before time runs out!",
        boot: {
          game: "reef-match",
          goal: 80,
          time: 70,
          lives: 3,
          good: ["🐠", "🪸", "🦐", "🐙"],
          bad: [],
          winText: "Match all pairs!",
          bgTop: "#00695c",
          bgBot: "#004d40"
        }
      },
      quiz: [
        { q: "Corals are…", options: ["Animals that build reefs", "Plants that grow on land", "Rocks made by volcanoes only", "Types of clouds"], correct: 0 },
        { q: "Colorful algae living inside corals are called…", options: ["Zooxanthellae", "Snowflakes", "Tornadoes", "Pine trees"], correct: 0 },
        { q: "Coral bleaching happens when corals…", options: ["Lose their algae partners", "Grow twice as fast", "Move to deserts", "Turn into fish"], correct: 0 },
        { q: "Reefs help coastlines by…", options: ["Blocking and breaking waves", "Making earthquakes", "Drying up oceans", "Removing all fish"], correct: 0 },
        { q: "About what fraction of marine species use reefs?", options: ["More than a quarter", "None at all", "Exactly half of birds", "Only polar bears"], correct: 0 }
      ]
    },
    {
      id: "marine-mammals",
      num: 23,
      slug: "Marine-Mammals",
      title: "Marine Mammals",
      emoji: "🐬",
      opponent: { name: "Whale Wilma", icon: "🐋" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Breath Hold, Big Heart",
          story: "A dolphin spiraled beside Kai's boat and chirped a greeting. Whale Wilma surfaced nearby, spouting a misty breath. \"We're mammals like you,\" she said warmly. \"We breathe air, nurse our babies, and stay warm with blubber.\"",
          explanation: "Marine mammals include whales, dolphins, porpoises, seals, sea lions, manatees, and otters. They evolved from land ancestors and returned to the sea while keeping mammal traits.",
          words: ["marine mammals", "blubber", "breathe", "nurse"]
        },
        {
          slot: "main-2",
          storyTitle: "Song Across the Sea",
          story: "Wilma's low hum vibrated through the hull like a giant cello. \"Whales talk with clicks and songs,\" she explained. \"Sound travels far underwater — we can chat across whole ocean basins.\"",
          explanation: "Whales and dolphins use echolocation clicks to navigate and hunt. Humpback whales sing complex songs that can travel hundreds of kilometers through the water.",
          words: ["echolocation", "clicks", "songs", "sound"]
        },
        {
          slot: "main-3",
          storyTitle: "Smart Pod Life",
          story: "Dolphins took turns herding fish into a tight ball for everyone to share. Kai clapped. \"You work together!\" Wilma nodded. \"Pods teach young ones, play games, and protect each other — brains and teamwork matter.\"",
          explanation: "Many marine mammals live in social groups called pods or colonies. They cooperate to hunt, defend against predators, and raise calves — showing advanced learning and culture.",
          words: ["pod", "cooperate", "calves", "culture"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Diving Deep on One Breath",
          story: "Wilma showed Kai how her blood stores extra oxygen and her heart slows during deep dives. \"Sperm whales can hunt squid a kilometer down,\" she said. \"We are built for long breath-hold journeys.\"",
          explanation: "Marine mammals have flexible ribs, high blood volume, and muscle stores of oxygen. Some whales collapse lungs partially to avoid nitrogen problems on extreme dives."
        },
        {
          slot: "explain-2",
          storyTitle: "Blubber Blanket",
          story: "Kai felt a layer of firm fat on a model dolphin. \"Blubber insulates us in cold seas,\" Wilma explained. \"It also stores energy for long migrations when food is scarce.\"",
          explanation: "Blubber is a thick fat layer under the skin. It reduces heat loss, adds buoyancy, and fuels whales during months-long travels between feeding and breeding grounds."
        },
        {
          slot: "explain-3",
          storyTitle: "Protecting Ocean Giants",
          story: "Captain Coral pointed to a ship on the horizon and lowered her voice. \"Noise, nets, and pollution hurt whales and dolphins,\" she said. \"Safe shipping lanes and protected waters give us room to thrive.\"",
          explanation: "Threats include entanglement in fishing gear, ship strikes, ocean noise, and plastic ingestion. Conservation laws and marine sanctuaries help marine mammal populations recover."
        }
      ],
      game: {
        id: "breath-dive",
        title: "🐬 Breath Dive",
        desc: "Dolphin dive ⬇️ for fish, surface ⬆️ for air. Watch the O₂ bar!",
        boot: {
          game: "breath-dive",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🐟", "🦐", "🦑"],
          bad: ["🪼", "🛢️"],
          player: "🐬",
          bgTop: "#0277bd",
          bgBot: "#01579b"
        }
      },
      quiz: [
        { q: "Marine mammals breathe…", options: ["Air with lungs", "Water through gills", "Only through skin", "Sand from the beach"], correct: 0 },
        { q: "Blubber helps whales by…", options: ["Keeping them warm and storing energy", "Making them fly", "Growing coral", "Digging tunnels"], correct: 0 },
        { q: "Dolphins find food using…", options: ["Echolocation clicks", "Only their eyes in total dark", "Smelling land trees", "Sunscreen"], correct: 0 },
        { q: "A group of whales or dolphins is often called a…", options: ["Pod", "Flock of penguins", "Pack of wolves only on land", "School of rocks"], correct: 0 },
        { q: "Which is a marine mammal?", options: ["Humpback whale", "Goldfish", "Jellyfish", "Starfish"], correct: 0 }
      ]
    },
    {
      id: "fish",
      num: 26,
      slug: "Fish",
      title: "Fish",
      emoji: "🐟",
      opponent: { name: "Finn Fish", icon: "🐠" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Gills, Fins, Scales",
          story: "Finn Fish zipped loops around Kai's mask, scales flashing silver and blue. \"We're the classic ocean swimmers,\" he bubbled. \"Gills grab oxygen from water, fins steer, and scales armor our sides.\"",
          explanation: "Fish are cold-blooded vertebrates with gills for breathing dissolved oxygen, fins for movement, and usually scales for protection. They dominate ocean food webs from reefs to the deep.",
          words: ["gills", "fins", "scales", "vertebrates"]
        },
        {
          slot: "main-2",
          storyTitle: "Schools for Safety",
          story: "Thousands of fish moved as one shimmering cloud. Finn Fish darted inside the crowd. \"Predators get confused when we stick together,\" he said. \"Watch — the whole school turns like a single animal!\"",
          explanation: "Many fish form schools to reduce the chance any one individual is caught. Matching movements and shiny sides create optical illusions that protect small fish from hunters.",
          words: ["school", "predators", "illusion", "protect"]
        },
        {
          slot: "main-3",
          storyTitle: "Shapes for Jobs",
          story: "Flat rays skim the sand, eels hid in holes, and speedy tuna cut through open water. Kai sketched each outline. \"Different bodies, different jobs,\" Finn Fish said. \"Ocean diversity is our superpower.\"",
          explanation: "Fish body shapes match lifestyles: streamlined tuna for speed, flat flounders for hiding on the bottom, anglerfish for luring prey, and pufferfish for puffing up when threatened.",
          words: ["diversity", "streamlined", "camouflage", "adaptation"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "How Gills Work",
          story: "Finn Fish fanned his gill covers so Kai could see feathery red filaments inside. \"Water flows one way, blood flows another,\" he explained. \"Oxygen hops from water into my blood — no lungs needed!\"",
          explanation: "Gills have thin, folded surfaces with rich blood supply. Counter-current flow lets fish extract most of the oxygen from water, even when oxygen levels are low."
        },
        {
          slot: "explain-2",
          storyTitle: "Freshwater and Saltwater",
          story: "Some fish live in rivers, some in seas, and a few like salmon travel both. \"Saltwater fish balance minerals inside their bodies,\" Finn Fish said. \"Freshwater fish face the opposite puzzle — we're all chemists!\"",
          explanation: "Marine fish often drink seawater and excrete extra salt through gills. Freshwater fish absorb water and produce dilute urine. Migratory species like salmon adapt as they move."
        },
        {
          slot: "explain-3",
          storyTitle: "Fish and People",
          story: "Captain Coral served Kai a dinner plate and talked about fishing wisely. \"Fish feed billions of people,\" she said. \"When we catch too many young fish or destroy habitats, stocks collapse — so rules and reefs matter.\"",
          explanation: "Sustainable fishing sets limits on catch size and season, protects breeding grounds, and reduces bycatch. Aquaculture and habitat restoration help meet food needs without emptying the sea."
        }
      ],
      game: {
        id: "school-run",
        title: "🐟 School Run",
        desc: "Switch lanes ⬅️➡️ — gobble plankton treats, dodge sharks and hooks!",
        boot: {
          game: "school-run",
          goal: 64,
          time: 55,
          lives: 3,
          good: ["🫧", "🦐", "🌿"],
          bad: ["🦈", "🎣"],
          player: "🐠",
          bgTop: "#015a7a",
          bgBot: "#004d73"
        }
      },
      quiz: [
        { q: "Fish breathe using…", options: ["Gills", "Lungs like humans", "Leaves", "Feathers"], correct: 0 },
        { q: "Why do small fish form schools?", options: ["To confuse predators and stay safer", "To fly in the sky", "To sleep on land", "To grow trees"], correct: 0 },
        { q: "A streamlined body helps fish…", options: ["Swim fast", "Climb mountains", "Dig deserts", "Hold breath for years on land"], correct: 0 },
        { q: "Salmon are famous for…", options: ["Migrating between river and ocean", "Living only in deserts", "Having feathers", "Building coral reefs"], correct: 0 },
        { q: "Sustainable fishing means…", options: ["Catching fish without wiping out populations", "Catching every fish today", "Removing all reefs", "Polluting the sea"], correct: 0 }
      ]
    }
  ];
})(window);
