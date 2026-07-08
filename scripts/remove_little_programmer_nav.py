from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent / 'book_html' / 'LittleProgrammer'
files = [
    'chapter2.1-move-the-bunny.html',
    'chapter3.1.html',
    'chapter4.1.html',
    'chapter5.1.html',
    'chapter6.1.html',
    'chapter7.1.html',
]

for name in files:
    path = root / name
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'<div class="controls">.*?</div>\s*', '', text, flags=re.S)
    text = re.sub(r'<p style="margin-top:12px"><a href="[^"]+">[^<]+</a></p>\s*', '', text, flags=re.S)
    path.write_text(text, encoding='utf-8')
    print('cleaned', name)
