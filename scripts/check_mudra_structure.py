from pathlib import Path
import re

folder = Path(__file__).resolve().parent.parent / 'book_html' / 'MudraGoesToGrandmaVillage'
for p in sorted(folder.glob('*.html')):
    txt = p.read_text(encoding='utf-8')
    if 'body class="main-chapter-page"' not in txt:
        continue
    story = len(re.findall(r'<section class="panel story-panel"', txt))
    press = len(re.findall(r'<section class="panel press-panel"', txt))
    if story != 3 or press != 1:
        print(f'{p.name} story={story} press={press}')
