/* Mudra holiday trip to Myanmar — junior-novel chapters (continuous Mudra holiday) */
(function (w) {
  /**
   * Book arc:
   * 1 Arrival — Intro
   * 2 Grandma — Character & world
   * 3 Tea — Rising action
   * 4 Market — Rising action
   * 5 Farm — Belonging
   * 6 School — Challenge
   * 7 Play — Friendship warmth
   * 8 Pagoda — Quiet climax
   * 9 Festival — Peak + ending
   *
   * Each chapter = two picture sessions (3 unique images each):
   *   learn / learn-2 / learn-3  + long story + words
   *   sent / sent-2 / sent-3    + scene story + sentences
   */
  var CHAPTERS = [
    {
      id: "arrival",
      emoji: "✈️",
      title: "Mudra Arrives",
      badge: "Hello Star",
      storyTitle: "Chapter 1 · The Window Above Myanmar",
      beat: "Intro",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Mingalarpar",
        text: "Mingalarpar is more than hello — it wishes goodness. Myanmar children who live abroad, like Mudra in Singapore, often hear it first when they visit grandparents."
      },
      tip: "Practice Mingalarpar every morning this week — English, then Myanmar.",
      story:
        "Mudra is 7 years old — a Myanmar girl who lives and studies in Singapore with Mother and Father. At school she speaks English. At home she often dreams in English too. Myanmar lived mostly in old photographs on Grandma's phone: wooden houses, green rice fields, and a smile Mudra had not felt in person for a long time.\n\n" +
        "On the morning of her holiday flight from Singapore, Mudra packed a small red suitcase. Inside she placed a notebook, a pencil, and a folded paper heart she had made for Grandma. Mother kissed her forehead. Father squeezed her hand. \"Be brave,\" he said. \"Listen carefully. Your ears will learn faster than you think.\"\n\n" +
        "The airplane rose through clouds. Mudra pressed her nose to the cold window. Hours later the sea turned into land, and the land turned into green squares of rice. Thin roads shone like threads. Then she saw them — golden pagodas standing like quiet candles on the hills. \"Today is my holiday trip to Myanmar,\" she whispered. Her heart beat with hope and a little worry. What if she forgot how to say hello? What if Grandma looked different from the photos?\n\n" +
        "When the wheels touched the runway, Mudra's fingers tightened on the suitcase handle. The air outside was warm and soft, like a blanket left in the sun. People called to each other in a language that sounded like music Mudra almost remembered.\n\n" +
        "At the gate, a small woman waved both hands so hard her flower hairpin wiggled. \"Mudra!\" Grandma's voice found her at once. Mudra ran. The hug smelled like rain, soap, and jasmine. Grandma held the red suitcase as if it were treasure. \"Welcome home,\" she said in English first, then smiled. \"Now listen. Mingalarpar.\"\n\n" +
        "Mudra practiced the word carefully — hello that wished goodness. Thank you. Come. Please. Yes. Grandma nodded. \"Good. In our village, kind words open every door. Tomorrow we begin. Tonight you sleep under our roof, little traveler.\"\n\n" +
        "That night Mudra wrote in her notebook: Day one. I am seven. I came from Singapore. I said Mingalarpar. I am a little scared. I am a little brave. Outside, frogs sang, and Myanmar felt real at last.",
      sentStory:
        "In the taxi to the village, Mudra practiced again. Hello. Welcome. Thank you. Grandma pointed to the green rice fields outside the window and said, \"လယ်ကွင်း — rice field.\" Mudra repeated lel-kwin as if collecting shells on a beach. When they reached the wooden gate, Grandma squeezed her hand. \"Come. Home is waiting.\"",
      sentStoryLong:
        "In the taxi to the village, Mudra sat close to Grandma and practiced the new sounds under her breath. Hello. Welcome. Thank you. Please. Yes. Beyond the window, water shone between green squares of rice. Grandma pointed and taught the real name of what Mudra saw: \"လယ်ကွင်း. Rice field. Say it — lel-kwin.\" Mudra repeated carefully, proud to learn a village word, not only a country name. When the wooden gate appeared between banana trees, Grandma squeezed her hand. \"Come. Home is waiting.\" Mudra stepped out with her red suitcase and felt the holiday truly begin.",
      words: [
        { en: "Hello", mm: "မင်္ဂလာပါ", emoji: "🙏", hint: "mingalarpar" },
        { en: "Welcome", mm: "ကြိုဆိုပါတယ်", emoji: "🏡", hint: "kyo-so" },
        { en: "Grandma", mm: "အဘွား", emoji: "👵", hint: "a-bwa" },
        { en: "Home", mm: "အိမ်", emoji: "🏠", hint: "ein" },
        { en: "Thank you", mm: "ကျေးဇူးတင်ပါတယ်", emoji: "💛", hint: "kye-zu" },
        { en: "Come", mm: "လာပါ", emoji: "👋", hint: "la-ba" },
        { en: "Please", mm: "ကျေးဇူးပြု၍", emoji: "🤲", hint: "kye-zu-pyu" },
        { en: "Yes", mm: "ဟုတ်ကဲ့", emoji: "✅", hint: "hote-ke" },
        { en: "Rice field", mm: "လယ်ကွင်း", emoji: "🌾", hint: "lel-kwin" },
        { en: "Holiday", mm: "အားလပ်ရက်", emoji: "☀️", hint: "ah-lut-yet" }
      ],
      quizQuestions: [
        { q: "How old is Mudra in this story?", options: ["Seven years old", "Two years old", "A grown-up teacher", "A baby only"], correct: 0 },
        { q: "Where does Mudra live most of the year?", options: ["In Singapore, far across the sea", "Only inside the pagoda", "Already on Grandma's farm every day", "Under the sea"], correct: 0 },
        { q: "Who met Mudra at the gate?", options: ["Grandma", "A robot", "Only strangers", "A silent statue"], correct: 0 },
        { q: "What greeting did Grandma teach first?", options: ["Mingalarpar", "Goodbye forever", "Be quiet", "Go away"], correct: 0 },
        { q: "What word did Grandma teach when she pointed at the green fields?", options: ["Rice field — လယ်ကွင်း (lel-kwin)", "Airplane", "Snow", "Computer"], correct: 0 }
      ]
    },
    {
      id: "grandma",
      emoji: "🏡",
      title: "Grandma's House",
      badge: "Family Star",
      storyTitle: "Chapter 2 · Names Under One Roof",
      beat: "Character & world",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Elders first",
        text: "In many Myanmar homes, children greet grandparents before anyone else. Family names carry respect and belonging."
      },
      tip: "Point to people in a family photo and name Mother, Father, Grandma — then hear Myanmar.",
      story:
        "Grandma's house stood on tall wooden stilts beside banana trees that whispered in the breeze. Chickens scratched under the stairs. A dog slept in a warm square of sunlight. Mudra climbed carefully, suitcase bumping her knee, and stepped into a room that smelled of rice and teak.\n\n" +
        "Mother was already there, stirring a pot. \"Mingalarpar, Mudra!\" she laughed, as if Mudra had only been gone a minute, not years. Father swept the yard below and looked up with kind eyes. Sister hung Mudra's travel dress by the window so the wrinkles could rest. Baby clapped sticky hands when Mudra waved.\n\n" +
        "Soon the house filled like a festival. Aunt arrived with sweets. Uncle carried a basket of mangoes. Cousin peeked from behind a door, shy and curious. Brother showed Mudra where to put her shoes. Everyone spoke quickly. Mudra's ears worked hard. She understood hugs better than sentences.\n\n" +
        "Grandma sat Mudra on a low chair. \"This is your family,\" she said slowly in English, then in Myanmar. She pointed to each face. Mother. Father. Sister. Brother. Aunt. Uncle. Cousin. Baby. Grandfather on the porch with his tea. Mudra tapped her own chest. \"I am Mudra.\" The room laughed gently, not to tease her, but to welcome her name into the air.\n\n" +
        "Before dinner, Grandma whispered near Mudra's ear. \"In our house we greet elders first.\" Mudra walked to Grandfather, bowed a little, and said, \"Mingalarpar, Grandfather.\" His eyes crinkled like folded paper. \"Welcome, little traveler. Tonight you sleep under our roof. Tomorrow the village will meet you.\"\n\n" +
        "That night Sister shared a mat with Mudra. Through the wooden wall Mudra heard frogs, distant drums, and Mother humming. She practiced family words in the dark until they felt like soft steps across a familiar floor. For the first time, Mudra was not only visiting. She was becoming someone who belonged.",
      sentStory:
        "At the low table, Mudra practiced every name again. Mother passed rice. Father smiled. Grandfather nodded when Mudra said thank you. Sit, Grandma told her kindly. Family filled every seat, and Mudra's shy voice grew a little stronger.",
      sentStoryLong:
        "At the low dinner table, Mudra practiced every name again while plates were filled. Mother passed rice. Father smiled across the steam. Sister nudged the water cup closer. When Mudra remembered to greet Grandfather and say thank you, Grandma whispered, \"Sit.\" Family filled every seat. Mudra's shy voice grew stronger with each careful word.",
      words: [
        { en: "Mother", mm: "အမေ", emoji: "👩", hint: "a-may" },
        { en: "Father", mm: "အဖေ", emoji: "👨", hint: "a-phe" },
        { en: "Grandfather", mm: "အဘိုး", emoji: "👴", hint: "a-bo" },
        { en: "Sister", mm: "ညီမ", emoji: "👧", hint: "nyi-ma" },
        { en: "Brother", mm: "အစ်ကို", emoji: "👦", hint: "a-ko" },
        { en: "Aunt", mm: "အဒေါ်", emoji: "👩", hint: "a-daw" },
        { en: "Uncle", mm: "ဦးလေး", emoji: "👨", hint: "u-lay" },
        { en: "Cousin", mm: "ဝမ်းကွဲ", emoji: "🧒", hint: "wun-kwe" },
        { en: "Baby", mm: "ကလေး", emoji: "👶", hint: "ka-lay" },
        { en: "Family", mm: "မိသားစု", emoji: "👨‍👩‍👧", hint: "mi-tha-zu" },
        { en: "House", mm: "အိမ်", emoji: "🏠", hint: "ein" },
        { en: "Sit", mm: "ထိုင်", emoji: "🪑", hint: "htain" }
      ],
      quizQuestions: [
        { q: "Where did Grandma's house stand?", options: ["On wooden stilts beside banana trees", "On an iceberg", "Inside a cave", "On a rooftop in another country"], correct: 0 },
        { q: "Who should Mudra greet first before dinner?", options: ["Grandfather", "Only the dog", "A stranger on the road", "Nobody"], correct: 0 },
        { q: "What did Mudra say while tapping her chest?", options: ["I am Mudra", "I am lost", "I am finished", "I am invisible"], correct: 0 },
        { q: "How did the family laugh when Mudra spoke?", options: ["Gently, to welcome her", "To chase her away", "Because they were angry", "Because they forgot her"], correct: 0 },
        { q: "What did Mudra feel she was becoming?", options: ["Someone who belonged", "A silent ghost", "A closed door", "A forgotten photo"], correct: 0 }
      ]
    },
    {
      id: "tea",
      emoji: "🍜",
      title: "Tea Shop Morning",
      badge: "Tea Star",
      storyTitle: "Chapter 3 · Cups and Careful Hands",
      beat: "Rising action",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Tea shops are living rooms",
        text: "Myanmar tea shops are where neighbors greet, sip sweet tea, and practice polite words — please, thank you, how much?"
      },
      tip: "At snack time say tea, bread, please, thank you — then tap Hear.",
      story:
        "Sunlight spilled across the yard like warm honey. After breakfast Grandma took Mudra's hand. \"Today we buy tea,\" she said. \"You will use your new words with someone outside our house.\" Mudra's stomach fluttered. Talking to family was one thing. Talking to the village was another.\n\n" +
        "They walked a short dusty path past red flowers and a sleeping cat. The tea shop was small and busy. Cups clinked. Steam rose. The seller wiped a wooden table and smiled as if he had been waiting for Mudra all year.\n\n" +
        "\"Mingalarpar,\" Mudra said. Her voice was soft, but it did not hide. \"Tea, please.\" The seller's eyes brightened. He poured milky tea into two cups and set down a plate of warm bread. Grandma asked, \"How much?\" Coins clicked softly. Mudra watched, then remembered. \"Thank you.\"\n\n" +
        "Aunt was already there with a neighbor. They made space on the bench. Mudra practiced cup, plate, hot, delicious. When her cup tipped and a drop kissed the table, Grandma steadied her wrist. \"Slow and careful,\" she laughed. \"Tea teaches patience.\"\n\n" +
        "Mudra listened to the shop's music — spoons, chatter, a radio far away. She understood only pieces, yet she understood kindness completely. The seller refilled the bread plate without being asked. Mudra whispered to Grandma, \"I did it.\" Grandma squeezed her fingers. \"Yes. The village heard your hello.\"\n\n" +
        "On the walk home Mudra repeated the morning like a favorite page: hello, please, tea, how much, thank you, share. The words were no longer only in her notebook. They lived in a real cup she had held without spilling — almost.",
      sentStory:
        "Back at the tea shop bench in her mind, Mudra lined up the words. Tea is hot. Bread is on the plate. The seller smiles. How much? Thank you. Share the table. Each sentence felt like a small brave step.",
      sentStoryLong:
        "Later on Grandma's porch, Mudra pretended the railing was the tea shop counter. Tea is hot. Bread is on the plate. The seller smiles. How much? Thank you. Share the table. Grandma played the seller and Mudra played herself, giggling when she remembered please. Each sentence was a small brave step back into the busy morning.",
      words: [
        { en: "Tea", mm: "လက်ဖက်ရည်", emoji: "🍵", hint: "la-phe-ye" },
        { en: "Bread", mm: "ပေါင်မုန့်", emoji: "🍞", hint: "paung-mont" },
        { en: "Cup", mm: "ခွက်", emoji: "🥛", hint: "khwet" },
        { en: "Plate", mm: "ပန်းကန်", emoji: "🍽️", hint: "pan-kan" },
        { en: "Noodle", mm: "ခေါက်ဆွဲ", emoji: "🍜", hint: "khauk-swe" },
        { en: "Seller", mm: "ရောင်းသူ", emoji: "🧑‍🍳", hint: "yaung-thu" },
        { en: "How much?", mm: "ဘယ်လောက်လဲ", emoji: "💰", hint: "be-lauk-le" },
        { en: "Hot", mm: "ပူတယ်", emoji: "🔥", hint: "pu-de" },
        { en: "Delicious", mm: "အရသာရှိတယ်", emoji: "😋", hint: "a-ya-tha" },
        { en: "Share", mm: "မျှဝေ", emoji: "🤝", hint: "hmya-we" }
      ],
      quizQuestions: [
        { q: "Why was Mudra nervous before the tea shop?", options: ["She would speak to someone outside the family", "She disliked tea forever", "She forgot Grandma", "She lost the airplane"], correct: 0 },
        { q: "What did Mudra ask for politely?", options: ["Tea, please", "A new house", "Silence only", "A closed shop"], correct: 0 },
        { q: "What question did Grandma ask about price?", options: ["How much?", "Who are you?", "Where is snow?", "Is it night?"], correct: 0 },
        { q: "What did Grandma say tea teaches?", options: ["Patience", "Anger", "Flying", "Forgetting"], correct: 0 },
        { q: "What made Mudra proud on the walk home?", options: ["The village heard her hello", "She never spoke", "She spilled everything", "She hid forever"], correct: 0 }
      ]
    },
    {
      id: "market",
      emoji: "🛍",
      title: "Market Basket",
      badge: "Market Star",
      storyTitle: "Chapter 4 · I Want This One",
      beat: "Rising action",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Markets feed the family table",
        text: "Village markets sell fish, eggs, tomatoes, and mangoes. Children learn to point, choose, and thank with both hands."
      },
      tip: "Play market at home: point to food and say I want this one, please, thank you.",
      story:
        "Grandma needed dinner. \"Mudra, the market is loud and bright,\" she warned kindly. \"Stay close. Use your finger and your manners.\" Mudra held the basket handle with both hands as if it were a steering wheel for courage.\n\n" +
        "Under colorful umbrellas, the market bloomed. Mangoes glowed like tiny suns. Tomatoes shone red. Eggs rested in neat rows. Silver fish lay on ice, eyes clear and fresh. Sellers called. Motorbikes hummed. Mudra's eyes darted everywhere, hungry to name what she saw.\n\n" +
        "At the fish stall Mudra pointed. \"I want this one.\" Grandma nodded. \"Please,\" she reminded. Mudra added please, then thank you when the fish slid into a bag. At the next stall she chose eggs. At another, a firm red tomato. Each time her sentences grew less shaky.\n\n" +
        "A kind seller noticed Mudra's careful words and placed one small mango in her palm. \"For the little traveler,\" he said. Mudra bowed her head. \"Thank you.\" The mango smelled like sunshine and holidays.\n\n" +
        "On the way home the basket felt heavier, but Mudra felt lighter. Mother cooked the fish with rice. Mudra set the plates and poured water. Steam rose. Family gathered. \"Tonight we eat what we chose together,\" Grandma said.\n\n" +
        "Mudra tasted a bite and whispered, \"Delicious.\" In her notebook she wrote: Market day. I pointed. I asked. I thanked. The village is teaching me with food and kindness.",
      sentStory:
        "Mudra remembers the stalls like pictures in a book. Fresh fish. Eggs. Tomato. Mango in her hand. Buy with please. Carry the basket home. Dinner tastes like bravery.",
      sentStoryLong:
        "That evening Mudra drew the market in her notebook: umbrellas, a shiny fish, eggs, a red tomato, and a mango gift. Fresh, she labeled. Buy, she wrote beside coins. Basket, beside the walk home. When Mother served dinner, Mudra said delicious again, louder, and everyone smiled as if the whole market had come to the table.",
      words: [
        { en: "Market", mm: "ဈေး", emoji: "🛍", hint: "zay" },
        { en: "Fish", mm: "ငါး", emoji: "🐟", hint: "nga" },
        { en: "Egg", mm: "ဥ", emoji: "🥚", hint: "u" },
        { en: "Tomato", mm: "ခရမ်းချဉ်သီး", emoji: "🍅", hint: "kha-yan-chin" },
        { en: "Mango", mm: "သရက်သီး", emoji: "🥭", hint: "tha-yet" },
        { en: "Rice", mm: "ထမင်း", emoji: "🍚", hint: "hta-min" },
        { en: "Basket", mm: "ခြင်းတောင်း", emoji: "🧺", hint: "chin-daung" },
        { en: "This one", mm: "ဒီဟာ", emoji: "👉", hint: "di-ha" },
        { en: "Buy", mm: "ဝယ်", emoji: "🛒", hint: "we" },
        { en: "Fresh", mm: "လတ်ဆတ်", emoji: "✨", hint: "lat-sat" }
      ],
      quizQuestions: [
        { q: "What did Grandma tell Mudra to use at the market?", options: ["Her finger and her manners", "Only shouting", "A closed mouth forever", "Running alone"], correct: 0 },
        { q: "What did Mudra say while pointing to the fish?", options: ["I want this one", "I want the moon", "I want silence", "I want to hide"], correct: 0 },
        { q: "What gift did a seller give Mudra?", options: ["A small mango", "A bicycle", "A drum set", "A boat"], correct: 0 },
        { q: "Who cooked the fish and rice?", options: ["Mother", "The airplane pilot", "A monkey", "Nobody"], correct: 0 },
        { q: "What did Mudra write that the village was teaching her with?", options: ["Food and kindness", "Fear only", "Closed doors", "Forgotten names"], correct: 0 }
      ]
    },
    {
      id: "farm",
      emoji: "🐔",
      title: "Farm Friends",
      badge: "Farm Star",
      storyTitle: "Chapter 5 · Soft Hands, Warm Eggs",
      beat: "Belonging",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Village farms teach care",
        text: "Many Myanmar children help feed chickens and collect eggs. Gentle hands matter for animals and people."
      },
      tip: "Name chicken, cow, dog in books or parks — then hear Myanmar.",
      story:
        "Uncle waited on the farm path with a grin and a bowl of grain. \"The chickens are hungry, Mudra!\" he called. \"Come meet our noisy friends.\" Mudra had seen farm animals in picture books. Now feathers, hoofprints, and real smells rose around her.\n\n" +
        "Chickens rushed like tiny golden boats. A cow watched from the field with calm eyes. A goat bleated near the hay as if telling secrets. The farm dog wagged so hard its whole body danced. A bird sang from the mango tree, bright and bossy.\n\n" +
        "\"Soft hands,\" Uncle said. \"Gentle.\" Mudra scattered grain carefully. She did not chase. She did not shout. When Uncle showed her the nest boxes, she collected warm eggs one by one into a basket lined with cloth. Each egg felt like a small promise.\n\n" +
        "Mudra named everything aloud — chicken, egg, cow, goat, dog, bird, hay, farm — mixing English and the Myanmar sounds Grandma had practiced with her. Uncle clapped once. \"The animals trust a quiet voice.\"\n\n" +
        "By noon the basket was full. Mudra's arms ached in a proud way. Walking back, she imagined Grandma's smile. Helping the farm was not a game only. It was work that fed the family table.\n\n" +
        "Grandma did smile. \"Tonight we cook with your farm eggs.\" Mudra stood taller. Belonging, she realized, could feel like warm eggs in a basket and soft hands that chose kindness.",
      sentStory:
        "Mudra tells the farm story to Baby using simple lines. The chickens are hungry. Feed them. Collect eggs. Be gentle. Uncle works on the farm. The dog wags. The bird sings.",
      sentStoryLong:
        "On the porch Mudra tells the farm story to Baby with simple lines and big gestures. The chickens are hungry. Feed them. Collect eggs. Be gentle. Uncle works on the farm. The dog wags. The bird sings in the mango tree. Baby claps at every animal sound Mudra makes, and Grandma listens from the doorway, proud.",
      words: [
        { en: "Chicken", mm: "ကြက်", emoji: "🐓", hint: "kyet" },
        { en: "Egg", mm: "ဥ", emoji: "🥚", hint: "u" },
        { en: "Cow", mm: "နွား", emoji: "🐄", hint: "nwa" },
        { en: "Goat", mm: "ဆိတ်", emoji: "🐐", hint: "seit" },
        { en: "Dog", mm: "ခွေး", emoji: "🐕", hint: "khwe" },
        { en: "Bird", mm: "ငှက်", emoji: "🐦", hint: "nghet" },
        { en: "Hay", mm: "မြက်ခြောက်", emoji: "🌾", hint: "myet-chauk" },
        { en: "Farm", mm: "ခြံ", emoji: "🚜", hint: "chan" },
        { en: "Feed", mm: "ကျွေး", emoji: "🥣", hint: "kyway" },
        { en: "Gentle", mm: "နူးညံ့", emoji: "🤍", hint: "nu-nyan" }
      ],
      quizQuestions: [
        { q: "Who invited Mudra to feed the chickens?", options: ["Uncle", "A king", "A fish", "The wind"], correct: 0 },
        { q: "What rule did Uncle teach?", options: ["Soft hands / be gentle", "Pull tails", "Shout loudly", "Run at animals"], correct: 0 },
        { q: "What did Mudra collect into the basket?", options: ["Warm eggs", "Stones", "Ice", "Paper planes"], correct: 0 },
        { q: "What did Uncle say animals trust?", options: ["A quiet voice", "Angry noise", "Closed eyes forever", "Forgotten names"], correct: 0 },
        { q: "What would Grandma cook with?", options: ["Mudra's farm eggs", "Only candy", "Snow", "Sand"], correct: 0 }
      ]
    },
    {
      id: "school",
      emoji: "🏫",
      title: "School Morning",
      badge: "School Star",
      storyTitle: "Chapter 6 · A Brave Voice in Class",
      beat: "Challenge",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Respect for teachers",
        text: "In Myanmar, children greet teachers with care. School words help visiting children feel ready to join."
      },
      tip: "Practice Good morning and Thank you before school or playgroup.",
      story:
        "Cousin arrived early with two school bags and a determined smile. \"Today you visit my class,\" Cousin said. Mudra's courage, which had grown at the tea shop and market, suddenly felt small again. School meant many eyes. School meant reading aloud.\n\n" +
        "They walked the dusty path together. At the gate, Teacher stood like a friendly lighthouse. \"Good morning,\" Teacher said. Mudra swallowed. \"Good morning, Teacher.\" The words came out clear enough to surprise her.\n\n" +
        "Inside the classroom, books waited in neat stacks. Pencils rested like tiny soldiers. Mudra sat beside Friend, who offered a shy wave. When Teacher asked Mudra to read one short line, the letters seemed to swim. Mudra's voice shook on the first word. Then it found the shore and grew steady.\n\n" +
        "Halfway through, Mudra's pencil tip broke with a soft snap. Panic rose. Friend slid another pencil across the desk without making a show of it. \"Thank you,\" Mudra whispered. Teacher heard and nodded. \"You are brave. Bravery is continuing.\"\n\n" +
        "After the lesson, Mudra helped carry books to a shelf. She learned classroom, read, write, bag, pencil, friend — not as a list on a wall, but as tools she had needed in a real moment.\n\n" +
        "On the walk home Mudra told Grandma everything in a rush of English and Myanmar. Grandma listened fully. \"A brave voice does not mean a loud voice,\" Grandma said. \"It means a true one.\" Mudra touched her notebook. Challenge had not stopped her story. It had deepened it.",
      sentStory:
        "Mudra practices school sentences on the steps. Good morning, Teacher. Open the book. Read one line. Friend shares a pencil. Thank you. The classroom grows quiet. Write your name.",
      sentStoryLong:
        "On Grandma's steps Mudra practices school sentences until they feel friendly. Good morning, Teacher. Open the book. Read one line. Friend shares a pencil. Thank you. The classroom grows quiet. Write your name. Cousin coaches her, and when Mudra finishes without rushing, they both cheer softly so Baby can keep sleeping.",
      words: [
        { en: "School", mm: "ကျောင်း", emoji: "🏫", hint: "kyaung" },
        { en: "Teacher", mm: "ဆရာမ", emoji: "👩‍🏫", hint: "sa-ya-ma" },
        { en: "Book", mm: "စာအုပ်", emoji: "📚", hint: "sa-oke" },
        { en: "Pencil", mm: "ခဲတံ", emoji: "✏️", hint: "khe-dan" },
        { en: "Bag", mm: "အိတ်", emoji: "🎒", hint: "ate" },
        { en: "Friend", mm: "သူငယ်ချင်း", emoji: "🤝", hint: "thu-nge-chin" },
        { en: "Read", mm: "ဖတ်", emoji: "📖", hint: "phat" },
        { en: "Write", mm: "ရေး", emoji: "✍️", hint: "yay" },
        { en: "Good morning", mm: "မင်္ဂလာမနက်ခင်းပါ", emoji: "🌅", hint: "mingalar-morning" },
        { en: "Classroom", mm: "စာသင်ခန်း", emoji: "🪑", hint: "sa-thin-khan" }
      ],
      quizQuestions: [
        { q: "Why did Mudra feel nervous about school?", options: ["Many eyes and reading aloud", "She disliked Cousin", "There was no teacher", "The path disappeared"], correct: 0 },
        { q: "How did Mudra greet Teacher?", options: ["Good morning, Teacher", "Go away", "I am lost forever", "No words"], correct: 0 },
        { q: "What did Friend do when the pencil broke?", options: ["Shared another pencil", "Laughed meanly", "Left the room", "Hid the books"], correct: 0 },
        { q: "What did Teacher say bravery is?", options: ["Continuing", "Giving up", "Shouting only", "Staying silent forever"], correct: 0 },
        { q: "What did Grandma say a brave voice means?", options: ["A true one", "Only a loud one", "A hidden one", "A forgotten one"], correct: 0 }
      ]
    },
    {
      id: "play",
      emoji: "🌳",
      title: "Playground Friends",
      badge: "Friend Star",
      storyTitle: "Chapter 7 · Want to Play?",
      beat: "Friendship warmth",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Play builds belonging",
        text: "Village playgrounds teach kind invitations — Want to play? Yes. Let's go. Language turns strangers into friends."
      },
      tip: "Practice Want to play? Yes! Let's go! during real playtime.",
      story:
        "After school the sun leaned gold across the playground. Children gathered under a wide tree whose roots made natural seats. Mudra stood at the edge with Cousin, unsure whether to step into the circle of laughter.\n\n" +
        "A girl with a bright ribbon jogged over. \"Want to play?\" she asked. The question was simple. For Mudra it was a bridge. \"Yes!\" she said, and the bridge held.\n\n" +
        "They ran. They jumped. They hid behind the tree and burst out giggling. \"Let's go!\" a boy shouted. \"Catch me!\" Mudra learned yes and no, run and jump, hide and catch — not from a list, but from breathless joy. When she felt shy again, Friend from class took her hand. \"You can play with us.\"\n\n" +
        "Once Mudra said no when a game felt too rough, and the others nodded. No was also a useful word. Respect lived inside play, too.\n\n" +
        "At sunset Grandma appeared at the path, lantern of a smile on her face. \"You made friends,\" she said. Mudra waved goodbye to the ribbon girl and the running boy. The tree seemed to wave back with its leaves.\n\n" +
        "Walking home, Mudra realized something quiet and huge: the village no longer felt far from her heart. It felt like a place that could call her name — and wait for her answer.",
      sentStory:
        "Under the tree Mudra practices play talk. Want to play? Yes. Let's go. Run. Jump. Hide. Catch me! Friend holds her hand. The tree listens to their laughter.",
      sentStoryLong:
        "Before bed Mudra and Cousin act out the playground under an imaginary tree in the hallway. Want to play? Yes. Let's go. Run. Jump. Hide. Catch me! Friend holds her hand. They collapse laughing on the mat, and Grandma says the house sounds happier when children practice joy as carefully as manners.",
      words: [
        { en: "Play", mm: "ကစား", emoji: "🎮", hint: "ka-za" },
        { en: "Friend", mm: "သူငယ်ချင်း", emoji: "🧒", hint: "thu-nge-chin" },
        { en: "Yes", mm: "ဟုတ်ကဲ့", emoji: "✅", hint: "hote-ke" },
        { en: "No", mm: "မဟုတ်ပါ", emoji: "⛔", hint: "ma-hote" },
        { en: "Let's go", mm: "သွားကြရအောင်", emoji: "🏃", hint: "thwa-ja" },
        { en: "Run", mm: "ပြေး", emoji: "💨", hint: "pyay" },
        { en: "Jump", mm: "ခုန်", emoji: "🤸", hint: "khone" },
        { en: "Hide", mm: "ပုန်း", emoji: "🙈", hint: "pone" },
        { en: "Catch", mm: "ဖမ်း", emoji: "🙌", hint: "phan" },
        { en: "Tree", mm: "သစ်ပင်", emoji: "🌳", hint: "thit-pin" }
      ],
      quizQuestions: [
        { q: "What question invited Mudra into the group?", options: ["Want to play?", "Want to leave forever?", "Want to sleep now?", "Want to hide from Grandma?"], correct: 0 },
        { q: "What did Mudra answer?", options: ["Yes!", "Never", "Only in snow", "I forgot how"], correct: 0 },
        { q: "Why was saying no also useful?", options: ["Respect lives inside play too", "Friends should always be angry", "Play must never stop", "Words do not matter"], correct: 0 },
        { q: "What did Grandma notice at sunset?", options: ["Mudra made friends", "Mudra was lost at sea", "The tree vanished", "School closed forever"], correct: 0 },
        { q: "How did the village feel to Mudra afterward?", options: ["Closer to her heart", "Farther than before", "Completely gone", "Only a dream"], correct: 0 }
      ]
    },
    {
      id: "pagoda",
      emoji: "🏯",
      title: "Pagoda Visit",
      badge: "Respect Star",
      storyTitle: "Chapter 8 · Quiet Golden Steps",
      beat: "Quiet climax",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Pagoda manners",
        text: "Visitors remove shoes, speak softly, offer flowers, and light candles. Respect is shown with body and voice."
      },
      tip: "Practice quiet indoor voices with please and thank you — then hear Myanmar.",
      story:
        "The morning of the pagoda visit arrived cool and clear. Grandma dressed in soft colors and gave Mudra a small bunch of white flowers. \"Today we practice quiet,\" she said. \"Quiet is also a language.\"\n\n" +
        "The pagoda shone like a held breath of gold. Before the steps, Grandma whispered, \"Please remove your shoes.\" Mudra placed hers neatly beside Grandma's pair. The stone felt smooth and serious under her feet.\n\n" +
        "They walked softly. Mudra noticed how even children lowered their voices here. Together they offered flowers and lit a small candle. Smoke curled upward like a thin silver question. Mudra practiced the words that fit the place: please, quiet, flower, candle, offer, bow, peace, thank you.\n\n" +
        "A monk passed with a gentle smile. Mudra bowed, a little unsure, a little sincere. Nobody laughed. Respect, she learned, did not need to be perfect to be real.\n\n" +
        "Sitting in a shaded corner, Mudra felt her busy holiday settle into stillness. The tea shop had taught bravery. The market had taught choosing. School had taught continuing. Play had taught friendship. Here, the pagoda taught her how to be quiet with love.\n\n" +
        "\"I understand a little more,\" Mudra told Grandma. Grandma touched Mudra's shoulder. \"Understanding grows like a candle flame — small at first, then enough to see the next step.\"",
      sentStory:
        "Mudra repeats pagoda manners gently. Please remove your shoes. Offer flowers. Light a candle. Stay quiet. Bow with respect. Peace in the heart. Thank you.",
      sentStoryLong:
        "At home Mudra arranges her shoes by the door and pretends the doorway is the pagoda step. Please remove your shoes. Offer flowers. Light a candle. Stay quiet. Bow with respect. Peace in the heart. Thank you. Grandma watches and says practice at home makes the real visit kinder for everyone.",
      words: [
        { en: "Pagoda", mm: "ဘုရား", emoji: "🏯", hint: "pha-ya" },
        { en: "Shoes", mm: "ဖိနပ်", emoji: "👟", hint: "phi-nat" },
        { en: "Flower", mm: "ပန်း", emoji: "🌸", hint: "pan" },
        { en: "Candle", mm: "ဖယောင်းတိုင်", emoji: "🕯", hint: "pha-yaung" },
        { en: "Quiet", mm: "တိတ်တိတ်", emoji: "🤫", hint: "teik-teik" },
        { en: "Please", mm: "ကျေးဇူးပြု၍", emoji: "🙏", hint: "kye-zu-pyu" },
        { en: "Monk", mm: "ရဟန်း", emoji: "🧘", hint: "ya-han" },
        { en: "Offer", mm: "လှူ", emoji: "🎁", hint: "hlu" },
        { en: "Bow", mm: "ဦးညွှတ်", emoji: "🙇", hint: "u-hnyut" },
        { en: "Peace", mm: "ငြိမ်းချမ်း", emoji: "☮️", hint: "nyein-chan" }
      ],
      quizQuestions: [
        { q: "What did Grandma say quiet is?", options: ["Also a language", "A punishment only", "Something to fear", "Useless"], correct: 0 },
        { q: "What did they remove before the steps?", options: ["Shoes", "Smiles", "Names", "Flowers forever"], correct: 0 },
        { q: "What did they offer and light?", options: ["Flowers and a candle", "Drums and fireworks only", "Ice cream", "Airplanes"], correct: 0 },
        { q: "What did Mudra learn about respect?", options: ["It does not need to be perfect to be real", "It must be loud", "It is only for adults", "It means never visiting"], correct: 0 },
        { q: "How did Grandma say understanding grows?", options: ["Like a candle flame", "Like a storm", "Like forgetting", "Like a closed book"], correct: 0 }
      ]
    },
    {
      id: "festival",
      emoji: "🎆",
      title: "Festival Night",
      badge: "Village Star",
      storyTitle: "Chapter 9 · Lanterns for Everyone",
      beat: "Peak & ending",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Festivals stitch the village",
        text: "Thadingyut lights bring families outside. Festival words help children celebrate with grandparents across oceans."
      },
      tip: "Say Happy Thadingyut and thank you — English and Myanmar — before bed.",
      story:
        "On the last evening of Mudra's holiday, the village changed clothes. Lanterns bloomed along every path like floating fruit. Drums tapped a heartbeat. Children danced. Neighbors called, \"Happy Thadingyut!\" The air smelled of oil lamps, sweets, and excitement.\n\n" +
        "Grandma held Mudra's hand, but not tightly. Mudra could walk on her own now, and Grandma knew it. They moved through the crowd greeting everyone Mudra had met on her journey. \"Mingalarpar, Teacher!\" \"Thank you,\" to the tea seller. \"Hello,\" to Uncle from the farm. \"Want to play later?\" to the ribbon girl under the tree of memory.\n\n" +
        "Each hello felt easier than the first day at the airport. Mudra was still learning. She still mixed words. Yet love made room for mistakes, and the village answered with smiles.\n\n" +
        "At the center square, lantern light gathered on faces Mudra loved — Mother, Father, Sister, Brother, Baby, Aunt, Uncle, Cousin, Grandfather, Grandma. The holiday's peak was not fireworks alone. It was recognition: Mudra could see her family clearly, and they could hear her.\n\n" +
        "Grandma cupped Mudra's face with warm palms. \"Now you can speak Myanmar with everyone,\" she said. Mudra's eyes shone like the lanterns. \"Not perfectly,\" Mudra answered. Grandma laughed. \"Perfectly is not the point. Together is the point.\"\n\n" +
        "Later, from the porch, Mudra saw a dark ribbon of river and a small boat waiting in tomorrow's imagination. Another adventure might come someday. Tonight she wrote one last line in her notebook:\n\n" +
        "Ending for now. The village is home. I can say hello. I can say thank you. I can say I love you — in more than one language. Goodbye is not forever. Goodbye is see you in words.",
      sentStory:
        "Festival sentences glow like lanterns. Happy Thadingyut! Come here. Let's eat. Dance. Light the night. Thank you. Goodbye with love. The village answers.",
      sentStoryLong:
        "Before sleep Mudra whispers festival sentences like lanterns being lit one by one. Happy Thadingyut! Come here. Let's eat. Dance. Light the night. Thank you. Goodbye with love. Grandma answers each line softly from the next mat, and the wooden house holds their voices the way the village held Mudra's whole holiday.",
      words: [
        { en: "Festival", mm: "ပွဲတော်", emoji: "🎆", hint: "pwe-daw" },
        { en: "Lantern", mm: "မီးပုံး", emoji: "🏮", hint: "mi-pone" },
        { en: "Happy", mm: "ပျော်ရွှင်", emoji: "😊", hint: "pyaw-shwin" },
        { en: "Dance", mm: "က", emoji: "💃", hint: "ka" },
        { en: "Come here", mm: "ဒီကိုလာပါ", emoji: "👉", hint: "di-ko-la" },
        { en: "Let's eat", mm: "စားကြရအောင်", emoji: "🍚", hint: "sa-ja" },
        { en: "Water", mm: "ရေ", emoji: "💦", hint: "yay" },
        { en: "Light", mm: "မီး", emoji: "💡", hint: "mi" },
        { en: "Goodbye", mm: "သွားတော့မယ်", emoji: "👋", hint: "thwa-daw" },
        { en: "Love", mm: "ချစ်တယ်", emoji: "❤️", hint: "chit-de" }
      ],
      quizQuestions: [
        { q: "What lit the paths on the last evening?", options: ["Lanterns", "Only darkness", "Snow", "Computer screens"], correct: 0 },
        { q: "What made the holiday's true peak for Mudra?", options: ["Recognizing family and being heard", "Leaving forever at once", "Forgetting every word", "Hiding from Grandma"], correct: 0 },
        { q: "What did Grandma say Mudra can do now?", options: ["Speak Myanmar with everyone", "Never return", "Forget the village", "Stay silent"], correct: 0 },
        { q: "What did Grandma say is the point?", options: ["Together", "Perfect scores only", "Being alone", "Giving up"], correct: 0 },
        { q: "How did Mudra describe goodbye in her notebook?", options: ["Not forever — see you in words", "The end of love", "Never speak again", "Erase Myanmar"], correct: 0 }
      ]
    }
  ];

  w.MM_CHAPTERS = CHAPTERS;
  w.MM_BOOK = {
    title: "Mudra holiday trip to Myanmar",
    subtitle: "A 7-year-old Myanmar girl from Singapore — junior story in nine chapters",
    age: "5–9",
    hero: "Mudra, age 7, lives and studies in Singapore",
    arc: "Intro → Character → Rising → Challenge → Climax → Peak & Ending"
  };
})(typeof window !== "undefined" ? window : global);
