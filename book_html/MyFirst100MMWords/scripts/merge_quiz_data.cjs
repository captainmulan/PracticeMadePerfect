#!/usr/bin/env node
/* Merge story quiz questions into _mmwords-data.js (idempotent marker) */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "_mmwords-data.js");

const QUIZ = {
  family: [
    { q: "Where did Su live in the family tale?", options: ["A teak village near the Irrawaddy River", "A desert oasis", "An ice castle", "Under the sea"], correct: 0 },
    { q: "Which festival did Su celebrate with candles for her grandparents?", options: ["Thadingyut", "Thingyan only", "Christmas", "Harvest moon in Norway"], correct: 0 },
    { q: "Who should Myanmar children greet first, according to the story?", options: ["Grandparents and elders", "The youngest cousin", "Strangers at the market", "Pets only"], correct: 0 },
    { q: "What did Grandmother say happens when you know a person's name in Myanmar?", options: ["You carry them in your heart across distance", "You forget English", "You must write it fifty times", "You cannot travel"], correct: 0 },
    { q: "How is a Myanmar family described in the tale?", options: ["A wide forest of relatives", "Only two people", "A single branch", "A competition"], correct: 0 }
  ],
  food: [
    { q: "What did Kyaw's mother cook before dawn?", options: ["Rice in a clay pot", "Pizza", "Ice cream", "Sandwiches only"], correct: 0 },
    { q: "Who walked barefoot down the lane each morning?", options: ["Monks receiving alms", "Knights on horses", "Snow skiers", "Robot chefs"], correct: 0 },
    { q: "What salad did old men share at the tea shop?", options: ["Lahpet thoke (tea-leaf salad)", "Caesar salad only", "No food at all", "Candy floss"], correct: 0 },
    { q: "What did Kyaw share with the hungry dog?", options: ["His snack", "A gold coin", "A bicycle", "Nothing — he ran away"], correct: 0 },
    { q: "What moral did Kyaw's mother teach about full bellies?", options: ["Full bellies can choose to be generous", "Never share food", "Eat as fast as possible", "Hide all rice"], correct: 0 }
  ],
  animals: [
    { q: "Name one of the Four Friends in the forest tale.", options: ["Elephant", "Dragon king", "Unicorn", "Penguin emperor"], correct: 0 },
    { q: "What did Elephant carry during the flood?", options: ["Rabbit", "A mountain", "A boat made of gold", "Nothing"], correct: 0 },
    { q: "What did villagers say about strength without kindness?", options: ["It is only noise", "It is always best", "It wins every race", "It replaces food"], correct: 0 },
    { q: "In the white elephant legend, who nursed the wounded calf?", options: ["A young prince", "A merchant who hoarded rice", "A snow leopard", "Nobody"], correct: 0 },
    { q: "Why do Myanmar children often learn the elephant first?", options: ["Gentleness and strength can share one heart", "Elephants cannot swim", "Tigers are illegal", "Birds are too small"], correct: 0 }
  ],
  colors: [
    { q: "Which pagoda did May visit with her father at dawn?", options: ["Shwedagon Pagoda", "A pagoda on the moon", "A glass tower in space", "No pagoda at all"], correct: 0 },
    { q: "Why is Shwedagon gold in the story?", options: ["People donate gold leaf in gratitude", "Paint from a factory", "It is made of paper", "Magic rain only"], correct: 0 },
    { q: "What color were the monks' robes that May noticed?", options: ["Saffron orange", "Bright blue", "Neon pink", "Invisible"], correct: 0 },
    { q: "In the temple tale, what did the poor girl offer?", options: ["White roadside flowers arranged with sincerity", "A diamond crown", "A spaceship", "Nothing — she left"], correct: 0 },
    { q: "What did Grandmother say gold means as a feeling?", options: ["Thankfulness", "Anger", "Sleepiness", "Fear"], correct: 0 }
  ],
  numbers: [
    { q: "Where did Hnin sell mangoes in the story?", options: ["A market town near Bagan", "At the North Pole", "On the moon", "Underwater"], correct: 0 },
    { q: "What did the old traveler place on the mat?", options: ["Ten coins", "One hundred mangoes", "A magic wand", "A fish"], correct: 0 },
    { q: "What lesson did Hnin learn about counting?", options: ["Count with eyes and voice together — do not rush", "Never count aloud", "Always guess", "Numbers do not matter"], correct: 0 },
    { q: "What did the wise monk compare to grains of sand at Bagan?", options: ["Merit and temples — too many to hold", "Fish in the sea only", "Snowflakes", "Stars you can eat"], correct: 0 },
    { q: "What did Hnin teach her little brother to count?", options: ["Fingers, steps to the pagoda, and festival candles", "Only zero", "Alien planets", "Secret passwords"], correct: 0 }
  ],
  body: [
    { q: "Where did Daw Khin teach dance in Mandalay?", options: ["A teak hall open to the garden", "A submarine", "A roller coaster", "A snow cave"], correct: 0 },
    { q: "What should you not turn toward a Buddha image or teacher?", options: ["The soles of your feet", "Your smile", "Your hands when bowing", "Your ears when listening"], correct: 0 },
    { q: "What did Daw Khin say hands do before the mouth?", options: ["Speak first through movement and respect", "Stay hidden always", "Make loud noises", "Hold toys only"], correct: 0 },
    { q: "In the giant's tale, what small hands fed him?", options: ["A child's hands, spoon by spoon", "Robot arms", "Wings of a peacock", "Nobody helped"], correct: 0 },
    { q: "How is the body described in Myanmar teaching?", options: ["A guesthouse for the soul — wash it and use it to help", "A machine to ignore", "Only for running races", "Something to fear"], correct: 0 }
  ],
  home: [
    { q: "Why did water not enter Theint's house during the monsoon?", options: ["The floor stood on strong teak stilts", "The house could fly", "It was made of ice", "There was no rain"], correct: 0 },
    { q: "What welcomes guests according to Theint's father?", options: ["The door", "The television", "The closet", "The roof only"], correct: 0 },
    { q: "What did Theint's family offer wet travelers?", options: ["Lamp light, boiled water, and rice", "Nothing — they locked the door", "Only jokes", "A map to Mars"], correct: 0 },
    { q: "In folk wisdom, a house with a clean kitchen feeds what?", options: ["The spirit", "Only insects", "Nothing at all", "The moon"], correct: 0 },
    { q: "What is a house beyond wood and nails?", options: ["How people inside treat those who arrive", "Only the color of paint", "The number of windows", "A shopping list"], correct: 0 }
  ],
  school: [
    { q: "Where did Paing learn before sunrise?", options: ["A monastery school courtyard", "A shopping mall", "A submarine classroom", "Nowhere — he never went"], correct: 0 },
    { q: "What did Saya ring to begin lessons?", options: ["A small bell", "A fire alarm for fun", "A drum made of chocolate", "Nothing"], correct: 0 },
    { q: "What did Saya draw for Paing on the blank slate?", options: ["One line, then another — the start of his name", "A rocket ship only", "An empty page forever", "A secret code in English only"], correct: 0 },
    { q: "In the lazy pupil tale, what happened to copied ink overnight?", options: ["It faded, leaving empty pages", "It turned to gold", "It became a butterfly", "It sang a song"], correct: 0 },
    { q: "What did Saya say knowledge shared becomes?", options: ["A lantern for others", "A locked box", "A forgotten dream", "A punishment"], correct: 0 }
  ],
  feelings: [
    { q: "What festival preparations was Thiri helping with?", options: ["Pagoda offerings under a full moon", "A snowball fight", "A car race", "Nothing — she slept all day"], correct: 0 },
    { q: "What did Thiri's aunt compare feelings to?", options: ["Visitors you greet but need not keep forever", "Stones you must swallow", "Birds that never land", "Ghosts that own you"], correct: 0 },
    { q: "What melted like sugar in tea after Thiri apologized?", options: ["Her anger", "The pagoda", "The moon", "Her shoes"], correct: 0 },
    { q: "In the prince's tale, what words made his chest feel lighter?", options: ["Please, thank you, and sorry", "Shout louder", "Buy more toys", "Never speak"], correct: 0 },
    { q: "Why should children name their feelings?", options: ["It builds a bridge to people who care", "To win arguments only", "To hide from family", "Feelings should stay secret forever"], correct: 0 }
  ],
  festivals: [
    { q: "What does Thingyan water symbolize in Lin's year?", options: ["Letting anger flow away like mud in the street", "Winning a swimming race only", "Cleaning robots", "Making rice disappear"], correct: 0 },
    { q: "During Thadingyut, whom did Lin carry gifts to?", options: ["His grandparents", "Only strangers", "The moon", "Nobody"], correct: 0 },
    { q: "Where did paper balloons rise on Tazaungdaing?", options: ["Above Taunggyi at night", "Under the ocean", "Inside a cave only", "On Mars"], correct: 0 },
    { q: "What wish did Lin whisper as the balloon climbed?", options: ["Health for family and peace for the land", "A thousand toys", "To forget Myanmar", "Endless candy"], correct: 0 },
    { q: "What three seasons of the heart did the old monk describe?", options: ["Thingyan cleans, Thadingyut thanks, Tazaungdaing hopes", "Eat, sleep, run", "Winter, summer, fall only", "None — festivals have no meaning"], correct: 0 }
  ]
};

let src = fs.readFileSync(DATA, "utf8");
Object.keys(QUIZ).forEach((id) => {
  const block = JSON.stringify(QUIZ[id], null, 6).replace(/^/gm, "      ");
  const re = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?)(quizQuestions:\\s*\\[[\\s\\S]*?\\],\\s*)?(words:\\s*\\[)`, "m");
  if (!re.test(src)) {
    console.warn("Skip (no match):", id);
    return;
  }
  src = src.replace(re, `$1quizQuestions: ${JSON.stringify(QUIZ[id], null, 6).replace(/\n/g, "\n      ")},\n      $3`);
});
fs.writeFileSync(DATA, src);
console.log("Merged quizQuestions for", Object.keys(QUIZ).length, "chapters.");
