from pathlib import Path
import re
root = Path(r'C:\Users\65966\PracticeMadePerfect\book_html\Mudra holiday trip to Myanmar')
for path in sorted(root.glob('*.html')):
    text = path.read_text(encoding='utf-8')
    new = text
    new = re.sub(r'<div class="beat-pill">.*?</div>\s*', '', new, flags=re.S)
    new = re.sub(r'(<p class="page-tagline"[^>]*>)(?:Chapter\s*\d+\s*·\s*)(.*?)(</p>)', r'\1\2\3', new, flags=re.I)
    new = re.sub(r'<button[^>]*id="nextBtn"[^>]*>.*?</button>\s*', '', new, flags=re.S)
    new = re.sub(r'document\.getElementById\(\'nextBtn\'\)\.onclick\s*=\s*function\(\)\s*\{[\s\S]*?\};\s*', '', new)
    new = re.sub(
        r"document\.getElementById\(\'quizArea\'\)\.addEventListener\(\'click\', function\(e\)\{[\s\S]*?\}\);",
        "document.getElementById('quizArea').addEventListener('click', function(e){\n    var btn=e.target.closest('.quiz-option'); if(!btn) return;\n    var card=btn.closest('.quiz-card'); if(card.dataset.done) return;\n    card.dataset.done='1';\n    var ok=btn.getAttribute('data-correct')==='1';\n    btn.classList.add(ok?'correct':'wrong');\n    if(ok) score++;\n    else { var right=card.querySelector('[data-correct=\"1\"]'); if(right) right.classList.add('correct'); }\n    if(i<cards.length-1){ i++; show(); }\n    else { document.getElementById('quizMsg').textContent='You scored '+score+' / '+cards.length+' — Mudra is proud!'; }\n  });",
        new,
        flags=re.S,
    )
    if new != text:
        path.write_text(new, encoding='utf-8')
        print(f'Updated {path.name}')
