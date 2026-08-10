from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent / "book_html" / "MudraGoesToGrandmaVillage"
template = (root / "Template" / "TEMPLATE-UNIFORM.html").read_text(encoding="utf-8")
template_head = re.search(r"<head>.*?</head>", template, re.S)
if not template_head:
    raise RuntimeError("Template head block not found")
template_head = template_head.group(0)

matched = []
not_matched = []
missing_head = []
for p in sorted(root.glob("*.html")):
    txt = p.read_text(encoding="utf-8")
    if 'body class="main-chapter-page"' not in txt:
        continue
    m = re.search(r"<head>.*?</head>", txt, re.S)
    if not m:
        missing_head.append(p.name)
        continue
    if m.group(0) == template_head:
        matched.append(p.name)
    else:
        not_matched.append(p.name)

print(f"matched {len(matched)}")
print(f"not_matched {len(not_matched)}")
print(f"missing_head {len(missing_head)}")
if not_matched:
    print("not matched:")
    for name in not_matched:
        print(name)
if missing_head:
    print("missing head:")
    for name in missing_head:
        print(name)
