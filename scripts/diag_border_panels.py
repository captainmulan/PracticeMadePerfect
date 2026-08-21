"""Detect panels via black border lines (Shwe Thway style)."""
import pymupdf
from pathlib import Path

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag\borders")
OUT.mkdir(parents=True, exist_ok=True)


def cluster_lines(idxs, gap=6):
    if not idxs:
        return []
    groups = [[idxs[0]]]
    for v in idxs[1:]:
        if v - groups[-1][-1] <= gap:
            groups[-1].append(v)
        else:
            groups.append([v])
    return [int(sum(g) / len(g)) for g in groups]


def detect_border_panels(pix):
    w, h, n = pix.width, pix.height, pix.n
    s = pix.samples
    # horizontal black lines
    h_lines = []
    for y in range(h):
        dark = 0
        for x in range(0, w, 2):
            i = (y * w + x) * n
            if s[i] + s[i + 1] + s[i + 2] < 180:
                dark += 1
        if dark / max(1, w // 2) > 0.55:
            h_lines.append(y)
    h_splits = cluster_lines(h_lines, gap=5)
    print("H border lines", h_splits)

    # keep lines that form panel frames: need segments between them of decent height
    # Use all splits including 0 and h if needed
    ys = [0] + h_splits + [h - 1]
    # unique sorted
    ys = sorted(set(ys))
    # merge very close
    ys = cluster_lines(ys, gap=4)
    print("Y splits", ys)

    bands = []
    for a, b in zip(ys, ys[1:]):
        if b - a >= h * 0.08:
            bands.append((a, b))
    print("bands", bands)

    panels = []
    for top, bot in bands:
        # vertical black lines in this band
        v_lines = []
        band_h = bot - top
        for x in range(w):
            dark = 0
            for y in range(top, bot, 2):
                i = (y * w + x) * n
                if s[i] + s[i + 1] + s[i + 2] < 180:
                    dark += 1
            if dark / max(1, band_h // 2) > 0.45:
                v_lines.append(x)
        xs = cluster_lines(v_lines, gap=5)
        xs = sorted(set([0] + xs + [w - 1]))
        xs = cluster_lines(xs, gap=4)
        print(f"  band {top}-{bot} V lines", xs)
        cells = []
        for a, b in zip(xs, xs[1:]):
            if b - a >= w * 0.08:
                cells.append((a, b))
        if len(cells) < 2:
            # equal 3
            cells = [(w * c // 3, w * (c + 1) // 3) for c in range(3)]
        for left, right in cells:
            # inset from border lines so we don't include neighbor
            inset = 2
            panels.append((left + inset, top + inset, max(1, right - left - 2 * inset), max(1, bot - top - 2 * inset)))
    return panels


doc = pymupdf.open(PDF)
page = doc[1]
pix = page.get_pixmap(matrix=pymupdf.Matrix(1.2, 1.2), alpha=False)
panels = detect_border_panels(pix)
area = pix.width * pix.height
kept = [p for p in panels if p[2] * p[3] >= area * 0.035]
print("kept", len(kept))
for i, (x, y, pw, ph) in enumerate(kept):
    clip = pymupdf.Rect(
        page.rect.width * x / pix.width,
        page.rect.height * y / pix.height,
        page.rect.width * (x + pw) / pix.width,
        page.rect.height * (y + ph) / pix.height,
    )
    zoom = min(400 / clip.width, 720 / clip.height)
    p2 = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
    p2.save(OUT / f"b{i:02d}.png")
    print(i, pw, ph, "->", p2.width, p2.height)
doc.close()
