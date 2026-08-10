from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
folder = root / "book_html" / "MudraGoesToGrandmaVillage"
template_file = folder / "Template" / "TEMPLATE-UNIFORM.html"

text = template_file.read_text(encoding='utf-8')
m = re.search(r'<head>.*?</head>', text, re.S)
if not m:
    raise RuntimeError("Template head block not found")
head = m.group(0)

changed = []
checked = []
for p in sorted(folder.glob('*.html')):
    txt = p.read_text(encoding='utf-8')
    if 'body class="main-chapter-page"' not in txt:
        continue
    m = re.search(r'<head>.*?</head>', txt, re.S)
    if not m:
        print('MISSING HEAD', p.name)
        continue
    if m.group(0) != head:
        changed.append(p.name)
        new_txt = txt[:m.start()] + head + txt[m.end():]
        p.write_text(new_txt, encoding='utf-8')
    checked.append(p.name)

print(f'Checked count: {len(checked)}')
print('Updated files:', changed)
