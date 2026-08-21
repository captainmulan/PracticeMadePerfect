import pymupdf
from pathlib import Path

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
doc = pymupdf.open(PDF)
page = doc[1]
pix = page.get_pixmap(matrix=pymupdf.Matrix(0.7, 0.7), alpha=False)
w, h, n = pix.width, pix.height, pix.n
s = pix.samples
row = []
for y in range(h):
    ink = 0
    samples = 0
    for x in range(0, w, 2):
        i = (y * w + x) * n
        samples += 1
        if s[i] + s[i + 1] + s[i + 2] < 765:
            ink += 1
    row.append(ink / max(1, samples))

buckets = 40
step = h / buckets
print("VERTICAL density (top -> bottom)")
for b in range(buckets):
    a = int(b * step)
    z = int((b + 1) * step)
    m = sum(row[a:z]) / max(1, z - a)
    bar = "#" * int(m * 40)
    print(f"{b:02d} y={a:4d}-{z:4d} dens={m:.3f} {bar}")
print("size", w, h, "mean", sum(row) / h, "min", min(row))

# horizontal mid-band
mid_top = h // 3
mid_bot = 2 * h // 3
col = [0.0] * w
for y in range(mid_top, mid_bot, 2):
    for x in range(w):
        i = (y * w + x) * n
        if s[i] + s[i + 1] + s[i + 2] < 765:
            col[x] += 1
band_rows = max(1, (mid_bot - mid_top + 1) // 2)
col = [c / band_rows for c in col]
print("\nHORIZONTAL density mid band")
stepx = w / buckets
for b in range(buckets):
    a = int(b * stepx)
    z = int((b + 1) * stepx)
    m = sum(col[a:z]) / max(1, z - a)
    bar = "#" * int(m * 40)
    print(f"{b:02d} x={a:4d}-{z:4d} dens={m:.3f} {bar}")

# save annotated full page
out = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag")
out.mkdir(exist_ok=True)
pix.save(out / "page2-probe.png")
doc.close()
print("saved", out / "page2-probe.png")
