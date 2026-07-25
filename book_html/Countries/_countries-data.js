/* Countries Adventure — chapter content (generate: node _generate-book.cjs) */
(function (w) {
  w.COUNTRIES_CHAPTERS = [
    {
      id: "overview",
      num: 5,
      slug: "World-Overview",
      title: "World Overview",
      emoji: "🌍",
      opponent: { name: "Globe Gus", icon: "🌐" },
      viewLabels: [
        {
          id: "globe",
          label: "Spinning Globe",
          desc: "A colorful globe showing all seven continents. Tap different regions to learn about our amazing planet."
        },
        {
          id: "map",
          label: "World Map",
          desc: "Flat map view with countries and oceans labeled. Explore how cartographers draw our round Earth on paper."
        },
        {
          id: "continents",
          label: "Continent Chart",
          desc: "Seven continent blocks in bright colors — Asia, Africa, North America, South America, Antarctica, Europe, and Australia/Oceania."
        },
        {
          id: "passport",
          label: "Traveler's View",
          desc: "Look through a passport window at famous landmarks from around the world — one destination at a time."
        }
      ],
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Our Big Blue Planet",
          story: "Mia unrolled a giant map on the classroom floor. Globe Gus, her friendly globe guide with a warm smile, spun slowly beside her. \"Earth is home to about 195 countries,\" he said. \"Every one has its own flag, language, and story.\"",
          explanation: "Earth has seven continents and about 195 countries. A country is a place with its own government, borders, and people who share traditions and laws.",
          words: ["Earth", "countries", "continents", "borders"]
        },
        {
          slot: "main-2",
          storyTitle: "Continents and Oceans",
          story: "Globe Gus pointed to green landmasses and blue water. \"Land comes in big chunks called continents,\" he explained. \"Oceans connect them all — the Pacific is the biggest, and the Arctic is the smallest ocean.\"",
          explanation: "The seven continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia (often grouped with Oceania). Five oceans — Pacific, Atlantic, Indian, Southern, and Arctic — cover most of Earth's surface.",
          words: ["continents", "Pacific", "oceans", "Asia"]
        },
        {
          slot: "main-3",
          storyTitle: "People Everywhere",
          story: "Mia pasted photos of kids from Brazil, Japan, Kenya, and Norway onto her map. \"We look different and speak different languages,\" she said, \"but we're all neighbors on one planet.\" Globe Gus nodded. \"That's what makes our world wonderful.\"",
          explanation: "Over 8 billion people live on Earth in diverse cultures. Languages, foods, religions, and customs vary by country, but trade, travel, and the internet connect us across borders.",
          words: ["culture", "languages", "diverse", "planet"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "What Makes a Country?",
          story: "Globe Gus showed Mia a passport stamp and a flag. \"Countries have governments that make laws, currencies for money, and capital cities where leaders work,\" he said. \"Some countries are huge; others are tiny islands you could walk across in a day.\"",
          explanation: "A country needs recognized borders, a government, and usually its own flag and anthem. Capital cities (like Washington D.C., Tokyo, or Paris) are where national decisions are made."
        },
        {
          slot: "explain-2",
          storyTitle: "Maps and Scale",
          story: "Mia tried to flatten an orange peel — it wrinkled and tore. \"That's why world maps look stretched near the poles,\" Globe Gus laughed. \"Cartographers use different map types to show size, shape, or direction as fairly as possible.\"",
          explanation: "Globes show Earth accurately, but flat maps distort size or shape. The Mercator map preserves direction for sailors; other projections try to show continent sizes more fairly."
        },
        {
          slot: "explain-3",
          storyTitle: "Time Zones and Hemispheres",
          story: "When Mia ate breakfast, kids in Australia were heading to bed. Globe Gus drew a line through Greenwich, England. \"Earth spins once every 24 hours,\" he said. \"We split the world into time zones so clocks make sense.\"",
          explanation: "The equator divides Earth into Northern and Southern Hemispheres. Time zones are roughly 15° of longitude wide. When it's noon in London, it might be evening in Tokyo and early morning in New York."
        }
      ],
      game: {
        id: "zone-sort",
        title: "🌍 Continent Sort",
        desc: "Move ← → to catch continent icons in order 🌏 → 🌍 → 🌎 → 🧊. Avoid wrong flags! Reach 60 points.",
        boot: {
          game: "zone-sort",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🌏", "🌍", "🌎", "🧊", "🏔️"],
          bad: ["❌", "🚫"],
          player: "🧳",
          bgTop: "#2e7d32",
          bgBot: "#1b5e20"
        }
      },
      quiz: [
        { q: "How many continents are there on Earth?", options: ["Five", "Six", "Seven", "Ten"], correct: 2 },
        { q: "About how many countries exist in the world?", options: ["About 50", "About 195", "About 500", "About 1,000"], correct: 1 },
        { q: "The largest ocean on Earth is the…", options: ["Arctic Ocean", "Indian Ocean", "Pacific Ocean", "Atlantic Ocean"], correct: 2 },
        { q: "A capital city is where…", options: ["National government usually works", "All fish live", "It never rains", "Maps are banned"], correct: 0 },
        { q: "Why do we have time zones?", options: ["Earth spins and sun rises at different times", "Clocks are decorations only", "Countries hate numbers", "Oceans stop time"], correct: 0 }
      ]
    },
    {
      id: "asia",
      num: 8,
      slug: "Asia",
      title: "Asia",
      emoji: "🌏",
      opponent: { name: "Sakura Sam", icon: "🌸" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Largest Continent",
          story: "Mia's plane touched down in Tokyo, Japan. Sakura Sam, a cheerful guide with cherry blossoms in her hair, waved from the gate. \"Welcome to Asia — the biggest continent!\" she said. \"More people live here than anywhere else on Earth.\"",
          explanation: "Asia is the largest continent by area and population. It includes China, India, Japan, Indonesia, and dozens of other countries — home to over 4.5 billion people.",
          words: ["Asia", "population", "Japan", "continent"]
        },
        {
          slot: "main-2",
          storyTitle: "Mountains and Deserts",
          story: "Sakura Sam showed Mia a photo of Mount Everest piercing the clouds and the vast Gobi Desert stretching golden and dry. \"Asia has Earth's highest peak and some of its driest places,\" she explained. \"Geography shapes how people live.\"",
          explanation: "The Himalayas contain Mount Everest (about 8,849 m). Asia also has the Gobi Desert, fertile river valleys like the Ganges and Yangtze, and tropical islands in Southeast Asia.",
          words: ["Himalayas", "Everest", "desert", "geography"]
        },
        {
          slot: "main-3",
          storyTitle: "Ancient Cultures",
          story: "In Beijing, Mia walked along the Great Wall. In India, she smelled spices at a busy market. \"Asia gave the world paper, printing, yoga, and so many inventions,\" Sakura Sam said proudly. \"History lives in every street.\"",
          explanation: "Asia is the birthplace of ancient civilizations including China, India, Mesopotamia, and Persia. Today it leads in technology, manufacturing, and cultural exports like anime, K-pop, and cuisine.",
          words: ["Great Wall", "civilization", "inventions", "culture"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Diverse Languages",
          story: "Mia heard Mandarin, Hindi, Arabic, Japanese, and Bengali in a single day. Sakura Sam smiled. \"Asia has thousands of languages and writing systems — some read left to right, others top to bottom or right to left.\"",
          explanation: "Major Asian languages include Mandarin Chinese, Hindi, Arabic, Bengali, Japanese, and Korean. Many countries have multiple official languages reflecting their diverse populations."
        },
        {
          slot: "explain-2",
          storyTitle: "Rice and Spice",
          story: "At a night market in Thailand, Mia tasted noodles, curry, and sticky rice wrapped in banana leaves. \"Rice feeds billions here,\" Sakura Sam said. \"Climate and soil decide whether farms grow rice paddies, tea bushes, or wheat.\"",
          explanation: "Asia produces most of the world's rice. Monsoon rains water South and Southeast Asian farms. Tea originated in China; spices from India and Indonesia shaped global trade for centuries."
        },
        {
          slot: "explain-3",
          storyTitle: "Modern Mega-Cities",
          story: "From Tokyo's neon towers to Mumbai's bustling trains, Mia saw cities that never seemed to sleep. \"Tokyo, Delhi, Shanghai, and Jakarta are among the world's largest cities,\" Sakura Sam said. \"Millions of people live, work, and dream in each one.\"",
          explanation: "Asia has many megacities with populations over 10 million. Rapid urbanization brings skyscrapers, subways, and innovation — along with challenges like traffic and pollution that cities work to solve."
        }
      ],
      game: {
        id: "sunbeam-snap",
        title: "🌏 Asia Snap",
        desc: "Tap Asian landmarks and treasures when they appear! Avoid wrong items.",
        boot: {
          game: "sunbeam-snap",
          goal: 72,
          time: 55,
          lives: 3,
          good: ["🏯", "🍜", "🐼", "🕌"],
          bad: ["🗽", "🗿", "🎭"],
          bgTop: "#ff8a65",
          bgBot: "#d84315"
        }
      },
      quiz: [
        { q: "Which continent is the largest by area?", options: ["Europe", "Asia", "Australia", "Antarctica"], correct: 1 },
        { q: "Mount Everest is in the…", options: ["Alps", "Himalayas", "Rockies", "Andes"], correct: 1 },
        { q: "The Great Wall is in…", options: ["Japan", "China", "India", "Thailand"], correct: 1 },
        { q: "More than half of all humans live in…", options: ["Antarctica", "Asia", "One small island", "Outer space"], correct: 1 },
        { q: "Rice is a staple food especially in…", options: ["South and East Asia", "Only Antarctica", "The moon", "Underwater caves"], correct: 0 }
      ]
    },
    {
      id: "europe",
      num: 11,
      slug: "Europe",
      title: "Europe",
      emoji: "🏰",
      opponent: { name: "Castle Carl", icon: "👑" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Castles and Cobblestones",
          story: "Mia wandered through a fairy-tale village in Germany. Castle Carl, a knight with a friendly plume on his helmet, pointed to a stone tower. \"Europe is packed with history,\" he said. \"Every country tells stories in its buildings, music, and art.\"",
          explanation: "Europe is a continent of about 44 countries, from icy Norway to sunny Greece. It has ancient ruins, medieval castles, and modern cities side by side.",
          words: ["Europe", "castles", "history", "countries"]
        },
        {
          slot: "main-2",
          storyTitle: "Many Languages, One Continent",
          story: "In Paris Mia heard French; in Madrid, Spanish; in Warsaw, Polish. Castle Carl chuckled. \"Europe has over 200 languages! Some countries share borders but speak completely different tongues.\"",
          explanation: "European languages belong to families like Romance (French, Spanish, Italian), Germanic (English, German), and Slavic (Polish, Russian). The European Union uses 24 official languages.",
          words: ["languages", "French", "Spanish", "borders"]
        },
        {
          slot: "main-3",
          storyTitle: "Art and Science",
          story: "Mia stood before the Eiffel Tower, then visited a museum with paintings by Van Gogh and da Vinci. \"Europe sparked the Renaissance and the Industrial Revolution,\" Castle Carl said. \"Ideas born here changed the whole world.\"",
          explanation: "Europe produced great artists, composers, and scientists — from Mozart and Shakespeare to Marie Curie and the Wright brothers. Museums and universities across Europe preserve this heritage.",
          words: ["Renaissance", "Eiffel Tower", "scientists", "museum"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "The European Union",
          story: "Castle Carl showed Mia a map where many countries share open borders and one currency — the euro. \"The EU helps nations trade peacefully and work together on laws, travel, and the environment,\" he explained.",
          explanation: "The European Union (EU) includes 27 member countries that cooperate on trade, travel, and regulations. Not all European countries use the euro — the UK, Norway, and Switzerland have their own arrangements."
        },
        {
          slot: "explain-2",
          storyTitle: "Climate from North to South",
          story: "Mia shivered in snowy Finland and later sunbathed on a Greek island. \"Europe stretches from the Arctic Circle to the Mediterranean,\" Castle Carl said. \"Climate changes what people grow, wear, and celebrate.\"",
          explanation: "Northern Europe has cold winters and midnight sun in summer. Southern Europe enjoys warm Mediterranean climates ideal for olives, grapes, and tourism. Alps create ski resorts and block some weather patterns."
        },
        {
          slot: "explain-3",
          storyTitle: "Famous Rivers",
          story: "A boat cruise on the Danube took Mia through four countries without changing ships. \"Rivers like the Danube, Rhine, and Thames connect cities and carry goods,\" Castle Carl said. \"Waterways built European trade.\"",
          explanation: "Major European rivers include the Danube (Central/Eastern Europe), Rhine (Germany/Netherlands), Seine (France), and Thames (England). Rivers provide transport, water, and fertile farmland."
        }
      ],
      game: {
        id: "glow-rhythm",
        title: "🏰 Castle Rhythm",
        desc: "Tap the glowing landmarks in rhythm! Match Europe's famous sights.",
        boot: {
          game: "glow-rhythm",
          goal: 48,
          time: 55,
          lives: 3,
          good: ["🏰", "🗼", "🎻", "☕"],
          bad: ["🌵", "🐪"],
          bgTop: "#5c6bc0",
          bgBot: "#283593"
        }
      },
      quiz: [
        { q: "The Eiffel Tower is in…", options: ["Italy", "France", "Spain", "Germany"], correct: 1 },
        { q: "The European Union helps countries…", options: ["Cooperate and trade peacefully", "Build walls between all neighbors", "Stop using money", "Move to Mars"], correct: 0 },
        { q: "Which language family includes Spanish and Italian?", options: ["Romance languages", "Only sign language", "Fish language", "Cloud language"], correct: 0 },
        { q: "The Mediterranean Sea borders…", options: ["Southern Europe", "Only Antarctica", "The moon", "No countries"], correct: 0 },
        { q: "The Danube is a famous European…", options: ["River", "Mountain on Mars", "Type of pizza", "Desert in Africa only"], correct: 0 }
      ]
    },
    {
      id: "africa",
      num: 14,
      slug: "Africa",
      title: "Africa",
      emoji: "🦁",
      opponent: { name: "Safari Sara", icon: "🦒" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Cradle of Humanity",
          story: "Mia watched the sun rise over the Serengeti plains. Safari Sara, a ranger with binoculars and a wide-brim hat, smiled. \"Africa is where the earliest humans lived,\" she said. \"It's the second-largest continent and full of life.\"",
          explanation: "Africa has 54 countries and incredibly diverse landscapes — savannas, rainforests, deserts, and mountains. Fossil evidence shows human ancestors evolved in Africa over millions of years.",
          words: ["Africa", "Serengeti", "humanity", "continent"]
        },
        {
          slot: "main-2",
          storyTitle: "Wildlife Kingdom",
          story: "Zebras stamped, elephants trumpeted, and a lion rested under an acacia tree. \"Africa's animals are famous worldwide,\" Safari Sara whispered. \"National parks protect them so future kids can wonder at giraffes and rhinos too.\"",
          explanation: "Africa hosts the \"Big Five\" — lion, leopard, elephant, rhino, and buffalo — plus gorillas, cheetahs, and millions of wildebeest that migrate across the Serengeti each year.",
          words: ["wildlife", "elephants", "national parks", "migration"]
        },
        {
          slot: "main-3",
          storyTitle: "Rhythms and Colors",
          story: "In Lagos, Mia danced to drums at a festival. In Morocco, she wandered a blue-walled medina. \"Every region has its own music, fabrics, and flavors,\" Safari Sara said. \"Africa's culture inspires the whole planet.\"",
          explanation: "Africa gave the world jazz, blues, and Afrobeat roots. Textiles like kente and mudcloth, cuisines using jollof rice and injera, and 2,000+ languages reflect the continent's rich diversity.",
          words: ["music", "festival", "culture", "languages"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "The Sahara Desert",
          story: "Mia rode a camel over golden dunes that seemed endless. \"The Sahara is the world's largest hot desert,\" Safari Sara said. \"Yet people have crossed it for trade for thousands of years — oases are like green islands in the sand.\"",
          explanation: "The Sahara covers much of North Africa. Despite harsh conditions, ancient trade routes connected sub-Saharan Africa to Europe and Asia, exchanging gold, salt, and ideas."
        },
        {
          slot: "explain-2",
          storyTitle: "The Nile River",
          story: "From a boat on the Nile, Mia saw farmers watering fields just as Egyptians did beside the pyramids. \"The Nile is Africa's longest river,\" Safari Sara explained. \"Its floods once made the soil rich for farming civilization.\"",
          explanation: "The Nile flows over 6,650 km through eleven countries. Ancient Egypt depended on its yearly floods. Today dams like the Aswan High Dam provide electricity and control water."
        },
        {
          slot: "explain-3",
          storyTitle: "Growing Cities",
          story: "Skyscrapers rose in Nairobi and Cape Town while village markets bustled outside the cities. \"Africa's cities are growing fast,\" Safari Sara said. \"Young entrepreneurs, tech hubs, and solar power are shaping a bright future.\"",
          explanation: "Cities like Lagos, Cairo, Johannesburg, and Nairobi are economic and cultural centers. Africa has the world's youngest population, bringing innovation in mobile banking, renewable energy, and arts."
        }
      ],
      game: {
        id: "sonar-ping",
        title: "🦁 Safari Ping",
        desc: "Spot African animals before they hide! Tap lions, elephants, and giraffes.",
        boot: {
          game: "sonar-ping",
          goal: 52,
          time: 55,
          lives: 3,
          good: ["🦁", "🐘", "🦒", "🦓"],
          bad: ["🐧"],
          bgTop: "#ff9800",
          bgBot: "#e65100"
        }
      },
      quiz: [
        { q: "How many countries are in Africa (about)?", options: ["12", "54", "200", "3"], correct: 1 },
        { q: "The Sahara is a huge…", options: ["Hot desert", "Ice rink", "Shopping mall", "Underwater city"], correct: 0 },
        { q: "The Nile is Africa's longest…", options: ["River", "Mountain peak", "Highway in space", "Cloud"], correct: 0 },
        { q: "Fossils show early humans lived in…", options: ["Africa", "Only on the moon", "Inside volcanoes", "Nowhere on Earth"], correct: 0 },
        { q: "The Serengeti is famous for…", options: ["Wildlife and migration", "Penguins only", "Giant glaciers", "No animals at all"], correct: 0 }
      ]
    },
    {
      id: "north-america",
      num: 17,
      slug: "North-America",
      title: "North America",
      emoji: "🗽",
      opponent: { name: "Liberty Lou", icon: "🦅" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "From Arctic to Tropics",
          story: "Mia stood before the Statue of Liberty in New York Harbor. Liberty Lou, a spirited guide with a star-spangled scarf, spread her arms wide. \"North America stretches from icy Canada to sunny Mexico,\" she said. \"Three big countries — plus islands and Central America — share this continent.\"",
          explanation: "North America includes Canada, the United States, Mexico, and the countries of Central America and the Caribbean. It spans Arctic tundra, vast plains, deserts, forests, and tropical beaches.",
          words: ["North America", "Canada", "United States", "Mexico"]
        },
        {
          slot: "main-2",
          storyTitle: "Native Nations",
          story: "Liberty Lou took Mia to a museum honoring First Nations, Navajo, Inuit, and Maya heritage. \"Long before modern borders, indigenous peoples built cities, farmed corn, and mapped stars,\" she said respectfully.",
          explanation: "Indigenous cultures thrived across North America for thousands of years — from Inuit in the Arctic to Maya in Central America. Their knowledge of land, plants, and astronomy remains vital today.",
          words: ["indigenous", "Maya", "heritage", "corn"]
        },
        {
          slot: "main-3",
          storyTitle: "Natural Wonders",
          story: "Mia hiked the Grand Canyon, watched geysers at Yellowstone, and listened to waves crash on California cliffs. \"This continent has superlatives,\" Liberty Lou laughed. \"Deep canyons, tall redwoods, and the Great Lakes hold a fifth of Earth's fresh surface water!\"",
          explanation: "North American landmarks include the Grand Canyon, Niagara Falls, Rocky Mountains, and Mississippi River. National parks protect bison, bears, wolves, and ancient forests.",
          words: ["Grand Canyon", "Yellowstone", "Great Lakes", "national parks"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "The United States",
          story: "From the White House to Hollywood, Mia saw how 50 states fit together like a puzzle. \"Each state has its own capital and laws,\" Liberty Lou explained, \"but they share one federal government and Constitution.\"",
          explanation: "The USA has 50 states plus Washington D.C. as the capital district. It is the world's third-largest country by population and a leader in technology, entertainment, and agriculture."
        },
        {
          slot: "explain-2",
          storyTitle: "Canada's Wild North",
          story: "In Canada, Mia saw auroras dance over pine forests and moose wade through lakes. \"Canada is the second-largest country by area,\" Liberty Lou said. \"Most Canadians live near the U.S. border, but the north is vast wilderness.\"",
          explanation: "Canada has ten provinces and three territories. Bilingual English and French reflect its history. Resources like timber, minerals, and hydropower support the economy alongside diverse cities like Toronto and Vancouver."
        },
        {
          slot: "explain-3",
          storyTitle: "Mexico and Central America",
          story: "Colorful papel picado fluttered over a plaza in Mexico City. \"Mexico gave the world chocolate, corn, and vibrant festivals,\" Liberty Lou said. \"Central American countries connect North and South America through rainforests and volcanoes.\"",
          explanation: "Mexico City is one of the world's largest metropolitan areas. Central America includes countries like Guatemala, Costa Rica, and Panama — home to rainforests, Mayan ruins, and the Panama Canal linking two oceans."
        }
      ],
      game: {
        id: "trench-pilot",
        title: "🗽 Landmark Pilot",
        desc: "Fly your plane ← → through North American landmarks! Dodge storm clouds.",
        boot: {
          game: "trench-pilot",
          goal: 55,
          time: 55,
          lives: 3,
          good: ["🗽", "🍁", "🌵", "🏔️"],
          bad: ["⛈️", "🌪️"],
          player: "✈️",
          bgTop: "#42a5f5",
          bgBot: "#1565c0"
        }
      },
      quiz: [
        { q: "Which three large countries share most of North America?", options: ["Canada, USA, Mexico", "France, Italy, Spain", "China, Japan, Korea", "Brazil, Chile, Peru"], correct: 0 },
        { q: "The Statue of Liberty is in…", options: ["New York, USA", "Paris, France", "London, England", "Sydney, Australia"], correct: 0 },
        { q: "The Grand Canyon was carved mainly by…", options: ["The Colorado River", "One day of rain", "A giant skateboard", "Moon gravity"], correct: 0 },
        { q: "Canada's capital city is…", options: ["Ottawa", "Toronto", "Paris", "Tokyo"], correct: 0 },
        { q: "Indigenous peoples lived in North America…", options: ["Long before modern countries formed", "Only after 2020", "Never", "Only in Antarctica"], correct: 0 }
      ]
    },
    {
      id: "south-america",
      num: 20,
      slug: "South-America",
      title: "South America",
      emoji: "🌎",
      opponent: { name: "Andes Ana", icon: "🦙" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Amazon Adventure",
          story: "Mia's boat glided into the green heart of the Amazon rainforest. Andes Ana, a guide with a colorful poncho, pointed to macaws and monkeys in the canopy. \"South America holds the world's largest rainforest and longest mountain chain,\" she said.",
          explanation: "South America has 12 countries including Brazil, Argentina, Peru, and Colombia. The Amazon River basin contains the planet's biggest tropical rainforest and incredible biodiversity.",
          words: ["Amazon", "rainforest", "Brazil", "biodiversity"]
        },
        {
          slot: "main-2",
          storyTitle: "The Andes Mountains",
          story: "A llama trotted beside Mia on a stone path high in the Andes. \"These mountains run the whole western coast,\" Andes Ana explained. \"The Inca built Machu Picchu here — a city in the clouds.\"",
          explanation: "The Andes stretch about 7,000 km along South America's west coast. Ancient Inca civilization engineered terraced farms and stone cities. Today the range includes active volcanoes and high-altitude lakes.",
          words: ["Andes", "Inca", "Machu Picchu", "llama"]
        },
        {
          slot: "main-3",
          storyTitle: "Rhythm of the Continent",
          story: "In Rio, Mia heard samba drums during Carnival. In Buenos Aires, tango dancers spun on a street corner. \"Music and dance are the heartbeat here,\" Andes Ana said, clapping along. \"Football passion unites millions too!\"",
          explanation: "South America is famous for samba, tango, and cumbia. Brazil hosts the world's largest Carnival. Football (soccer) is hugely popular — Pelé and Messi are global legends born here.",
          words: ["samba", "Carnival", "tango", "football"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Rainforest Guardians",
          story: "Andes Ana showed Mia how trees release moisture that becomes rain across the continent. \"The Amazon produces oxygen and stores carbon,\" she said. \"Protecting it helps fight climate change for the whole planet.\"",
          explanation: "Amazon rainforests regulate Earth's climate and house millions of species. Deforestation threatens jaguars, poison dart frogs, and indigenous communities who depend on the forest."
        },
        {
          slot: "explain-2",
          storyTitle: "Patagonia and Pampas",
          story: "At the continent's southern tip, wind whipped across icy Patagonia. Farther north, golden grasslands called the pampas stretched to the horizon. \"Argentina's gauchos herd cattle here,\" Andes Ana said, \"while penguins nest on southern shores.\"",
          explanation: "Patagonia spans Argentina and Chile with glaciers and rugged peaks. The pampas are fertile grasslands for farming and ranching. Chile is long and narrow, bordered by the Andes and Pacific Ocean."
        },
        {
          slot: "explain-3",
          storyTitle: "Galápagos and Unique Life",
          story: "Off Ecuador's coast, Mia saw giant tortoises and blue-footed boobies on the Galápagos Islands. \"Isolated islands evolve unique animals,\" Andes Ana explained. \"Charles Darwin's visit here helped him understand evolution.\"",
          explanation: "The Galápagos Islands inspired Darwin's theory of natural selection. South America's isolation produced unique species like llamas, capybaras, and poison dart frogs found nowhere else."
        }
      ],
      game: {
        id: "sonar-ping",
        title: "🦙 Jungle Ping",
        desc: "Spot rainforest treasures in the green! Tap macaws, jaguars, and flowers.",
        boot: {
          game: "sonar-ping",
          goal: 52,
          time: 55,
          lives: 3,
          good: ["🦜", "🐆", "🌺", "🦙"],
          bad: ["🏜️"],
          bgTop: "#2e7d32",
          bgBot: "#1b5e20"
        }
      },
      quiz: [
        { q: "The Amazon rainforest is mostly in…", options: ["Brazil", "Iceland", "Japan", "Egypt"], correct: 0 },
        { q: "Machu Picchu was built by the…", options: ["Inca civilization", "Romans", "Vikings", "Penguins"], correct: 0 },
        { q: "The Andes are a long chain of…", options: ["Mountains", "Deserts in space", "Shopping malls", "Ice cream flavors"], correct: 0 },
        { q: "Carnival is a famous festival in…", options: ["Brazil", "Antarctica only", "The moon", "No countries"], correct: 0 },
        { q: "Galápagos Islands helped Darwin study…", options: ["Evolution and unique species", "How to build rockets", "Moon cheese", "Desert snow"], correct: 0 }
      ]
    },
    {
      id: "australia-oceania",
      num: 23,
      slug: "Australia-Oceania",
      title: "Australia & Oceania",
      emoji: "🦘",
      opponent: { name: "Outback Ollie", icon: "🐨" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Land Down Under",
          story: "Mia arrived in Sydney and stared up at the sail-shaped Opera House. Outback Ollie, a ranger in a wide hat, grinned. \"Welcome to Australia — a continent and a country!\" he said. \"Oceania also includes thousands of Pacific islands.\"",
          explanation: "Australia is both a country and a continent. Oceania includes New Zealand, Papua New Guinea, Fiji, and many Pacific island nations scattered across the world's largest ocean.",
          words: ["Australia", "Oceania", "Sydney", "Pacific"]
        },
        {
          slot: "main-2",
          storyTitle: "Unique Animals",
          story: "A kangaroo hopped past while a koala dozed in a eucalyptus tree. \"Most mammals here are marsupials — they carry babies in pouches,\" Outback Ollie explained. \"Platypuses lay eggs! Evolution got creative on this isolated continent.\"",
          explanation: "Australia's isolation produced unique wildlife: kangaroos, koalas, wombats, platypuses, and deadly-but-fascinating creatures like box jellyfish and funnel-web spiders (handled only by experts!).",
          words: ["marsupials", "kangaroo", "koala", "platypus"]
        },
        {
          slot: "main-3",
          storyTitle: "Reef and Rock",
          story: "Mia snorkeled on the Great Barrier Reef, then walked around Uluru's red rock at sunset. \"The reef is the largest living structure on Earth,\" Outback Ollie said. \"Uluru is sacred to Aboriginal peoples who have cared for this land for tens of thousands of years.\"",
          explanation: "The Great Barrier Reef spans over 2,300 km. Uluru (Ayers Rock) is a sacred sandstone monolith. Aboriginal and Torres Strait Islander cultures are among the world's oldest continuous cultures.",
          words: ["Great Barrier Reef", "Uluru", "Aboriginal", "sacred"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Pacific Island Nations",
          story: "On a map, Mia traced tiny dots from Hawaii to Samoa to New Zealand. \"Some islands are volcanic peaks; others are coral atolls barely above sea level,\" Outback Ollie said. \"Polynesian navigators crossed vast oceans using stars and waves.\"",
          explanation: "Pacific cultures include Polynesia, Micronesia, and Melanesia. Traditional navigation used star paths and ocean swells. Rising sea levels from climate change threaten low-lying atoll nations."
        },
        {
          slot: "explain-2",
          storyTitle: "The Outback",
          story: "Red dust, spinifex grass, and a sky blazing with stars — Mia camped in Australia's interior. \"The outback is dry and remote,\" Outback Ollie said, \"but it holds ancient art, mining resources, and tough, resilient communities.\"",
          explanation: "Most Australians live on the coast; the interior outback is sparsely populated desert and scrubland. Indigenous rock art at places like Kakadu dates back over 20,000 years."
        },
        {
          slot: "explain-3",
          storyTitle: "New Zealand's Volcanoes",
          story: "Mia hiked near steaming geysers in New Zealand and learned the Māori greeting \"Kia ora.\" \"New Zealand sits on the Ring of Fire,\" Outback Ollie explained. \"Mountains, fjords, and rugby pride define this island nation.\"",
          explanation: "New Zealand has two main islands with volcanoes, glaciers, and fjords. Māori culture is central to national identity. The All Blacks rugby team is famous worldwide."
        }
      ],
      game: {
        id: "reef-match",
        title: "🦘 Outback Match",
        desc: "Flip cards and find matching Australian and Pacific pairs!",
        boot: {
          game: "reef-match",
          goal: 80,
          time: 70,
          lives: 3,
          good: ["🦘", "🐨", "🌊", "🏝️"],
          bad: [],
          winText: "Match all pairs!",
          bgTop: "#00897b",
          bgBot: "#004d40"
        }
      },
      quiz: [
        { q: "Australia is both a country and a…", options: ["Continent", "Moon", "Type of soup", "Volcano in Europe"], correct: 0 },
        { q: "Kangaroos and koalas are…", options: ["Marsupials", "Fish", "Birds that swim in deserts", "Robots"], correct: 0 },
        { q: "The Great Barrier Reef is off the coast of…", options: ["Australia", "Canada", "Switzerland", "Mongolia"], correct: 0 },
        { q: "Uluru is important to…", options: ["Aboriginal peoples", "Only penguins", "Nobody", "Aliens from Mars"], correct: 0 },
        { q: "New Zealand's indigenous people are the…", options: ["Māori", "Inca", "Vikings", "Romans"], correct: 0 }
      ]
    },
    {
      id: "antarctica",
      num: 26,
      slug: "Antarctica",
      title: "Antarctica",
      emoji: "🐧",
      opponent: { name: "Polar Pete", icon: "🧊" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The Frozen Continent",
          story: "Mia zipped her parka as wind howled across white ice. Polar Pete, a scientist in a big red coat, waved from the research station. \"Welcome to Antarctica — the coldest, driest, windiest continent!\" he shouted. \"No country owns it — nations work together here.\"",
          explanation: "Antarctica is Earth's southernmost continent, covered by ice averaging 2 km thick. The Antarctic Treaty protects it for peaceful scientific research — no military bases or mining allowed.",
          words: ["Antarctica", "ice", "Antarctic Treaty", "research"]
        },
        {
          slot: "main-2",
          storyTitle: "Penguin Parade",
          story: "Thousands of emperor penguins huddled together against the cold, chicks peeking from fluffy feathers. \"Penguins, seals, and seabirds rule this land,\" Polar Pete said. \"There are no permanent human residents — only visiting scientists and support teams.\"",
          explanation: "Antarctic wildlife includes emperor and Adélie penguins, Weddell seals, and albatrosses. No native land mammals exist — animals depend on the surrounding Southern Ocean for food.",
          words: ["penguins", "seals", "wildlife", "Southern Ocean"]
        },
        {
          slot: "main-3",
          storyTitle: "Ice and Climate",
          story: "Polar Pete drilled an ice core and showed Mia layers like tree rings. \"This ice trapped air from thousands of years ago,\" he explained. \"Antarctica's ice sheets hold most of Earth's fresh water — if too much melts, sea levels rise worldwide.\"",
          explanation: "Antarctica stores about 90% of the world's ice and 70% of fresh water. Scientists study ice cores to understand past climates. Warming temperatures threaten ice shelves and global coastlines.",
          words: ["ice core", "climate", "sea level", "fresh water"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Midnight Sun and Polar Night",
          story: "In Antarctic summer, the sun never fully set — pink light glowed at midnight. In winter, darkness lasted months. \"That's life near the South Pole,\" Polar Pete said. \"Extreme seasons test every explorer.\"",
          explanation: "Antarctica experiences six months of continuous daylight in summer and six months of darkness in winter due to Earth's tilt. Temperatures can drop below −80 °C in interior winter."
        },
        {
          slot: "explain-2",
          storyTitle: "Research Stations",
          story: "Mia visited labs studying ozone holes, cosmic rays, and ancient microbes frozen in ice. \"Countries share data freely here,\" Polar Pete said. \"Discoveries in Antarctica help us understand the whole planet.\"",
          explanation: "Over 30 countries operate research stations. Studies cover climate change, astronomy (clear, dry air), glaciology, and marine biology in the Southern Ocean."
        },
        {
          slot: "explain-3",
          storyTitle: "Protecting the White Continent",
          story: "Mia joined a cleanup sorting recycling from the station waste. \"We leave no trace,\" Polar Pete insisted. \"Tourism is limited, and everyone must protect penguin colonies and keep invasive species out.\"",
          explanation: "Antarctic tourism is regulated to protect wildlife. Introduced species could devastate fragile ecosystems. International agreements aim to preserve Antarctica as a natural reserve dedicated to peace and science."
        }
      ],
      game: {
        id: "breath-dive",
        title: "🐧 Polar Dive",
        desc: "Penguin dive ⬇️ for fish, surface ⬆️ for air. Watch the O₂ bar in icy waters!",
        boot: {
          game: "breath-dive",
          goal: 60,
          time: 60,
          lives: 3,
          good: ["🐟", "🦐", "🦑"],
          bad: ["🧊", "⛷️"],
          player: "🐧",
          bgTop: "#0277bd",
          bgBot: "#01579b"
        }
      },
      quiz: [
        { q: "Antarctica is the…", options: ["Coldest continent", "Hottest desert", "Smallest ocean", "Capital of France"], correct: 0 },
        { q: "No country permanently…", options: ["Owns Antarctica as private property", "Allows science", "Has ice", "Has penguins"], correct: 0 },
        { q: "Emperor penguins live in…", options: ["Antarctica", "The Sahara Desert", "Shopping malls", "Volcanoes only"], correct: 0 },
        { q: "Antarctica holds most of Earth's…", options: ["Ice and fresh water", "Desert sand", "Palm trees", "Skyscrapers"], correct: 0 },
        { q: "Scientists study ice cores to learn about…", options: ["Past climates", "Future pizza recipes", "How fish fly", "Moon gardening"], correct: 0 }
      ]
    },
    {
      id: "landmarks",
      num: 29,
      slug: "Famous-Landmarks",
      title: "Famous Landmarks",
      emoji: "🗿",
      opponent: { name: "Landmark Lexi", icon: "📸" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Wonders of the World",
          story: "Mia flipped through a photo album of global icons — pyramids, towers, temples, and statues. Landmark Lexi, a travel photographer with a huge camera, beamed. \"Landmarks tell us what people value — faith, power, art, or remembrance.\"",
          explanation: "Famous landmarks include the Great Pyramid of Giza, Taj Mahal, Eiffel Tower, Great Wall of China, and Statue of Liberty. Many are UNESCO World Heritage Sites protected for future generations.",
          words: ["landmarks", "UNESCO", "heritage", "monuments"]
        },
        {
          slot: "main-2",
          storyTitle: "Natural vs. Built",
          story: "Lexi compared photos of Uluru, Niagara Falls, and Mount Fuji with the Colosseum and Petra. \"Some landmarks are carved by nature; others by human hands over centuries,\" she said. \"Both kinds inspire awe.\"",
          explanation: "Natural landmarks include Victoria Falls, Mount Everest, and the Grand Canyon. Built landmarks include the Parthenon, Angkor Wat, and Sydney Opera House — each reflects engineering and culture of its time.",
          words: ["natural", "built", "engineering", "culture"]
        },
        {
          slot: "main-3",
          storyTitle: "Symbols and Stories",
          story: "At the Taj Mahal, Mia learned it was built as a tomb for love. At Berlin's Brandenburg Gate, she heard about unity. \"Every landmark has a story,\" Lexi whispered. \"When you visit, you're stepping into history.\"",
          explanation: "Landmarks often symbolize national identity — Big Ben for London, Christ the Redeemer for Rio, Moai statues for Easter Island. Understanding their stories helps us respect local cultures when we travel.",
          words: ["symbols", "history", "Taj Mahal", "identity"]
        }
      ],
      explainedSegments: [
        {
          slot: "explain-1",
          storyTitle: "Ancient Wonders",
          story: "Lexi showed Mia sketches of the Colosseum where gladiators once fought, and Petra's rose-red city carved into Jordanian cliffs. \"Ancient builders moved stones weighing tons without modern machines,\" she marveled.",
          explanation: "Seven Wonders of the Ancient World included the Hanging Gardens of Babylon and Lighthouse of Alexandria — most are gone. Surviving ancient sites teach archaeology, architecture, and early engineering."
        },
        {
          slot: "explain-2",
          storyTitle: "Modern Icons",
          story: "Glass skyscrapers like the Burj Khalifa in Dubai and the CN Tower in Toronto push height records. \"Modern landmarks use steel, glass, and computers,\" Lexi said. \"They show what today's engineers can achieve.\"",
          explanation: "The Burj Khalifa (828 m) is the world's tallest building. Other modern icons include the Golden Gate Bridge, Panama Canal, and International Space Station — landmarks of human ambition."
        },
        {
          slot: "explain-3",
          storyTitle: "Responsible Tourism",
          story: "Lexi taught Mia to stay on paths, never carve initials, and learn local rules before visiting sacred sites. \"Millions of tourists can wear down landmarks,\" she warned. \"We protect wonders by visiting kindly.\"",
          explanation: "Overtourism can damage fragile sites. Responsible travel means respecting rules, supporting local communities, and choosing sustainable transport. UNESCO lists help countries preserve threatened landmarks."
        }
      ],
      game: {
        id: "school-run",
        title: "📸 Landmark Run",
        desc: "Switch lanes ⬅️➡️ — collect camera shots, dodge closed signs!",
        boot: {
          game: "school-run",
          goal: 64,
          time: 55,
          lives: 3,
          good: ["📸", "🗺️", "⭐"],
          bad: ["🚧", "🚫"],
          player: "🧳",
          bgTop: "#7b1fa2",
          bgBot: "#4a148c"
        }
      },
      quiz: [
        { q: "The Taj Mahal is in…", options: ["India", "Brazil", "Canada", "Norway"], correct: 0 },
        { q: "The Great Pyramid of Giza is in…", options: ["Egypt", "Japan", "Australia", "Mexico City only"], correct: 0 },
        { q: "UNESCO World Heritage Sites are protected because they are…", options: ["Culturally or naturally important", "Secret bases", "Empty parking lots", "Always made of ice cream"], correct: 0 },
        { q: "Petra is famous for buildings carved into…", options: ["Cliffs in Jordan", "Clouds", "The ocean floor", "Outer space"], correct: 0 },
        { q: "Responsible tourists should…", options: ["Follow rules and respect sacred places", "Carve their names on ancient walls", "Leave trash everywhere", "Ignore local customs"], correct: 0 }
      ]
    }
  ];
})(window);
