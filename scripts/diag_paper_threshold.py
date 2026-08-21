import pymupdf
from pathlib import Path
from collections import Counter

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
doc = pymupdf.open(PDF)
page = doc[1]
pix = page.get_pixmap(matrix=pymupdf.Matrix(1.0, 1.0), alpha=False)
w, h, n = pix.width, pix.height, pix.n
s = pix.samples

# Sample a vertical strip in the middle looking for lightest rows
row_mean = []
for y in range(h):
    total = 0
    for x in range(0, w, 3):
        i = (y * w + x) * n
        total += s[i] + s[i + 1] + s[i + 2]
    row_mean.append(total / max(1, (w + 2) // 3))

# lightest 15 rows
idx = sorted(range(h), key=lambda y: row_mean[y], reverse=True)[:15]
print("lightest rows (likely gutters):")
for y in idx:
    # sample colors
    colors = []
    for x in range(0, w, max(1, w // 20)):
        i = (y * w + x) * n
        colors.append((s[i], s[i + 1], s[i + 2]))
    print(f"y={y} meanRGB={row_mean[y]:.1f} samples={colors[:5]}")

# Try paper thresholds
for thr_sum in (700, 720, 740, 750, 760, 765, 780):
    paper_rows = 0
    for y in range(h):
        paper = 0
        samples = 0
        for x in range(0, w, 2):
            i = (y * w + x) * n
            samples += 1
            if s[i] + s[i + 1] + s[i + 2] >= thr_sum:
                paper += 1
        if paper / samples > 0.55:
            paper_rows += 1
    print(f"sum>={thr_sum}: paper-like rows={paper_rows}/{h}")

for thr_ch in (220, 230, 240, 245, 250):
    paper_rows = 0
    for y in range(h):
        paper = 0
        samples = 0
        for x in range(0, w, 2):
            i = (y * w + x) * n
            samples += 1
            if s[i] >= thr_ch and s[i + 1] >= thr_ch and s[i + 2] >= thr_ch:
                paper += 1
        if paper / samples > 0.55:
            paper_rows += 1
    print(f"ch>={thr_ch}: paper-like rows={paper_rows}/{h}")

doc.close()
