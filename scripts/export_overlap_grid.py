"""3x3 overlap grid — verify captions survive."""
import pymupdf
from pathlib import Path

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag\overlap")
OUT.mkdir(parents=True, exist_ok=True)

doc = pymupdf.open(PDF)
page = doc[1]
r = page.rect
pad = 0.03
content = pymupdf.Rect(
    r.x0 + r.width * pad,
    r.y0 + r.height * pad,
    r.x1 - r.width * pad,
    r.y1 - r.height * pad,
)
rows = cols = 3
cw = content.width / cols
ch = content.height / rows
ox, oy = cw * 0.04, ch * 0.14
for row in range(rows):
    for col in range(cols):
        i = row * cols + col
        x0 = max(content.x0, content.x0 + col * cw - ox)
        y0 = max(content.y0, content.y0 + row * ch - oy)
        x1 = min(content.x1, content.x0 + (col + 1) * cw + ox)
        y1 = min(content.y1, content.y0 + (row + 1) * ch + oy)
        clip = pymupdf.Rect(x0, y0, x1, y1)
        zoom = min(400 / clip.width, 700 / clip.height)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
        pix.save(OUT / f"o{i:02d}.png")
        print(i, "r", row, "c", col, pix.width, pix.height)
doc.close()
