from pathlib import Path
import re

root = Path('c:/Users/65966/PracticeMadePerfect/book_html/Mudra holiday trip to Myanmar')
pattern_story = re.compile(r'<div class="section-head">Story</div>\s*', re.DOTALL)
pattern_h3 = re.compile(
    r'<div class="story-box story-novel">\s*<h3 style="margin:0 0 8px;color:#7c3aed;font-size:clamp\(20px,3vw,24px\);">.*?</h3>\s*',
    re.DOTALL,
)
changed = []
for f in sorted(root.glob('*.html')):
    text = f.read_text(encoding='utf-8')
    new = pattern_story.sub('', text)
    new = pattern_h3.sub('<div class="story-box story-novel">\n', new)
    if new != text:
        f.write_text(new, encoding='utf-8')
        changed.append(f.name)
print('changed files:', len(changed))
for name in changed:
    print(name)
