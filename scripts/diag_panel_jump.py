"""Diagnose comic panel detection on Shwe Thway page 2 (1-based)."""
from __future__ import annotations

import json
from pathlib import Path

import pymupdf

PDF = Path(
    r"C:\Users\65966\PracticeMadePerfect\book_html"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477"
    r"\shwe-thway-journal-vol-56-no-8-1711504983477.pdf"
)
OUT = Path(r"C:\Users\65966\PracticeMadePerfect\tmp-panel-diag")
OUT.mkdir(parents=True, exist_ok=True)


def find_valley_splits(density: list[float], min_seg: int) -> list[int]:
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
        if (
            v <= smooth[i - 1]
            and v <= smooth[i + 1]
            and v <= smooth[i - 2]
            and v <= smooth[i + 2]
        ):
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


def detect_panels(pix: pymupdf.Pixmap) -> list[tuple[int, int, int, int]]:
    w, h = pix.width, pix.height
    samples = pix.samples
    n = pix.n  # 3 or 4

    def ink_at(x: int, y: int) -> bool:
        i = (y * w + x) * n
        return samples[i] + samples[i + 1] + samples[i + 2] < 765

    step = 2 if w * h > 180_000 else 1
    row = [0.0] * h
    for y in range(0, h, step):
        ink = 0
        samples_n = 0
        for x in range(0, w, step):
            samples_n += 1
            if ink_at(x, y):
                ink += 1
        dens = ink / max(1, samples_n)
        row[y] = dens
        if step > 1 and y + 1 < h:
            row[y + 1] = dens

    min_row = max(8, h // 20)
    min_col = max(8, w // 20)
    y_splits = find_valley_splits(row, min_row)
    bands = []
    for a, b in zip(y_splits, y_splits[1:]):
        if b - a >= int(min_row * 0.55):
            bands.append((a, b))
    if not bands:
        bands = [(0, h)]

    panels: list[tuple[int, int, int, int]] = []
    for top, bot in bands:
        col = [0.0] * w
        band_h = max(1, bot - top)
        for y in range(top, bot, step):
            for x in range(0, w, step):
                if ink_at(x, y):
                    col[x] += 1
        row_samples = max(1, (band_h + step - 1) // step)
        col = [c / row_samples for c in col]
        x_splits = find_valley_splits(col, min_col)
        cells = []
        for a, b in zip(x_splits, x_splits[1:]):
            if b - a >= int(min_col * 0.55):
                cells.append((a, b))
        if not cells:
            cells = [(0, w)]
        for left, right in cells:
            panels.append((left, top, right - left, bot - top))
    return panels


def main() -> None:
    doc = pymupdf.open(PDF)
    page = doc[1]  # page 2
    # phone-ish render
    zoom = 1.2
    mat = pymupdf.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    full_path = OUT / "page2-full.png"
    pix.save(full_path)

    panels = detect_panels(pix)
    meta = {
        "page_size": [page.rect.width, page.rect.height],
        "pixmap": [pix.width, pix.height],
        "panel_count": len(panels),
        "panels_px": panels,
    }
    (OUT / "page2-meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(json.dumps(meta, indent=2))

    phone_w, phone_h = 414, 720  # content area approx
    for i, (x, y, pw, ph) in enumerate(panels):
        # contain-fit into phone
        scale = min(phone_w / max(1, pw), phone_h / max(1, ph))
        # crop from pixmap
        clip = pymupdf.IRect(x, y, x + pw, y + ph)
        panel_pix = pymupdf.Pixmap(pix, clip)
        out = OUT / f"page2-panel-{i:02d}.png"
        panel_pix.save(out)
        print(
            f"panel {i}: {pw}x{ph}px contain-scale={scale:.2f} "
            f"-> ~{pw*scale:.0f}x{ph*scale:.0f} on phone"
        )

    doc.close()
    print("wrote", OUT)


if __name__ == "__main__":
    main()
