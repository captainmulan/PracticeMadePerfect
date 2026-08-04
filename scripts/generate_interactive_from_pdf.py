import fitz
from pathlib import Path
import re

src_pdf = Path(r'C:/JC/Aung/Other/Dream/MagicLibrary/MyanmarGovSchoolTexbook/G1-Myanmarsa-TB.pdf')
out_dir = Path(r'C:/JC/Aung/Other/Dream/MagicLibrary/MyanmarGovSchoolTexbook/interactive_html')
out_dir.mkdir(parents=True, exist_ok=True)

def tokenize(text):
    # Split into words, punctuation, and whitespace
    tokens = re.findall(r"\w+|[^\w\s]+|\s+", text, flags=re.UNICODE)
    return tokens

with fitz.open(src_pdf) as doc:
    pages = []
    for i, page in enumerate(doc, start=1):
        raw = page.get_text("text")
        tokens = tokenize(raw)
        # Build HTML content with tokens wrapped
        parts = []
        for t in tokens:
            if t.isspace():
                parts.append(t)
            elif re.match(r"\w+", t, flags=re.UNICODE):
                # word
                safe = t.replace('"', '&quot;')
                parts.append(f'<span class="word" data-word="{safe}">{t}</span>')
            else:
                # punctuation
                parts.append(t)
        body_html = ''.join(parts)
        html_path = out_dir / f'page-{i:03d}.html'
        page_title = f'Page {i}'
        # Build HTML without f-string to avoid accidental brace expansion
        head = ("<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>" + page_title + "</title>\n  <style>\n    body{font-family: Inter, Arial, sans-serif; margin:0; background:#fff; color:#111;}\n    .toolbar{display:flex;gap:8px;align-items:center;padding:12px;border-bottom:1px solid #eee;background:#fafafa;position:sticky;top:0;z-index:10}\n    .content{max-width:980px;margin:18px auto;padding:0 18px;line-height:1.7;font-size:18px}\n    .word{cursor:pointer;padding:2px 4px;border-radius:6px;}\n    .word:hover{background:linear-gradient(90deg,#fff3bf,#fff9e6);}\n    .word.selected{background:#ffe8a5;box-shadow:0 2px 6px rgba(0,0,0,0.08);}\n    .btn{padding:8px 12px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer}\n    .badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eee;font-size:13px}\n    .search{margin-left:8px;padding:8px;border:1px solid #ddd;border-radius:8px}\n  </style>\n</head>\n<body>\n  <div class=\"toolbar\">\n    <button class=\"btn\" id=\"readPage\">🔊 Read page</button>\n    <button class=\"btn\" id=\"collectSelected\">⭐ Collect selected</button>\n    <button class=\"btn\" id=\"clearSelection\">Clear selection</button>\n    <a class=\"btn\" href=\"index.html\">Index</a>\n    <a class=\"btn\" href=\"quiz.html\">Study (collection)</a>\n    <input id=\"searchInput\" class=\"search\" placeholder=\"Find word...\">\n    <div style=\"margin-left:auto;display:flex;gap:8px;align-items:center\"><span class=\"badge\">" + page_title + "</span></div>\n  </div>\n\n  <div class=\"content\" id=\"content\">")
        tail = ("</div>\n\n  <script>\n    // Word click toggles selection\n    document.querySelectorAll('.word').forEach(function(el){\n      el.addEventListener('click', function(){\n        el.classList.toggle('selected');\n      });\n    });\n\n    document.getElementById('clearSelection').addEventListener('click', function(){\n      document.querySelectorAll('.word.selected').forEach(function(e){ e.classList.remove('selected'); });\n    });\n\n    document.getElementById('collectSelected').addEventListener('click', function(){\n      var sel = Array.from(document.querySelectorAll('.word.selected')).map(function(e){return e.dataset.word});\n      if(sel.length===0){alert('Select words by clicking them first.');return}\n      var key = 'ebook_collection';\n      var existing = JSON.parse(localStorage.getItem(key)||'[]');\n      var merged = Array.from(new Set(existing.concat(sel)));\n      localStorage.setItem(key, JSON.stringify(merged));\n      alert('Added '+sel.length+' words to your collection');\n    });\n\n    document.getElementById('readPage').addEventListener('click', function(){\n      var text = document.getElementById('content').innerText;\n      if(!window.speechSynthesis){ alert('SpeechSynthesis not supported in this browser.'); return }\n      var u = new SpeechSynthesisUtterance(text);\n      u.rate = 0.95;\n      u.lang = 'en-US';\n      window.speechSynthesis.cancel();\n      window.speechSynthesis.speak(u);\n    });\n\n    // search\n    var search = document.getElementById('searchInput');\n    search.addEventListener('input', function(){\n      var q = search.value.trim().toLowerCase();\n      document.querySelectorAll('.word').forEach(function(w){\n        var t = (w.dataset.word||'').toLowerCase();\n        w.style.outline = '';\n        if(q && t.indexOf(q)!==-1){\n          w.style.outline = '3px solid rgba(255,235,59,0.6)';\n        }\n      });\n    });\n  </script>\n</body>\n</html>")
        content = head + body_html + tail
        html_path.write_text(content, encoding='utf-8')
        pages.append((i, html_path.name))
        print(f'Generated {html_path.name}')

    # create index
    index_path = out_dir / 'index.html'
    links = '\n'.join(f'      <li><a href="{name}">Page {num}</a></li>' for num,name in pages)
    index_content = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Interactive Textbook</title>
  <style>body{{font-family:Inter,Arial,sans-serif;background:#fff;color:#111;margin:0}}.wrap{{max-width:980px;margin:24px auto;padding:18px}}a.list{{display:block;padding:12px 14px;margin:8px 0;border-radius:8px;background:#fafafa;border:1px solid #eee;text-decoration:none;color:inherit}}</style>
</head>
<body>
  <div class="wrap">
    <h1>Interactive Textbook</h1>
    <p>Pages generated from PDF. Use <strong>Study (collection)</strong> to review collected words.</p>
    <div>
{links}
    </div>
  </div>
</body>
</html>'''
    index_path.write_text(index_content, encoding='utf-8')
    print('Generated index.html')

    # create quiz/study page
    quiz_path = out_dir / 'quiz.html'
    quiz_content = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Study collection</title>
  <style>body{font-family:Inter,Arial,sans-serif;margin:0;padding:20px;background:#fff;color:#111}.card{max-width:720px;margin:20px auto;padding:18px;border:1px solid #eee;border-radius:12px}.word{font-size:2rem;font-weight:700}.actions{margin-top:12px}</style>
</head>
<body>
  <div class="card" id="card">Loading collection...</div>
  <script>
    function render(){
      const key='ebook_collection';
      const coll = JSON.parse(localStorage.getItem(key)||'[]');
      const el = document.getElementById('card');
      if(!coll.length){ el.innerHTML = '<p>No words in collection. Add words from pages first.</p><p><a href="index.html">Back to pages</a></p>'; return }
      const idx = Math.floor(Math.random()*coll.length);
      const w = coll[idx];
      el.innerHTML = `<div class="word">${w}</div><div class="actions"><button id="show">Show/Hide</button> <button id="known">Mark known (remove)</button> <button id="again">Next</button></div><div id="note" style="margin-top:12px"></div>`;
      document.getElementById('show').addEventListener('click', ()=>{
        const n=document.getElementById('note'); n.innerHTML = n.innerHTML ? '' : '<em>(no meaning stored)</em>';
      });
      document.getElementById('known').addEventListener('click', ()=>{
        coll.splice(idx,1); localStorage.setItem(key, JSON.stringify(coll)); render();
      });
      document.getElementById('again').addEventListener('click', ()=> render());
    }
    render();
  </script>
</body>
</html>'''
    quiz_path.write_text(quiz_content, encoding='utf-8')
    print('Generated quiz.html')
