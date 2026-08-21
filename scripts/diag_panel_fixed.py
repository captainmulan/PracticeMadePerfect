import pymupdf
from pathlib import Path
import json

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag")
OUT.mkdir(exist_ok=True)


def is_ink(r, g, b):
    return r < 248 or g < 248 or b < 248


def find_valley_splits(density, min_seg):
    n = len(density)
    if n < 8:
        return [0, n]
    smooth = []
    for i in range(n):
        vals = [density[j] for j in range(max(0, i - 3), min(n, i + 4))]
        smooth.append(sum(vals) / len(vals))
    mean = sum(smooth) / n
    min_v = min(smooth)
    threshold = max(min_v + 0.01, min(mean * 0.55, mean * 0.4 + 0.02))
    raw = []
    for i in range(2, n - 2):
        v = smooth[i]
        if v > threshold:
            continue
        if v <= smooth[i - 1] and v <= smooth[i + 1] and v <= smooth[i - 2] and v <= smooth[i + 2]:
            if not raw or i - raw[-1] >= max(4, min_seg // 3):
                raw.append(i)
            elif v < smooth[raw[-1]]:
                raw[-1] = i
    splits = [0]
    for v in raw:
        if v >= min_seg and n - v >= min_seg:
            splits.append(v)
    splits.append(n)
    return splits


def detect(pix):
    w, h, n = pix.width, pix.height, pix.n
    s = pix.samples
    step = 2 if w * h > 180000 else 1
    row = [0.0] * h
    for y in range(0, h, step):
        ink = 0
        samples = 0
        for x in range(0, w, step):
            i = (y * w + x) * n
            samples += 1
            if is_ink(s[i], s[i + 1], s[i + 2]):
                ink += 1
        dens = ink / max(1, samples)
        row[y] = dens
        if step > 1 and y + 1 < h:
            row[y + 1] = dens
    min_row = max(8, h // 20)
    min_col = max(8, w // 20)
    y_splits = find_valley_splits(row, min_row)
    bands = [(a, b) for a, b in zip(y_splits, y_splits[1:]) if b - a >= int(min_row * 0.55)] or [(0, h)]
    panels = []
    for top, bot in bands:
        col = [0.0] * w
        for y in range(top, bot, step):
            for x in range(0, w, step):
                i = (y * w + x) * n
                if is_ink(s[i], s[i + 1], s[i + 2]):
                    col[x] += 1
        row_samples = max(1, (bot - top + step - 1) // step)
        col = [c / row_samples for c in col]
        x_splits = find_valley_splits(col, min_col)
        cells = [(a, b) for a, b in zip(x_splits, x_splits[1:]) if b - a >= int(min_col * 0.55)] or [(0, w)]
        for left, right in cells:
            panels.append((left, top, right - left, bot - top))
    return panels


doc = pymupdf.open(PDF)
page = doc[1]
pix = page.get_pixmap(matrix=pymupdf.Matrix(0.72, 0.72), alpha=False)
panels = detect(pix)
print("panel_count", len(panels))
for i, (x, y, pw, ph) in enumerate(panels):
    print(f"  {i}: x={x} y={y} w={pw} h={ph}")
    # export crop via page clip in PDF coords
    sx = page.rect.width / pix.width
    sy = page.rect.height / pix.height
    clip = pymupdf.Rect(x * sx, y * sy, (x + pw) * sx, (y + ph) * sy)
    p2 = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), clip=clip, alpha=False)
    p2.save(OUT / f"fixed-panel-{i:02d}.png")

# phone contain preview of first panel
if panels:
    x, y, pw, ph = panels[0]
    sx = page.rect.width / pix.width
    sy = page.rect.height / pix.height
    clip = pymupdf.Rect(x * sx, y * sy, (x + pw) * sx, (y + ph) * sy)
    # render to fit ~414x700
    zoom = min(414 / clip.width, 700 / clip.height)
    p2 = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
    p2.save(OUT / "phone-panel-0.png")
    print("phone panel0", p2.width, p2.height)

(OUT / "fixed-meta.json").write_text(json.dumps({"count": len(panels), "panels": panels}, indent=2))
doc.close()
print("ok", OUT)
