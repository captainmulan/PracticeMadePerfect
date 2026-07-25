/* Explore My Body — chapter content (generate: node _generate-book.cjs) */
(function (w) {
  w.BODY_CHAPTERS = [
    {
      id: "heart",
      num: 4,
      slug: "Your-Amazing-Heart",
      title: "Your Amazing Heart",
      emoji: "🫀",
      opponent: { name: "Dr. Pulse", icon: "🩺" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Maya hears her heartbeat",
          story: "Maya presses her fingers to her wrist after running in the park. Thump-thump, thump-thump! \"That's my heart,\" she whispers. Her friend Leo tries too — everyone's rhythm is a little different, but every beat means life is flowing.",
          explanation: "Your heart is a strong muscle about the size of your fist. It sits in your chest, slightly to the left, and beats without you thinking about it — even while you sleep!"
        },
        {
          slot: "main-2",
          storyTitle: "The delivery truck",
          story: "Maya imagines her heart as a tiny delivery truck. Every beat sends a package of oxygen to her toes, her brain, and her pinky finger. When she sprints, the truck works faster to keep up!",
          explanation: "Blood carries oxygen and nutrients to every cell. Your heart pumps about 5 litres of blood every minute — that's like ten water bottles swirling through your body."
        },
        {
          slot: "main-3",
          storyTitle: "Four special rooms",
          story: "In science class, Maya learns her heart has four rooms called chambers. Blood visits each room like a train stopping at stations before heading to the lungs or the rest of the body.",
          explanation: "The right side sends blood to the lungs for fresh oxygen. The left side pumps oxygen-rich blood to your muscles, skin, and brain. Four chambers, one amazing team!"
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Inside the chambers",
          story: "Maya draws her heart like a house with four rooms: two upstairs (atria) and two downstairs (ventricles). She labels the doors between them — valves that snap shut so blood only flows one way.",
          explanation: "Valves are one-way doors. They stop blood from flowing backwards when the heart squeezes. A healthy heart makes a steady lub-dub sound as valves open and close."
        },
        {
          slot: "exp-2",
          storyTitle: "The long road",
          story: "If Maya could ride a red blood cell, she'd travel through arteries as wide as garden hoses and capillaries thinner than a hair. The whole trip — heart to toes and back — takes about one minute!",
          explanation: "Arteries carry blood away from the heart; veins carry it back. Capillaries are so tiny they let oxygen hop off right next to your cells."
        },
        {
          slot: "exp-3",
          storyTitle: "Keeping the engine strong",
          story: "Maya's coach says, \"Your heart is like an engine — feed it well and use it!\" After practice she drinks water, eats an apple, and feels her heartbeat slow down as she rests.",
          explanation: "Exercise makes your heart stronger. Healthy food, sleep, and staying calm help too. A fit heart doesn't have to work as hard during everyday activities."
        }
      ],
      game: { id: "heart-beat", title: "Heart Beat Challenge", desc: "Tap in rhythm when the heart glows! Match 8 beats to win." },
      quiz: [
        { q: "About how big is your heart?", options: ["Size of your fist", "Size of your head", "Size of your foot", "Size of a pea"], correct: 0 },
        { q: "How many chambers does your heart have?", options: ["2", "3", "4", "6"], correct: 2 },
        { q: "What does blood carry to your cells?", options: ["Only water", "Oxygen and nutrients", "Only sugar", "Air bubbles"], correct: 1 },
        { q: "Where does blood go to pick up fresh oxygen?", options: ["Stomach", "Brain", "Lungs", "Skin"], correct: 2 },
        { q: "What sound does a healthy heart make?", options: ["Beep-beep", "Lub-dub", "Tick-tock", "Whoosh"], correct: 1 },
        { q: "What helps keep your heart strong?", options: ["Never moving", "Exercise and healthy food", "Skipping sleep", "Only candy"], correct: 1 }
      ]
    },
    {
      id: "brain",
      num: 7,
      slug: "Your-Brain",
      title: "Your Brain",
      emoji: "🧠",
      opponent: { name: "Professor Cortex", icon: "🔬" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The command centre",
          story: "When Maya solves a puzzle, laughs at a joke, or remembers her grandma's voice, one organ is boss: her brain. It weighs about as much as a grapefruit and never switches off.",
          explanation: "Your brain is your body's control centre. It sends and receives messages through nerves, helping you move, feel, think, and learn."
        },
        {
          slot: "main-2",
          storyTitle: "Left and right teams",
          story: "Maya writes with her right hand but kicks a ball with her left foot. Her brain has two halves — left and right — that work together like teammates passing a ball.",
          explanation: "The left side often helps with language and logic. The right side helps with creativity and spatial skills. Both sides talk through a bridge called the corpus callosum."
        },
        {
          slot: "main-3",
          storyTitle: "Memory library",
          story: "Before bed, Maya replays her day — the butterfly she saw, the spelling test, the silly song. Her brain files memories like books on shelves, some easy to find, some needing a reminder.",
          explanation: "The hippocampus helps form new memories. Sleep helps your brain sort and store what you learned. That's why rest helps you remember!"
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Neurons — tiny messengers",
          story: "Maya learns her brain has billions of tiny cells called neurons. They chat using electrical sparks and chemicals, faster than a text message zooming around the world.",
          explanation: "Neurons connect in networks. When you practice piano or maths, pathways get stronger — that's how practice makes skills easier."
        },
        {
          slot: "exp-2",
          storyTitle: "Protective packaging",
          story: "Maya's bike helmet protects her head because the brain is soft and precious. Three layers of tissue and fluid cushion it inside the hard skull.",
          explanation: "Cerebrospinal fluid acts like a shock absorber. The skull and meninges (protective layers) guard your brain from bumps."
        },
        {
          slot: "exp-3",
          storyTitle: "Brain fuel",
          story: "At breakfast Maya eats eggs and toast. Her brain loves steady fuel — glucose from food plus oxygen from breathing keeps her focused through morning class.",
          explanation: "Your brain uses about 20% of your body's energy even though it's small. Water, sleep, and balanced meals help you think clearly."
        }
      ],
      game: { id: "brain-match", title: "Brain Memory Match", desc: "Flip cards and match body-part pairs before time runs out!" },
      quiz: [
        { q: "What is the brain's main job?", options: ["Pump blood", "Control the body", "Digest food", "Filter air"], correct: 1 },
        { q: "How many main halves does the brain have?", options: ["1", "2", "4", "8"], correct: 1 },
        { q: "Brain cells that send messages are called…", options: ["Neurons", "Atoms", "Ribosomes", "Platelets"], correct: 0 },
        { q: "What protects the soft brain inside your head?", options: ["Hair only", "Skull and fluid", "Muscles only", "Skin only"], correct: 1 },
        { q: "Sleep helps your brain…", options: ["Forget everything", "Store memories", "Stop growing", "Shrink"], correct: 1 },
        { q: "About how much of your body's energy does the brain use?", options: ["1%", "5%", "20%", "50%"], correct: 2 }
      ]
    },
    {
      id: "bones",
      num: 10,
      slug: "Your-Bones",
      title: "Your Bones",
      emoji: "🦴",
      opponent: { name: "Skeletal Sam", icon: "💀" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Your hidden frame",
          story: "Maya stands tall and wiggles her fingers. Under her skin, 206 bones form a frame that holds her up — like the poles inside a tent.",
          explanation: "Bones give your body shape and support. Adults have 206 bones; babies start with more that fuse as they grow."
        },
        {
          slot: "main-2",
          storyTitle: "Living and growing",
          story: "Maya breaks a small fall with her hands and is glad nothing cracks. Her bones aren't dead sticks — they're alive, growing, and fixing small cracks.",
          explanation: "Bones contain living cells. They store minerals like calcium and make new blood cells inside bone marrow."
        },
        {
          slot: "main-3",
          storyTitle: "Joints that bend",
          story: "Maya's elbow bends but her upper arm doesn't flop. Joints — where bones meet — let some parts hinge, swivel, or glide.",
          explanation: "Hinge joints (like elbows and knees) bend one way. Ball-and-socket joints (like hips and shoulders) rotate more freely."
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Strong but light",
          story: "Maya picks up a bird bone model in class — hollow inside yet strong. Her own long bones have a hard outside and a spongy middle that saves weight.",
          explanation: "Compact bone is dense and strong on the outside. Spongy bone inside is lighter but still tough — a smart design!"
        },
        {
          slot: "exp-2",
          storyTitle: "The spine's stack",
          story: "Maya counts the bumps down her back — vertebrae stacked like coins, protecting the spinal cord running through the middle.",
          explanation: "Your spine has 33 vertebrae (some fused in adults). Discs between them cushion shocks when you walk, run, or jump."
        },
        {
          slot: "exp-3",
          storyTitle: "Calcium builders",
          story: "Maya drinks milk at lunch knowing calcium feeds her bones. Sunlight and exercise help too — her skeleton is a project that never quite finishes until she's grown.",
          explanation: "Calcium and vitamin D build strong bones. Weight-bearing exercise (running, jumping) signals bones to stay dense and sturdy."
        }
      ],
      game: { id: "bone-stack", title: "Skeleton Stack", desc: "Drag bones into the right slots to build a skeleton!" },
      quiz: [
        { q: "About how many bones do adults have?", options: ["52", "106", "206", "406"], correct: 2 },
        { q: "Bones store which important mineral?", options: ["Gold", "Calcium", "Salt only", "Sugar"], correct: 1 },
        { q: "Where two bones meet is called a…", options: ["Muscle", "Joint", "Vein", "Lung"], correct: 1 },
        { q: "Which joint lets your arm rotate in a socket?", options: ["Elbow hinge", "Shoulder ball-and-socket", "Knee only", "Ankle only"], correct: 1 },
        { q: "Blood cells are made inside…", options: ["Hair", "Bone marrow", "Fingernails", "Teeth"], correct: 1 },
        { q: "What protects your spinal cord?", options: ["Ribs only", "Skull only", "The spine", "Stomach"], correct: 2 }
      ]
    },
    {
      id: "muscles",
      num: 13,
      slug: "Your-Muscles",
      title: "Your Muscles",
      emoji: "💪",
      opponent: { name: "Flex Fiona", icon: "🏋️" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Pull, never push",
          story: "Maya flexes her arm and watches her biceps bulge. Muscles can only pull — so they work in pairs, one shortening while its partner relaxes.",
          explanation: "Skeletal muscles attach to bones with tendons. When a muscle contracts (shortens), it pulls the bone and creates movement."
        },
        {
          slot: "main-2",
          storyTitle: "Three muscle teams",
          story: "Some muscles Maya controls — like waving. Others work automatically — like her heart and the ones that push food along. A third kind makes organs squeeze.",
          explanation: "Skeletal muscles move bones. Smooth muscles line organs like the stomach. Cardiac muscle makes the heart beat."
        },
        {
          slot: "main-3",
          storyTitle: "Warm-up wonder",
          story: "Before football, Maya jogs lightly. Her muscles warm up, blood flows faster, and they feel ready instead of stiff.",
          explanation: "Warm muscles perform better and get injured less. Stretching and gradual activity prepare fibres for hard work."
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Fast and slow fibres",
          story: "Maya sprints fast then walks. Some muscle fibres fire quickly for bursts; others keep going longer for endurance — like sprinters vs marathon runners.",
          explanation: "Fast-twitch fibres help short, powerful moves. Slow-twitch fibres help steady activities like long walks or holding posture."
        },
        {
          slot: "exp-2",
          storyTitle: "Fuel and repair",
          story: "After practice, Maya eats chicken and rice. Protein gives her muscles building blocks to repair tiny tears from exercise.",
          explanation: "Exercise creates micro-tears in muscle fibres. Rest and protein help them rebuild stronger — that's how you get fitter."
        },
        {
          slot: "exp-3",
          storyTitle: "The strongest pound-for-pound",
          story: "Maya learns her jaw muscle (masseter) is incredibly strong for its size — handy for chewing crunchy apples!",
          explanation: "Different muscles excel at different jobs. The glutes are large and powerful for walking upstairs; eye muscles make tiny precise moves."
        }
      ],
      game: { id: "muscle-flex", title: "Muscle Flex Tap", desc: "Tap the glowing muscles as fast as you can!" },
      quiz: [
        { q: "Muscles can only…", options: ["Push", "Pull", "Spin", "Float"], correct: 1 },
        { q: "Muscles attach to bones with…", options: ["Tendons", "Hair", "Teeth", "Lungs"], correct: 0 },
        { q: "Which muscle type makes the heart beat?", options: ["Skeletal", "Cardiac", "Smooth only", "None"], correct: 1 },
        { q: "What helps muscles repair after exercise?", options: ["Protein and rest", "Skipping meals", "No sleep", "Standing still forever"], correct: 0 },
        { q: "Skeletal muscles are muscles you mostly…", options: ["Control on purpose", "Never feel", "See through skin", "Replace yearly"], correct: 0 },
        { q: "Warming up before sport helps muscles…", options: ["Freeze", "Perform safely", "Disappear", "Stop blood flow"], correct: 1 }
      ]
    },
    {
      id: "lungs",
      num: 16,
      slug: "Your-Lungs",
      title: "Your Lungs",
      emoji: "🫁",
      opponent: { name: "Captain Air", icon: "🌬️" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Breath of life",
          story: "Maya holds a pinwheel to her lips — one puff and it spins. Her lungs fill like balloons, grabbing oxygen her blood needs.",
          explanation: "You breathe in oxygen and breathe out carbon dioxide — a waste gas your cells make. Lungs swap these gases in your chest."
        },
        {
          slot: "main-2",
          storyTitle: "Two spongy bags",
          story: "In a model, Maya sees two pink sponges — her left and right lung. The left is slightly smaller to make room for the heart next door.",
          explanation: "Lungs aren't empty bags — they're filled with tiny air sacs called alveoli, like bunches of grapes covered in blood vessels."
        },
        {
          slot: "main-3",
          storyTitle: "The diaphragm dance",
          story: "Maya lies down and feels her belly rise as she inhales. A sheet of muscle under her lungs — the diaphragm — pulls down to suck air in.",
          explanation: "Breathing out happens when the diaphragm relaxes and pushes up. Your ribs also lift slightly to make more room."
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Millions of tiny sacs",
          story: "If Maya could shrink and walk inside a lung, she'd see alveoli — millions of tiny sacs where oxygen hops into blood.",
          explanation: "Alveoli have thin walls and a huge total surface area — about the size of a tennis court! That helps you absorb oxygen quickly."
        },
        {
          slot: "exp-2",
          storyTitle: "Clean-up crew",
          story: "Maya coughs once after dust tickles her throat. Tiny hairs and mucus in airways trap dirt so lungs stay clean.",
          explanation: "Cilia (microscopic hairs) sweep mucus upward. Coughing or swallowing clears trapped particles — your lung's self-cleaning team."
        },
        {
          slot: "exp-3",
          storyTitle: "Deep breath power",
          story: "Before a race, Maya takes slow deep breaths. Calm breathing steadies her heart and fills her muscles with fresh oxygen.",
          explanation: "Deep breathing can calm nerves and improve focus. Fresh air and exercise keep lungs strong — smoking harms them, so never start."
        }
      ],
      game: { id: "lung-breath", title: "Breath Rhythm", desc: "Match the circle — breathe in when it grows, out when it shrinks!" },
      quiz: [
        { q: "What gas do lungs take IN from the air?", options: ["Carbon dioxide", "Oxygen", "Smoke", "Helium only"], correct: 1 },
        { q: "Tiny air sacs in lungs are called…", options: ["Alveoli", "Atoms", "Villi only", "Cells only"], correct: 0 },
        { q: "Which muscle helps you breathe?", options: ["Diaphragm", "Biceps", "Jaw only", "Toe"], correct: 0 },
        { q: "How many lungs do you have?", options: ["1", "2", "3", "4"], correct: 1 },
        { q: "What gas do you breathe OUT?", options: ["Pure oxygen", "Carbon dioxide", "Gold", "Nothing"], correct: 1 },
        { q: "What keeps airways clean?", options: ["Mucus and cilia", "Sand", "Water only", "Nothing"], correct: 0 }
      ]
    },
    {
      id: "stomach",
      num: 19,
      slug: "Your-Stomach",
      title: "Your Stomach",
      emoji: "🍽️",
      opponent: { name: "Chef Digest", icon: "👨‍🍳" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "The food mixer",
          story: "After lunch Maya feels her tummy gurgle. Her stomach is churning lunch like a washing machine — mixing food with juices to start digestion.",
          explanation: "The stomach is a muscular bag that breaks food into smaller pieces. Acid and enzymes start turning meals into nutrients your body can use."
        },
        {
          slot: "main-2",
          storyTitle: "Acid that's on your side",
          story: "Maya learns stomach acid is strong — strong enough to dissolve some metals! — yet a special lining keeps her stomach safe.",
          explanation: "Hydrochloric acid kills many germs in food and helps enzymes work. Mucus protects the stomach wall from being digested itself."
        },
        {
          slot: "main-3",
          storyTitle: "On to the small intestine",
          story: "Hours after eating, mushy food leaves the stomach in small amounts, heading to the small intestine for the main nutrient grab.",
          explanation: "The stomach stores and mixes; the small intestine absorbs most vitamins, sugars, fats, and proteins into your blood."
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Brain-gut chat",
          story: "Butterflies before a test? Maya feels them in her stomach because the brain and gut talk through nerves — that's why stress can feel tummy-related.",
          explanation: "The vagus nerve connects brain and digestive system. Emotions can change appetite or cause butterflies — your gut is sensitive!"
        },
        {
          slot: "exp-2",
          storyTitle: "Chew, chew, chew",
          story: "Maya races through dinner once and gets a stomach ache. Her teacher says chewing gives the stomach a head start — teeth are step one.",
          explanation: "Saliva starts breaking starch in your mouth. Smaller bites mean less work for the stomach and smoother digestion."
        },
        {
          slot: "exp-3",
          storyTitle: "Friendly bacteria",
          story: "Yogurt at snack time adds helpful bacteria. Trillions of microbes in the gut help digest fibre and keep the system balanced.",
          explanation: "Your microbiome — gut bacteria — aids digestion and supports immunity. Fibre-rich foods feed good bacteria."
        }
      ],
      game: { id: "stomach-sort", title: "Food Sort", desc: "Drag healthy foods into the stomach — skip the junk!" },
      quiz: [
        { q: "The stomach breaks food using…", options: ["Acid and enzymes", "Only teeth", "Air", "Light"], correct: 0 },
        { q: "Most nutrients are absorbed in the…", options: ["Hair", "Small intestine", "Nose", "Heart"], correct: 1 },
        { q: "What protects the stomach from its own acid?", options: ["Mucus lining", "Nothing", "Bones", "Hair"], correct: 0 },
        { q: "Chewing food well helps because…", options: ["It looks nice", "Digestion starts in the mouth", "Stomach stops working", "You eat less air"], correct: 1 },
        { q: "Gurgling sounds often mean…", options: ["Stomach is working", "Lungs stopped", "Brain sleep", "Bones cracking"], correct: 0 },
        { q: "Helpful gut bacteria aid…", options: ["Digestion", "Flying", "Hearing colours", "Bone length only"], correct: 0 }
      ]
    },
    {
      id: "eyes",
      num: 22,
      slug: "Your-Eyes",
      title: "Your Eyes",
      emoji: "👁️",
      opponent: { name: "Optic Ollie", icon: "👓" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Windows to the world",
          story: "Maya watches a rainbow after rain — red, orange, yellow streak the sky. Her eyes catch light and send pictures to her brain faster than she can blink.",
          explanation: "Eyes work like cameras: the cornea and lens focus light onto the retina — a layer of cells at the back that makes signals for the brain."
        },
        {
          slot: "main-2",
          storyTitle: "Rods and cones",
          story: "In dim light Maya sees shapes; in daylight she sees colours. Two cell types — rods and cones — handle night vision and colour.",
          explanation: "Rods help you see in low light. Cones detect colour — red, green, and blue combinations make every hue you know."
        },
        {
          slot: "main-3",
          storyTitle: "Blink shield",
          story: "Dust floats toward Maya's eye — blink! Tears wash it away. Eyelashes and lids guard the delicate surface.",
          explanation: "Tears keep eyes moist and clean. Blinking spreads tears and protects the cornea — the clear front window of the eye."
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Upside-down start",
          story: "Maya learns the retina receives images upside down — her brain flips them right-side up without her noticing!",
          explanation: "The optic nerve carries signals to the visual cortex at the back of the brain, which builds the world you see."
        },
        {
          slot: "exp-2",
          storyTitle: "Pupil power",
          story: "In a dark cinema Maya's pupils widen to let in more light; stepping outside they shrink to a pinhole.",
          explanation: "The iris controls pupil size like a camera aperture. Muscles widen or narrow the opening based on brightness."
        },
        {
          slot: "exp-3",
          storyTitle: "Screen break",
          story: "After tablet time Maya looks out the window at a far tree. Her eye muscles relax when she focuses far away.",
          explanation: "Too much close-up screen time can tire eyes. The 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds."
        }
      ],
      game: { id: "eye-focus", title: "Focus Finder", desc: "Tap the sharpest object before the blur spreads!" },
      quiz: [
        { q: "Light focuses onto which part of the eye?", options: ["Retina", "Ear drum", "Nose", "Tongue"], correct: 0 },
        { q: "Cones in the eye help you see…", options: ["Colour", "Only black and white", "Sound", "Smell"], correct: 0 },
        { q: "What spreads moisture across the eye?", options: ["Blinking", "Coughing", "Jumping", "Sleeping only"], correct: 0 },
        { q: "The coloured part of the eye is the…", options: ["Iris", "Lung", "Liver", "Spine"], correct: 0 },
        { q: "Images on the retina are first…", options: ["Upside down", "Invisible", "Heard not seen", "Printed"], correct: 0 },
        { q: "Looking far away helps eyes…", options: ["Relax focus", "Stop working", "Change colour", "Grow bigger"], correct: 0 }
      ]
    },
    {
      id: "ears",
      num: 25,
      slug: "Your-Ears",
      title: "Your Ears",
      emoji: "👂",
      opponent: { name: "Sound Wave Sue", icon: "🎵" },
      mainSegments: [
        {
          slot: "main-1",
          storyTitle: "Catch the vibration",
          story: "Maya strums a rubber-band guitar — the band wiggles, air wiggles, and her eardrum wiggles too. Ears turn vibrations into sounds she recognises.",
          explanation: "Sound is vibration travelling through air. The outer ear collects it; the eardrum and tiny bones pass it deeper inside."
        },
        {
          slot: "main-2",
          storyTitle: "Three tiny bones",
          story: "Maya sees a model of the hammer, anvil, and stirrup — the smallest bones in the body — passing vibrations like a relay team.",
          explanation: "These ossicles amplify sound from the eardrum to the cochlea — a spiral organ filled with fluid and hair cells."
        },
        {
          slot: "main-3",
          storyTitle: "Balance buddies",
          story: "Spinning on a chair, Maya feels dizzy when she stops. Her inner ear also senses balance and movement, not just sound.",
          explanation: "Semicircular canals detect head rotation. Together with vision, they help you stay upright and coordinated."
        }
      ],
      explainedSegments: [
        {
          slot: "exp-1",
          storyTitle: "Hair cells hear",
          story: "Inside the cochlea, microscopic hair cells bend with fluid waves and send signals to the hearing part of the brain.",
          explanation: "Different hair cells respond to different pitches — low bass notes vs high whistles. Damage from loud noise can harm them permanently."
        },
        {
          slot: "exp-2",
          storyTitle: "Volume safety",
          story: "At a concert Maya wears earplugs. Very loud sounds can hurt delicate hair cells — once damaged, they don't grow back.",
          explanation: "Keep volume low on headphones. If you must shout to be heard over music, it's too loud for safe listening."
        },
        {
          slot: "exp-3",
          storyTitle: "Locating sounds",
          story: "Maya closes her eyes and points to a chirping bird. One ear hears it slightly sooner — her brain calculates direction.",
          explanation: "Tiny timing differences between ears help locate sounds. Owls use this skill even better for hunting at night!"
        }
      ],
      game: { id: "ear-match", title: "Sound Match", desc: "Match the sound icon to the correct source!" },
      quiz: [
        { q: "Sound reaches the ear as…", options: ["Vibrations in air", "Light beams", "Smells", "Heat only"], correct: 0 },
        { q: "The eardrum is in the…", options: ["Middle ear", "Stomach", "Knee", "Eye"], correct: 0 },
        { q: "The cochlea looks like a…", options: ["Spiral shell", "Square box", "Triangle", "Star"], correct: 0 },
        { q: "Inner ear also helps with…", options: ["Balance", "Digestion", "Breathing", "Hair colour"], correct: 0 },
        { q: "Very loud noise can damage…", options: ["Hair cells in the cochlea", "Elbow skin", "Toenails", "Teeth only"], correct: 0 },
        { q: "The three tiny ear bones are called…", options: ["Ossicles", "Ribs", "Vertebrae", "Neurons"], correct: 0 }
      ]
    }
  ];
})(window);
