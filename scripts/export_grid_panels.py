"""Export 3x3 grid panels as phone contain-fit previews (fallback path)."""
from pathlib import Path
import pymupdf

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag\grid3x3")
OUT.mkdir(parents=True, exist_ok=True)

doc = pymupdf.open(PDF)
page = doc[1]
r = page.rect
# soft content trim ~4%
pad = 0.04
content = pymupdf.Rect(
    r.x0 + r.width * pad,
    r.y0 + r.height * pad,
    r.x1 - r.width * pad,
    r.y1 - r.height * pad,
)
rows, cols = 3, 3
cw = content.width / cols
ch = content.height / rows
phone_w, phone_h = 390, 700
order = []
for row in range(rows):
    for col in range(cols):
        i = row * cols + col
        clip = pymupdf.Rect(
            content.x0 + col * cw,
            content.y0 + row * ch,
            content.x0 + (col + 1) * cw,
            content.y0 + (row + 1) * ch,
        )
        zoom = min(phone_w / clip.width, phone_h / clip.height)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
        path = OUT / f"panel-{i:02d}-r{row}c{col}.png"
        pix.save(path)
        order.append({"i": i, "row": row, "col": col, "file": path.name, "px": [pix.width, pix.height]})
        print(i, "row", row, "col", col, pix.width, "x", pix.height, path.name)

# also extract text if any
text = page.get_text("text")
(OUT / "page2-text.txt").write_text(text or "(no text layer)", encoding="utf-8")
print("text chars", len(text or ""))
doc.close()
