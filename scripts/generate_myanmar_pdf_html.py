import fitz
from pathlib import Path
import html

src_pdf = Path(r'C:\JC\Aung\Other\Dream\MagicLibrary\MyanmarGovSchoolTexbook\G1-Myanmarsa-TB.pdf')
out_dir = Path(r'C:\JC\Aung\Other\Dream\MagicLibrary\MyanmarGovSchoolTexbook\html')
out_dir.mkdir(parents=True, exist_ok=True)

print(f'Source PDF: {src_pdf}')
print(f'Output folder: {out_dir}')

if not src_pdf.exists():
    raise FileNotFoundError(f'Source PDF not found: {src_pdf}')

# Open PDF once and render images and pages
with fitz.open(src_pdf) as doc:
    pages = []
    for i, page in enumerate(doc, start=1):
        img_path = out_dir / f'page-{i:03d}.png'
        pix = page.get_pixmap(alpha=False)
        pix.save(img_path)

        html_path = out_dir / f'page-{i:03d}.html'
        page_title = f'Page {i}'
        content = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{page_title}</title>
  <style>
    body {{ margin: 0; background: #111; color: #fff; min-height: 100vh; display: flex; flex-direction: column; }}
    .page-wrapper {{ flex: 1; display: grid; place-items: center; padding: 16px; }}
    img {{ max-width: 100%; height: auto; box-shadow: 0 0 22px rgba(0,0,0,0.4); }}
    .nav {{ display: flex; justify-content: center; gap: 16px; padding: 14px; background: #090909; border-bottom: 1px solid #222; flex-wrap: wrap; }}
    .nav a {{ color: #fff; text-decoration: none; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); }}
    .nav a:hover {{ background: rgba(255,255,255,0.12); }}
  </style>
</head>
<body>
  <div class="nav">
    <a href="index.html">Home</a>
    <span>{page_title}</span>
  </div>
  <div class="page-wrapper">
    <img src="{html.escape(img_path.name)}" alt="{page_title}">
  </div>
</body>
</html>'''
        html_path.write_text(content, encoding='utf-8')
        pages.append((i, html_path.name))
        print(f'Generated {html_path.name}')

    index_path = out_dir / 'index.html'
    links = '\n'.join(
        f'      <li><a href="{html.escape(name)}">Page {num}</a></li>' for num, name in pages
    )
    index_content = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MyanmarGovSchool Textbook</title>
  <style>
    body {{ margin: 0; background: #111; color: #fff; font-family: Arial, sans-serif; }}
    .container {{ max-width: 980px; margin: 0 auto; padding: 24px; }}
    h1 {{ margin-top: 0; }}
    .page-list {{ list-style: none; padding: 0; margin: 20px 0; display: grid; gap: 12px; }}
    .page-list li a {{ display: block; padding: 14px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #fff; text-decoration: none; border-radius: 12px; }}
    .page-list li a:hover {{ background: rgba(255,255,255,0.12); }}
  </style>
</head>
<body>
  <div class="container">
    <h1>MyanmarGovSchool Textbook</h1>
    <p>Generated HTML pages from the PDF source.</p>
    <ul class="page-list">
{links}
    </ul>
  </div>
</body>
</html>'''
    index_path.write_text(index_content, encoding='utf-8')
    print(f'Generated index.html with {len(pages)} pages')
