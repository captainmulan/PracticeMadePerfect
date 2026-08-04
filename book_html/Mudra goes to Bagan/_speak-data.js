/* Mudra goes to Bagan — claymation junior-novel chapters (Macey-goes-to style) */
(function (w) {
  /**
   * Book arc (fun → funny → belonging → challenge → quiet → peak → ending):
   * 1 Bus — Intro
   * 2 Guesthouse — Character & world
   * 3 Market — Rising action
   * 4 Temple — Rising action
   * 5 Bike — Belonging
   * 6 Balloon — Challenge
   * 7 River — Friendship warmth
   * 8 Shwezigon — Quiet climax
   * 9 Sunset — Peak + ending
   *
   * Each chapter = two picture sessions (3 unique images each):
   *   learn / learn-2 / learn-3  + long story + words
   *   sent / sent-2 / sent-3    + scene story + sentences
   */
  var CHAPTERS = [
    {
      id: "bus",
      emoji: "🚌",
      title: "Mudra Goes to Bagan",
      badge: "Bus Star",
      storyTitle: "Chapter 1 · Temples at Dawn",
      beat: "Intro",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Bagan",
        text: "Bagan is a plain of ancient brick temples by the Irrawaddy River. Many Myanmar children dream of seeing the sunrise over those pointed roofs."
      },
      tip: "Practice Hello and Bus before a trip — English, then Myanmar.",
      story:
        "Mudra is 7 years old — a Myanmar girl who lives and studies in Singapore. She wears a tiny pink hair clip shaped like the letter M, because Mudra begins with M, and she likes things that make sense.\n\n" +
        "When Grandma called, \"We are going to Bagan!\" Mudra packed too many socks and one brave notebook. Mother kissed her forehead. Father packed snacks that rattled like drums. \"Bagan has more temples than socks,\" Father joked. Mudra counted her socks. \"Impossible,\" she whispered. Then she grinned. Impossible sounded like an adventure.\n\n" +
        "The overnight bus smelled of biscuits and air conditioning. Mudra's seat leaned back so far she nearly became a pancake. Cousin Ko Ko snored like a tiny tractor. Grandma hummed. Outside, darkness slid past the windows.\n\n" +
        "Just before dawn, Grandma woke her with a poke that was gentle and also not gentle. \"Look,\" Grandma whispered. Mudra pressed her nose to the glass. Across a misty plain, pointed brick roofs rose like a city of clay crowns. One temple after another. Then another. Mudra's mouth made a silent O.\n\n" +
        "\"Today is Mudra goes to Bagan,\" she whispered into her notebook. Her stomach fluttered — half biscuits, half wonder. What if the temples were too big? What if she got lost between a thousand roofs?\n\n" +
        "Grandma squeezed her hand. \"We go together. Say hello to Bagan.\" Mudra practiced Mingalarpar under her breath until the bus doors sighed open and warm Bagan air rushed in like a welcome hug.",
      sentStory:
        "On the bus steps, Mudra practiced again. Hello. Bus. Temple. Please. Yes. Grandma pointed at the first golden tip shining in morning light. \"Pagoda,\" she said. Mudra repeated carefully, pink M clip shining like a tiny flag.",
      sentStoryLong:
        "On the bus steps, Mudra practiced new sounds while Ko Ko pretended to sleep standing up. Hello. Bus. Temple. Please. Yes. Grandma pointed at the first golden tip shining in morning light. \"Pagoda,\" she said. Mudra repeated carefully. The pink M clip on her hair caught the sun like a tiny flag, and Bagan felt ready for jokes, snacks, and brave feet.",
      words: [
        { en: "Hello", mm: "မင်္ဂလာပါ", emoji: "🙏", hint: "mingalarpar" },
        { en: "Bus", mm: "ဘတ်စ်ကား", emoji: "🚌", hint: "bus-kar" },
        { en: "Grandma", mm: "အဘွား", emoji: "👵", hint: "a-bwa" },
        { en: "Temple", mm: "ဘုရား", emoji: "🏯", hint: "pha-ya" },
        { en: "Morning", mm: "မနက်", emoji: "🌅", hint: "ma-net" },
        { en: "Please", mm: "ကျေးဇူးပြု၍", emoji: "🤲", hint: "kye-zu-pyu" },
        { en: "Yes", mm: "ဟုတ်ကဲ့", emoji: "✅", hint: "hote-ke" },
        { en: "Look", mm: "ကြည့်ပါ", emoji: "👀", hint: "kyi-ba" },
        { en: "Together", mm: "အတူတူ", emoji: "🤝", hint: "a-tu-tu" },
        { en: "Bagan", mm: "ပုဂံ", emoji: "🧡", hint: "ba-gan" }
      ],
      quizQuestions: []
    },
    {
      id: "guesthouse",
      emoji: "🏠",
      title: "Rooster Alarm",
      badge: "Guest Star",
      storyTitle: "Chapter 2 · Brick House Morning",
      beat: "Character & world",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Guest houses",
        text: "In Bagan, many families welcome travelers with tea, smiles, and early mornings — sometimes earlier than anyone planned."
      },
      tip: "Practice Good morning and Thank you when you wake up.",
      story:
        "Auntie Hla's guest house was made of warm brick and funny creaks. A painted peacock guarded the gate. Inside, the rooms smelled of tea and laundry soap. Auntie Hla had round cheeks, bright eyes, and a laugh that bounced off the walls. She was not Grandma. She was not Mother. She was Auntie Hla — and Mudra liked her at once.\n\n" +
        "\"Welcome!\" Auntie Hla said, then switched to Myanmar and English like a radio with two stations. She showed Mudra a small bed with a mosquito net that looked like a princess tent. Cousin Ko Ko claimed the top bunk of bravery. Mudra claimed the bottom bunk of wisdom.\n\n" +
        "Before dawn — before even biscuits — a rooster screamed like a tiny fire truck. Mudra sat up so fast her M clip almost flew away. \"Is it an emergency?\" she asked. Grandma groaned. \"It is Bagan time.\"\n\n" +
        "Auntie Hla brought tea and warm sticky rice. Father swept the yard. Mother folded towels. Ko Ko chased a chicken and lost. Auntie Hla introduced the house words slowly: bed, water, toilet, breakfast, thank you. Mudra tapped her chest. \"I am Mudra.\" Auntie Hla bowed with a grin. \"And I am the rooster's boss… almost.\"\n\n" +
        "That morning Mudra learned that Bagan mornings begin with noise, tea, and kindness. She wrote in her notebook: Day one in the brick house. Rooster 1, Mudra 0. Tea delicious. Ready for temples.",
      sentStory:
        "At the breakfast table Mudra practices house words. Good morning. Tea. Breakfast. Water. Thank you. Auntie Hla claps when Mudra remembers sit and please.",
      sentStoryLong:
        "At the breakfast table Mudra practices house words while the rooster paces outside like a bossy general. Good morning. Tea. Breakfast. Water. Thank you. Sit. Please. Auntie Hla claps. Ko Ko tries to clap too and spills tea by one brave drop. Everyone laughs, and the brick house feels like a friendly stage.",
      words: [
        { en: "Good morning", mm: "မင်္ဂလာမနက်ခင်းပါ", emoji: "🌅", hint: "mingalar-morning" },
        { en: "Tea", mm: "လက်ဖက်ရည်", emoji: "🍵", hint: "la-phe-ye" },
        { en: "Breakfast", mm: "မနက်စာ", emoji: "🍚", hint: "ma-net-za" },
        { en: "Bed", mm: "အိပ်ရာ", emoji: "🛏️", hint: "ate-ya" },
        { en: "Water", mm: "ရေ", emoji: "💧", hint: "yay" },
        { en: "Thank you", mm: "ကျေးဇူးတင်ပါတယ်", emoji: "💛", hint: "kye-zu" },
        { en: "Auntie", mm: "အဒေါ်", emoji: "👩", hint: "a-daw" },
        { en: "House", mm: "အိမ်", emoji: "🏠", hint: "ein" },
        { en: "Rooster", mm: "ကြက်ဖ", emoji: "🐓", hint: "kyet-pha" },
        { en: "Sit", mm: "ထိုင်", emoji: "🪑", hint: "htain" }
      ],
      quizQuestions: []
    },
    {
      id: "market",
      emoji: "🛍",
      title: "Nyaung-U Market",
      badge: "Market Star",
      storyTitle: "Chapter 3 · Please, This One",
      beat: "Rising action",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Nyaung-U market",
        text: "Nyaung-U market sells fruit, lacquerware, snacks, and sun hats. Polite words help little travelers choose and thank."
      },
      tip: "Play market at home: point and say This one, please, thank you.",
      story:
        "Auntie Hla said the market was louder than the rooster, which Mudra did not believe until she arrived. Nyaung-U market bloomed under umbrellas — mangoes, tomatoes, longyi cloth, shiny lacquer boxes, and hats big enough to sail in.\n\n" +
        "Grandma held Mudra's hand. \"Use your finger and your manners.\" Mudra held a little basket like a steering wheel of courage. A seller with a kind mustache waved. Mudra waved back so hard her M clip wiggled.\n\n" +
        "\"I want this one,\" Mudra said, pointing to a round snack that smelled sweet. \"Please.\" Grandma nodded proudly. Coins clicked. \"Thank you,\" Mudra added. The seller gave her an extra smile for free.\n\n" +
        "Ko Ko tried on a sun hat that covered his eyes completely. He walked into a soft mango pile with a soft bonk. \"I am fine,\" he announced from under the hat. The mangoes were also fine. Mostly.\n\n" +
        "They bought water, fruit, and a tiny lacquer box for Mudra's paper heart. On the walk home Mudra practiced market, buy, fresh, hat, and how much until the words felt as colorful as the stalls. Rising action, she decided, tasted like mango.",
      sentStory:
        "Mudra remembers the stalls. Market. Mango. Hat. This one. Please. Thank you. Buy. Fresh. How much? The basket grows heavier and happier.",
      sentStoryLong:
        "That afternoon Mudra draws the market in her notebook: umbrellas, a mango, a silly hat on Ko Ko, and Auntie Hla laughing. Market. Mango. Hat. This one. Please. Thank you. Buy. Fresh. How much? Grandma says the best souvenir is a polite voice, and Mudra believes her — mostly — while also loving the lacquer box.",
      words: [
        { en: "Market", mm: "ဈေး", emoji: "🛍", hint: "zay" },
        { en: "Mango", mm: "သရက်သီး", emoji: "🥭", hint: "tha-yet" },
        { en: "Hat", mm: "ဦးထုပ်", emoji: "👒", hint: "u-htoke" },
        { en: "This one", mm: "ဒီဟာ", emoji: "👉", hint: "di-ha" },
        { en: "Buy", mm: "ဝယ်", emoji: "🛒", hint: "we" },
        { en: "Fresh", mm: "လတ်ဆတ်", emoji: "✨", hint: "lat-sat" },
        { en: "How much?", mm: "ဘယ်လောက်လဲ", emoji: "💰", hint: "be-lauk-le" },
        { en: "Basket", mm: "ခြင်းတောင်း", emoji: "🧺", hint: "chin-daung" },
        { en: "Water", mm: "ရေ", emoji: "💧", hint: "yay" },
        { en: "Smile", mm: "ပြုံး", emoji: "😊", hint: "pyone" }
      ],
      quizQuestions: []
    },
    {
      id: "temple",
      emoji: "🛕",
      title: "Hot Temple Steps",
      badge: "Temple Star",
      storyTitle: "Chapter 4 · Shoes and Giggles",
      beat: "Rising action",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Temple manners",
        text: "Visitors remove shoes, speak softly, and climb carefully. Hot stone steps teach patience — and sometimes comedy."
      },
      tip: "Practice Please remove your shoes and Quiet before temple visits.",
      story:
        "Their first big temple rose like a brick mountain with a golden tip. Mudra's neck tilted until her M clip pointed at the sky. \"It is huge,\" she whispered. Ko Ko whispered, \"My legs are small.\" Grandma whispered, \"Then we climb with small brave steps.\"\n\n" +
        "\"Please remove your shoes,\" Grandma said at the steps. Mudra lined her sandals neatly. Ko Ko's sandals somehow swapped left and right and became clown shoes. He hopped. Mudra giggled into her hands. Quiet giggling still counts as quiet… almost.\n\n" +
        "The stone was warm underfoot. Inside, cool shadows smelled of incense and old stories. They offered flowers. They lit a small candle. Mudra practiced please, quiet, flower, candle, thank you. A guide smiled when she bowed a little too fast and nearly bonked her own forehead. \"Brave bow,\" he said kindly.\n\n" +
        "From a high window, Bagan spread out — temples like clay toys for giants. Mudra's heart thumped with rising action and rising stairs. She wrote: Hot steps. Cool heart. Shoes waiting downstairs like loyal dogs.",
      sentStory:
        "Mudra repeats temple manners. Please remove your shoes. Climb carefully. Offer flowers. Light a candle. Stay quiet. Thank you.",
      sentStoryLong:
        "Back at the guest house Mudra lines up everyone's shoes by the door and pretends it is the temple step. Please remove your shoes. Climb carefully. Offer flowers. Light a candle. Stay quiet. Thank you. Ko Ko still puts his sandals on wrong for comedy, and Auntie Hla laughs until the teapot rattles.",
      words: [
        { en: "Temple", mm: "ဘုရား", emoji: "🛕", hint: "pha-ya" },
        { en: "Shoes", mm: "ဖိနပ်", emoji: "👟", hint: "phi-nat" },
        { en: "Climb", mm: "တက်", emoji: "🪜", hint: "tet" },
        { en: "Flower", mm: "ပန်း", emoji: "🌸", hint: "pan" },
        { en: "Candle", mm: "ဖယောင်းတိုင်", emoji: "🕯", hint: "pha-yaung" },
        { en: "Quiet", mm: "တိတ်တိတ်", emoji: "🤫", hint: "teik-teik" },
        { en: "Please", mm: "ကျေးဇူးပြု၍", emoji: "🙏", hint: "kye-zu-pyu" },
        { en: "Hot", mm: "ပူတယ်", emoji: "🔥", hint: "pu-de" },
        { en: "Steps", mm: "လှေကား", emoji: "📶", hint: "hlay-ka" },
        { en: "View", mm: "မြင်ကွင်း", emoji: "👀", hint: "myin-kwin" }
      ],
      quizQuestions: []
    },
    {
      id: "bike",
      emoji: "🚲",
      title: "Bicycle Bounce",
      badge: "Bike Star",
      storyTitle: "Chapter 5 · Wheels Among Temples",
      beat: "Belonging",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Temple bikes",
        text: "Families often bike or e-bike between Bagan temples. Soft brakes and kind calling keep the ride joyful."
      },
      tip: "Practice Left, Right, Slow, and Careful during play rides.",
      story:
        "Cousin Ko Ko rented two bicycles that jingled like happy goats. \"I am the captain,\" he announced. Mudra adjusted her M clip for aerodynamic bravery. Grandma followed on a slower bike that refused to hurry for anyone, including destiny.\n\n" +
        "They rolled past brick temples, green trees, and dusty paths. Mudra learned left, right, stop, slow, careful. A goat stepped into the road like a traffic officer with fur. Ko Ko squeaked. Mudra braked. The goat chewed thoughtfully, as if grading their manners.\n\n" +
        "\"Hello, goat,\" Mudra said. The goat did not answer in Myanmar or English, but it moved. Victory.\n\n" +
        "At a shady temple they parked and drank water. Auntie Hla arrived by e-bike looking like a queen of breeze. \"You belong on these paths,\" she said. Mudra felt it — belonging was not only a house. Belonging could be wheels, dust, laughter, and knowing when to stop for goats.\n\n" +
        "On the ride home Ko Ko sang loudly and off-key. Birds fled. Mudra laughed until her stomach hurt in the best way. She wrote: Bike day. Goat boss. I am part of Bagan's bounce.",
      sentStory:
        "Mudra practices bike talk. Left. Right. Stop. Slow. Careful. Drink water. Hello, goat. Ride together.",
      sentStoryLong:
        "Under the guest-house tree Mudra and Ko Ko act out the bike day with two chairs as bicycles. Left. Right. Stop. Slow. Careful. Drink water. Hello, goat. Ride together. Grandma plays the goat with great dignity, and Auntie Hla nearly falls over laughing.",
      words: [
        { en: "Bicycle", mm: "စက်ဘီး", emoji: "🚲", hint: "set-bi" },
        { en: "Ride", mm: "စီး", emoji: "🚴", hint: "si" },
        { en: "Left", mm: "ဘယ်", emoji: "⬅️", hint: "be" },
        { en: "Right", mm: "ညာ", emoji: "➡️", hint: "nya" },
        { en: "Stop", mm: "ရပ်", emoji: "🛑", hint: "yat" },
        { en: "Slow", mm: "ဖြည်းဖြည်း", emoji: "🐢", hint: "phyee-phyee" },
        { en: "Careful", mm: "သတိထား", emoji: "⚠️", hint: "tha-ti" },
        { en: "Goat", mm: "ဆိတ်", emoji: "🐐", hint: "seit" },
        { en: "Path", mm: "လမ်း", emoji: "🛤️", hint: "lan" },
        { en: "Together", mm: "အတူတူ", emoji: "🤝", hint: "a-tu-tu" }
      ],
      quizQuestions: []
    },
    {
      id: "balloon",
      emoji: "🎈",
      title: "Balloon Scare",
      badge: "Brave Star",
      storyTitle: "Chapter 6 · Too High, Then Wow",
      beat: "Challenge",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Bagan balloons",
        text: "Hot-air balloons float over Bagan at sunrise. Even watching from the ground can feel like flying with your eyes."
      },
      tip: "Practice Brave, High, and Wow when trying something new.",
      story:
        "Long before the rooster — somehow — Grandma woke Mudra for balloon morning. The field was full of giant colorful onions filling with fire-breath. Mudra's courage, which had grown on bikes and temple steps, suddenly felt the size of a peanut.\n\n" +
        "\"We watch from the ground first,\" Grandma promised. Mudra nodded, then held Grandma's skirt like a seatbelt. Baskets waited. Burners roared. A balloon lifted — slow, huge, impossible. Mudra's knees did a little dance of worry.\n\n" +
        "\"Brave does not mean no fear,\" Grandma said. \"Brave means looking anyway.\" Mudra looked. The balloon rose over temples like a floating festival. Pink light painted every brick. Mudra forgot to grip the skirt.\n\n" +
        "\"Wow,\" she breathed. Then louder, \"Wow!\" Ko Ko tried to say wow in a deep movie voice and sneezed instead. Even the sneeze sounded amazed.\n\n" +
        "Challenge had not asked Mudra to fly today. It asked her to face the sky and stay. She wrote: Balloon day. Peanut courage grew. Temples looked small from up there — and my fear looked smaller too.",
      sentStory:
        "Mudra practices balloon words. Early. High. Balloon. Fire. Brave. Look. Wow. Up. Sky. Thank you, Grandma.",
      sentStoryLong:
        "On the porch Mudra retells balloon morning with her arms as rising balloons. Early. High. Balloon. Fire. Brave. Look. Wow. Up. Sky. Thank you, Grandma. Mother claps. Father pretends to be a burner with a ridiculous whoosh, and Mudra's peanut courage feels like a whole mango.",
      words: [
        { en: "Balloon", mm: "ပူဖောင်း", emoji: "🎈", hint: "pu-phaung" },
        { en: "High", mm: "မြင့်တယ်", emoji: "⬆️", hint: "myin-de" },
        { en: "Brave", mm: "ရဲရင့်", emoji: "💪", hint: "ye-yin" },
        { en: "Sky", mm: "ကောင်းကင်", emoji: "☁️", hint: "kaung-kin" },
        { en: "Early", mm: "စောစော", emoji: "⏰", hint: "saw-saw" },
        { en: "Fire", mm: "မီး", emoji: "🔥", hint: "mi" },
        { en: "Look", mm: "ကြည့်ပါ", emoji: "👀", hint: "kyi-ba" },
        { en: "Wow", mm: "ဝါး", emoji: "😮", hint: "wa" },
        { en: "Up", mm: "အပေါ်", emoji: "🔼", hint: "a-paw" },
        { en: "Fear", mm: "ကြောက်တယ်", emoji: "😰", hint: "kyauk-de" }
      ],
      quizQuestions: []
    },
    {
      id: "river",
      emoji: "🌊",
      title: "Irrawaddy Splash",
      badge: "Friend Star",
      storyTitle: "Chapter 7 · Friends by the River",
      beat: "Friendship warmth",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Irrawaddy River",
        text: "The Irrawaddy is Myanmar's great river. Children play near its banks, watch boats, and share snacks with new friends."
      },
      tip: "Practice Want to play? Yes! and Friend during real playtime.",
      story:
        "After the big balloon feelings, Mudra needed something soft and splashy. Auntie Hla took them to the Irrawaddy. The river moved like a wide silver road. Boats bobbed. Birds argued politely in bird language.\n\n" +
        "Local kids were skipping stones. A girl with a bright ribbon jogged over. \"Want to play?\" she asked. Mudra's answer came easier than on her first village holiday. \"Yes!\"\n\n" +
        "They ran along the sand. They jumped. Ko Ko tried a mighty stone skip and created one magnificent splash that watered everyone's ankles. \"Sorry!\" he yelled. \"Friendship shower!\" the ribbon girl yelled back, laughing.\n\n" +
        "Mudra practiced yes, no, friend, boat, river, play, come here. When she felt shy, the new friend held out a snack. Mudra said thank you and shared her mango pieces like treasure.\n\n" +
        "At sunset Grandma found them sandy and glowing. \"You made river friends,\" she said. Mudra waved goodbye. Bagan no longer felt only like temples. It felt like voices that answered hers.",
      sentStory:
        "Under a river tree Mudra practices play talk. Want to play? Yes. Friend. Boat. River. Come here. Jump. Thank you. Goodbye.",
      sentStoryLong:
        "Before bed Mudra and Ko Ko recreate the river day with a blue towel as water. Want to play? Yes. Friend. Boat. River. Come here. Jump. Thank you. Goodbye. Auntie Hla provides snack sound effects by crunching biscuits, which somehow improves the drama.",
      words: [
        { en: "River", mm: "မြစ်", emoji: "🌊", hint: "myit" },
        { en: "Boat", mm: "လှေ", emoji: "⛵", hint: "hlay" },
        { en: "Friend", mm: "သူငယ်ချင်း", emoji: "🧒", hint: "thu-nge-chin" },
        { en: "Play", mm: "ကစား", emoji: "🎮", hint: "ka-za" },
        { en: "Yes", mm: "ဟုတ်ကဲ့", emoji: "✅", hint: "hote-ke" },
        { en: "No", mm: "မဟုတ်ပါ", emoji: "⛔", hint: "ma-hote" },
        { en: "Come here", mm: "ဒီကိုလာပါ", emoji: "👉", hint: "di-ko-la" },
        { en: "Jump", mm: "ခုန်", emoji: "🤸", hint: "khone" },
        { en: "Sand", mm: "သဲ", emoji: "🏖️", hint: "the" },
        { en: "Share", mm: "မျှဝေ", emoji: "🤝", hint: "hmya-we" }
      ],
      quizQuestions: []
    },
    {
      id: "shwezigon",
      emoji: "✨",
      title: "Quiet at Shwezigon",
      badge: "Respect Star",
      storyTitle: "Chapter 8 · Gold That Listens",
      beat: "Quiet climax",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Shwezigon",
        text: "Shwezigon Pagoda is one of Bagan's most loved golden landmarks. Visitors speak softly, offer flowers, and practice respect."
      },
      tip: "Practice Quiet, Bow, and Peace with soft indoor voices.",
      story:
        "On a cool evening they walked to Shwezigon. The pagoda shone like a held breath of gold. Mudra felt the week's jokes settle into something deeper — not sad, just big.\n\n" +
        "\"Please remove your shoes,\" Grandma whispered. Mudra placed them neatly. No clown sandals tonight. Ko Ko was quiet too, which was a historical event.\n\n" +
        "They offered flowers and lit a candle. Smoke curled upward. Mudra practiced quiet, offer, bow, peace, thank you. Around them, travelers and locals moved softly, as if the gold itself was listening.\n\n" +
        "Mudra thought of the bus dawn, the rooster, the market hat, the hot steps, the goat, the balloon peanut courage, the river splash. All of it had led to this quiet climax — a place where love did not need to shout.\n\n" +
        "\"I understand a little more,\" Mudra told Grandma. Grandma touched her shoulder. \"Understanding grows like candle light — small, then enough.\" Mudra's eyes shone. Her M clip glowed faintly in the gold reflection, like a tiny signature on a big day.",
      sentStory:
        "Mudra repeats Shwezigon manners. Please remove your shoes. Offer flowers. Light a candle. Bow. Stay quiet. Peace. Thank you.",
      sentStoryLong:
        "At home Mudra softens her voice and practices Shwezigon manners by the doorway. Please remove your shoes. Offer flowers. Light a candle. Bow. Stay quiet. Peace. Thank you. Even the rooster, for once, stays quiet — or maybe he is just planning tomorrow's alarm.",
      words: [
        { en: "Pagoda", mm: "စေတီ", emoji: "✨", hint: "zay-di" },
        { en: "Gold", mm: "ရွှေ", emoji: "🥇", hint: "shwe" },
        { en: "Quiet", mm: "တိတ်တိတ်", emoji: "🤫", hint: "teik-teik" },
        { en: "Flower", mm: "ပန်း", emoji: "🌸", hint: "pan" },
        { en: "Candle", mm: "ဖယောင်းတိုင်", emoji: "🕯", hint: "pha-yaung" },
        { en: "Bow", mm: "ဦးညွှတ်", emoji: "🙇", hint: "u-hnyut" },
        { en: "Peace", mm: "ငြိမ်းချမ်း", emoji: "☮️", hint: "nyein-chan" },
        { en: "Offer", mm: "လှူ", emoji: "🎁", hint: "hlu" },
        { en: "Respect", mm: "လေးစား", emoji: "🙏", hint: "lay-za" },
        { en: "Evening", mm: "ညနေ", emoji: "🌆", hint: "nya-nay" }
      ],
      quizQuestions: []
    },
    {
      id: "sunset",
      emoji: "🌇",
      title: "Thousand Temples Sunset",
      badge: "Bagan Star",
      storyTitle: "Chapter 9 · The Sky Says Goodbye",
      beat: "Peak & ending",
      learnImage: "learn",
      sentImage: "sent",
      heritage: {
        title: "Bagan sunsets",
        text: "Families gather on temple viewpoints to watch the sun paint a thousand roofs. Goodbyes can be soft, funny, and full of love."
      },
      tip: "Say Thank you and Goodbye — English and Myanmar — before bed.",
      story:
        "On the last evening, Auntie Hla led them to a sunset viewpoint. The plain turned orange, then pink, then a color Mudra decided to invent: biscuit-gold. Temples became silhouettes. Balloons from morning memory floated only in her mind now.\n\n" +
        "This was the peak — not louder than the balloon roar, not splashier than the river, but bigger somehow. Mudra stood between Grandma and Ko Ko and felt the whole trip stack up like friendly bricks.\n\n" +
        "\"Happy Bagan,\" Auntie Hla said, inventing a greeting on purpose. Mudra laughed and answered, \"Thank you, Bagan.\" She greeted the ribbon girl from the river if she was somewhere in the crowd of hearts. She thanked the tea, the goat, the steps, the sky.\n\n" +
        "Grandma cupped Mudra's face. \"Now you can speak Myanmar with Bagan too.\" Mudra's eyes shone. \"Not perfectly,\" Mudra said. Grandma grinned. \"Perfectly is not the point. Together is the point.\"\n\n" +
        "Later on the porch, Mudra wrote one last line while frogs sang and the rooster dreamed of tomorrow:\n\n" +
        "Ending for now. Bagan is in my notebook and my mouth. I can say hello. I can say wow. I can say I love you — in more than one language. Goodbye is not forever. Goodbye is see you in temples and words.",
      sentStory:
        "Festival-of-sunset sentences glow. Thank you. Goodbye. Love. Beautiful. Come here. Let's eat. Light. Happy. See you.",
      sentStoryLong:
        "Before sleep Mudra whispers ending sentences like lanterns. Thank you. Goodbye. Love. Beautiful. Come here. Let's eat. Light. Happy. See you. Grandma answers each line softly, and Auntie Hla promises the rooster will miss Mudra's M clip almost as much as the family will.",
      words: [
        { en: "Sunset", mm: "နေဝင်ချိန်", emoji: "🌇", hint: "nay-win" },
        { en: "Beautiful", mm: "လှတယ်", emoji: "😍", hint: "hla-de" },
        { en: "Thank you", mm: "ကျေးဇူးတင်ပါတယ်", emoji: "💛", hint: "kye-zu" },
        { en: "Goodbye", mm: "သွားတော့မယ်", emoji: "👋", hint: "thwa-daw" },
        { en: "Love", mm: "ချစ်တယ်", emoji: "❤️", hint: "chit-de" },
        { en: "Happy", mm: "ပျော်ရွှင်", emoji: "😊", hint: "pyaw-shwin" },
        { en: "Light", mm: "မီး", emoji: "💡", hint: "mi" },
        { en: "Come here", mm: "ဒီကိုလာပါ", emoji: "👉", hint: "di-ko-la" },
        { en: "Let's eat", mm: "စားကြရအောင်", emoji: "🍚", hint: "sa-ja" },
        { en: "See you", mm: "တွေ့မယ်", emoji: "👋", hint: "tway-me" }
      ],
      quizQuestions: []
    }
  ];

  w.MM_CHAPTERS = CHAPTERS;
  w.MM_BOOK = {
    title: "Mudra goes to Bagan",
    subtitle: "A fun claymation holiday — Mudra, age 7, among a thousand temples",
    age: "5–9",
    hero: "Mudra, age 7, lives and studies in Singapore — pink M hair clip",
    series: "Mudra goes to…",
    style: "Claymation / Aardman-inspired",
    arc: "Intro → Character → Rising → Belonging → Challenge → Friendship → Quiet climax → Peak & Ending"
  };
})(typeof window !== "undefined" ? window : global);
