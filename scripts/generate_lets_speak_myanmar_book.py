from pathlib import Path

book_dir = Path(r"C:\JC\Aung\Other\Dream\MagicLibrary\Let's Speak Myanmar")
book_dir.mkdir(parents=True, exist_ok=True)

pages = [
    ('001', 'Book-Briefing', 'Welcome to Grandma\'s Village', 'briefing'),
    ('002', 'Index', 'Mission Map', 'index'),
    ('003', 'Character-Selection', 'Choose Su', 'selection'),
    ('004', 'Intro-Village-Tour', 'Meet the village', 'intro'),

    ('005', 'Grandmas-House', 'Mission: Help Grandma', 'mission'),
    ('006', 'Grandmas-House-Explained', 'Myanmar phrases to meet Grandma', 'explained'),
    ('007', 'Grandmas-House-Quiz', 'Review Grandma mission', 'quiz'),

    ('008', 'Tea-Shop', 'Mission: Serve tea', 'mission'),
    ('009', 'Tea-Shop-Explained', 'Tea Shop chat phrases', 'explained'),
    ('010', 'Tea-Shop-Quiz', 'Review Tea Shop mission', 'quiz'),

    ('011', 'Market', 'Mission: Find groceries', 'mission'),
    ('012', 'Market-Explained', 'Market conversation phrases', 'explained'),
    ('013', 'Market-Quiz', 'Review Market mission', 'quiz'),

    ('014', 'Playground', 'Mission: Play with friends', 'mission'),
    ('015', 'Playground-Explained', 'Playground phrases', 'explained'),
    ('016', 'Playground-Quiz', 'Review Playground mission', 'quiz'),

    ('017', 'School', 'Mission: Bring books to class', 'mission'),
    ('018', 'School-Explained', 'School greetings and thanks', 'explained'),
    ('019', 'School-Quiz', 'Review School mission', 'quiz'),

    ('020', 'Pagoda', 'Mission: Visit the Pagoda', 'mission'),
    ('021', 'Pagoda-Explained', 'Pagoda manners', 'explained'),
    ('022', 'Pagoda-Quiz', 'Review Pagoda mission', 'quiz'),

    ('023', 'Festival', 'Mission: Festival preparations', 'mission'),
    ('024', 'Festival-Explained', 'Festival phrases', 'explained'),
    ('025', 'Festival-Quiz', 'Review Festival mission', 'quiz'),

    ('026', 'Village-Celebration', 'Mission: Celebrate with the village', 'mission'),
    ('027', 'Village-Celebration-Explained', 'The ending journey', 'explained'),
    ('028', 'Village-Celebration-Quiz', 'Final review', 'quiz'),
    ('029', 'Congratulations', 'Su has brought the village to life', 'conclusion'),
]

css = '''*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,system-ui,Arial,sans-serif;background:#fbf3e9;color:#2d1f14;min-height:100vh;line-height:1.6}a{color:#8a563d;text-decoration:none}img{max-width:100%;height:auto;display:block}button,input,select{font:inherit}
.page{max-width:920px;margin:0 auto;padding:22px 18px 40px}header{margin-bottom:24px}
.title{font-size:clamp(2rem,3.5vw,3.4rem);margin-bottom:10px;line-height:1.03}
.subtitle{font-size:1.05rem;color:#6f4c33;margin-bottom:18px}
.nav{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}
.nav a{background:#ffe4c4;color:#6f4c33;padding:10px 14px;border-radius:999px;border:1px solid #f1c7a0}
.section{background:#fff7ef;border:1px solid #f0d3b4;border-radius:22px;padding:20px;margin-bottom:18px}
.section h2{margin-bottom:12px;color:#8a563d}
.section p{margin-bottom:12px}
.badge{display:inline-flex;align-items:center;gap:8px;background:#ffe7c3;color:#7e4f26;padding:8px 12px;border-radius:999px;font-size:.95rem}
.grid{display:grid;gap:14px}
.card{background:#fff1e6;border:1px solid #f2d8c0;border-radius:18px;padding:18px}
.card strong{color:#8a563d}
.list{margin:0;padding-left:1.25rem}
.sticky{position:sticky;top:0;background:#fbf3e9;padding:18px 0 12px;z-index:5}
.button-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px}
.button{border:none;background:#d68956;color:#fff;padding:12px 18px;border-radius:999px;cursor:pointer;transition:transform .2s,filter .2s}
.button:hover{transform:translateY(-1px);filter:brightness(1.05)}
.button.secondary{background:#f6d8b7;color:#6b452c}
.button.outline{background:transparent;color:#8a563d;border:1px solid #f1c7a0}
.hidden{display:none !important}
.status-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:#fff1e6;border:1px solid #f2d8c0;color:#7e4f26;font-weight:700}
.phrase-list{display:grid;gap:12px;margin-top:14px}
.phrase-item{padding:14px 16px;background:#fff5e8;border:1px solid #f0d3b4;border-radius:18px}
.phrase-item button{margin-top:10px;background:#8a563d;color:#fff;padding:10px 12px;border:none;border-radius:999px;cursor:pointer}
.game-panel{display:grid;gap:14px;margin-top:16px}
.game-option{padding:14px 16px;border-radius:18px;border:1px solid #f1c7a0;background:#fff6eb;cursor:pointer}
.game-option.correct{border-color:#67a34c;background:#d4f5d1}
.game-option.wrong{border-color:#d97706;background:#fdd9b5}
.alert{padding:14px 16px;background:#fff3d6;border:1px solid #f7d08a;border-radius:18px;margin-top:12px;color:#7b4b24}
''' 

shared_js = '''const BOOK_STATE_KEY = 'my-myanmar-adventure-state';
const pageState = JSON.parse(localStorage.getItem(BOOK_STATE_KEY) || '{}');
const defaultState = { userName:'Su', character:'👧', completed:[], coins:0 };
const state = Object.assign({}, defaultState, pageState);

function saveState(){ localStorage.setItem(BOOK_STATE_KEY, JSON.stringify(state)); }
function speak(text){ if(!window.speechSynthesis)return; const utter = new SpeechSynthesisUtterance(text); utter.lang='en-US'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); }
function setCharacter(name, emoji){ state.userName=name||'Su'; state.character=emoji||'👧'; saveState(); }
function completeMission(id, reward){ if(state.completed.includes(id)) return; state.completed.push(id); state.coins += reward||10; saveState(); renderProgress(); document.dispatchEvent(new CustomEvent('missionCompleted', {detail:{id}})); }
function renderProgress(){ const el = document.getElementById('progressSummary'); if(!el)return; const completed = state.completed.length; const total = 7; const percent = Math.round((completed/total)*100); el.innerHTML = `<div class='section'><h2>Adventure progress</h2><p><strong>${state.userName}</strong> has completed <strong>${completed}</strong> of <strong>${total}</strong> missions and earned <strong>${state.coins}</strong> coins.</p><div class='status-pill'>${percent}% village alive</div></div>`; }
function attachPhraseButtons(){ document.querySelectorAll('[data-phrase]').forEach(btn=>{ btn.addEventListener('click', ()=> speak(btn.dataset.phrase)); }); }
function attachMissionGame(){ const missionId = document.body.datasetMissionId; if(!missionId) return; const status = document.getElementById('missionStatus'); if(status){ const done = state.completed.includes(missionId); status.textContent = done ? 'Completed' : 'Incomplete'; status.className = 'status-pill'; }
 document.querySelectorAll('.complete-mission').forEach(btn=>{ btn.addEventListener('click', ()=>{ const reward = Number(btn.datasetReward||10); completeMission(missionId, reward); updateMissionPage(); btn.textContent = 'Mission completed'; btn.disabled = true; }); });
 document.querySelectorAll('.game-option').forEach(opt=>{ opt.addEventListener('click', ()=>{ const correct = opt.datasetCorrect === 'true'; document.querySelectorAll('.game-option').forEach(item=>item.classList.add('disabled')); if(correct){ opt.classList.add('correct'); opt.insertAdjacentHTML('afterend','<div class="alert">Nice! You completed the mission. Tap Complete Mission to earn coins.</div>'); } else { opt.classList.add('wrong'); opt.insertAdjacentHTML('afterend','<div class="alert">Oops! Try the other choice.</div>'); } }); }); }
function updateMissionPage(){ const missionId = document.body.datasetMissionId; if(!missionId) return; const unlockedEl = document.getElementById('missionUnlocked'); const lockedEl = document.getElementById('missionLocked'); const done = state.completed.includes(missionId); if(unlockedEl){ unlockedEl.classList.toggle('hidden', false); } if(lockedEl){ lockedEl.classList.toggle('hidden', false); }
 const currentIndex = missionOrder.indexOf(missionId); const prevMission = missionOrder[currentIndex-1]; const nextMission = missionOrder[currentIndex+1]; const allowed = currentIndex===0 || state.completed.includes(prevMission);
 if(!allowed){ if(unlockedEl) unlockedEl.classList.add('hidden'); if(lockedEl) lockedEl.classList.remove('hidden'); document.querySelectorAll('.complete-mission').forEach(btn=> btn.disabled=true); }
 if(done){ if(unlockedEl) unlockedEl.classList.add('hidden'); if(lockedEl) lockedEl.classList.remove('hidden'); document.querySelectorAll('.complete-mission').forEach(btn=>{ btn.disabled=true; btn.textContent='Completed';}); }
}
const missionOrder=['Grandmas-House','Tea-Shop','Market','Playground','School','Pagoda','Festival','Village-Celebration'];
window.addEventListener('DOMContentLoaded', ()=>{ renderProgress(); attachPhraseButtons(); attachMissionGame(); if(document.body.datasetPageType==='selection'){ const form=document.getElementById('characterForm'); if(form){ form.addEventListener('submit', e=>{ e.preventDefault(); const name=document.getElementById('playerName').value.trim()||'Su'; const emoji=document.querySelector('input[name="character"]:checked')?.value||'👧'; setCharacter(name, emoji); window.location.href='004-Intro-Village-Tour.html'; } ); } }
 const charName = document.getElementById('playerName'); if(charName) charName.value = state.userName;
 const chosen = document.querySelector(`input[name="character"][value="${state.character}"]`); if(chosen) chosen.checked=true;
});'''


def page_template(title, subtitle, body_html, page_type, mission_id=''):
    data_attrs = ''
    if page_type:
        data_attrs += f' data-page-type="{page_type}"'
    if mission_id:
        data_attrs += f' data-mission-id="{mission_id}"'
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link rel="stylesheet" href="book.css">
</head>
<body{data_attrs}>
  <div class="page">
    <header>
      <div class="badge">My Myanmar Adventure</div>
      <h1 class="title">{title}</h1>
      <div class="subtitle">{subtitle}</div>
    </header>
    {body_html}
  </div>
  <script src="_shared.js"></script>
</body>
</html>'''


def render_nav(index):
    links = []
    if index > 0:
        prev_num, prev_slug, prev_title, _ = pages[index - 1]
        links.append(f'<a href="{prev_num}-{prev_slug}.html">← {prev_title}</a>')
    links.append('<a href="002-Index.html">🏠 Home</a>')
    if index + 1 < len(pages):
        next_num, next_slug, next_title, _ = pages[index + 1]
        links.append(f'<a href="{next_num}-{next_slug}.html">{next_title} →</a>')
    return '<div class="nav">' + ''.join(links) + '</div>'


def write_page(num, slug, title, subtitle, body_html, page_type, mission_id=''):
    page_path = book_dir / f'{num}-{slug}.html'
    content = page_template(title, subtitle, body_html, page_type, mission_id)
    page_path.write_text(content, encoding='utf-8')


def write_assets():
    (book_dir / 'book.css').write_text(css, encoding='utf-8')
    (book_dir / '_shared.js').write_text(shared_js, encoding='utf-8')


intro_text = '''<div class="section"><h2>Story</h2><p>Su has grown up overseas and is visiting Myanmar for the first holiday. Grandma says, "Let's visit everyone in our village!" The player explores a small village scene, unlocks one location at a time, and learns phrases by completing missions.</p></div>
<div class="section"><h2>How to play</h2><ul class="list"><li>Travel from Grandma's house to the Tea Shop, Market, Playground, School, Pagoda, and Festival.</li><li>Each mission teaches useful Myanmar phrases through conversations and mini games.</li><li>Finish missions to change the village and make it feel alive.</li></ul></div>'''

readme_lines = [
    '# My Myanmar Adventure',
    '',
    'A mission-driven language RPG where Su brings her village to life by speaking Myanmar.',
    '',
    '## Folder structure',
    '',
    'This book follows the standalone Magic Library HTML book format. Pages are numbered and loaded in order, with a briefing, index, character selection, mission scenes, explained phrase pages, quiz pages, and a celebration ending.',
    '',
    '## Missions',
    '',
    '- Grandma\'s House',
    '- Tea Shop',
    '- Market',
    '- Playground',
    '- School',
    '- Pagoda',
    '- Festival',
    '- Village Celebration',
    '',
    '## Pages',
    '',
]

for idx, (num, slug, title, page_type) in enumerate(pages):
    body = ''
    mission_id = ''
    if num == '001':
        body = intro_text
    elif num == '002':
        cards = []
        for n, s, t, _ in pages:
            cards.append(f'<div class="card"><strong>{n}. {t}</strong><p>{s}</p></div>')
        body = '<div id="progressSummary"></div><div class="grid">' + ''.join(cards) + '</div>'
    elif num == '003':
        body = '''<div class="section"><h2>Create Su</h2><p>Enter Su's nickname, pick her favorite animal, and get ready to meet the village.</p>
<form id="characterForm"><div class="section"><label for="playerName">Your name</label><input id="playerName" name="playerName" type="text" placeholder="Su" style="width:100%;margin-top:8px;padding:12px;border:1px solid #f1c7a0;border-radius:14px;background:#fff7ef;"></div>
<div class="section"><h2>Choose an avatar</h2><div class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr));"><label class="card"><input type="radio" name="character" value="👧" checked style="display:none"><div style="font-size:3rem;text-align:center;">👧</div><div style="text-align:center;margin-top:10px;font-weight:700">Su</div></label><label class="card"><input type="radio" name="character" value="🐯" style="display:none"><div style="font-size:3rem;text-align:center;">🐯</div><div style="text-align:center;margin-top:10px;font-weight:700">Tiger</div></label><label class="card"><input type="radio" name="character" value="🦋" style="display:none"><div style="font-size:3rem;text-align:center;">🦋</div><div style="text-align:center;margin-top:10px;font-weight:700">Butterfly</div></label></div></div>
<div class="button-row"><button class="button" type="submit">Start the adventure</button></div>
</form></div>'''
    elif num == '004':
        body = '<div class="section"><h2>Mission Map</h2><p>Visit the village in order. Each location unlocks after the previous mission is complete.</p><div class="section"><div class="list"><ul><li>Grandma\'s House</li><li>Tea Shop</li><li>Market</li><li>Playground</li><li>School</li><li>Pagoda</li><li>Festival</li><li>Village Celebration</li></ul></div></div>'
    elif page_type == 'mission':
        mission_id = title.split(': ')[1].replace(' ', '-').replace('’', '').replace("'", '')
        prompt = ''
        if mission_id == 'Help-Grandma':
            prompt = '<p>Choose the right item to put away so Grandma can tidy the house.</p><div class="game-panel"><button class="game-option" data-correct="true">Fold the blanket</button><button class="game-option" data-correct="false">Leave the tea cup</button><button class="game-option" data-correct="false">Scatter the toys</button></div>'
        elif mission_id == 'Serve-tea':
            prompt = '<p>Serve the correct tea to the customer.</p><div class="game-panel"><button class="game-option" data-correct="false">Serve empty cup</button><button class="game-option" data-correct="true">Serve tea cup with snack</button><button class="game-option" data-correct="false">Serve wrong drink</button></div>'
        elif mission_id == 'Find-groceries':
            prompt = '<p>Pick the right groceries for Grandma.</p><div class="game-panel"><button class="game-option" data-correct="true">Take tomatoes, eggs, and fish</button><button class="game-option" data-correct="false">Take candy and toys</button></div>'
        elif mission_id == 'Play-with-friends':
            prompt = '<p>Choose the child who asked "Want to play?"</p><div class="game-panel"><button class="game-option" data-correct="false">The sleepy child</button><button class="game-option" data-correct="true">The smiling boy</button></div>'
        elif mission_id == 'Bring-books-to-class':
            prompt = '<p>Deliver the books to the right desk.</p><div class="game-panel"><button class="game-option" data-correct="false">To the empty chair</button><button class="game-option" data-correct="true">To the teacher\'s desk</button></div>'
        elif mission_id == 'Visit-the-Pagoda':
            prompt = '<p>Choose the respectful action.</p><div class="game-panel"><button class="game-option" data-correct="false">Run inside with shoes</button><button class="game-option" data-correct="true">Remove shoes first</button></div>'
        elif mission_id == 'Festival-preparations':
            prompt = '<p>What will make the festival bright?</p><div class="game-panel"><button class="game-option" data-correct="true">Light lanterns</button><button class="game-option" data-correct="false">Turn off lights</button></div>'
        elif mission_id == 'Celebrate-with-the-village':
            prompt = '<p>Help the whole village celebrate.</p><div class="game-panel"><button class="game-option" data-correct="true">Light the final lantern</button><button class="game-option" data-correct="false">Hide in the house</button></div>'
        else:
            prompt = '<p>Complete this mission by exploring and helping the village.</p>'
        body = f'<div class="section"><h2>Mission</h2><p>{title.replace("Mission: ","")}. Learn phrases and complete the challenge below.</p>{prompt}</div><div class="section"><div id="missionUnlocked" class="section"><div class="status-pill">Mission available</div><button class="button complete-mission" data-reward="20">Complete mission</button></div><div id="missionLocked" class="section hidden"><div class="alert">This mission unlocks after the previous one is complete.</div></div><div class="section"><div id="missionStatus" class="status-pill">Status unknown</div></div></div>'
    elif page_type == 'explained':
        phrase_entries = {
            'Grandmas-House': [('Mingalarpar', 'Hello'), ('Welcome', 'Come in'), ('Sit down', 'Sit down'), ('Thank you', 'Thank you')],
            'Tea-Shop': [('Thank you', 'Thank you'), ('How much?', 'How much is this?'), ('This one', 'This one, please'), ('Let\'s buy tea', 'Let\'s buy tea')],
            'Market': [('I want', 'I want this'), ('Thank you', 'Thank you'), ('This one', 'This one, please'), ('Help me find', 'Please help me find')],
            'Playground': [('Want to play?', 'Do you want to play?'), ('Yes', 'Yes'), ('No', 'No'), ('Let\'s go', 'Let\'s go')],
            'School': [('Good morning', 'Good morning'), ('Read this', 'Please read this'), ('Write this', 'Please write this'), ('Thank you', 'Thank you')],
            'Pagoda': [('Remove shoes', 'Please remove your shoes'), ('Offer flowers', 'Offer flowers to the shrine'), ('Light candle', 'Light the candle'), ('Thank you', 'Thank you')],
            'Festival': [('Happy Thadingyut', 'Happy Thadingyut'), ('Happy Thingyan', 'Happy Thingyan'), ('Come here', 'Come here'), ('Let\'s eat', 'Let\'s eat')],
            'Village-Celebration': [('Thank you', 'Thank you'), ('Let\'s celebrate', 'Let\'s celebrate'), ('You did it', 'You did it'), ('Welcome home', 'Welcome home')],
        }
        key = title.replace('Myanmar phrases to meet ', '').replace(' ', '-').replace('Mission: ', '')
        phrases = phrase_entries.get(key, [])
        phrase_html = ''.join(f'<div class="phrase-item"><strong>{en}</strong><p>{mm}</p><button data-phrase="{en}">🔊 Hear English</button></div>' for en, mm in phrases)
        body = f'<div class="section"><h2>{title}</h2><p>Practice the key phrases from this mission. Tap each phrase to hear it.</p><div class="phrase-list">{phrase_html}</div></div>'
    elif page_type == 'quiz':
        body = '<div class="section"><h2>Quiz</h2><p>Review the mission phrases with the quiz. This is a short check to help Su remember the conversation.</p><div class="section"><p><strong>Question:</strong> Which phrase is polite to say after someone helps you?</p><div class="button-row"><button class="button outline" onclick="speak(\'Thank you\')">Thank you</button><button class="button outline" onclick="speak(\'Hello\')">Hello</button></div></div><div class="section"><p><strong>Question:</strong> Which phrase means "I want this"?</p><div class="button-row"><button class="button outline" onclick="speak(\'This one\')">This one</button><button class="button outline" onclick="speak(\'Good morning\')">Good morning</button></div></div>'
    elif page_type == 'conclusion':
        body = '<div class="section"><h2>The Ending</h2><p>Grandma says, "Now you can speak Myanmar." Everyone you met gathers to celebrate. Su realizes she can now understand and belong with her family.</p><div class="section"><h2>Thank you</h2><p>This book is a village adventure, not just a vocabulary list. The village changes forever because of what you learned.</p></div>'
    else:
        body = '<div class="section"><p>Page content coming soon.</p></div>'
    body += render_nav(idx)
    write_page(num, slug, title, title, body, page_type, mission_id)
    readme_lines.append(f'- {num}-{slug}.html — {title}')

write_assets()
readme_path = book_dir / 'README.md'
readme_path.write_text('\n'.join(readme_lines) + '\n', encoding='utf-8')
print('Generated book at', book_dir)
