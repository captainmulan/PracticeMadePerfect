/* My First 100 Myanmar Words — chapter word data */
(function (w) {
  var CHAPTERS = [
    {
      id: "family",
      num: 8,
      emoji: "👨‍👩‍👧",
      title: "Family",
      badge: "Family Star",
      gameTitle: "Catch the Family",
      story: "Aye lives in Singapore with her family. Every evening, Grandma calls from Yangon. Aye learns to say each family word — so she can tell Grandma about everyone at home.",
      parentPhrase: { en: "This is my mother.", mm: "ဒီအူမေမာပါ။" },
      didYouKnow: "In Myanmar, children often live with grandparents. Learning family words helps kids talk to relatives on video calls!",
      practiceSentences: [
        { en: "This is my mother.", mm: "ဒီအမေပါ။" },
        { en: "I love my family.", mm: "မိသားစုကို ချစ်တယ်။" },
        { en: "Grandma, hello!", mm: "အဘွား၊ မင်္ဂလာပါ!" }
      ],
      words: [
        { en: "Mother", mm: "မေမာ", emoji: "👩", hint: "ma-ma", useEn: "This is my mother.", useMm: "ဒီအမေပါ။" },
        { en: "Father", mm: "အဖေ", emoji: "👨", hint: "a-phe", useEn: "My father cooks rice.", useMm: "အဖေက ထမင်းချက်တယ်။" },
        { en: "Grandmother", mm: "အဘွား", emoji: "👵", hint: "a-bwa", useEn: "Grandma lives in Myanmar.", useMm: "အဘွားက မြန်မာနိုင်ငံမှာ နေတယ်။" },
        { en: "Grandfather", mm: "အဘိုး", emoji: "👴", hint: "a-bo", useEn: "Grandpa tells stories.", useMm: "အဘိုးက ပုံပြင်ပြောတယ်။" },
        { en: "Sister", mm: "ညီမ", emoji: "👧", hint: "nyi-ma", useEn: "My sister is kind.", useMm: "ညီမက ကောင်းတယ်။" },
        { en: "Brother", mm: "အစ်ကို", emoji: "👦", hint: "a-ko", useEn: "My brother plays football.", useMm: "အစ်ကို ဘောလုံးကစားတယ်။" },
        { en: "Baby", mm: "ကလေး", emoji: "👶", hint: "ka-lay", useEn: "The baby is sleeping.", useMm: "ကလေးက အိပ်နေတယ်။" },
        { en: "Family", mm: "မိသားစု", emoji: "👨‍👩‍👧", hint: "mi-tha-zu", useEn: "I love my family.", useMm: "မိသားစုကို ချစ်တယ်။" },
        { en: "Aunt", mm: "အဒေါ်", emoji: "👩", hint: "a-daw", useEn: "My aunt lives in Yangon.", useMm: "အဒေါ်က ရန်ကုန်မှာ နေတယ်။" },
        { en: "Uncle", mm: "ဦးလေး", emoji: "👨", hint: "u-lay", useEn: "Uncle is funny!", useMm: "ဦးလေးက ရယ်စရာကောင်းတယ်!" },
        { en: "Cousin", mm: "ဝမ်းကွဲ", emoji: "🧒", hint: "win-pwe", useEn: "I play with my cousin.", useMm: "ဝမ်းကွဲနဲ့ ကစားတယ်။" },
        { en: "Parents", mm: "မိဘ", emoji: "👨‍👩‍👧", hint: "mi-ba", useEn: "My parents help me.", useMm: "မိဘတွေက ကူညီပေးတယ်။" }
      ]
    },
    {
      id: "food",
      num: 11,
      emoji: "🍚",
      title: "Food",
      badge: "Food Master",
      gameTitle: "Catch the Food",
      story: "At dinner, Aye's mum cooks Myanmar food. The kitchen smells like home. Aye taps each dish and learns the Myanmar names before the first bite.",
      parentPhrase: { en: "I am hungry.", mm: "ဗိုက်ဆာပါတယ်။" },
      words: [
        { en: "Rice", mm: "ထမင်း", emoji: "🍚", hint: "hta-min" },
        { en: "Water", mm: "ရေ", emoji: "💧", hint: "yay" },
        { en: "Apple", mm: "ပန်းသီး", emoji: "🍎", hint: "pan-thee" },
        { en: "Banana", mm: "ငှက်ပျောသီး", emoji: "🍌", hint: "ngat-pyaw-thee" },
        { en: "Fish", mm: "ငါး", emoji: "🐟", hint: "nga" },
        { en: "Egg", mm: "ဥ", emoji: "🥚", hint: "u" },
        { en: "Milk", mm: "နို့", emoji: "🥛", hint: "no" },
        { en: "Bread", mm: "ပေါင်မုန့်", emoji: "🍞", hint: "poun-moun" },
        { en: "Tea", mm: "လက်ဖက်ရည်", emoji: "🍵", hint: "laphet-yay" },
        { en: "Soup", mm: "ဟင်းရည်", emoji: "🍲", hint: "hin-yay", useEn: "The soup is hot.", useMm: "ဟင်းရည် ပူတယ်။" },
        { en: "Mango", mm: "သရက်သီး", emoji: "🥭", hint: "tha-yat-thee", useEn: "I like mango.", useMm: "သရက်သီး ကြိုက်တယ်။" },
        { en: "Noodle", mm: "ခေါက်ဆွဲ", emoji: "🍜", hint: "khauk-swe", useEn: "Noodles for lunch!", useMm: "နေ့လည်ခေါက်ဆွဲ!" },
        { en: "Sugar", mm: "သကြား", emoji: "🍬", hint: "sa-ya", useEn: "Not too much sugar.", useMm: "သကြားမများနဲ့။" },
        { en: "Meat", mm: "အသား", emoji: "🥩", hint: "a-tha", useEn: "We eat meat today.", useMm: "ဒီနေ့ အသားစားမယ်။" }
      ]
    },
    {
      id: "animals",
      num: 14,
      emoji: "🐘",
      title: "Animals",
      badge: "Animal Friend",
      gameTitle: "Catch the Animals",
      story: "Aye visits the zoo with Dad. Elephants, cats, and birds — each animal has a Myanmar name. Can you catch them all before the zoo closes?",
      parentPhrase: { en: "Look at the elephant!", mm: "ဆင်ကို ကြည့်ပါ!"},
      words: [
        { en: "Elephant", mm: "ဆင်", emoji: "🐘", hint: "sin" },
        { en: "Cat", mm: "ကြောင်", emoji: "🐱", hint: "kyaung" },
        { en: "Dog", mm: "ခွေး", emoji: "🐶", hint: "khway" },
        { en: "Bird", mm: "ငှက်", emoji: "🐦", hint: "ngat" },
        { en: "Fish", mm: "ငါး", emoji: "🐟", hint: "nga" },
        { en: "Cow", mm: "နွား", emoji: "🐄", hint: "nwa" },
        { en: "Chicken", mm: "ကြက်", emoji: "🐔", hint: "kyet" },
        { en: "Tiger", mm: "ကျား", emoji: "🐯", hint: "kya" },
        { en: "Monkey", mm: "မျောက်", emoji: "🐒", hint: "myauk" },
        { en: "Snake", mm: "မြွေ", emoji: "🐍", hint: "mway", useEn: "The snake is long.", useMm: "မြွေက ရှည်တယ်။" },
        { en: "Horse", mm: "မြင်း", emoji: "🐴", hint: "myin", useEn: "The horse runs fast.", useMm: "မြင်းက မြန်မြန်ပြေးတယ်။" },
        { en: "Duck", mm: "ဘဲ", emoji: "🦆", hint: "be", useEn: "The duck swims.", useMm: "ဘဲက ရေမှာ ရေကူးတယ်။" },
        { en: "Pig", mm: "ဝက်", emoji: "🐷", hint: "wet", useEn: "The pig is pink.", useMm: "ဝက်က ပန်းရောင်ပါ။" },
        { en: "Butterfly", mm: "လိပ်ပြာ", emoji: "🦋", hint: "late-pya", useEn: "A pretty butterfly!", useMm: "လိပ်ပြာလေး လှတယ်!" }
      ]
    },
    {
      id: "colors",
      num: 17,
      emoji: "🎨",
      title: "Colors",
      badge: "Color Artist",
      gameTitle: "Catch the Colors",
      story: "Aye paints a picture for Grandma. Red like a rose, gold like a pagoda. Each color has a beautiful Myanmar word.",
      parentPhrase: { en: "What color is this?", mm: "ဒါ ဘာအရောင်လဲ?" },
      words: [
        { en: "Red", mm: "အနီ", emoji: "🔴", hint: "a-ni" },
        { en: "Blue", mm: "အပြာ", emoji: "🔵", hint: "a-pya" },
        { en: "Green", mm: "အစိမ်း", emoji: "🟢", hint: "a-sin" },
        { en: "Yellow", mm: "အဝါ", emoji: "🟡", hint: "a-wa" },
        { en: "White", mm: "အဖြူ", emoji: "⚪", hint: "a-phu" },
        { en: "Black", mm: "အနက်", emoji: "⚫", hint: "a-net" },
        { en: "Orange", mm: "လိမ္မော်ရောင်", emoji: "🟠", hint: "le-moun-yaung" },
        { en: "Pink", mm: "ပန်းရောင်", emoji: "🌸", hint: "pan-yaung" },
        { en: "Gold", mm: "ရွှေရောင်", emoji: "✨", hint: "shwe-yaung", useEn: "Gold like a pagoda.", useMm: "ဘုရားလို ရွှေရောင်။" },
        { en: "Purple", mm: "ခရမ်းရောင်", emoji: "🟣", hint: "kyaung-yaung", useEn: "Purple flowers.", useMm: "ခရမ်းရောင် ပန်းလေးတွေ။" },
        { en: "Brown", mm: "အညိုရောင်", emoji: "🟤", hint: "a-nyo-yaung", useEn: "Brown tree bark.", useMm: "အညိုရောင် သစ်ခွရွှံ။" }
      ]
    },
    {
      id: "numbers",
      num: 20,
      emoji: "🔢",
      title: "Numbers",
      badge: "Number Ninja",
      gameTitle: "Catch the Numbers",
      story: "Aye counts mangoes at the market with Mum. One, two, three — in English at school, in Myanmar at home.",
      parentPhrase: { en: "How many?", mm: "ဘယ်နှစ်ခုလဲ?" },
      words: [
        { en: "One", mm: "တစ်", emoji: "1️⃣", hint: "tit" },
        { en: "Two", mm: "နှစ်", emoji: "2️⃣", hint: "hni" },
        { en: "Three", mm: "သုံး", emoji: "3️⃣", hint: "thone" },
        { en: "Four", mm: "လေး", emoji: "4️⃣", hint: "lay" },
        { en: "Five", mm: "ငါး", emoji: "5️⃣", hint: "nga" },
        { en: "Six", mm: "ခြောက်", emoji: "6️⃣", hint: "chauk" },
        { en: "Seven", mm: "ခုနစ်", emoji: "7️⃣", hint: "ku-nit" },
        { en: "Eight", mm: "ရှစ်", emoji: "8️⃣", hint: "shit" },
        { en: "Nine", mm: "ကိုး", emoji: "9️⃣", hint: "ko" },
        { en: "Ten", mm: "တဆယ်", emoji: "🔟", hint: "ta-ze", useEn: "Ten fingers!", useMm: "လက်ချောင်းဆယ်ချောင်း!" },
        { en: "Zero", mm: "သုည", emoji: "0️⃣", hint: "thone-nya", useEn: "Zero means none.", useMm: "သုည ဆိုတာ မရှိဘူး။" },
        { en: "Many", mm: "အများကြီး", emoji: "🔢", hint: "a-mya-gyi", useEn: "So many mangoes!", useMm: "သရက်သီး အများကြီး!" }
      ]
    },
    {
      id: "body",
      num: 23,
      emoji: "👂",
      title: "Body Parts",
      badge: "Body Explorer",
      gameTitle: "Catch the Body Parts",
      story: "After playing outside, Aye washes her hands and learns body words. Point to your nose — နှာခေါင်း!",
      parentPhrase: { en: "Wash your hands.", mm: "လက်ကို ဆေးပါ။" },
      words: [
        { en: "Head", mm: "ခေါင်း", emoji: "🙂", hint: "kaung" },
        { en: "Eye", mm: "မျက်လုံး", emoji: "👁️", hint: "myet-lone" },
        { en: "Ear", mm: "နား", emoji: "👂", hint: "na" },
        { en: "Nose", mm: "နှာခေါင်း", emoji: "👃", hint: "hna-kaung" },
        { en: "Mouth", mm: "ပါးစပ်", emoji: "👄", hint: "ba-zut" },
        { en: "Hand", mm: "လက်", emoji: "✋", hint: "let" },
        { en: "Foot", mm: "ခြေထောက်", emoji: "🦶", hint: "chay-thout" },
        { en: "Heart", mm: "နှလုံး", emoji: "❤️", hint: "hna-lone", useEn: "My heart beats fast.", useMm: "နှလုံးက မြန်မြန်ခုန်တယ်။" },
        { en: "Hair", mm: "ဆံပင်", emoji: "💇", hint: "san-pin", useEn: "Brush your hair.", useMm: "ဆံပင်ကို စီပါ။" },
        { en: "Teeth", mm: "သွား", emoji: "🦷", hint: "dthwa", useEn: "Clean your teeth.", useMm: "သွားကို သန့်ရှင်းပါ။" },
        { en: "Stomach", mm: "ဗိုက်", emoji: "🫃", hint: "bite", useEn: "My stomach is full.", useMm: "ဗိုက်ဝတယ်။" }
      ]
    },
    {
      id: "home",
      num: 26,
      emoji: "🏠",
      title: "Home",
      badge: "Home Helper",
      gameTitle: "Catch Home Items",
      story: "Aye helps tidy the house before Grandma's video call. Bed, door, lamp — every room has words to learn.",
      parentPhrase: { en: "Go to your room.", mm: "မင်းအခန်းကို သွားပါ။" },
      words: [
        { en: "House", mm: "အိမ်", emoji: "🏠", hint: "ain" },
        { en: "Room", mm: "အခန်း", emoji: "🚪", hint: "a-khan" },
        { en: "Door", mm: "တံခါး", emoji: "🚪", hint: "dan-kha" },
        { en: "Window", mm: "ပြတင်းပေါက်", emoji: "🪟", hint: "pya-din-pout" },
        { en: "Bed", mm: "အိပ်ရာ", emoji: "🛏️", hint: "et-ya" },
        { en: "Chair", mm: "ထိုင်ခုံ", emoji: "🪑", hint: "htaing-khone" },
        { en: "Table", mm: "စားပွဲ", emoji: "🪑", hint: "sa-bwe" },
        { en: "Lamp", mm: "မီး", emoji: "💡", hint: "mi", useEn: "Turn on the lamp.", useMm: "မီးဖွင့်ပါ။" },
        { en: "Kitchen", mm: "မီးဖိုချောင်", emoji: "🍳", hint: "mi-fo-chaung", useEn: "Mum is in the kitchen.", useMm: "အမေ မီးဖိုချောင်မှာ ရှိတယ်။" },
        { en: "Bathroom", mm: "ရေချိုးခန်း", emoji: "🚿", hint: "yay-cho-khan", useEn: "Wash in the bathroom.", useMm: "ရေချိုးခန်းမှာ ရေချိုးပါ။" },
        { en: "Phone", mm: "ဖုန်း", emoji: "📱", hint: "phone", useEn: "Call Grandma on the phone.", useMm: "ဖုန်းနဲ့ အဘွားကို ခေါ်ပါ။" }
      ]
    },
    {
      id: "school",
      num: 29,
      emoji: "🎒",
      title: "School",
      badge: "School Star",
      gameTitle: "Catch School Items",
      story: "At school Aye speaks English. At home she learns Myanmar words for pencil, book, and teacher — so both worlds connect.",
        parentPhrase: { en: "Do you have homework?", mm: "အိမ်စာ ရှိလား?" },
      words: [
        { en: "School", mm: "ကျောင်း", emoji: "🏫", hint: "kyaung" },
        { en: "Teacher", mm: "ဆရာ", emoji: "👩‍🏫", hint: "saya" },
        { en: "Book", mm: "စာအုပ်", emoji: "📚", hint: "sa-ouk" },
        { en: "Pencil", mm: "ခဲတံ", emoji: "✏️", hint: "khe-dan" },
        { en: "Bag", mm: "အိတ်", emoji: "🎒", hint: "ate" },
        { en: "Friend", mm: "သူငယ်ချင်း", emoji: "🤝", hint: "thu-ngay-chin" },
        { en: "Class", mm: "စာသင်ခန်း", emoji: "📖", hint: "sa-thin-khan" },
        { en: "Homework", mm: "အိမ်စာ", emoji: "📝", hint: "ain-sa", useEn: "I have homework.", useMm: "အိမ်စာ ရှိတယ်။" },
        { en: "Pen", mm: "ဘောပင်", emoji: "🖊️", hint: "baw-pin", useEn: "Write with a pen.", useMm: "ဘောပင်နဲ့ ရေးပါ။" },
        { en: "Eraser", mm: "ခဲဖျက်", emoji: "🧽", hint: "khe-phyet", useEn: "Use the eraser.", useMm: "ခဲဖျက်သုံးပါ။" },
        { en: "Lesson", mm: "သင်ခန်းစာ", emoji: "📖", hint: "thin-khan-sa", useEn: "Today's lesson is fun.", useMm: "ဒီနေ့ သင်ခန်းစာ ပျော်စရာကောင်းတယ်။" }
      ]
    },
    {
      id: "feelings",
      num: 32,
      emoji: "😊",
      title: "Feelings",
      badge: "Feelings Friend",
      gameTitle: "Catch the Feelings",
      story: "Sometimes Aye feels happy, sometimes tired. Learning feeling words in Myanmar helps her tell parents how she really feels.",
      parentPhrase: { en: "Are you happy?", mm: "ပျော်ရွှင်လား?" },
      words: [
        { en: "Happy", mm: "ပျော်ရွှင်", emoji: "😊", hint: "pyaw-shwin" },
        { en: "Sad", mm: "ဝမ်းနည်း", emoji: "😢", hint: "wun-nay" },
        { en: "Angry", mm: "ဒေါ်", emoji: "😠", hint: "daw" },
        { en: "Scared", mm: "ကြောက်", emoji: "😨", hint: "kyaung" },
        { en: "Tired", mm: "ပင်ပန်း", emoji: "😴", hint: "pin-pan" },
        { en: "Hungry", mm: "ဗိုက်ဆာ", emoji: "🍽️", hint: "bite-sa" },
        { en: "Love", mm: "ချစ်", emoji: "❤️", hint: "chit" },
        { en: "Thank you", mm: "ကျေးဇူးတင်ပါတယ်", emoji: "🙏", hint: "kyay-zu tin-ba-de", useEn: "Thank you very much!", useMm: "ကျေးဇူးအများကြီးတင်ပါတယ်!" },
        { en: "Sorry", mm: "ဆောရီး", emoji: "😔", hint: "sorry", useEn: "Sorry, Mum.", useMm: "ဆောရီး အမေ။" },
        { en: "Please", mm: "ကျေးဇူးပြု", emoji: "🙏", hint: "kyay-zu pyu", useEn: "Please help me.", useMm: "ကျေးဇူးပြုပြီး ကူညီပေးပါ။" },
        { en: "Excited", mm: "စိတ်လှုပ်ရှား", emoji: "🤩", hint: "sate-hlote-shwa", useEn: "I am so excited!", useMm: "စိတ်လှုပ်ရှားလိုက်တာ!" }
      ]
    },
    {
      id: "festivals",
      num: 35,
      emoji: "🎆",
      title: "Myanmar Festivals",
      badge: "Festival Fan",
      gameTitle: "Catch Festival Fun",
      story: "Thingyan water festival, lights at Thadingyut, hot air balloons at Tazaungdaing — Myanmar festivals are full of joy and special words.",
      parentPhrase: { en: "Happy Thingyan!", mm: "သင်္ကြန်ပျော်ရွှင်ပါ!" },
      words: [
        { en: "Thingyan", mm: "သင်္ကြန်", emoji: "💦", hint: "thin-jan" },
        { en: "Water", mm: "ရေ", emoji: "💧", hint: "yay" },
        { en: "Pagoda", mm: "ဘုရား", emoji: "🛕", hint: "pha-ya" },
        { en: "Light", mm: "မီး", emoji: "🪔", hint: "mi" },
        { en: "Balloon", mm: "မီးပုံးပျံ", emoji: "🎈", hint: "mi-pone-pyan" },
        { en: "Dance", mm: "က", emoji: "💃", hint: "ka" },
        { en: "Gift", mm: "လက်ဆောင်", emoji: "🎁", hint: "let-saung" },
        { en: "Celebrate", mm: "ပျော်မွေ့", emoji: "🎉", hint: "pyaw-mway", useEn: "Let's celebrate!", useMm: "ပျော်မွေ့ကြရအောင်!" },
        { en: "New Year", mm: "နှစ်သစ်", emoji: "🎊", hint: "hnit-thit", useEn: "Happy New Year!", useMm: "နှစ်သစ်မှ ပျော်ရွှင်ပါ!" },
        { en: "Offering", mm: "ပွဲတော်", emoji: "🙏", hint: "pe-daw", useEn: "We give offerings.", useMm: "ပွဲတော်တင်ကြတယ်။" },
        { en: "Monk", mm: "ရဟန်း", emoji: "🧘", hint: "ya-han", useEn: "The monk blesses us.", useMm: "ရဟန်းက ကျေးဇူးပြုပါတယ်။" }
      ]
    }
  ];

  /* Remove obsolete patch */

  w.MM_CHAPTERS = CHAPTERS;
  w.MM_BOOK = {
    title: "My First 100 Myanmar Words",
    author: "Jimmy Cooper",
    tagline: "Keep your child connected to Myanmar — even while growing up overseas."
  };
})(window);
