#!/usr/bin/env node
/* Build _mmwords-sentence-lines.js — one natural sentence per vocabulary word */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(DIR, "_mmwords-explained-groups.js"), "utf8"), sandbox);
const GROUPS = sandbox.window.MM_EXPLAINED_GROUPS || {};

const SIMPLE =
  /^(This is|These are|That is|Look at|I am |I feel |Let's |Say |One |Two |Three |Four |Five |Six |Seven |Eight |Nine |Ten |The baby is cute|You look |It is okay|Anger goes|Rest when|Do not |Please sit|Please give|Please help|Thank you\.|Sorry\.|Happy Thingyan|Happy New Year|Open your|Close the|Turn on|Wash your|Write with|Use the|Sit on|Go to your|We eat at|Class starts|School is fun|New Year is|Monks visit|Balloons rise at night|Candles shine|We visit the|We pour water at|We play with|We dance together|We celebrate together|Let's celebrate|Let's dance|Let's eat|Gifts make|Anger goes|Do not be|My heart is happy|My teeth are|My hair is long|My hands are|My room is|Our house is|This bread is|This mango is|The egg is|The chair is|The lamp is|The table is|The fish is small|Fish swim|The butterfly is|The monkey climbs|The tiger is|The chicken wakes|The cow gives|The dog runs|The cat sleeps|The elephant is|This is red|This is blue|This is green|This is yellow|This is white|This is black|This is orange|This is pink|This is gold|This is purple|This is soup|This is tea|This is water|This is rice|This is meat|This is an egg|This is bread|These are noodles|This is a mango|This is fish|This is a pagoda|This is a light|This is a balloon|This is a dance|This is a gift|This is Thingyan|This is New Year|This is a monk|This is my |This is our |This is the )/i;

/** Hand-crafted rich lines — varied, story-like, not "This is X" */
const RICH = {
  family: {
    Mother: {
      en: "My mother used to cook rice in the kitchen every morning.",
      mm: "ကျွန်မအမေက မနက်တိုင်း မီးဖိုချောင်မှာ ထမင်းချက်ခဲ့တယ်။"
    },
    Father: {
      en: "My father reads the newspaper on the porch after breakfast.",
      mm: "ကျွန်မအဖေက မနက်စာ စားပြီးရင် ဧရိယာမှာ သတင်းစာဖတ်တယ်။"
    },
    Grandmother: {
      en: "My grandmother tells old village stories before bedtime.",
      mm: "ကျွန်မအဘွားက အိပ်ရာဝင်ခါနီး ကျေးရွာဟောင်းပုံပြင်တွေ ပြောပြတယ်။"
    },
    Grandfather: {
      en: "My grandfather sits with tea and watches the children play.",
      mm: "ကျွန်မအဘိုးက လက်ဖက်ရည်သောက်ရင်း ကလေးတွေ ကစားတာ ကြည့်နေတယ်။"
    },
    Sister: {
      en: "My sister helps me carry water from the well each afternoon.",
      mm: "ကျွန်မညီမက နေ့လည် တိုင်းရေတွင်း ကနေ ရေသယ်ရာ ကျွန်မကို ကူညီပေးတယ်။"
    },
    Brother: {
      en: "My brother plays football with cousins in the dusty yard.",
      mm: "ကျွန်မအစ်ကိုက ဝမ်းကွဲတွေနဲ့ ဖုန်ထမြောက်တဲ့ ဧရိယာမှာ ဘောလုံးကစားတယ်။"
    },
    Baby: {
      en: "The baby laughs when Grandmother shakes a little bell.",
      mm: "ကလေးလေးက အဘွားက ခေါင်းလောင်းလေး လှုပ်ရင် ရယ်မောတယ်။"
    },
    Aunt: {
      en: "My aunt brings sweet rice cakes when she visits from Yangon.",
      mm: "ကျွန်မအဒေါ်က ရန်ကုန်က လာလည်ရင် မုန့်လုံးချိုတွေ ယူလာတယ်။"
    },
    Uncle: {
      en: "My uncle tells funny jokes at every family dinner.",
      mm: "ကျွန်မဦးလေးက မိသားစုညစာ တိုင်း ရယ်စရာကောင်းတဲ့ ပြောစာတွေ ပြောပြတယ်။"
    },
    Cousin: {
      en: "I play hide-and-seek with my cousin until the sun goes down.",
      mm: "နေမဝင်ခင် ကျွန်မဝမ်းကွဲနဲ့ တူတူ ပုန်းတမ်းကစားတယ်။"
    },
    Family: {
      en: "My whole family eats together on a mat every evening.",
      mm: "ကျွန်မမိသားစုလုံး ညနေတိုင်း စောင်းပေါ်မှာ အတူတူ ထမင်းစားကြတယ်။"
    },
    Parents: {
      en: "My parents wake early to prepare rice and tea for everyone.",
      mm: "ကျွန်မမိဘတွေက အားလုံးအတွက် ထမင်းနဲ့ လက်ဖက်ရည် ပြင်ဖို့ စောစောထတယ်။"
    }
  },
  food: {
    Rice: {
      en: "We eat warm rice with soup at the big wooden table.",
      mm: "ကျွန်မတို့ စားပွဲကြီးမှာ ဟင်းရည်နဲ့ ပူပူ ထမင်းစားကြတယ်။"
    },
    Water: {
      en: "I drink cool water from a clay pot when I come home from school.",
      mm: "ကျောင်း ပြန်ရောက်ရင် အိုးကလေးကနေ အေးတဲ့ ရေသောက်တယ်။"
    },
    Soup: {
      en: "Mother stirs hot soup while the rain taps on the roof.",
      mm: "မိုးက အမိုးပေါ် တိုက်ရင် အမေက ဟင်းရည် ပူပူကို မွှေနေတယ်။"
    },
    Tea: {
      en: "We drink sweet tea at the shop and talk about the day.",
      mm: "ကျွန်မတို့ ဆိုင်မှာ လက်ဖက်ရည် သောက်ရင်း နေ့ရဲ့ အကြောင်းတွေ ပြောကြတယ်။"
    },
    Fish: {
      en: "We eat fresh fish from the river for dinner on market day.",
      mm: "ဈေးနေ့ ညနေခင်းမှာ မြစ်ကနေ လတ်တဲ့ ငါးစားကြတယ်။"
    },
    Mango: {
      en: "This ripe mango is so sweet that juice runs down my chin.",
      mm: "ဒီသရက်သီး ရင့်လို့ ချိုတာကြောင့် ရည်စီးကျတယ်။"
    },
    Noodle: {
      en: "Hot noodles steam in the bowl while I wait on a wooden bench.",
      mm: "ခေါက်ဆွဲ ပူပူက ပန်းကန်ထဲ အငွေ့တက်နေတုန်း ကျွန်မ သစ်ခုံပေါ်မှာ စောင့်နေတယ်။"
    },
    Egg: {
      en: "Mother fries an egg in oil and serves it with rice.",
      mm: "အမေက ဆီနဲ့ ဥကြော်ပြီး ထမင်းနဲ့ အတူ ပေးတယ်။"
    },
    Bread: {
      en: "I eat fresh bread with tea before walking to school.",
      mm: "ကျောင်းသွားခင် လက်ဖက်ရည်နဲ့ လတ်တဲ့ ပေါင်မုန့်စားတယ်။"
    },
    Meat: {
      en: "Father cooks meat slowly for guests who arrive at sunset.",
      mm: "နေဝင်ချိန် ဧည့်သည်တွေ ရောက်လာရင် အဖေက အသားကို ဖြည်းဖြည်း ချက်တယ်။"
    }
  },
  animals: {
    Elephant: {
      en: "The elephant walks slowly through the green forest at dawn.",
      mm: "နေမထခင် ဆင်က အစိမ်းတောထဲ ဖြည်းဖြည်း လျှောက်သွားတယ်။"
    },
    Cat: {
      en: "The cat sleeps in a sunny spot on our wooden porch.",
      mm: "ကြောင်က ကျွန်မတို့ သစ်ဧရိယာမှာ နေရောင်ထဲ အိပ်နေတယ်။"
    },
    Dog: {
      en: "Our dog guards the house and barks when strangers pass.",
      mm: "ကျွန်မတို့ ခွေးက အိမ်ကို စောင့်ရှောက်ပြီး မသိတဲ့သူ လျှောက်သွားရင် ဟောင်တယ်။"
    },
    Bird: {
      en: "Birds sing in the tamarind tree every cool morning.",
      mm: "အေးတဲ့ မနက်ခင်းတိုင်း ငှက်တွေ သီးသီးပင်မှာ သီချင်းဆိုတယ်။"
    },
    Fish: {
      en: "Small fish swim in circles in the village pond.",
      mm: "ငါးသေးသေးလေးတွေ ကျေးရွာ ရေကန်ထဲ ဝိုင်းပတ်ပြီး ရေကူးတယ်။"
    },
    Cow: {
      en: "The cow eats grass in the field while farmers work nearby.",
      mm: "တောင်သူတွေ အနီးမှာ အလုပ်လုပ်နေတုန်း နွားက မြက်စားနေတယ်။"
    },
    Chicken: {
      en: "The chicken wakes the whole house before the sun rises.",
      mm: "နေမထခင် ကြက်က အိမ်တစ်အိမ်လုံး နိုးစေတယ်။"
    },
    Tiger: {
      en: "The tiger lives deep in the forest — we only see it in stories.",
      mm: "ကျားက တောအတွင်း နေတယ် — ပုံပြင်ထဲမှာပဲ မြင်ရတယ်။"
    },
    Monkey: {
      en: "The monkey climbs fast and steals a banana from the stall.",
      mm: "မျောက်က မြန်မြန်တက်ပြီး ဆိုင်က ငှက်ပျောသီးကို ခိုးသွားတယ်။"
    },
    Butterfly: {
      en: "A pretty butterfly lands on the flower in our garden.",
      mm: "လိပ်ပြာလှလှလေးက ကျွန်မတို့ ဥယျာဉ်က ပန်းပေါ် ဆင်းသက်တယ်။"
    }
  },
  colors: {
    Red: {
      en: "Red lanterns glow above the street during the festival.",
      mm: "ပွဲတော်မှာ လမ်းပေါ်မှာ အနီရောင် မီးပုံးလေးတွေ တောက်ပနေတယ်။"
    },
    Blue: {
      en: "After the rain, the sky turns a deep blue above the pagoda.",
      mm: "မိုးရပ်ပြီးရင် ဘုရားပေါ်မှာ ကောင်းကင် အပြာရောင် လှလှ ဖြစ်သွားတယ်။"
    },
    Green: {
      en: "Green rice fields stretch far beyond our village road.",
      mm: "အစိမ်းရောင် စပါးခင်းတွေ ကျေးရွာလမ်းကနေ အဝေးအထိ တိုးနေတယ်။"
    },
    Yellow: {
      en: "Yellow mangoes hang heavy on the tree in hot season.",
      mm: "နွေရာသီ မှာ အဝါရောင် သရက်သီးတွေ သစ်ပေါ်မှာ ဝိုင်းနေတယ်။"
    },
    White: {
      en: "White jasmine flowers smell sweet in Grandmother's hair.",
      mm: "အဖြူရောင် စက္ကူမဲ ပန်းတွေ အဘွားဆံပင်မှာ ချိုလှတယ်။"
    },
    Black: {
      en: "Black clouds gather before the monsoon storm arrives.",
      mm: "မိုးကြီး မရောက်ခင် တိမ်မည်းတွေ စုဝေးလာတယ်။"
    },
    Orange: {
      en: "Monks wear orange robes when they walk through our village.",
      mm: "ရဟန်းတွေ ကျေးရွာကို လျှောက်သွားတဲ့အခါ လိမ္မော်ရောင် ဝတ်ကြတယ်။"
    },
    Pink: {
      en: "Pink flowers bloom on the fence when the hot season begins.",
      mm: "နွေရာသီ စတဲ့အခါ ခြံစည်းပေါ်မှာ ပန်းရောင် ပန်းတွေ ပွင့်တယ်။"
    },
    Gold: {
      en: "The pagoda shines gold in the morning sun like a crown.",
      mm: "ဘုရားက မနက်နေရောင်အောက်မှာ သမီးတော်လို ရွှေရောင် တောက်ပနေတယ်။"
    },
    Purple: {
      en: "Purple flowers in the market smell sweet after the rain.",
      mm: "မိုးရပ်ပြီးရင် ဈေးက ခရမ်းရောင် ပန်းတွေ ချိုလှတယ်။"
    }
  },
  numbers: {
    One: {
      en: "Su picks one ripe mango from the tree for her brother.",
      mm: "စူးက အစ်ကိုအတွက် သရက်သီး ရင့်တစ်လုံး ခူးတယ်။"
    },
    Two: {
      en: "Two friends share a cup of tea under the tamarind tree.",
      mm: "သူငယ်ချင်း နှစ်ယောက် သီးသီးပင်အောက် လက်ဖက်ရည် မျှသောက်ကြတယ်။"
    },
    Three: {
      en: "Three monks walk past our house in the quiet morning.",
      mm: "တိတ်တဆိတ်မနက်ခင်းမှာ ရဟန်း သုံးပါး ကျွန်မတို့အိမ်ကို ဖြတ်သွားတယ်။"
    },
    Four: {
      en: "Four chairs wait around the table for visiting guests.",
      mm: "ဧည့်သည်တွေအတွက် ထိုင်ခုံ လေးခု စားပွဲပတ်လည် စောင့်နေတယ်။"
    },
    Five: {
      en: "Su lights five candles for Grandmother on Thadingyut night.",
      mm: "သီတင်းကျွတ်ညမှာ စူးက အဘွားအတွက် ဖယောင်းတိုင် ငါးတိုင်း လင်းစေတယ်။"
    },
    Six: {
      en: "Six eggs sit in the basket that Mother takes to market.",
      mm: "အမေ ဈေးသွားမယ့် ခြင်းထဲမှာ ဥ ခြောက်လုံး ထားရှိတယ်။"
    },
    Seven: {
      en: "There are seven days in one week — Su marks each on her chart.",
      mm: "တစ်ပတ်မှာ ခုနစ်ရက် ရှိတယ် — စူးက chart ပေါ်မှာ တစ်ရက်စီ မှတ်တယ်။"
    },
    Eight: {
      en: "Eight birds rest on the roof while the village still sleeps.",
      mm: "ကျေးရွာ အိပ်နေတုန်း ငှက် ရှစ်ကောင် အမိုးပေါ်မှာ အနားယူနေတယ်။"
    },
    Nine: {
      en: "Su places nine flowers at the pagoda gate as an offering.",
      mm: "စူးက ဘုရားတံခါးမှာ ပန်း ကိုးပွင့် ပွဲတော်အဖြစ် တင်တယ်။"
    },
    Ten: {
      en: "Su counts to ten on her fingers before the school bell rings.",
      mm: "ကျောင်းခေါင်းလောင်း မမြည်ခင် စူးက လက်ချောင်း ဆယ်ချောင်းနဲ့ ရေတွက်တယ်။"
    }
  },
  body: {
    Head: {
      en: "Su bows her head gently when she greets Grandmother.",
      mm: "စူးက အဘွားကို နှုတ်ဆက်တဲ့အခါ ခေါင်းကို ညွတ်ညွတ်လေး ညွတ်တယ်။"
    },
    Eye: {
      en: "Su opens her eyes wide to watch the festival parade.",
      mm: "စူးက ပွဲတော်လှည့်လည် ကြည့်ဖို့ မျက်လုံးကို ချဲ့ဖွင့်တယ်။"
    },
    Ear: {
      en: "Su listens with both ears when the teacher reads a story.",
      mm: "ဆရာမက ပုံပြင်ဖတ်ပြတဲ့အခါ စူးက နားနှစ်ဖက်နဲ့ နားထောင်တယ်။"
    },
    Nose: {
      en: "Su smells jasmine flowers with her nose in the cool evening air.",
      mm: "ညနေခင်း လေအေးထဲမှာ စူးက နှာခေါင်းနဲ့ စက္ကူမဲပန်းကို အနံ့ခံကြည့်တယ်။"
    },
    Mouth: {
      en: "Su speaks kind words with her mouth at the family table.",
      mm: "စူးက မိသားစုစားပွဲမှာ ပါးစပ်နဲ့ ကောင်းကောင်း စကားပြောတယ်။"
    },
    Hand: {
      en: "Su washes her hands with soap before every meal.",
      mm: "စူးက ထမင်းစားခင် ဆပ်ပြာနဲ့ လက်ကို ဆေးတယ်။"
    },
    Foot: {
      en: "Su walks slowly on bare feet across the cool courtyard stones.",
      mm: "စူးက အေးတဲ့ ဧရိယာကျောက်ပေါ် ချာချာလျှောက်သွားတယ်။"
    },
    Heart: {
      en: "Su's heart beats fast when she sees the golden pagoda.",
      mm: "ရွှေရောင် ဘုရားကို မြင်တဲ့အခါ စူးရဲ့ နှလုံးက မြန်မြန်ခုန်တယ်။"
    },
    Hair: {
      en: "Grandmother braids Su's long hair before school each morning.",
      mm: "မနက်တိုင်း ကျောင်းမသွားခင် အဘွားက စူးရဲ့ ဆံပင်ရှည်ကို စည်းပေးတယ်။"
    },
    Teeth: {
      en: "Su brushes her teeth clean after eating sweet mango.",
      mm: "သရက်သီး ချိုစားပြီးရင် စူးက သွားကို သန့်ရှင်းအောင် တိုက်တယ်။"
    }
  },
  home: {
    House: {
      en: "Guests are always welcome at our house near the pagoda road.",
      mm: "ဘုရားလမ်းနားက ကျွန်မတို့ အိမ်မှာ ဧည့်သည်တွေ အမြဲ ကြိုဆိုပါတယ်။"
    },
    Room: {
      en: "Su keeps her room tidy so books and pencils have a place.",
      mm: "စူးက စာအုပ်နဲ့ ခဲတံတွေ နေရာရှိအောင် အခန်းကို သန့်ရှင်းထားတယ်။"
    },
    Door: {
      en: "Su opens the door wide when guests bring food to share.",
      mm: "ဧည့်သည်တွေ အစားအစာ ယူလာရင် စူးက တံခါးကို ကျယ်ကျယ် ဖွင့်ပေးတယ်။"
    },
    Window: {
      en: "Cool air drifts through the window after the afternoon rain.",
      mm: "နေ့လည်ခင်း မိုးရပ်ပြီးရင် အေးတဲ့လေ ပြတင်းပေါက်ကနေ ဝင်လာတယ်။"
    },
    Bed: {
      en: "Su reads one more page in bed before the lamp goes out.",
      mm: "မီးမပိတ်ခင် စူးက အိပ်ရာပေါ်မှာ စာမျက်နှာ တစ်မျက်နှာ ထပ်ဖတ်တယ်။"
    },
    Chair: {
      en: "Grandfather pulls up a chair and tells stories by the lamp.",
      mm: "အဘိုးက ထိုင်ခုံ ဆွဲပြီး မီးအောက်မှာ ပုံပြင်ပြောပြတယ်။"
    },
    Table: {
      en: "The whole family gathers around the table when rice is ready.",
      mm: "ထမင်း ပြင်ပြီးရင် မိသားစုလုံး စားပွဲပတ်လည် စုဝေးကြတယ်။"
    },
    Lamp: {
      en: "Su turns on the lamp when dark clouds cover the village.",
      mm: "တိမ်မည်းတွေ ကျေးရွာကို ဖုံးလာရင် စူးက မီးဖွင့်တယ်။"
    },
    Kitchen: {
      en: "The kitchen smells of garlic and ginger while Mother cooks soup.",
      mm: "အမေ ဟင်းရည် ချက်နေတုန်း မီးဖိုချောင်မှာ ကြက်သွန်နဲ့ ချင်းအနံ့ တက်တယ်။"
    },
    Bathroom: {
      en: "Su washes her face in the bathroom before the school bell.",
      mm: "ကျောင်းခေါင်းလောင်း မမြည်ခင် စူးက ရေချိုးခန်းမှာ မျက်နှာ သန့်ရှင်းတယ်။"
    }
  },
  school: {
    School: {
      en: "Su walks to school with her bag while roosters still crow.",
      mm: "ကြက်မနိုးခင် စူးက အိတ်နဲ့ ကျောင်းသွားတယ်။"
    },
    Teacher: {
      en: "Su thanks her teacher after reading aloud to the class.",
      mm: "စာသင်ခန်းမှာ အသံထွက်ဖတ်ပြီးရင် စူးက ဆရာမကို ကျေးဇူးတင်တယ်။"
    },
    Book: {
      en: "Su opens her book and follows the story line by line.",
      mm: "စူးက စာအုပ်ဖွင့်ပြီး ပုံပြင်ကို စာကြောင်း တစ်ကြောင်းစီ လိုက်ဖတ်တယ်။"
    },
    Pencil: {
      en: "Su writes her name carefully with a short pencil.",
      mm: "စူးက ခဲတံတိုလေးနဲ့ နာမည် ဂရုစိုက်ပြီး ရေးတယ်။"
    },
    Bag: {
      en: "Su packs her bag the night before so nothing is forgotten.",
      mm: "စူးက ညဘက် အိတ်ကို ပြင်ဆင်ထားတယ် — ဘာမှ မမေ့အောင်။"
    },
    Friend: {
      en: "Su's friend shares a pencil when hers breaks during class.",
      mm: "စာသင်ခန်းမှာ ခဲတံ ကျိုးသွားရင် သူငယ်ချင်းက ခဲတံ မျှသုံးပေးတယ်။"
    },
    Class: {
      en: "The class grows quiet when the teacher opens a new lesson.",
      mm: "ဆရာမက သင်ခန်းစာအသစ် ဖွင့်တဲ့အခါ စာသင်ခန်း တိတ်သွားတယ်။"
    },
    Homework: {
      en: "Su finishes her homework at the table before helping in the kitchen.",
      mm: "မီးဖိုချောင်မှာ မကူညီခင် စူးက စားပွဲပေါ်မှာ အိမ်စာ ပြီးအောင်လုပ်တယ်။"
    },
    Pen: {
      en: "Su writes neat lines with her pen in the exercise book.",
      mm: "စူးက ဘောပင်နဲ့ လေ့ကျင့်ခန်းစာအုပ်မှာ စာကြောင်း ရှင်းရှင်းလင်း ရေးတယ်။"
    },
    Eraser: {
      en: "Su uses a soft eraser when she makes a small mistake.",
      mm: "အမှား နည်းနည်းလုပ်မိရင် စူးက ခဲဖျက် နူးညံ့လေးသုံးတယ်။"
    }
  },
  feelings: {
    Happy: {
      en: "Su feels happy when the whole family laughs at Uncle's jokes.",
      mm: "မိသားစုလုံး ဦးလေးရဲ့ ပြောစာတွေကို ရယ်ရင် စူးက ပျော်ရွှင်တယ်။"
    },
    Sad: {
      en: "Su feels a little sad when her cousin leaves after the festival.",
      mm: "ပွဲတော် ပြီးရင် ဝမ်းကွဲ ပြန်သွားတဲ့အခါ စူးက နည်းနည်း ဝမ်းနည်းတယ်။"
    },
    Angry: {
      en: "Su takes a deep breath when she feels angry and counts to three.",
      mm: "ဒေါ်တဲ့အခါ စူးက အသက်ရှူအကြိမ်ကြိမ် လုပ်ပြီး သုံးအထိ ရေတွက်တယ်။"
    },
    Scared: {
      en: "Su feels scared during the storm until Mother holds her hand.",
      mm: "မိုးကြီး ရွာတဲ့အခါ အမေ လက်ကို ကိုင်ပေးမှ စူးက ကြောက်မှုနည်းသွားတယ်။"
    },
    Tired: {
      en: "Su feels tired after dancing all day at the village festival.",
      mm: "ကျေးရွာ ပွဲတော်မှာ တစ်နေ့လုံး ကပြီးရင် စူးက ပင်ပန်းတယ်။"
    },
    Hungry: {
      en: "Su feels hungry when she smells rice cooking in the kitchen.",
      mm: "မီးဖိုချောင်မှာ ထမင်းချက်နေတဲ့အနံ့ကို ရတဲ့အခါ စူးက ဗိုက်ဆာတယ်။"
    },
    Love: {
      en: "Su whispers that she loves Grandmother under the festival lights.",
      mm: "ပွဲတော်မီးအောက်မှာ စူးက အဘွားကို ချစ်တယ်လို့ တိုးတိုးပြောတယ်။"
    },
    "Thank you": {
      en: "Su says thank you very much when Aunt brings sweet cakes.",
      mm: "အဒေါ်က မုန့်လုံးချို ယူလာရင် စူးက ကျေးဇူးအများကြီး တင်တယ်။"
    },
    Sorry: {
      en: "Su says sorry to her sister after they bump at the doorway.",
      mm: "တံခါးနားမှာ ညီမနဲ့ တိုက်မိရင် စူးက တောင်းပန်ပါတယ်။"
    },
    Please: {
      en: "Su says please when she asks Mother for help with homework.",
      mm: "အိမ်စာ ကူညီဖို့ အမေကို မေးတဲ့အခါ စူးက ကျေးဇူးပြုပြီး ပြောတယ်။"
    }
  },
  festivals: {
    Thingyan: {
      en: "During Thingyan, Su splashes water with friends in the sunny street.",
      mm: "သင်္ကြန်မှာ စူးက နေရောင်ထဲ လမ်းပေါ်မှာ သူငယ်ချင်းတွေနဲ့ ရေလောင်းကြတယ်။"
    },
    Water: {
      en: "Scented water brings laughter when friends pour it with joy.",
      mm: "သူငယ်ချင်းတွေ ပျော်ရွှင်စွာ ရေလောင်းရင် မွှေးကြိုင်တဲ့ ရေနဲ့ ရယ်မောကြတယ်။"
    },
    Pagoda: {
      en: "Families visit the pagoda together on the full-moon festival night.",
      mm: "လပြည့်ပွဲတော် ညမှာ မိသားစုတွေ အတူတူ ဘုရားကို သွားကြတယ်။"
    },
    Light: {
      en: "Candles and lamps shine along every path on Thadingyut evening.",
      mm: "သီတင်းကျွတ်ညနေခင်းမှာ လမ်းတိုင်း ဖယောင်းတိုင်နဲ့ မီးလင်းတွေ တောက်ပနေတယ်။"
    },
    Balloon: {
      en: "Paper balloons rise over the hills while children cheer below.",
      mm: "ကလေးတွေ အောက်မှာ အော်ဟစ်နေတုန်း မီးပုံးပျံတွေ တောင်တန်းပေါ် ပျံသွားတယ်။"
    },
    Dance: {
      en: "Villagers dance together in a circle when the drums begin to play.",
      mm: "စည်သံ မြည်တဲ့အခါ ကျေးသူတွေ ဝိုင်းပတ်ပြီး အတူတူ ကပြကြတယ်။"
    },
    Gift: {
      en: "Su gives a small gift to Grandmother with both hands and a bow.",
      mm: "စူးက လက်နှစ်ဖက် ညွတ်ပြီး အဘွားကို လက်ဆောင်လေး ပေးတယ်။"
    },
    Celebrate: {
      en: "The whole village celebrates together when the New Year finally arrives.",
      mm: "နှစ်သစ်ကူး ရောက်တဲ့အခါ ကျေးရွာတစ်ရွာ အတူတူ ပျော်ကြတယ်။"
    },
    "New Year": {
      en: "Happy New Year — Su wishes peace for every house on her street.",
      mm: "နှစ်သစ်ကူး ပျော်ပါစေ — စူးက သူ့လမ်းပေါ်က အိမ်တိုင်း ငြိမ်းချမ်းဖို့ ဆုတောင်းတယ်။"
    },
    Monk: {
      en: "Monks walk through the village and bless the families at dawn.",
      mm: "နေမထခင် ရဟန်းတွေ ကျေးရွာကို လျှောက်သွားပြီး မိသားစုတွေကို ကောင်းချီးပေးတယ်။"
    }
  }
};

function pickFallback(group) {
  const pool = (group.sentences || []).filter((s) => s.en && s.mm && !SIMPLE.test(s.en.trim()));
  if (pool.length) return pool.sort((a, b) => b.en.length - a.en.length)[0];
  const last = group.sentences && group.sentences[group.sentences.length - 1];
  return last || { en: "", mm: "" };
}

const out = {};
for (const [chId, groups] of Object.entries(GROUPS)) {
  out[chId] = {};
  for (const group of groups) {
    const rich = RICH[chId] && RICH[chId][group.title];
    out[chId][group.title] = rich || pickFallback(group);
  }
}

const js = `/* One natural sentence per word — used on Sentences pages */
(function (w) {
  w.MM_SENTENCE_LINES = ${JSON.stringify(out, null, 4)};
})(window);
`;

fs.writeFileSync(path.join(DIR, "_mmwords-sentence-lines.js"), js);
console.log("Wrote _mmwords-sentence-lines.js —", Object.values(out).reduce((n, c) => n + Object.keys(c).length, 0), "lines");
