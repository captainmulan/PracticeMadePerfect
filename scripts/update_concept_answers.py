import json
import re
from pathlib import Path

root = Path('src/data/taskDefs')
updated = []
for path in sorted(root.glob('*.json')):
    data = json.loads(path.read_text(encoding='utf-8'))
    html = data.get('answerHtml')
    if not isinstance(html, str):
        continue
    new_html = html
    new_html = re.sub(r'<th>\s*Question\s*</th>', '<th>Sub Question</th>', new_html)
    new_html = re.sub(r'<div class="solid-meta">.*?</div>\s*', '', new_html, flags=re.S)
    new_html = re.sub(r'<div class="solid-banner">.*?</div>\s*', '', new_html, flags=re.S)
    new_html = re.sub(r'<section class="solid-section">\s*<h2>.*?</h2>\s*', '<section class="solid-section">', new_html, flags=re.S)
    if new_html != html:
        data['answerHtml'] = new_html
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        updated.append(path.name)
        print(f'Updated {path.name}')
print(f'Done {len(updated)} files updated.')
