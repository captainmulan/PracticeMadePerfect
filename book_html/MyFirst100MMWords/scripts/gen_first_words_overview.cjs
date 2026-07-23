#!/usr/bin/env node
/* Embed first-words hero PNG in 005 — standalone like Solar System textures */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..");
const SRC = path.join(DIR, "assets", "first-words-hero.png");
const OUT = path.join(DIR, "005-First-Words-Overview.html");

if (!fs.existsSync(SRC)) {
  console.error("Missing:", SRC);
  process.exit(1);
}

const b64 = fs.readFileSync(SRC).toString("base64");
const uri = "data:image/png;base64," + b64;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My First 100 Myanmar Words - First Words Overview</title>
<style>
:root{--bg:#F0F4F8;--surface:#FFFFFF;--primary:#1865F2;--text:#1B2838;--text-muted:#5F6B7A;--border:#E2E8F0;--mm:#0D47A1;--shadow:0 2px 8px rgba(27,40,56,.08);--shadow-lg:0 8px 24px rgba(27,40,56,.12);--radius:16px;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Myanmar Text',Padauk,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.5;}
.container{max-width:680px;margin:0 auto;padding:0 0 40px;}
.top-bar{background:var(--surface);padding:20px 20px 16px;border-bottom:1px solid var(--border);box-shadow:var(--shadow);}
.top-bar h1{font-size:22px;font-weight:700;margin-bottom:4px;}
.top-bar .subtitle{font-size:14px;color:var(--text-muted);}
.hero-wrap{padding:0 16px 8px;}
.hero-card{position:relative;width:100%;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface);box-shadow:var(--shadow-lg);overflow:hidden;margin-top:16px;}
.hero-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;}
.scroll-cue{text-align:center;font-size:13px;color:var(--text-muted);padding:10px 0 4px;}
.section{padding:20px;}
.card{background:var(--surface);border-radius:var(--radius);padding:18px;margin-bottom:16px;border:1px solid var(--border);box-shadow:var(--shadow);}
.card h2{font-size:17px;font-weight:700;margin-bottom:10px;}
.card p{font-size:15px;line-height:1.65;color:var(--text-muted);}
.story-box{background:#F8FAFC;border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.65;color:var(--text);border-left:3px solid var(--primary);}
.heritage-card{background:linear-gradient(135deg,#FFFBEB 0%,#FEF3C7 100%);border:1px solid #FDE68A;}
.heritage-card h2{color:#92400E;}
.heritage-card p{color:#78350F;}
.heritage-tag{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#B45309;margin-bottom:8px;}
.hero-word-card{max-width:320px;margin:12px auto;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:var(--surface);box-shadow:var(--shadow);}
.word-card-top{background:#F8FAFC;padding:14px 10px 10px;text-align:center;}
.word-emoji{font-size:56px;line-height:1.1;}
.word-bridge{display:flex;align-items:stretch;}
.speak-btn{flex:1;border:none;padding:12px 8px 14px;cursor:pointer;font-family:inherit;transition:transform .12s;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:88px;}
.speak-btn:active,.speak-btn.pressed{transform:scale(.96);}
.speak-btn-en{background:#EEF2FF;color:var(--primary);border-right:1px solid var(--border);}
.speak-btn-mm{background:#ECFDF5;color:#047857;}
.speak-flag{font-size:20px;}
.speak-label{font-size:10px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;opacity:.75;}
.speak-text-en{font-size:15px;font-weight:bold;}
.speak-text-mm{font-size:18px;font-weight:bold;font-family:'Myanmar Text',Padauk,sans-serif;color:var(--mm);}
.speak-icon{font-size:14px;opacity:.85;}
.legend{display:flex;justify-content:center;gap:16px;margin-bottom:10px;font-size:13px;color:var(--text-muted);}
.topic-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;}
.topic-pill{background:#EEF2FF;padding:10px;border-radius:12px;text-align:center;font-size:14px;font-weight:600;color:var(--primary);}
.nav-hint{margin:0 16px;padding:14px;text-align:center;font-size:12px;color:var(--text-muted);background:var(--surface);border-radius:12px;border:1px solid var(--border);}
</style>
<script src="_mmwords-player.js"></script>
</head>
<body>
<div class="container">
  <div class="top-bar">
    <h1>🍎 Your First 100 Words</h1>
    <div class="subtitle">Two buttons on every card — English &amp; Myanmar</div>
  </div>

  <div class="hero-wrap">
    <div class="hero-card">
      <img class="hero-img" src="${uri}" alt="Aye's family learning first Myanmar words — apple, rice, elephant flashcards at home" width="800" height="450" decoding="async">
    </div>
    <p class="scroll-cue">↑ Aye learns her first words at home · scroll for the story</p>
  </div>

  <div class="section">
    <div class="card heritage-card">
      <span class="heritage-tag">🇲🇲 Myanmar story</span>
      <h2>The three flashcards on the table</h2>
      <p>Every Myanmar home has a quiet moment like this. Mum spreads three cards — <em>ပန်းသီး</em>, <em>ထမင်း</em>, <em>ဆင်</em> — and asks, "Which one do you eat every day?" Through the window, Shwedagon glows like a memory. Overseas or in Yangon, parents teach the same way: one word, one smile, one story at a time.</p>
    </div>

    <div class="card">
      <h2>📖 Aye's story</h2>
      <div class="story-box">After school in Singapore, Aye runs to the kitchen where Mum has laid out three flashcards. "Apple!" she shouts in English. Mum taps the card and whispers, "ပန်းသီး — pan-thee." Aye tries again, softer. Dad pours sweet tea and adds, "And this one?" — pointing at the elephant. Aye giggles: "That's not food, Daddy!" But she remembers every word. That night she video-calls Grandma in Yangon and says, "အဘွား… ပန်းသီး!" Grandma claps so loud the whole family hears.</div>
    </div>

    <div class="card">
      <h2>🌉 Example Word Card</h2>
      <div class="legend"><span>🇬🇧 Hear English</span><span>🇲🇲 Hear Myanmar</span></div>
      <div class="hero-word-card word-card" data-en="Apple" data-mm="ပန်းသီး" data-hint="pan-thee">
        <div class="word-card-top"><div class="word-emoji">🍎</div></div>
        <div class="word-bridge">
          <button type="button" class="speak-btn speak-btn-en" onclick="tapEn(this,'demo')">
            <span class="speak-flag">🇬🇧</span>
            <span class="speak-label">English</span>
            <span class="speak-text-en">Apple</span>
            <span class="speak-icon">🔊</span>
          </button>
          <button type="button" class="speak-btn speak-btn-mm" onclick="tapMm(this,'demo')">
            <span class="speak-flag">🇲🇲</span>
            <span class="speak-label">Myanmar</span>
            <span class="speak-text-mm">ပန်းသီး</span>
            <span class="speak-icon">🔊</span>
          </button>
        </div>
      </div>
      <p style="text-align:center;font-size:13px;color:var(--text-muted);margin-top:12px;">🎮 Catch game in Food chapter · 🏆 Fruit Master badge</p>
    </div>

    <div class="card">
      <h2>📂 10 Chapters</h2>
      <div class="topic-grid">
        <div class="topic-pill">👨‍👩‍👧 Family</div>
        <div class="topic-pill">🍚 Food</div>
        <div class="topic-pill">🐘 Animals</div>
        <div class="topic-pill">🎨 Colors</div>
        <div class="topic-pill">🔢 Numbers</div>
        <div class="topic-pill">👂 Body</div>
        <div class="topic-pill">🏠 Home</div>
        <div class="topic-pill">🎒 School</div>
        <div class="topic-pill">😊 Feelings</div>
        <div class="topic-pill">🎆 Festivals</div>
      </div>
    </div>

    <div class="card">
      <h2>✨ Each Chapter Includes</h2>
      <p>📖 Mini story · 🇬🇧/🇲🇲 dual speak buttons · 🎮 Catch game · 👨‍👩‍👧 Parent phrase card</p>
    </div>
  </div>

  <div class="nav-hint">Parents in Singapore, Malaysia, Australia, UK, US — this book is for you.</div>
</div>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log("Wrote", path.basename(OUT), "(" + (fs.statSync(OUT).size / 1024 / 1024).toFixed(2) + " MB)");
