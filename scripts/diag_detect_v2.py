import pymupdf
from pathlib import Path

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag\detected")
OUT.mkdir(parents=True, exist_ok=True)


def is_ink(r, g, b):
    return r < 248 or g < 248 or b < 248


def find_valley_splits(density, min_seg):
    n = len(density)
    smooth = [
        sum(density[j] for j in range(max(0, i - 3), min(n, i + 4)))
        / max(1, min(n, i + 4) - max(0, i - 3))
        for i in range(n)
    ]
    mean = sum(smooth) / n
    min_v = min(smooth)
    threshold = max(0.04, min(0.14, mean * 0.22))
    print(f"  mean={mean:.3f} min={min_v:.3f} thr={threshold:.3f}")
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
    splits = [0] + [v for v in raw if v >= min_seg and n - v >= min_seg] + [n]
    print("  splits", splits)
    return splits


def detect(pix):
    w, h, n = pix.width, pix.height, pix.n
    s = pix.samples
    step = 1
    row = [0.0] * h
    for y in range(h):
        ink = 0
        samples = 0
        for x in range(0, w, 2):
            i = (y * w + x) * n
            samples += 1
            if is_ink(s[i], s[i + 1], s[i + 2]):
                ink += 1
        row[y] = ink / max(1, samples)

    # print vertical profile buckets
    print("VERTICAL profile")
    for b in range(30):
        a = int(b * h / 30)
        z = int((b + 1) * h / 30)
        m = sum(row[a:z]) / max(1, z - a)
        print(f"  {b:02d} dens={m:.3f} {'#'*int((1-m)*30)}{'='*int(m*30)}")

    min_row = max(8, h // 20)
    min_col = max(8, w // 20)
    print("H gutters")
    y_splits = find_valley_splits(row, min_row)
    bands = [(a, b) for a, b in zip(y_splits, y_splits[1:]) if b - a >= int(min_row * 0.55)] or [(0, h)]
    print("bands", bands)
    panels = []
    for bi, (top, bot) in enumerate(bands):
        col = [0.0] * w
        for y in range(top, bot):
            for x in range(w):
                i = (y * w + x) * n
                if is_ink(s[i], s[i + 1], s[i + 2]):
                    col[x] += 1
        band_h = max(1, bot - top)
        col = [c / band_h for c in col]
        print(f"V gutters band {bi}")
        x_splits = find_valley_splits(col, min_col)
        cells = [(a, b) for a, b in zip(x_splits, x_splits[1:]) if b - a >= int(min_col * 0.55)] or [(0, w)]
        for left, right in cells:
            panels.append((left, top, right - left, bot - top))
    return panels


doc = pymupdf.open(PDF)
page = doc[1]
pix = page.get_pixmap(matrix=pymupdf.Matrix(1.0, 1.0), alpha=False)
# trim margins like content box ~3%
pad = int(min(pix.width, pix.height) * 0.03)
# crop pixmap conceptually by only detecting inside
panels = detect(pix)
area = pix.width * pix.height
kept = []
for p in panels:
    x, y, pw, ph = p
    if pw * ph < area * 0.055:
        continue
    aspect = pw / max(1, ph)
    if aspect < 0.35 or aspect > 2.8:
        continue
    kept.append(p)
print("kept", len(kept), kept)

for i, (x, y, pw, ph) in enumerate(kept):
    clip = pymupdf.Rect(
        page.rect.width * x / pix.width,
        page.rect.height * y / pix.height,
        page.rect.width * (x + pw) / pix.width,
        page.rect.height * (y + ph) / pix.height,
    )
    zoom = min(400 / clip.width, 700 / clip.height)
    p2 = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
    p2.save(OUT / f"det-{i:02d}.png")
    print(i, p2.width, p2.height)

doc.close()
