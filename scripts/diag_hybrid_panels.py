"""Hybrid detect: H-gutters + equal cols per wide row. Export phone previews."""
import pymupdf
from pathlib import Path

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag\hybrid")
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
    return [0] + [v for v in raw if v >= min_seg and n - v >= min_seg] + [n]


def mid_band_art_width(s, w, n, top, bot):
    """Ink extent across mid third of band; used only for col count."""
    band_h = bot - top
    mid_top = top + band_h // 3
    mid_bot = top + (2 * band_h) // 3
    if mid_bot <= mid_top:
        mid_top, mid_bot = top, bot
    left, right = w, -1
    for y in range(mid_top, mid_bot, 2):
        for x in range(0, w, 2):
            i = (y * w + x) * n
            if is_ink(s[i], s[i + 1], s[i + 2]):
                if x < left:
                    left = x
                if x > right:
                    right = x
    if right < left:
        return w
    return right - left + 1


def detect(pix):
    w, h, n = pix.width, pix.height, pix.n
    s = pix.samples
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

    min_row = max(8, h // 12)
    y_splits = find_valley_splits(row, min_row)
    bands = [(a, b) for a, b in zip(y_splits, y_splits[1:]) if b - a >= min_row]
    panels = []
    for top, bot in bands:
        band_h = bot - top
        art_w = mid_band_art_width(s, w, n, top, bot)
        aspect = art_w / max(1, band_h)
        cols = 3 if aspect > 2.0 else (2 if aspect > 1.25 else 1)
        for c in range(cols):
            left = (w * c) // cols
            right = (w * (c + 1)) // cols
            panels.append((left, top, right - left, band_h))
    # filter
    area = w * h
    kept = [p for p in panels if p[2] * p[3] >= area * 0.04]
    return kept


doc = pymupdf.open(PDF)
page = doc[1]
pix = page.get_pixmap(matrix=pymupdf.Matrix(1.0, 1.0), alpha=False)
panels = detect(pix)
print("count", len(panels))
story = []
for i, (x, y, pw, ph) in enumerate(panels):
    clip = pymupdf.Rect(
        page.rect.width * x / pix.width,
        page.rect.height * y / pix.height,
        page.rect.width * (x + pw) / pix.width,
        page.rect.height * (y + ph) / pix.height,
    )
    zoom = min(400 / clip.width, 720 / clip.height)
    p2 = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
    path = OUT / f"p{i:02d}.png"
    p2.save(path)
    print(i, f"{pw}x{ph}", "->", p2.width, p2.height)
    story.append(str(path))

doc.close()
print("files", len(story))
