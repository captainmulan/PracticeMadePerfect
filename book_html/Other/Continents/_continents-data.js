/* Continents Adventure — chapter content (generate: node _generate-book.cjs) */
(function (w) {
  w.CONTINENT_CHAPTERS = [
    {
      id: "overview",
      num: 5,
      slug: "Continents-Overview",
      title: "Continents Overview",
      emoji: "🌍",
      opponent: { name: "Professor Globe", icon: "🌍" },
      viewLabels: [
        {
          id: "map",
          label: "World Map",
          desc: "Flat painted map of all seven continents — tap each landmass to learn its name, size, and place on Earth."
        },
        {
          id: "globe",
          label: "Globe Spin",
          desc: "Spin a 3D globe and watch continents rotate — see how land and ocean fit together from every angle."
        },
        {
          id: "plates",
          label: "Plate Puzzle",
          desc: "Sliding tectonic puzzle — move the pieces to see how continents once fit together and still drift today."
        },
        {
          id: "climate",
          label: "Climate Zones",
          desc: "Color bands from icy poles to steamy equator — tap each zone to learn how latitude shapes weather and life."
        }
      ],
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Seven Great Landmasses",
          story: "Maya spread her map across the classroom table and traced the colored shapes with her finger. Professor Globe adjusted his round glasses and smiled. \"Earth has seven continents,\" he said, spinning a desktop globe. \"Each one is a giant puzzle piece of land where billions of people and animals live.\"",
          explanation: "Continents are the largest areas of land on Earth: Africa, Asia, Europe, North America, South America, Antarctica, Australia, plus many islands grouped with them. Together they cover about 29% of Earth's surface.",
          words: ["continents", "landmass", "Earth", "surface"]
        },
        {
          slot: "main-2",
          storyTitle: "Oceans Between, Life Within",
          story: "Professor Globe pointed to the blue spaces between the continents. \"Oceans separate land, but they also connect it,\" he explained. \"Ships, birds, and even wind carry seeds and stories from one shore to another. Continents are neighbors across the water.\"",
          explanation: "Continents are surrounded and linked by five oceans. People have traveled between continents for thousands of years, sharing food, languages, animals, and ideas — making our world one big connected home.",
          words: ["oceans", "connected", "travel", "neighbors"]
        },
        {
          slot: "main-3",
          storyTitle: "Land on the Move",
          story: "Maya watched puzzle pieces slide on Professor Globe's screen — South America nestled into Africa like matching jigsaw edges. \"Continents drift slowly,\" he whispered. \"Millions of years ago they were joined. They're still moving today — about as fast as your fingernails grow!\"",
          explanation: "Earth's outer shell is broken into tectonic plates that slowly move. This continental drift shapes mountains, earthquakes, and volcanoes, and explains why matching fossils appear on continents now far apart.",
          words: ["tectonic", "drift", "plates", "fossils"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Big and Small",
          story: "Professor Globe ranked the continents by size on a chart. Asia stretched widest, Australia sat smallest among the seven, and Antarctica — though icy and empty of cities — was still enormous. \"Size doesn't mean more people,\" he noted. \"Antarctica has research stations, not big towns.\"",
          explanation: "Asia is the largest continent by both area and population. Australia is the smallest continent (though larger than many islands). Antarctica has no permanent residents, only scientists who rotate through research stations."
        },
        {
          slot: "explain-2",
          storyTitle: "Hemispheres and Equator",
          story: "Maya drew a green line around the globe's middle. \"That's the equator,\" Professor Globe said. \"Continents north of it experience different seasons than continents south of it. The equator gets the most direct sunlight year-round.\"",
          explanation: "The equator divides Earth into Northern and Southern Hemispheres. Continents near the equator tend to be warm and rainy; polar continents like parts of Antarctica and northern North America are cold most of the year."
        },
        {
          slot: "explain-3",
          storyTitle: "Explore with Care",
          story: "Maya pinned photos of rainforests, deserts, and coral reefs beside each continent. Professor Globe nodded proudly. \"Every continent holds unique habitats,\" he said. \"When we learn about them, we can protect forests, rivers, and animals for the next generation of explorers like you.\"",
          explanation: "Continents contain diverse biomes — from African savannas to Asian mountains to South American rainforests. Conservation, national parks, and learning about other cultures help keep these places healthy and welcoming."
        }
      ],
      game: {
        id: "zone-sort",
        title: "🌍 Continent Sort",
        desc: "Move ← → to catch continent icons in exploration order 🌍 → 🦁 → 🐼 → 🏰 → 🦅 → 🦙 → 🐧 → 🦘. Avoid trash! Reach 60 points.",
        boot: {
          game: "zone-sort",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🌍", "🦁", "🐼", "🏰", "🦅", "🦙", "🐧", "🦘"],
          bad: ["🗑️", "🛢️"],
          player: "🧭",
          bgTop: "#2e7d32",
          bgBot: "#1b5e20"
        }
      },
      quiz: [
        { q: "How many continents does Earth have?", options: ["Five", "Seven", "Ten", "Three"], correct: 1 },
        { q: "Which is the largest continent?", options: ["Australia", "Europe", "Asia", "Antarctica"], correct: 2 },
        { q: "Continental drift means continents…", options: ["Move slowly over time", "Float on clouds", "Never change shape", "Are made of ice only"], correct: 0 },
        { q: "The equator divides Earth into…", options: ["Northern and Southern Hemispheres", "Only deserts", "Two oceans", "Day and night only"], correct: 0 },
        { q: "About how much of Earth is land?", options: ["About 29%", "About 71%", "About 99%", "About 1%"], correct: 0 }
      ]
    },
    {
      id: "africa",
      num: 8,
      slug: "Africa",
      title: "Africa",
      emoji: "🦁",
      opponent: { name: "Savanna Sam", icon: "🦒" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Cradle of Humanity",
          story: "Maya stepped onto golden grassland as far as she could see. Zara Zebra trotted up, her stripes shimmering in the sun. \"Welcome to Africa!\" she neighed warmly. \"Our continent holds the world's longest river, biggest desert, and some of the earliest human fossils ever found.\"",
          explanation: "Africa is the second-largest continent. It is home to the Nile River, the Sahara Desert, rich savannas, and rainforests. Many scientists believe early humans evolved in Africa before spreading across the globe.",
          words: ["Africa", "savanna", "Nile", "fossils"]
        },
        {
          slot: "main-2",
          storyTitle: "Wild Kingdom",
          story: "A lion rested under an acacia tree while elephants marched across the plain. Zara Zebra stamped her hoof. \"Africa's wildlife is famous worldwide,\" she said. \"From giraffes and zebras on grasslands to gorillas in misty mountains — our animals are part of what makes this continent special.\"",
          explanation: "Africa hosts the \"Big Five\" safari animals — lion, leopard, elephant, rhinoceros, and buffalo — plus giraffes, zebras, hippos, and thousands of bird species. National parks protect these creatures and their habitats.",
          words: ["wildlife", "elephant", "giraffe", "habitat"]
        },
        {
          slot: "main-3",
          storyTitle: "Many Nations, One Continent",
          story: "Maya opened a book showing colorful flags and bustling markets from Cairo to Cape Town. Zara Zebra smiled. \"Africa has over fifty countries,\" she explained. \"People speak hundreds of languages, play amazing music, and build cities beside ancient deserts and modern coastlines.\"",
          explanation: "Africa contains 54 recognized countries with diverse cultures, languages, and histories. From ancient Egyptian pyramids to vibrant modern cities like Lagos and Nairobi, Africa blends tradition and innovation.",
          words: ["countries", "languages", "culture", "cities"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "The Mighty Sahara",
          story: "Zara Zebra led Maya to a dune ridge where heat shimmered above sand. \"The Sahara is the world's largest hot desert,\" she said. \"Daytime is blazing, nights are chilly, and special plants and animals survive with very little rain.\"",
          explanation: "The Sahara covers much of North Africa — about the size of the United States. Despite harsh conditions, people, camels, foxes, and drought-tolerant plants have lived there for thousands of years."
        },
        {
          slot: "explain-2",
          storyTitle: "River of Life",
          story: "They reached the Nile's muddy banks where farmers tended green fields. \"This river has fed civilizations for millennia,\" Zara Zebra said. \"Water brings life to deserts — without the Nile, ancient Egypt could never have flourished.\"",
          explanation: "The Nile flows over 6,600 kilometers through northeastern Africa — one of the longest rivers on Earth. Its annual flooding (now controlled by dams) deposited rich soil that supported farming and great ancient cultures."
        },
        {
          slot: "explain-3",
          storyTitle: "Protecting African Wildlands",
          story: "Maya saw rangers tracking rhinos with care. Zara Zebra spoke softly. \"Poaching and habitat loss threaten some animals,\" she said. \"National parks, community conservation, and education help elephants, rhinos, and gorillas survive for future explorers.\"",
          explanation: "Conservation efforts across Africa include anti-poaching patrols, wildlife corridors, and ecotourism that funds protection. Saving African ecosystems also preserves biodiversity found nowhere else on Earth."
        }
      ],
      game: {
        id: "sunbeam-snap",
        title: "🦁 Safari Snap",
        desc: "Tap African animals when they step into the sunny savanna! Avoid traps and trash.",
        boot: {
          game: "sunbeam-snap",
          goal: 72,
          time: 55,
          lives: 3,
          good: ["🦁", "🦒", "🐘", "🦓"],
          bad: ["🪤", "🗑️", "🛢️"],
          bgTop: "#ffb74d",
          bgBot: "#e65100"
        }
      },
      quiz: [
        { q: "Africa is the ___ largest continent.", options: ["Smallest", "Second-largest", "Third-smallest", "Only one"], correct: 1 },
        { q: "The world's longest river in Africa is the…", options: ["Amazon", "Nile", "Mississippi", "Thames"], correct: 1 },
        { q: "The Sahara is a huge…", options: ["Hot desert", "Ice cap", "Coral reef", "Rainforest"], correct: 0 },
        { q: "How many countries are in Africa (about)?", options: ["Over 50", "Exactly 3", "Only 1", "About 200"], correct: 0 },
        { q: "Many scientists believe early humans first lived in…", options: ["Africa", "Antarctica only", "The Moon", "Under the ocean"], correct: 0 }
      ]
    },
    {
      id: "asia",
      num: 11,
      slug: "Asia",
      title: "Asia",
      emoji: "🐼",
      opponent: { name: "Tiger Tia", icon: "🐯" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Giant Continent",
          story: "Maya gazed up at snow-capped peaks that scraped the clouds. Panda Ping rolled out a bamboo snack and bowed politely. \"Asia is Earth's biggest continent,\" he said munching. \"More people live here than on any other continent — over half of everyone on the planet!\"",
          explanation: "Asia stretches from the Arctic Circle to tropical islands. It includes Russia, China, India, Japan, Indonesia, and many more countries. Its enormous size means deserts, jungles, tundra, and megacities all share one landmass.",
          words: ["Asia", "population", "mountains", "countries"]
        },
        {
          slot: "main-2",
          storyTitle: "Roof of the World",
          story: "Wind whistled through prayer flags on a high pass. Panda Ping pointed to the tallest peaks. \"The Himalayas rise here,\" he said. \"Mount Everest — the highest point on Earth — stands in Nepal and Tibet. Rivers born in these mountains feed billions of people below.\"",
          explanation: "The Himalayas formed when the Indian tectonic plate collided with Asia. Mount Everest reaches about 8,849 meters. Major rivers like the Ganges, Indus, and Yangtze begin in Asian highlands and support farming across the continent.",
          words: ["Himalayas", "Everest", "rivers", "tectonic"]
        },
        {
          slot: "main-3",
          storyTitle: "Ancient and Modern",
          story: "Maya wandered from a temple with curved roofs to a city glowing with neon signs. Panda Ping chuckled. \"Asia holds some of the world's oldest civilizations and its newest technology,\" he said. \"Silk roads, samurai history, and space programs — all on one continent.\"",
          explanation: "Asia gave the world paper, compasses, fireworks, and major religions like Buddhism and Hinduism. Today it leads in manufacturing, innovation, and trade while preserving ancient traditions in art, food, and festivals.",
          words: ["civilization", "technology", "traditions", "innovation"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Deserts and Rainforests",
          story: "Panda Ping showed Maya two maps side by side — one sandy, one dripping green. \"The Gobi Desert stretches across northern Asia,\" he said. \"Meanwhile Southeast Asian rainforests team with orangutans, tigers, and more plant species than almost anywhere.\"",
          explanation: "Asia's climate ranges from the frozen Siberian tundra to steamy tropical forests. The Gobi is a cold desert in Mongolia and China; rainforests in Malaysia and Indonesia hold incredible biodiversity under constant warmth and rain."
        },
        {
          slot: "explain-2",
          storyTitle: "Bamboo and Balance",
          story: "In a misty forest, Panda Ping munched bamboo calmly. \"Giant pandas eat almost nothing else,\" he explained. \"Protecting bamboo forests keeps us alive. Asia works hard to save endangered species — pandas, tigers, and snow leopards need wild homes.\"",
          explanation: "Giant pandas live mainly in China's mountain bamboo forests. Conservation programs have helped panda numbers rise. Tigers, rhinos, and elephants across Asia also depend on protected forests and anti-poaching laws."
        },
        {
          slot: "explain-3",
          storyTitle: "Ring of Fire",
          story: "Maya watched a volcano diagram glow on Panda Ping's tablet. \"Asia sits on the Pacific Ring of Fire,\" he said. \"Earthquakes and volcanoes happen where plates collide — Japan, Indonesia, and the Philippines prepare carefully to stay safe.\"",
          explanation: "The Ring of Fire outlines tectonic plate boundaries around the Pacific Ocean. Asian nations along this zone experience earthquakes and volcanic eruptions. Building codes, early warning systems, and drills help protect communities."
        }
      ],
      game: {
        id: "glow-rhythm",
        title: "🐼 Lantern Rhythm",
        desc: "Tap glowing lanterns when they shine brightest at the festival — not too early! Avoid storm clouds.",
        boot: {
          game: "glow-rhythm",
          goal: 55,
          time: 55,
          lives: 3,
          good: ["🏮", "🐼", "✨"],
          bad: ["⛈️"],
          bgTop: "#b71c1c",
          bgBot: "#4a0e0e"
        }
      },
      quiz: [
        { q: "Asia is the ___ continent by size.", options: ["Smallest", "Largest", "Same as Australia", "Only an island"], correct: 1 },
        { q: "Mount Everest is in the…", options: ["Himalayas", "Andes", "Alps", "Rockies"], correct: 0 },
        { q: "More than half of Earth's people live in…", options: ["Asia", "Antarctica", "One small village", "The ocean"], correct: 0 },
        { q: "Giant pandas mainly eat…", options: ["Bamboo", "Ice cream", "Metal", "Clouds"], correct: 0 },
        { q: "The Ring of Fire is linked to…", options: ["Earthquakes and volcanoes", "Rainbow making", "Fish schools only", "Desert sandstorms only"], correct: 0 }
      ]
    },
    {
      id: "europe",
      num: 14,
      slug: "Europe",
      title: "Europe",
      emoji: "🏰",
      opponent: { name: "Knight Nora", icon: "⚔️" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Castles and Continents",
          story: "Maya walked cobblestone streets toward a stone castle on a green hill. Castle Carl waved a tiny flag from the tower. \"Welcome to Europe!\" he called. \"We're a continent of history — kings and queens, artists, scientists, and explorers who mapped the world.\"",
          explanation: "Europe is the world's second-smallest continent but one of the most densely populated. It includes about 50 countries — from Iceland in the north to Greece in the south — with shared and distinct languages, foods, and traditions.",
          words: ["Europe", "history", "countries", "traditions"]
        },
        {
          slot: "main-2",
          storyTitle: "Mountains, Rivers, and Seas",
          story: "Castle Carl unrolled a map showing the Alps, the Rhine River, and coastlines on many seas. \"Europe may be small, but our geography is mighty,\" he said. \"Mountain ranges block winds, rivers carry trade, and seas connect us to Africa and Asia.\"",
          explanation: "The Alps, Pyrenees, and Carpathians rise across Europe. Major rivers like the Danube and Volga link inland cities to the sea. Europe borders the Atlantic Ocean, Arctic Ocean, and Mediterranean Sea.",
          words: ["Alps", "rivers", "geography", "Mediterranean"]
        },
        {
          slot: "main-3",
          storyTitle: "Art, Science, and Ideas",
          story: "Maya peeked into galleries of paintings and a museum of inventions. Castle Carl beamed. \"European thinkers asked big questions,\" he said. \"How do planets move? What are human rights? Those ideas spread across the globe and still shape schools today.\"",
          explanation: "Europe contributed major advances in science, art, and government — from the printing press and telescopes to democracy and classical music. The Renaissance and Industrial Revolution began on this continent.",
          words: ["science", "Renaissance", "inventions", "democracy"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "The European Union",
          story: "Castle Carl showed Maya passports from countries that share open borders. \"Many European nations work together in the European Union,\" he explained. \"They trade freely, agree on some laws, and use a shared currency called the euro in many places.\"",
          explanation: "The European Union (EU) is a partnership of European countries that cooperate on trade, travel, and laws. Not every European country joins the EU, but it helps keep peace and economic ties strong after centuries of wars."
        },
        {
          slot: "explain-2",
          storyTitle: "Northern Lights and Frozen North",
          story: "Maya saw photos of green lights dancing over snowy forests. \"In Scandinavia, winters are long and dark,\" Castle Carl said. \"But auroras, skiing, and cozy traditions turn cold months into something magical.\"",
          explanation: "Northern Europe — Norway, Sweden, Finland, and Iceland — experiences short winter days and long summer days because of Earth's tilt. The aurora borealis (Northern Lights) glow when solar particles hit the atmosphere near the poles."
        },
        {
          slot: "explain-3",
          storyTitle: "Protecting Old Cities and Wild Places",
          story: "Castle Carl pointed to wind turbines beside a medieval town. \"Europe balances old and new,\" he said. \"We restore historic buildings, create national parks in the Alps, and invest in clean energy to fight climate change.\"",
          explanation: "European cities preserve Roman ruins, Gothic cathedrals, and modern green spaces. Countries protect forests, wetlands, and wildlife while working to reduce pollution and carbon emissions for future generations."
        }
      ],
      game: {
        id: "sonar-ping",
        title: "🏰 Castle Ping",
        desc: "Foggy courtyard! Ping your lantern and tap treasures the moment they appear. Avoid decoys!",
        boot: {
          game: "sonar-ping",
          goal: 48,
          time: 55,
          lives: 3,
          good: ["⭐", "👑", "✨"],
          bad: ["🗡️"],
          bgTop: "#37474f",
          bgBot: "#263238"
        }
      },
      quiz: [
        { q: "Europe is one of the ___ continents.", options: ["Smallest", "Largest", "Only", "Underwater"], correct: 0 },
        { q: "The Alps are a famous ___ in Europe.", options: ["Mountain range", "Desert", "Coral reef", "Volcano in space"], correct: 0 },
        { q: "The Mediterranean Sea borders…", options: ["Southern Europe", "Only Antarctica", "The Moon", "Mars"], correct: 0 },
        { q: "The European Union helps countries…", options: ["Cooperate on trade and travel", "Build walls everywhere", "Stop using maps", "Move to another planet"], correct: 0 },
        { q: "The Northern Lights appear near…", options: ["The North Pole region", "The equator only", "Inside volcanoes", "Underground caves only"], correct: 0 }
      ]
    },
    {
      id: "north-america",
      num: 17,
      slug: "North-America",
      title: "North America",
      emoji: "🦅",
      opponent: { name: "Bison Ben", icon: "🦬" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "From Arctic to Tropics",
          story: "Maya stood in a canyon so deep the river below looked like a ribbon. Eagle Eddie swooped down and landed on a pine branch. \"North America stretches from icy Arctic tundra to sunny Mexican beaches,\" he screeched. \"Three big countries — Canada, the United States, and Mexico — plus Central America and the Caribbean.\"",
          explanation: "North America covers about 24 million square kilometers. It includes diverse climates: Arctic ice, temperate forests, Great Plains, deserts, and tropical coasts. Over 20 countries and many island nations call it home.",
          words: ["North America", "climate", "Canada", "Mexico"]
        },
        {
          slot: "main-2",
          storyTitle: "Landmarks of Scale",
          story: "Eagle Eddie flew Maya past the Grand Canyon, Niagara Falls, and towering redwoods. \"Nature built monuments here,\" he said. \"The Rockies and Appalachians are mountain spines; the Mississippi River drains a huge heartland of farms and cities.\"",
          explanation: "North America's landmarks include the Grand Canyon (carved by the Colorado River), the Great Lakes, the Mississippi-Missouri river system, and mountain ranges from Alaska to Mexico. These features shape weather, travel, and settlement.",
          words: ["Grand Canyon", "Mississippi", "Rockies", "landmarks"]
        },
        {
          slot: "main-3",
          storyTitle: "Many Peoples, Long History",
          story: "Maya visited a museum honoring First Nations art and stories. Eagle Eddie folded his wings respectfully. \"Indigenous peoples lived here for thousands of years before European explorers arrived,\" he said. \"Their languages, farming, and wisdom still enrich the continent today.\"",
          explanation: "Native American, First Nations, Inuit, and other Indigenous cultures developed rich societies across North America — building cities, trading networks, and sustainable land practices long before Columbus and later settlers arrived.",
          words: ["Indigenous", "history", "cultures", "traditions"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Great Plains and Prairie Life",
          story: "Wind rippled grass as far as Maya could see. Bison Ben joined them, hooves thundering softly. \"The Great Plains once hosted millions of bison,\" Eagle Eddie explained. \"Grasslands feed the world through wheat and corn — and still shelter hawks, coyotes, and prairie dogs.\"",
          explanation: "The Great Plains stretch from Canada to Texas — flat grasslands perfect for farming and ranching. Bison nearly went extinct but conservation brought them back. Prairies store carbon and prevent soil erosion when protected."
        },
        {
          slot: "explain-2",
          storyTitle: "National Parks",
          story: "Maya read a sign: Yellowstone — first national park on Earth. Eagle Eddie puffed his chest. \"North America invented the idea of national parks,\" he said. \"Places set aside so geysers, bears, and forests stay wild for everyone to visit.\"",
          explanation: "Yellowstone in the U.S. became the world's first national park in 1872. Canada, Mexico, and the U.S. now protect dozens of parks — preserving wolves, elk, glaciers, and geothermal wonders like Old Faithful geyser."
        },
        {
          slot: "explain-3",
          storyTitle: "Hurricanes and Tornado Alley",
          story: "Storm maps flickered on Eagle Eddie's weather tablet. \"Warm Gulf waters fuel hurricanes in the southeast,\" he said. \"The central plains get tornadoes when warm and cold air clash. Knowing geography saves lives when storms strike.\"",
          explanation: "North America's weather extremes include Atlantic hurricanes, Pacific typhoons hitting Mexico, and tornadoes in Tornado Alley. Meteorologists use satellites and radar to warn communities — geography helps predict where storms hit hardest."
        }
      ],
      game: {
        id: "trench-pilot",
        title: "🦅 Canyon Pilot",
        desc: "Steer ⬆️⬇️ through rocky canyon gaps. Travel far to win!",
        boot: {
          game: "trench-pilot",
          goal: 50,
          time: 45,
          lives: 3,
          good: [],
          bad: ["🪨", "🌵", "⛰️"],
          winText: "Distance goal: 50",
          bgTop: "#bf360c",
          bgBot: "#3e2723"
        }
      },
      quiz: [
        { q: "Which three large countries are in North America?", options: ["Canada, U.S., Mexico", "Brazil, Chile, Peru", "France, Spain, Italy", "China, Japan, Korea"], correct: 0 },
        { q: "The Grand Canyon was carved mainly by the…", options: ["Colorado River", "Nile River", "Amazon River", "Mississippi only"], correct: 0 },
        { q: "The first national park in the world was…", options: ["Yellowstone", "Antarctica", "A shopping mall", "The Moon"], correct: 0 },
        { q: "Indigenous peoples lived in North America…", options: ["For thousands of years before European contact", "Only after 2020", "Never", "Only in Europe"], correct: 0 },
        { q: "Tornado Alley is known for…", options: ["Frequent tornadoes", "Only calm weather", "Penguins", "Coral reefs"], correct: 0 }
      ]
    },
    {
      id: "south-america",
      num: 20,
      slug: "South-America",
      title: "South America",
      emoji: "🦙",
      opponent: { name: "Jaguar Jax", icon: "🐆" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Rainforest Heart",
          story: "Maya ducked under vines dripping with rain as macaws screamed overhead. Llama Luna adjusted her colorful pack and grinned. \"South America holds the Amazon — the biggest rainforest on Earth,\" she said. \"One river system carries more water than almost any other on the planet.\"",
          explanation: "South America includes 12 countries and three dependencies. The Amazon River basin spans several nations and produces about 20% of Earth's oxygen through its vast tree cover — earning the nickname \"lungs of the planet.\"",
          words: ["Amazon", "rainforest", "South America", "oxygen"]
        },
        {
          slot: "main-2",
          storyTitle: "Andes Sky Roads",
          story: "Llama Luna led Maya up stone steps built centuries ago along mountain ridges. \"The Andes stretch the whole western coast,\" she explained. \"Inca engineers carved paths here long before modern roads. Llamas like me still carry loads in high villages.\"",
          explanation: "The Andes are the longest continental mountain range — about 7,000 kilometers. The Inca Empire built Machu Picchu and an extensive road network across these peaks. Today the Andes influence climate from desert coasts to cloud forests.",
          words: ["Andes", "Inca", "Machu Picchu", "mountains"]
        },
        {
          slot: "main-3",
          storyTitle: "Rhythm and Color",
          story: "Drums pulsed at a festival where dancers wore feathers and bright cloth. Maya clapped along. \"South America celebrates with music,\" Llama Luna said. \"From Brazilian samba to Argentine tango — our continent blends Indigenous, African, and European roots into something brand new.\"",
          explanation: "South American culture mixes Indigenous traditions with influences from colonization and the African diaspora. Carnaval in Brazil, Andean weaving, and Colombian coffee culture show how geography and history shape daily life.",
          words: ["culture", "Indigenous", "festival", "diversity"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Galápagos and Unique Life",
          story: "Llama Luna showed Maya pictures of giant tortoises and blue-footed birds. \"Islands off Ecuador — the Galápagos — inspired Charles Darwin,\" she said. \"Isolated places evolve strange, wonderful creatures found nowhere else.\"",
          explanation: "The Galápagos Islands helped Darwin develop his theory of evolution by natural selection. South America's isolation — from penguins in Patagonia to poison dart frogs in rainforests — makes it a hotspot of unique species."
        },
        {
          slot: "explain-2",
          storyTitle: "Atacama — Driest Desert",
          story: "They compared maps of lush Amazon jungle and a bone-dry Chilean desert. \"The Atacama gets almost no rain,\" Llama Luna whispered. \"Some weather stations never recorded a drop! Yet astronomers love its clear skies for stargazing.\"",
          explanation: "The Atacama Desert in Chile is one of the driest places on Earth. Its clear, dark skies host major telescopes. Nearby, the wet Amazon shows how South America's geography creates extreme contrasts within one continent."
        },
        {
          slot: "explain-3",
          storyTitle: "Saving the Amazon",
          story: "Maya saw satellite images of forest patches shrinking. Llama Luna's ears drooped. \"Deforestation threatens animals and climate worldwide,\" she said. \"Protecting rainforest — and respecting Indigenous land rights — helps the whole planet breathe easier.\"",
          explanation: "Amazon rainforest stores carbon and regulates rainfall across South America. Logging, farming, and fires destroy habitat for jaguars, sloths, and uncontacted tribes. Conservation and sustainable farming can slow losses."
        }
      ],
      game: {
        id: "reef-match",
        title: "🦙 Rainforest Match",
        desc: "Flip cards and find matching rainforest pairs before time runs out!",
        boot: {
          game: "reef-match",
          goal: 80,
          time: 70,
          lives: 3,
          good: ["🦜", "🐆", "🌿", "🦥"],
          bad: [],
          winText: "Match all pairs!",
          bgTop: "#1b5e20",
          bgBot: "#004d40"
        }
      },
      quiz: [
        { q: "The Amazon rainforest is mainly in…", options: ["South America", "Antarctica", "Europe only", "The Arctic"], correct: 0 },
        { q: "The Andes are a long…", options: ["Mountain range", "River only", "Desert with no sand", "Space station"], correct: 0 },
        { q: "Machu Picchu was built by the…", options: ["Inca", "Romans", "Penguins", "Robots"], correct: 0 },
        { q: "The Galápagos Islands helped Darwin study…", options: ["Evolution", "Ice cream flavors", "Car engines", "Moon rocks"], correct: 0 },
        { q: "Cutting down rainforest hurts the planet because trees…", options: ["Store carbon and produce oxygen", "Make earthquakes", "Turn into oceans", "Stop the Earth from spinning"], correct: 0 }
      ]
    },
    {
      id: "antarctica",
      num: 23,
      slug: "Antarctica",
      title: "Antarctica",
      emoji: "🐧",
      opponent: { name: "Seal Sam", icon: "🦭" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Frozen Continent",
          story: "Maya bundled in the warmest coat she had as wind howled across endless white. Penguin Pete waddled up, flippers out for balance. \"Welcome to Antarctica!\" he cheered. \"We're the coldest, driest, windiest continent — and almost entirely covered in ice.\"",
          explanation: "Antarctica is Earth's fifth-largest continent, centered on the South Pole. Temperatures can drop below −80°C. Despite snow and ice, it is technically a desert because very little new snow falls in the interior.",
          words: ["Antarctica", "ice", "South Pole", "desert"]
        },
        {
          slot: "main-2",
          storyTitle: "Penguins and Polar Life",
          story: "Emperor penguins huddled together while skuas circled overhead. Penguin Pete slid on his belly gleefully. \"No permanent humans live here,\" he said, \"but millions of penguins, seals, and seabirds thrive on krill-rich southern oceans. We are the real locals.\"",
          explanation: "Antarctica has no native human population. Wildlife includes emperor and Adélie penguins, Weddell seals, and whales that visit in summer. Krill — tiny shrimp-like animals — feed most of the food web around the continent.",
          words: ["penguins", "seals", "krill", "wildlife"]
        },
        {
          slot: "main-3",
          storyTitle: "Scientists at the Bottom of the World",
          story: "Maya toured a research station where scientists drilled ice cores and tracked satellites. Penguin Pete pointed with his flipper. \"Countries share Antarctica for peaceful science,\" he explained. \"The ice holds air bubbles from thousands of years ago — a history book of Earth's climate.\"",
          explanation: "The Antarctic Treaty (1959) sets aside the continent for research and bans military activity and mining. Scientists study climate change, astronomy, and marine biology. Ice cores reveal past temperatures and greenhouse gas levels.",
          words: ["scientists", "research", "climate", "treaty"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Ice Sheet and Sea Level",
          story: "Penguin Pete showed Maya a cross-section of ice two miles thick. \"If this ice sheet melted, sea levels would rise dangerously,\" he said seriously. \"Most ice stays locked here — which is why warming at the poles matters to coastal cities worldwide.\"",
          explanation: "Antarctica holds about 90% of Earth's ice and 70% of its fresh water. Melting land ice adds to sea level rise (floating sea ice melting does not). Even small temperature changes can affect ice stability over time."
        },
        {
          slot: "explain-2",
          storyTitle: "Midnight Sun and Polar Night",
          story: "Maya checked a clock showing 2 a.m. sunlight blazing outside. \"During Antarctic summer, the sun barely sets,\" Penguin Pete said. \"In winter, darkness lasts months — but auroras paint the sky green and purple.\"",
          explanation: "Earth's tilt causes Antarctica to tilt toward the sun in Southern Hemisphere summer (24-hour daylight) and away in winter (polar night). These extreme light cycles affect animal breeding and human research schedules."
        },
        {
          slot: "explain-3",
          storyTitle: "Protecting the Last Wild Place",
          story: "Seal Sam barked agreement as Maya read rules: no littering, no disturbing nests. \"Antarctica is fragile,\" Penguin Pete said. \"Tourism must be careful, fishing must be limited, and pollution from other continents reaches even our clean ice through ocean currents.\"",
          explanation: "Threats include climate warming, invasive species on ships, and overfishing of krill and toothfish. Marine protected areas and strict visitor rules help keep Antarctica the wildest continent on Earth."
        }
      ],
      game: {
        id: "breath-dive",
        title: "🐧 Penguin Dive",
        desc: "Penguin dive ⬇️ for krill, surface ⬆️ for air. Watch the O₂ bar!",
        boot: {
          game: "breath-dive",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🦐", "🐟", "🦑"],
          bad: ["🛢️", "🪝"],
          player: "🐧",
          bgTop: "#0277bd",
          bgBot: "#01579b"
        }
      },
      quiz: [
        { q: "Antarctica is located around the…", options: ["South Pole", "North Pole", "Equator only", "Moon"], correct: 0 },
        { q: "Antarctica is technically a desert because it gets…", options: ["Very little precipitation", "Too much rain", "Only hot weather", "No ice"], correct: 0 },
        { q: "No ___ permanently live in Antarctica.", options: ["Humans", "Penguins", "Seals", "Scientists (visiting)"], correct: 0 },
        { q: "Ice cores help scientists study…", options: ["Past climate", "Future sports scores", "Alien cities", "Dinosaur rockets"], correct: 0 },
        { q: "The Antarctic Treaty promotes…", options: ["Peaceful scientific research", "Military bases everywhere", "Mining all the ice", "Moving continents"], correct: 0 }
      ]
    },
    {
      id: "australia",
      num: 26,
      slug: "Australia",
      title: "Australia",
      emoji: "🦘",
      opponent: { name: "Kangaroo Kate", icon: "🦘" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Island Continent",
          story: "Maya hopped off a bus into red desert dust under a blazing sun. Koala Kai waved sleepily from a eucalyptus branch. \"G'day! Australia is the smallest continent and the largest island,\" he yawned. \"We're also the only continent that's one single country — plus nearby islands like Tasmania.\"",
          explanation: "Australia lies between the Indian and Pacific Oceans. Its unique isolation for millions of years created animals found nowhere else — kangaroos, koalas, wombats, and the egg-laying platypus.",
          words: ["Australia", "island", "unique", "isolation"]
        },
        {
          slot: "main-2",
          storyTitle: "Outback and Reef",
          story: "Koala Kai showed Maya two worlds — rusty Outback plains and turquoise water over coral. \"Inland is dry and ancient,\" he said. \"Off the northeast coast lies the Great Barrier Reef — the biggest coral reef system on Earth, home to fish, turtles, and sharks.\"",
          explanation: "The Australian Outback covers most of the continent with desert and scrubland. Uluru (Ayers Rock) is a sacred sandstone monolith. The Great Barrier Reef stretches over 2,300 kilometers and is visible from space.",
          words: ["Outback", "Uluru", "Great Barrier Reef", "coral"]
        },
        {
          slot: "main-3",
          storyTitle: "First Australians",
          story: "Maya listened to Aboriginal elders tell stories painted on bark and rock. Koala Kai bowed respectfully. \"Indigenous Australians — the world's oldest continuing culture — have cared for this land for over 65,000 years,\" he whispered. \"Their songlines map deserts like living libraries.\"",
          explanation: "Aboriginal and Torres Strait Islander peoples developed complex languages, art, and land management across Australia. Dreamtime stories explain landscapes and teach respect for country — land, water, and community together.",
          words: ["Aboriginal", "Indigenous", "culture", "Dreamtime"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Marsupials and Monotremes",
          story: "Kangaroo Kate joined them, joey peeking from her pouch. \"Most mammals here raise babies in pouches,\" she said. \"And the platypus — part beak, part beaver — lays eggs! Australia is a real-life evolution lab.\"",
          explanation: "Marsupials like kangaroos, koalas, and possums give birth to tiny young that finish growing in pouches. Monotremes like the platypus and echidna lay eggs — rare among mammals. Isolation let these lineages survive."
        },
        {
          slot: "explain-2",
          storyTitle: "Bushfires and Balance",
          story: "Koala Kai showed charred trunks sprouting green shoots. \"Eucalyptus forests sometimes burn,\" he said sadly. \"Fire can be natural, but hotter droughts make mega-fires worse. Koalas and kangaroos need forests — and careful fire management.\"",
          explanation: "Some Australian plants need fire to release seeds, but climate change brings longer droughts and more extreme fire seasons. Wildlife rescue, controlled burns, and reducing emissions help protect people and animals."
        },
        {
          slot: "explain-3",
          storyTitle: "Reef in Danger",
          story: "Maya snorkeled above pale coral that should have been colorful. Koala Kai frowned. \"Warming oceans bleach reefs,\" he explained. \"Australia protects the reef with marine parks, but global teamwork on climate is essential to save this underwater city.\"",
          explanation: "Coral bleaching happens when stressed corals expel algae. The Great Barrier Reef faces threats from warming, pollution, and crown-of-thorns starfish. Reducing carbon pollution and improving water quality support reef recovery."
        }
      ],
      game: {
        id: "school-run",
        title: "🦘 Outback Run",
        desc: "Switch lanes ⬅️➡️ — collect bush snacks, dodge dingoes and thorn bushes!",
        boot: {
          game: "school-run",
          goal: 64,
          time: 55,
          lives: 3,
          good: ["🌿", "💧", "🍃"],
          bad: ["🐕", "🌵"],
          player: "🦘",
          bgTop: "#e65100",
          bgBot: "#bf360c"
        }
      },
      quiz: [
        { q: "Australia is both the smallest continent and…", options: ["The largest island", "The coldest desert", "A moon base", "Part of Europe"], correct: 0 },
        { q: "Kangaroos and koalas are…", options: ["Marsupials", "Fish", "Birds only", "Reptiles from Mars"], correct: 0 },
        { q: "The Great Barrier Reef is made of…", options: ["Coral", "Ice", "Sand dunes only", "Concrete"], correct: 0 },
        { q: "Indigenous Australians have lived here for…", options: ["Over 65,000 years", "Only 10 years", "One week", "They never lived there"], correct: 0 },
        { q: "The platypus is unusual because it…", options: ["Lays eggs", "Has wings", "Lives in space", "Is a type of tree"], correct: 0 }
      ]
    },
    {
      id: "landforms",
      num: 29,
      slug: "Landforms",
      title: "Landforms",
      emoji: "⛰️",
      opponent: { name: "Volcano Val", icon: "🌋" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Mountains That Touch Clouds",
          story: "Maya clipped onto a trail as peaks rose around her like teeth. Rocky Ridge tossed pebbles and caught them one-handed. \"Landforms are Earth's shapes — mountains, valleys, plains, and plateaus,\" he rumbled. \"Mountains form when tectonic plates crash together or volcanoes pile up rock.\"",
          explanation: "Mountains rise through tectonic collisions (like the Himalayas), volcanic activity, or fault-block lifting. They affect weather — forcing air upward to create rain — and provide homes for unique plants and animals at high elevations.",
          words: ["mountains", "landforms", "tectonic", "volcanoes"]
        },
        {
          slot: "main-2",
          storyTitle: "Rivers That Carve the Land",
          story: "They followed a river from a mountain spring down to a wide delta. Rocky Ridge skipped a stone across the water. \"Rivers are sculptors,\" he said. \"They cut canyons, carry soil to farms, and spread nutrients to oceans. Civilizations grew beside rivers for a reason — fresh water and fertile mud.\"",
          explanation: "Rivers erode rock, transport sediment, and deposit rich soil in floodplains and deltas. The Nile, Amazon, Mississippi, and Yangtze shaped human history by providing water for drinking, farming, and transportation.",
          words: ["rivers", "erosion", "sediment", "delta"]
        },
        {
          slot: "main-3",
          storyTitle: "Plates Beneath Our Feet",
          story: "Maya watched an animation of continents sliding apart and together. Rocky Ridge tapped the ground. \"Earth's crust is broken into plates floating on hot, soft rock below,\" he explained. \"When they move, we get earthquakes, volcanoes, and brand-new mountains — geology in action!\"",
          explanation: "Tectonic plates move a few centimeters per year on the mantle. Collisions build mountains; separations open rifts and oceans. The Ring of Fire and Mid-Atlantic Ridge show plate boundaries where Earth reshapes itself.",
          words: ["plates", "earthquakes", "mantle", "geology"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Volcanoes — Builders and Destroyers",
          story: "Volcano Val puffed harmless steam beside a cinder cone model. \"Volcanoes erupt molten rock called magma,\" she said. \"They destroy forests but also create new islands — like Hawaii — and spread minerals that enrich soil for farming.\"",
          explanation: "Volcanoes form where magma reaches the surface. Explosive eruptions can be dangerous, but volcanic soil is often fertile. Hot spots, subduction zones, and rifts each produce different volcano types — shield, stratovolcano, and cinder cone."
        },
        {
          slot: "explain-2",
          storyTitle: "Canyons and Caves",
          story: "Rocky Ridge led Maya through a slot canyon where red walls glowed like sunset. \"Water and wind carve rock over millions of years,\" he whispered. \"Underground, dripping water builds stalactites in caves — slow art made one drop at a time.\"",
          explanation: "Canyons like the Grand Canyon reveal rock layers and Earth's history. Karst caves form when acidic water dissolves limestone. Erosion and deposition constantly reshape landforms — no landscape stays frozen forever."
        },
        {
          slot: "explain-3",
          storyTitle: "Living with Landforms",
          story: "Maya saw earthquake-safe buildings and terraces cut into hillsides for farming. Rocky Ridge nodded. \"People adapt to landforms — and landforms affect people,\" he said. \"Building on steep slopes, damming rivers, and mining mountains all change the Earth. We must plan wisely.\"",
          explanation: "Human activities alter landforms through mining, deforestation, and construction — sometimes causing landslides or flooding. Sustainable planning, reforestation, and respecting floodplains help communities live safely with dynamic geology."
        }
      ],
      game: {
        id: "zone-sort",
        title: "⛰️ Landform Sort",
        desc: "Move ← → to catch landform icons in order ⛰️ → 🏞️ → 🌋 → 🏜️ → 🏝️. Avoid trash! Reach 60 points.",
        boot: {
          game: "zone-sort",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["⛰️", "🏞️", "🌋", "🏜️", "🏝️"],
          bad: ["🗑️", "🏭"],
          player: "🧗",
          bgTop: "#5d4037",
          bgBot: "#3e2723"
        }
      },
      quiz: [
        { q: "Mountains often form when tectonic plates…", options: ["Collide or push upward", "Float away into space", "Turn into water", "Stop moving forever"], correct: 0 },
        { q: "Rivers help shape land by…", options: ["Eroding and carrying sediment", "Only freezing solid", "Making mountains disappear in one day", "Blocking all rain"], correct: 0 },
        { q: "Magma that reaches the surface is called…", options: ["Lava", "Snow", "Clouds", "Sand only"], correct: 0 },
        { q: "Earth's crust is broken into…", options: ["Tectonic plates", "One unbreakable shell", "Ice cubes only", "Paper sheets"], correct: 0 },
        { q: "The Grand Canyon shows…", options: ["Layers of rock carved by a river", "Only modern buildings", "Ocean coral", "Polar ice caps"], correct: 0 }
      ]
    }
  ];
})(window);
