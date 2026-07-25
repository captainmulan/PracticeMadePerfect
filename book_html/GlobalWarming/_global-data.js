/* Global Warming — chapter content (generate: node _generate-book.cjs) */
(function (w) {
  w.GLOBAL_CHAPTERS = [
    {
      id: "overview",
      num: 5,
      slug: "Climate-Overview",
      title: "Climate Overview",
      emoji: "🌍",
      opponent: { name: "Professor Leaf", icon: "🍃" },
      viewLabels: [
        {
          id: "vertical",
          label: "Climate Timeline",
          desc: "Painted Earth cross-section — five eras from ice ages to today. Tap each band to learn how our planet's temperature has changed over time."
        },
        {
          id: "surface",
          label: "Earth Systems",
          desc: "Land, ocean, and sky work together — with all five climate layers stacked from the atmosphere down to the deep sea."
        },
        {
          id: "reef",
          label: "Heat Map",
          desc: "Top-down global view — color rings show warmer and cooler regions. Tap a ring to learn what drives the heat."
        },
        {
          id: "deep",
          label: "Weather Window",
          desc: "Look through a scientist's window — one climate clue at a time, close up. Tap to peek at the next discovery."
        }
      ],
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Our Changing Planet",
          story: "Maya stood on a hill and watched clouds roll across the valley. Professor Leaf adjusted her leaf-badge lab coat and smiled. \"Weather is what you see today,\" she said. \"Climate is the big pattern over many years — and right now, Earth is warming faster than it has in a very long time.\"",
          explanation: "Climate is the average weather over decades — temperature, rain, wind, and seasons. Global warming means Earth's average temperature is rising, mainly because human activities add heat-trapping gases to the atmosphere.",
          words: ["climate", "weather", "warming", "atmosphere"]
        },
        {
          slot: "main-2",
          storyTitle: "One Connected World",
          story: "Professor Leaf unrolled a glowing map showing forests, oceans, ice caps, and cities linked by swirling arrows. \"Nothing on Earth stays separate,\" she explained. \"Heat in the air melts ice, warm oceans change storms, and what we do in one country affects the whole planet.\"",
          explanation: "Earth's climate system connects the atmosphere, oceans, land, ice, and living things. Changes in one part — like burning fuel or cutting forests — ripple through the whole system.",
          words: ["atmosphere", "oceans", "ice caps", "connected"]
        },
        {
          slot: "main-3",
          storyTitle: "Why It Matters to You",
          story: "Maya spotted a butterfly landing on a wildflower and asked, \"Is this about polar bears far away?\" Professor Leaf knelt beside her. \"It's about your backyard too — hotter summers, stronger storms, and animals that may not find food or homes they need.\"",
          explanation: "Global warming affects farms, water supplies, health, wildlife, and coastlines everywhere. Learning how climate works helps us make smarter choices to protect the planet we share.",
          words: ["storms", "wildlife", "backyard", "choices"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Weather vs Climate",
          story: "Back at the climate lab, Maya learned that a snowy day does not cancel global warming — just like one cold hour does not mean summer is over. Professor Leaf showed graphs spanning a hundred years. \"One day is weather,\" she said. \"The long trend is climate.\"",
          explanation: "Weather changes hour to hour; climate is the long-term average. Scientists use thermometers, satellites, ice cores, and tree rings to track how Earth's temperature has shifted over centuries."
        },
        {
          slot: "explain-2",
          storyTitle: "The Fever Analogy",
          story: "Professor Leaf compared Earth to a body with a fever. \"A small rise in average temperature makes a huge difference,\" she said. \"Just one degree Celsius can mean more droughts, heavier rains, and ice melting faster.\"",
          explanation: "Earth has warmed about 1.1°C (2°F) since the late 1800s. That may sound small, but it is enough to shift growing seasons, raise sea levels, and increase extreme heat events worldwide."
        },
        {
          slot: "explain-3",
          storyTitle: "Hope and Action",
          story: "Maya frowned at a chart showing rising temperatures, then noticed a second line where emissions could fall. Professor Leaf handed her a reusable water bottle. \"The future is not fixed,\" she said. \"When people learn, invent, and act together, we can slow warming and protect life on Earth.\"",
          explanation: "Climate change is a serious challenge, but solutions exist: clean energy, protecting forests, reducing waste, and smarter transportation. Young explorers like Maya can help by learning and sharing what they know."
        }
      ],
      game: {
        id: "zone-sort",
        title: "🌍 Climate Sort",
        desc: "Move ← → to catch climate clues in order 🌡️ → 🏭 → 💨 → 🧊 → 🌱. Avoid trash! Reach 60 points.",
        boot: {
          game: "zone-sort",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🌡️", "🏭", "💨", "🧊", "🌱"],
          bad: ["🗑️", "🏭"],
          player: "🌍",
          bgTop: "#2e7d32",
          bgBot: "#1b5e20"
        }
      },
      quiz: [
        { q: "Climate is best described as…", options: ["Today's weather only", "The average weather over many years", "A single rainy day", "Only what happens in winter"], correct: 1 },
        { q: "Global warming means Earth's average temperature is…", options: ["Rising over time", "Staying exactly the same forever", "Dropping every year", "Only changing on Mars"], correct: 0 },
        { q: "Earth's climate system includes…", options: ["Only the air above cities", "Atmosphere, oceans, land, ice, and living things", "Just the moon", "Only deserts"], correct: 1 },
        { q: "About how much has Earth warmed since the late 1800s?", options: ["About 1.1°C", "About 50°C", "Exactly 0°C", "About 100°C"], correct: 0 },
        { q: "What can help address climate change?", options: ["Learning and making greener choices", "Burning more trash", "Cutting down all forests", "Ignoring the science"], correct: 0 }
      ]
    },
    {
      id: "greenhouse",
      num: 8,
      slug: "Greenhouse-Effect",
      title: "Greenhouse Effect",
      emoji: "🏠",
      opponent: { name: "Sunny Sam", icon: "☀️" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Nature's Cozy Blanket",
          story: "Maya stepped into a sunny greenhouse filled with tomato plants. Sunny Sam, a cheerful sunbeam character with a warm glow, danced on the glass roof. \"This building traps heat — just like certain gases trap heat around Earth,\" he beamed. \"Without that blanket, our planet would be a frozen ice ball!\"",
          explanation: "The greenhouse effect is natural and important. Gases like carbon dioxide and water vapor in the atmosphere trap some of the sun's heat, keeping Earth warm enough for life.",
          words: ["greenhouse effect", "gases", "heat", "atmosphere"]
        },
        {
          slot: "main-2",
          storyTitle: "Sun In, Heat Stays",
          story: "Professor Leaf drew a diagram: sunlight passing through the air, bouncing off the ground, and some heat trying to escape to space. Sunny Sam pointed at the arrows. \"Short waves come in easily,\" he said. \"But outgoing heat gets snagged by greenhouse gases — like a soft blanket holding warmth in.\"",
          explanation: "The sun sends short-wave light to Earth. The surface warms and sends long-wave heat back upward. Greenhouse gases absorb some of that heat and re-radiate it, warming the lower atmosphere.",
          words: ["sunlight", "radiate", "blanket", "surface"]
        },
        {
          slot: "main-3",
          storyTitle: "Too Much of a Good Thing",
          story: "Maya wiped sweat from her brow inside the greenhouse. \"It feels great for tomatoes,\" she said, \"but what about Earth?\" Professor Leaf nodded. \"Extra greenhouse gases from cars, factories, and deforestation thicken the blanket — and Earth gets hotter than before.\"",
          explanation: "Human activities have added extra greenhouse gases, especially carbon dioxide and methane. A stronger greenhouse effect means more heat stays trapped, causing global warming.",
          words: ["carbon dioxide", "methane", "factories", "trapped"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Greenhouse Gases",
          story: "Professor Leaf listed the main greenhouse gases on a chart — carbon dioxide, methane, nitrous oxide, and water vapor. Sunny Sam lit up each name. \"We need some of these to live,\" he said. \"The problem is the extra amount humans are adding.\"",
          explanation: "Key greenhouse gases include CO₂ (from burning fuels), methane (from agriculture and leaks), and nitrous oxide (from fertilizers). They stay in the atmosphere for different lengths of time but all trap heat."
        },
        {
          slot: "explain-2",
          storyTitle: "Venus vs Earth",
          story: "Sunny Sam showed Maya two planets side by side. \"Venus has a super-thick CO₂ atmosphere — scorching hot,\" he said. \"Earth's blanket is thinner and just right for oceans, forests, and us — unless we make it too thick.\"",
          explanation: "Earth's natural greenhouse effect keeps average temperatures around 15°C (59°F). Without it, Earth would be about −18°C (−0°F). Too much greenhouse gas pushes temperatures too high for comfort and safety."
        },
        {
          slot: "explain-3",
          storyTitle: "Keeping the Balance",
          story: "Maya opened vents in the greenhouse to cool the plants. Professor Leaf smiled. \"Earth cannot open a window,\" she said. \"We balance the blanket by planting trees, using clean energy, and wasting less — giving extra heat a way out.\"",
          explanation: "Forests and oceans absorb some greenhouse gases. Reducing emissions and protecting natural carbon sinks helps restore balance to the greenhouse effect."
        }
      ],
      game: {
        id: "sunbeam-snap",
        title: "☀️ Sunbeam Snap",
        desc: "Tap sun and heat icons when they shine through the greenhouse glass! Avoid smoke and pollution.",
        boot: {
          game: "sunbeam-snap",
          goal: 72,
          time: 55,
          lives: 3,
          good: ["☀️", "🌡️", "🌈", "🪟"],
          bad: ["🏭", "💨"],
          bgTop: "#fff8e1",
          bgBot: "#f9a825"
        }
      },
      quiz: [
        { q: "The greenhouse effect helps Earth by…", options: ["Trapping some heat so life can exist", "Removing all oxygen", "Freezing the oceans", "Blocking all sunlight"], correct: 0 },
        { q: "Greenhouse gases trap heat after it…", options: ["Bounces off Earth's surface", "Comes only from the moon", "Stays inside rocks forever", "Never reaches Earth"], correct: 0 },
        { q: "Which gas is a major greenhouse gas?", options: ["Carbon dioxide", "Pure gold", "Helium from balloons only", "Table salt"], correct: 0 },
        { q: "Extra greenhouse gases from human activity…", options: ["Make Earth warmer than before", "Make Earth colder every year", "Have no effect at all", "Only change the moon"], correct: 0 },
        { q: "Without the natural greenhouse effect, Earth would be…", options: ["Much colder and mostly frozen", "Exactly the same temperature", "On fire", "Without gravity"], correct: 0 }
      ]
    },
    {
      id: "carbon-dioxide",
      num: 11,
      slug: "Carbon-Dioxide",
      title: "Carbon Dioxide",
      emoji: "💨",
      opponent: { name: "Carbon Carl", icon: "💨" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Meet CO₂",
          story: "Maya breathed out a visible puff on a cool morning. Carbon Carl, a wispy gray character shaped like a curly vapor, popped into view. \"That's me — carbon dioxide!\" he said. \"Plants breathe you in, you breathe me out. I've been part of Earth's cycle for millions of years.\"",
          explanation: "Carbon dioxide (CO₂) is a colorless gas made of one carbon atom and two oxygen atoms. Animals release it when they breathe; plants absorb it during photosynthesis.",
          words: ["carbon dioxide", "CO₂", "plants", "photosynthesis"]
        },
        {
          slot: "main-2",
          storyTitle: "The Carbon Cycle",
          story: "Professor Leaf spun a wheel showing forests, oceans, animals, and volcanoes passing carbon back and forth. Carbon Carl rode the loop like a roller coaster. \"I move from air to tree to animal to soil and back again,\" he explained. \"Usually the cycle stays balanced.\"",
          explanation: "The carbon cycle moves carbon through the atmosphere, plants, animals, soil, and oceans. Natural processes keep CO₂ levels fairly steady over long periods — until extra carbon is added from burning fossil fuels.",
          words: ["carbon cycle", "forests", "oceans", "balanced"]
        },
        {
          slot: "main-3",
          storyTitle: "Too Much in the Air",
          story: "Maya watched smoke rise from a distant factory chimney. Carbon Carl grew bigger and darker. \"When humans burn coal, oil, and gas, they dig up ancient carbon and dump extra me into the sky,\" he said sadly. \"I hang around for a long time, trapping heat.\"",
          explanation: "Burning fossil fuels releases carbon stored underground for millions of years. CO₂ can stay in the atmosphere for centuries, building up and strengthening the greenhouse effect.",
          words: ["fossil fuels", "atmosphere", "centuries", "greenhouse"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Plants as Carbon Catchers",
          story: "In a sun-dappled forest, Maya watched leaves drink in sunlight. Professor Leaf explained that trees lock carbon in wood and roots. \"Forests are carbon sinks,\" she said. \"Cutting or burning them releases stored CO₂ back into the air.\"",
          explanation: "Photosynthesis pulls CO₂ from the air and builds plant material. Forests, wetlands, and oceans absorb large amounts of carbon. Protecting and planting trees helps reduce atmospheric CO₂."
        },
        {
          slot: "explain-2",
          storyTitle: "Measuring the Air",
          story: "Carbon Carl pointed to a graph climbing year after year. \"Scientists measure me on mountaintops and with satellites,\" he said. \"CO₂ in the atmosphere is now over 420 parts per million — higher than any time in human history.\"",
          explanation: "Scientists track CO₂ with instruments like those at Mauna Loa Observatory in Hawaii. The steady rise matches the increase in fossil fuel burning since the Industrial Revolution."
        },
        {
          slot: "explain-3",
          storyTitle: "Oceans Absorb CO₂",
          story: "Professor Leaf showed Maya a seashell fizzing slightly in acidic water. \"Oceans swallow a lot of CO₂,\" she said, \"but that makes seawater more acidic, which hurts corals and shell-building creatures.\"",
          explanation: "About a quarter of human CO₂ emissions dissolve into the ocean, causing ocean acidification. This makes it harder for corals, oysters, and plankton to build shells and skeletons."
        }
      ],
      game: {
        id: "glow-rhythm",
        title: "💨 Carbon Rhythm",
        desc: "Tap trees and leaves when the carbon cycle pulse is brightest — not too early! Avoid factories and cars.",
        boot: {
          game: "glow-rhythm",
          goal: 55,
          time: 55,
          lives: 3,
          good: ["🌳", "💨", "🍃", "🌿"],
          bad: ["🏭", "🚗"],
          bgTop: "#33691e",
          bgBot: "#1b2e0f"
        }
      },
      quiz: [
        { q: "Plants use carbon dioxide for…", options: ["Photosynthesis", "Making lightning", "Building mountains", "Creating moonlight"], correct: 0 },
        { q: "The carbon cycle moves carbon through…", options: ["Air, plants, animals, soil, and oceans", "Only outer space", "Just one tree forever", "Underground caves only"], correct: 0 },
        { q: "Burning fossil fuels adds CO₂ because…", options: ["Ancient stored carbon is released into the air", "Rocks create oxygen only", "Cars filter CO₂ out", "Coal contains no carbon"], correct: 0 },
        { q: "Forests help climate by…", options: ["Absorbing and storing carbon", "Releasing all carbon instantly", "Blocking the sun completely", "Making Earth colder than space"], correct: 0 },
        { q: "When oceans absorb extra CO₂, they become…", options: ["More acidic", "Pure fresh water", "Solid ice", "Completely empty"], correct: 0 }
      ]
    },
    {
      id: "fossil-fuels",
      num: 14,
      slug: "Fossil-Fuels",
      title: "Fossil Fuels",
      emoji: "⛽",
      opponent: { name: "Coal Casey", icon: "⛏️" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Energy from the Past",
          story: "Maya toured a museum diorama showing ancient swamps buried for millions of years. Coal Casey, a sturdy miner character with a hard hat, tapped a lump of coal. \"I'm sunshine from dinosaur days, packed into rock,\" he rumbled. \"Coal, oil, and natural gas — we powered the modern world.\"",
          explanation: "Fossil fuels formed from ancient plants and tiny sea creatures buried under layers of earth. Over millions of years, heat and pressure turned them into coal, oil, and natural gas.",
          words: ["fossil fuels", "coal", "oil", "natural gas"]
        },
        {
          slot: "main-2",
          storyTitle: "Power Everywhere",
          story: "Professor Leaf pointed out lights, buses, and factories all running on stored ancient energy. \"Fossil fuels are packed with energy,\" she said. \"When we burn them, we release that power — and also carbon dioxide that was locked away for ages.\"",
          explanation: "Fossil fuels supply most of the world's electricity, heating, and transportation fuel. Burning them releases energy quickly but also sends greenhouse gases into the atmosphere.",
          words: ["electricity", "transportation", "burning", "energy"]
        },
        {
          slot: "main-3",
          storyTitle: "The Hidden Cost",
          story: "Maya coughed near a smoky tailpipe and frowned. Coal Casey looked down. \"We gave people warmth and travel,\" he said, \"but burning us too fast overheats the planet. The challenge is finding cleaner ways to power life without leaving everyone in the dark.\"",
          explanation: "Fossil fuel use is the main driver of human-caused climate change. Mining and drilling can also harm habitats and water. Transitioning to cleaner energy reduces emissions and pollution.",
          words: ["emissions", "pollution", "overheats", "cleaner"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Three Main Fuels",
          story: "Coal Casey displayed three samples — black coal, golden oil, and invisible natural gas. \"Coal fuels many power plants,\" he said. \"Oil runs cars and planes. Gas heats homes and makes electricity. All of us release CO₂ when burned.\"",
          explanation: "Coal is mostly carbon and burns in power stations. Oil (petroleum) becomes gasoline and plastics. Natural gas is mainly methane — it burns cleaner than coal but still produces CO₂ and can leak methane, a potent greenhouse gas."
        },
        {
          slot: "explain-2",
          storyTitle: "Not Unlimited",
          story: "Professor Leaf showed a bathtub filling with water while the drain was open. \"Fossil fuels took millions of years to form,\" she said. \"We use them in decades. They will run out — and the climate damage happens long before the last drop.\"",
          explanation: "Fossil fuel reserves are finite. Even before they run out, their greenhouse gas emissions cause warming, sea level rise, and ecosystem damage — reasons to shift to renewable energy sooner."
        },
        {
          slot: "explain-3",
          storyTitle: "Breaking the Habit",
          story: "Maya rode a bike past a solar panel array gleaming on a school roof. Professor Leaf cheered. \"Every time we choose efficiency, public transit, or clean power, we need a little less coal, oil, and gas,\" she said.",
          explanation: "Reducing fossil fuel use means using energy wisely, switching to renewables, and designing cities and vehicles that waste less power. Many countries are already adding more wind and solar every year."
        }
      ],
      game: {
        id: "sonar-ping",
        title: "⛽ Fuel Finder",
        desc: "Dark screen! Tap fossil fuel icons the moment sonar reveals them. Avoid green energy decoys!",
        boot: {
          game: "sonar-ping",
          goal: 48,
          time: 55,
          lives: 3,
          good: ["⛽", "🛢️", "🏭"],
          bad: ["🌱", "♻️"],
          bgTop: "#37474f",
          bgBot: "#263238"
        }
      },
      quiz: [
        { q: "Fossil fuels formed from…", options: ["Ancient plants and sea life buried over millions of years", "Rocks that fell from the moon", "Fresh rainwater only", "Wind and sunlight yesterday"], correct: 0 },
        { q: "The three main fossil fuels are…", options: ["Coal, oil, and natural gas", "Ice, snow, and hail", "Wood, paper, and cotton", "Sand, clay, and gravel"], correct: 0 },
        { q: "Burning fossil fuels mainly adds…", options: ["Carbon dioxide to the atmosphere", "Pure oxygen only", "No gases at all", "Extra ozone to space"], correct: 0 },
        { q: "Fossil fuels are used for…", options: ["Electricity, heating, and transportation", "Growing trees instantly", "Cooling the whole ocean", "Making Earth's core spin faster"], correct: 0 },
        { q: "A key solution to fossil fuel pollution is…", options: ["Using cleaner and renewable energy", "Burning more coal every day", "Removing all plants", "Stopping all science"], correct: 0 }
      ]
    },
    {
      id: "renewable-energy",
      num: 17,
      slug: "Renewable-Energy",
      title: "Renewable Energy",
      emoji: "☀️",
      opponent: { name: "Windy Wren", icon: "💨" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Power That Keeps Coming",
          story: "Maya climbed a grassy hill where wind turbines spun like giant pinwheels. Windy Wren, a breezy bird character, swooped alongside her. \"Sun, wind, water, and Earth's heat never run out on human timescales,\" she chirped. \"That's renewable energy — nature's free lunch!\"",
          explanation: "Renewable energy comes from sources that replenish naturally: sunlight, wind, moving water, geothermal heat, and biomass. Unlike fossil fuels, they produce little or no greenhouse gas emissions when generating power.",
          words: ["renewable", "sunlight", "wind", "geothermal"]
        },
        {
          slot: "main-2",
          storyTitle: "Solar Superstars",
          story: "Professor Leaf showed Maya solar panels on rooftops and fields, quietly turning sunshine into electricity. \"Every hour, enough sunlight hits Earth to power civilization many times over,\" she said. \"We just need to catch it.\"",
          explanation: "Solar panels use photovoltaic cells to convert sunlight directly into electricity. Solar farms and home panels are among the fastest-growing energy sources worldwide.",
          words: ["solar panels", "photovoltaic", "electricity", "sunshine"]
        },
        {
          slot: "main-3",
          storyTitle: "Wind and Water",
          story: "Windy Wren led Maya to a riverside dam and a offshore wind farm on a map. \"Wind turbines harvest moving air,\" she explained. \"Hydro dams use flowing water. Both spin generators to make clean power day and night.\"",
          explanation: "Wind turbines capture kinetic energy from wind. Hydroelectric dams use flowing or falling water. Both spin magnets inside generators to produce electricity without burning fuel.",
          words: ["turbines", "hydroelectric", "generators", "kinetic"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "More Than Sun and Wind",
          story: "Professor Leaf opened a catalog of clean options — geothermal plants tapping underground heat, tidal turbines in the sea, and farms turning waste into biogas. \"Renewables come in many flavors,\" she said.",
          explanation: "Geothermal energy uses heat from inside Earth. Biomass burns organic waste or crops for fuel when managed sustainably. Tidal and wave power harvest ocean movement. Each fits different places and needs."
        },
        {
          slot: "explain-2",
          storyTitle: "Storage and Smart Grids",
          story: "Maya asked, \"What about cloudy days?\" Windy Wren pointed to a battery building storing daytime solar. \"Batteries, pumped water, and connected grids balance supply and demand,\" Professor Leaf added. \"Engineers are solving the puzzle.\"",
          explanation: "Renewable power varies with weather, so batteries, hydro storage, and wide power grids help keep electricity steady. Smart grids route power efficiently from where it is generated to where it is needed."
        },
        {
          slot: "explain-3",
          storyTitle: "Jobs and Cleaner Air",
          story: "Maya met a technician fixing a turbine and a student designing a solar car. \"Clean energy creates jobs and reduces smog,\" Professor Leaf said. \"Every panel and turbine is a step toward a cooler, healthier planet.\"",
          explanation: "Renewable industries employ millions of people in manufacturing, installation, and maintenance. Replacing coal and gas plants cuts air pollution, helping lungs and the climate at the same time."
        }
      ],
      game: {
        id: "reef-match",
        title: "☀️ Energy Match",
        desc: "Flip cards and find matching renewable energy pairs before time runs out!",
        boot: {
          game: "reef-match",
          goal: 80,
          time: 70,
          lives: 3,
          good: ["☀️", "💨", "🌊", "🌱"],
          bad: [],
          winText: "Match all pairs!",
          bgTop: "#0277bd",
          bgBot: "#01579b"
        }
      },
      quiz: [
        { q: "Renewable energy sources include…", options: ["Sun, wind, and flowing water", "Coal and oil only", "Ancient buried dinosaurs", "Plastic trash burned forever"], correct: 0 },
        { q: "Solar panels convert sunlight into…", options: ["Electricity", "Rocks", "Salt water", "Coal"], correct: 0 },
        { q: "Wind turbines generate power from…", options: ["Moving air", "Underground coal", "Moon gravity only", "Frozen ice cubes"], correct: 0 },
        { q: "A challenge with solar and wind is…", options: ["Matching supply when weather changes", "They never produce any energy", "They only work on Mars", "They increase CO₂ when running"], correct: 0 },
        { q: "Renewable energy helps climate by…", options: ["Replacing fossil fuels and cutting emissions", "Adding more smoke to the air", "Removing all trees", "Warming the planet faster"], correct: 0 }
      ]
    },
    {
      id: "melting-ice",
      num: 20,
      slug: "Melting-Ice",
      title: "Melting Ice",
      emoji: "🧊",
      opponent: { name: "Polar Pete", icon: "🐧" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Ice on Thin Water",
          story: "Maya put on a virtual parka and stood beside a cracking ice shelf in Antarctica. Polar Pete, a friendly emperor penguin, waddled over. \"This ice has floated here for thousands of years,\" he said. \"But warmer air and ocean water are melting it faster than ever.\"",
          explanation: "Earth's ice includes glaciers, ice sheets (Greenland and Antarctica), and floating sea ice. Rising temperatures from global warming are melting ice worldwide at accelerating rates.",
          words: ["glaciers", "ice sheets", "Antarctica", "melting"]
        },
        {
          slot: "main-2",
          storyTitle: "Land Ice vs Sea Ice",
          story: "Professor Leaf showed two cubes — one on a plate, one in a glass of water. \"Sea ice already floats,\" she explained. \"But ice on land — like Greenland's ice sheet — adds new water to the ocean when it melts. That's a big deal for sea levels.\"",
          explanation: "Melting floating sea ice does not raise sea level much (like melting ice in a drink). Melting land ice — glaciers and ice sheets — pours extra water into oceans and raises sea levels globally.",
          words: ["sea ice", "land ice", "Greenland", "sea level"]
        },
        {
          slot: "main-3",
          storyTitle: "White Reflects, Dark Absorbs",
          story: "Polar Pete spread his wings over bright snow. \"White ice bounces sunlight back to space — we call that albedo,\" he said. \"When ice melts, dark ocean or rock absorbs more heat, which melts even more ice. It's a feedback loop.\"",
          explanation: "Ice and snow reflect sunlight (high albedo). When they melt, darker surfaces absorb more heat, speeding up warming — a positive feedback that makes climate change harder to reverse.",
          words: ["albedo", "reflect", "feedback", "absorb"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Glaciers in Retreat",
          story: "Professor Leaf flipped through photos of the same mountain glacier — thick and white in old pictures, thin and rocky today. \"Glaciers worldwide are shrinking,\" she said. \"Communities that rely on glacier melt for drinking water face shortages.\"",
          explanation: "Mountain glaciers feed rivers used for drinking, farming, and hydropower. As they shrink, regions from the Andes to the Himalayas may lose a reliable dry-season water source."
        },
        {
          slot: "explain-2",
          storyTitle: "Permafrost Thaw",
          story: "Polar Pete pointed to cracked tundra where the ground had sunk. \"Permafrost is frozen soil that locked away plant matter for ages,\" Professor Leaf said. \"When it thaws, it can release methane and CO₂ — adding more greenhouse gases.\"",
          explanation: "Permafrost underlies Arctic land. Thawing exposes ancient organic material to microbes that release methane and carbon dioxide, potentially accelerating warming further."
        },
        {
          slot: "explain-3",
          storyTitle: "Why Ice Matters to Everyone",
          story: "Maya realized her coastal hometown could flood if ice keeps melting. Polar Pete nodded solemnly. \"Ice far away protects homes everywhere,\" he said. \"Slowing warming helps my home — and yours too.\"",
          explanation: "Ice loss contributes to sea level rise, changes ocean currents, and affects weather patterns globally. Protecting ice means cutting emissions and keeping global temperature rise as low as possible."
        }
      ],
      game: {
        id: "trench-pilot",
        title: "🧊 Ice Pilot",
        desc: "Steer ⬆️⬇️ through melting ice gaps. Travel far to win!",
        boot: {
          game: "trench-pilot",
          goal: 50,
          time: 45,
          lives: 3,
          good: [],
          bad: ["🧊", "🏔️", "❄️"],
          winText: "Distance goal: 50",
          bgTop: "#b3e5fc",
          bgBot: "#0288d1"
        }
      },
      quiz: [
        { q: "Melting land ice (like Greenland's ice sheet)…", options: ["Adds water and raises sea levels", "Has no effect on oceans", "Makes oceans smaller", "Only affects Antarctica's sky"], correct: 0 },
        { q: "Warmer temperatures melt ice because…", options: ["Heat breaks down frozen water faster", "Ice grows thicker in heat", "Cold air melts glaciers", "Ice ignores temperature"], correct: 0 },
        { q: "Albedo means how much a surface…", options: ["Reflects sunlight", "Digests food", "Produces electricity", "Stores coal underground"], correct: 0 },
        { q: "When ice melts and exposes dark ocean, Earth…", options: ["Absorbs more heat and warms faster", "Becomes colder instantly", "Stops warming forever", "Loses all water"], correct: 0 },
        { q: "Thawing permafrost can release…", options: ["Methane and carbon dioxide", "Pure oxygen only", "Gold and silver", "Nothing at all"], correct: 0 }
      ]
    },
    {
      id: "rising-seas",
      num: 23,
      slug: "Rising-Seas",
      title: "Rising Seas",
      emoji: "🌊",
      opponent: { name: "Tide Tara", icon: "🌊" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Higher Water Lines",
          story: "Maya visited a coastal town where old flood markers sat well above today's high tide. Tide Tara, a wave character with sea-green hair, rolled onto the pier. \"The ocean is climbing,\" she said. \"Not just from melting ice — warm water expands, like liquid in a heated bottle.\"",
          explanation: "Sea level rise comes from two main causes: melting land ice adding water to oceans, and thermal expansion — seawater taking up more space as it warms.",
          words: ["sea level", "thermal expansion", "melting ice", "oceans"]
        },
        {
          slot: "main-2",
          storyTitle: "Coastal Communities",
          story: "Professor Leaf showed maps of cities built near the shore — homes, ports, and farms at risk. \"Millions of people live low and close to the sea,\" she said. \"Even a few centimeters of rise can worsen flooding during storms.\"",
          explanation: "Low-lying islands and coastal cities face increased flooding, storm surges, and saltwater intrusion into farmland and drinking wells as seas rise.",
          words: ["flooding", "storm surges", "coastal", "intrusion"]
        },
        {
          slot: "main-3",
          storyTitle: "Living with the Tide",
          story: "Maya saw seawalls, restored mangroves, and houses on stilts. Tide Tara smiled. \"Some places lift buildings, plant protective wetlands, or move back from the edge,\" she said. \"Planning ahead saves lives and treasures.\"",
          explanation: "Adaptation strategies include sea walls, elevated buildings, flood barriers, and restoring mangroves and marshes that absorb wave energy. Some communities may eventually relocate inland.",
          words: ["adaptation", "mangroves", "seawalls", "relocate"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Measuring the Rise",
          story: "Professor Leaf pointed to a tide gauge recording sea level over decades — a slow but steady climb. \"Global average sea level has risen about 20 centimeters since 1900,\" she said. \"The pace is speeding up as ice melts faster.\"",
          explanation: "Satellites and tide gauges track sea level globally. Projections suggest continued rise this century, with the amount depending on how quickly greenhouse gas emissions are reduced."
        },
        {
          slot: "explain-2",
          storyTitle: "Storm Surge Danger",
          story: "Tide Tara demonstrated how a hurricane pushes a wall of water onto shore. \"Higher baseline seas mean storm surges reach farther inland,\" she warned. \"Floods that used to be 'once in a century' happen more often.\"",
          explanation: "Storm surges are temporary rises from hurricanes and cyclones. When added to higher average sea levels, they cause more damage to buildings, roads, and ecosystems."
        },
        {
          slot: "explain-3",
          storyTitle: "Island Nations",
          story: "Maya read a letter from students on a small Pacific island worried about losing their home. Professor Leaf's voice softened. \"Some nations may lose land entirely,\" she said. \"Cutting emissions helps every coast — near and far.\"",
          explanation: "Small island countries like Tuvalu and the Maldives face existential threats from sea level rise. International cooperation on emissions cuts and adaptation funding is critical for their survival."
        }
      ],
      game: {
        id: "breath-dive",
        title: "🌊 Tide Dive",
        desc: "House dive ⬇️ for safe zones, surface ⬆️ before flooding! Watch the O₂ bar!",
        boot: {
          game: "breath-dive",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🏠", "🌊", "🛟"],
          bad: ["🌊", "🏭"],
          player: "🏠",
          bgTop: "#0288d1",
          bgBot: "#01579b"
        }
      },
      quiz: [
        { q: "Sea level rises mainly because of…", options: ["Melting land ice and warming oceans expanding", "Fish swimming to the surface", "Mountains growing taller", "The moon getting heavier"], correct: 0 },
        { q: "Thermal expansion means warm water…", options: ["Takes up more space", "Turns into solid ice", "Disappears from oceans", "Becomes lighter than air"], correct: 0 },
        { q: "Coastal flooding worsens when…", options: ["Sea level is higher during storms", "There are no oceans", "Rivers run uphill", "Tides stop moving"], correct: 0 },
        { q: "Mangroves and marshes help coasts by…", options: ["Absorbing wave energy and reducing erosion", "Making seas rise faster", "Blocking all rain", "Removing all fish"], correct: 0 },
        { q: "Slowing climate change helps seas by…", options: ["Reducing how much ice melts and water expands", "Making oceans vanish", "Freezing all coastlines", "Adding more salt to deserts"], correct: 0 }
      ]
    },
    {
      id: "wildlife",
      num: 26,
      slug: "Wildlife-at-Risk",
      title: "Wildlife at Risk",
      emoji: "🐻",
      opponent: { name: "Bear Bella", icon: "🐻" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Homes Under Pressure",
          story: "Maya walked a forest trail where spring flowers bloomed weeks earlier than her grandmother remembered. Bear Bella, a gentle brown bear with a tracking collar, lumbered beside her. \"Animals time their lives to seasons,\" she rumbled. \"When climate shifts too fast, we miss the food we need.\"",
          explanation: "Climate change alters habitats — shifting temperatures, rainfall, and seasons. Many species cannot move or adapt quickly enough, putting them at risk of decline or extinction.",
          words: ["habitats", "seasons", "species", "extinction"]
        },
        {
          slot: "main-2",
          storyTitle: "Polar Paths",
          story: "Professor Leaf showed photos of polar bears on shrinking ice and penguins facing changed krill supplies. Bear Bella pointed north. \"Arctic ice is my cousins' hunting platform,\" she said. \"Less ice means longer swims and fewer seals to eat.\"",
          explanation: "Polar bears depend on sea ice to hunt seals. Penguins and seals in Antarctica face shifting food webs as ocean temperatures change. Arctic warming is happening faster than the global average.",
          words: ["polar bears", "sea ice", "food web", "Arctic"]
        },
        {
          slot: "main-3",
          storyTitle: "Coral and Creatures",
          story: "Maya watched a video of bleached coral reefs looking ghostly white. \"Fish, turtles, and millions of sea creatures lose their apartment buildings,\" Professor Leaf said. Bear Bella added, \"Land or sea — when home breaks, everyone suffers.\"",
          explanation: "Warm ocean water causes coral bleaching, destroying reef habitats. On land, droughts, wildfires, and heatwaves stress forests, rivers, and the animals that depend on them.",
          words: ["coral bleaching", "droughts", "wildfires", "ecosystems"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Migration and Mismatch",
          story: "Bear Bella described birds arriving before caterpillars hatch — a timing mismatch. \"Migration schedules are tied to daylight,\" Professor Leaf explained. \"Climate shifts temperature and food, but not the sun — so hungry birds may arrive too early.\"",
          explanation: "Phenology is the timing of natural events. Climate change can desynchronize predators and prey, pollinators and flowers, causing population drops up the food chain."
        },
        {
          slot: "explain-2",
          storyTitle: "Range on the Move",
          story: "Maps showed species shifting poleward or uphill to find cooler homes. \"Some butterflies and plants climb mountains,\" Maya observed. \"But at the top, there's nowhere left to go.\"",
          explanation: "Many species are moving toward the poles or higher elevations as temperatures rise. Habitat fragmentation — roads, farms, and cities — blocks their paths, trapping them in shrinking zones."
        },
        {
          slot: "explain-3",
          storyTitle: "Protect and Connect",
          story: "Maya joined a wildlife corridor project linking two forest patches. Bear Bella sniffed approvingly. \"Protected parks, wildlife bridges, and planting native species give us room to roam,\" she said.",
          explanation: "Conservation helps: national parks, wildlife corridors, reducing pollution, and cutting emissions to limit warming. Every healthy habitat supports biodiversity that keeps ecosystems resilient."
        }
      ],
      game: {
        id: "school-run",
        title: "🐻 Wildlife Run",
        desc: "Switch lanes ⬅️➡️ — collect food and shelter, dodge pollution and fire!",
        boot: {
          game: "school-run",
          goal: 64,
          time: 55,
          lives: 3,
          good: ["🦋", "🐻", "🐧", "🌿"],
          bad: ["🏭", "🔥"],
          player: "🦋",
          bgTop: "#558b2f",
          bgBot: "#33691e"
        }
      },
      quiz: [
        { q: "Climate change hurts wildlife by…", options: ["Changing habitats and food timing", "Giving every animal extra food", "Making all seasons identical", "Cooling every forest instantly"], correct: 0 },
        { q: "Polar bears struggle when sea ice…", options: ["Melts and shrinks", "Grows thicker every year", "Turns into grass", "Moves to deserts"], correct: 0 },
        { q: "Coral bleaching happens when…", options: ["Corals lose their algae partners in warm water", "Fish paint corals white", "Ice covers reefs", "Corals move to mountains"], correct: 0 },
        { q: "A phenology mismatch means…", options: ["Natural events happen at the wrong time relative to each other", "All animals hibernate together", "Birds stop migrating forever", "Plants grow without water"], correct: 0 },
        { q: "Wildlife corridors help by…", options: ["Connecting habitats so animals can move safely", "Blocking all animal travel", "Replacing forests with parking lots", "Removing all predators"], correct: 0 }
      ]
    },
    {
      id: "green-future",
      num: 29,
      slug: "Green-Future",
      title: "Green Future",
      emoji: "🌱",
      opponent: { name: "Sprout Sam", icon: "🌱" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Seeds of Change",
          story: "Maya planted a sapling in her school garden while classmates sorted recycling bins. Sprout Sam, a tiny green sprout with a hopeful smile, pushed through the soil. \"Every big forest started as one small plant,\" he said. \"Your choices today grow tomorrow's world.\"",
          explanation: "Individual and community actions — planting trees, reducing waste, saving energy, and choosing clean transport — add up to meaningful climate solutions when many people participate.",
          words: ["planting", "recycling", "choices", "community"]
        },
        {
          slot: "main-2",
          storyTitle: "Inventors and Ideas",
          story: "Professor Leaf toured Maya through a maker lab — kids building wind models, coding smart thermostats, and designing reusable packaging. \"Clean technology is growing fast,\" she said. \"Young inventors will solve problems we haven't even named yet.\"",
          explanation: "Innovation in solar, batteries, electric vehicles, green building, and farming helps reduce emissions. Education and curiosity prepare the next generation to improve these tools.",
          words: ["innovation", "electric vehicles", "technology", "education"]
        },
        {
          slot: "main-3",
          storyTitle: "Together We Can",
          story: "Maya presented her climate project to the town council — bike lanes, solar on the library, and a tree-planting day. Sprout Sam glowed with pride. \"Governments, schools, families, and friends must work as a team,\" Professor Leaf said. \"No one fixes the climate alone.\"",
          explanation: "Climate action works at every level: international agreements, national laws, city planning, school projects, and home habits. Cooperation and fairness help all countries build a sustainable future.",
          words: ["cooperation", "sustainable", "action", "future"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "The Three Rs and More",
          story: "Sprout Sam held up signs: Reduce, Reuse, Recycle — plus Rethink and Repair. \"Using less stuff means less energy to make and move it,\" Professor Leaf added. \"Fixing instead of tossing keeps resources in play.\"",
          explanation: "Reducing consumption cuts emissions from manufacturing and shipping. Reusing and repairing extend product life. Recycling saves materials but using less in the first place is even better."
        },
        {
          slot: "explain-2",
          storyTitle: "Fair and Green",
          story: "Maya learned that floods and droughts hit some communities harder than others. Professor Leaf explained that a green future must be fair — sharing clean technology and helping everyone adapt.",
          explanation: "Climate justice means wealthy countries and polluters help vulnerable nations with funding and technology. Everyone deserves clean air, safe water, and a stable climate.",
          words: ["climate justice", "adapt", "fair", "vulnerable"]
        },
        {
          slot: "explain-3",
          storyTitle: "Your Climate Superpowers",
          story: "Sprout Sam listed Maya's powers: learn, speak up, save energy, walk or bike, eat local food, and vote when she grows up. \"You are already a climate hero,\" Professor Leaf said, pinning a leaf badge on Maya's jacket.",
          explanation: "Kids can talk to family about saving energy, join school green clubs, plant gardens, and teach others. Awareness spreads through friends, families, and communities — creating the green future Sprout Sam dreams of."
        }
      ],
      game: {
        id: "zone-sort",
        title: "🌱 Green Sort",
        desc: "Move ← → to catch green action icons in order ♻️ → 🚲 → 🌱 → 💡 → 🌍. Avoid trash! Reach 60 points.",
        boot: {
          game: "zone-sort",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["♻️", "🚲", "🌱", "💡", "🌍"],
          bad: ["🗑️", "🏭"],
          player: "🌱",
          bgTop: "#43a047",
          bgBot: "#2e7d32"
        }
      },
      quiz: [
        { q: "Planting trees helps climate by…", options: ["Absorbing carbon dioxide from the air", "Adding smoke to the sky", "Warming the soil on purpose", "Removing all oxygen"], correct: 0 },
        { q: "The 'Three Rs' stand for…", options: ["Reduce, Reuse, Recycle", "Run, Race, Roll", "Rain, River, Rock", "Read, Rest, Repeat"], correct: 0 },
        { q: "Electric vehicles can help by…", options: ["Running on cleaner power instead of gasoline", "Using more coal directly", "Removing all roads", "Producing extra CO₂ on purpose"], correct: 0 },
        { q: "Climate justice means…", options: ["Fair help for communities hit hardest by climate change", "Only rich countries matter", "Ignoring small islands", "Stopping all technology"], correct: 0 },
        { q: "Kids can help the climate by…", options: ["Learning, saving energy, and sharing ideas", "Using as much plastic as possible", "Wasting electricity on purpose", "Never talking about science"], correct: 0 }
      ]
    }
  ];
})(window);
