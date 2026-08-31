#!/usr/bin/env python3
"""Remove studio background from flower pot image; export transparent PNG."""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path

from PIL import Image

ASSETS = Path(__file__).resolve().parent.parent / "assets"
SRC = ASSETS / "flower-pot-single.png"
OUT = ASSETS / "flower-pot.png"


def dist(c1: tuple[int, ...], c2: tuple[int, ...]) -> float:
    return math.sqrt(sum((int(a) - int(b)) ** 2 for a, b in zip(c1, c2)))


def sample_bg(img: Image.Image) -> tuple[int, int, int]:
    px = img.load()
    w, h = img.size
    pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)]
    rs = gs = bs = 0
    for x, y in pts:
        r, g, b = px[x, y][:3]
        rs += r
        gs += g
        bs += b
    n = len(pts)
    return rs // n, gs // n, bs // n


def flood_transparent(img: Image.Image, tolerance: float = 48) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    bg = sample_bg(img)
    seen = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def close(x: int, y: int) -> bool:
        r, g, b, a = px[x, y]
        if a == 0:
            return True
        return dist((r, g, b), bg) <= tolerance

    for x in range(w):
        for y in (0, h - 1):
            if close(x, y):
                seen[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y][x] and close(x, y):
                seen[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and close(nx, ny):
                seen[ny][nx] = True
                q.append((nx, ny))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            d = dist((r, g, b), bg)
            if d < tolerance + 24:
                fade = min(255, max(0, int((d - tolerance) / 24 * 255)))
                px[x, y] = (r, g, b, min(a, fade))
            if r > 198 and g > 198 and b > 198 and max(r, g, b) - min(r, g, b) < 12:
                px[x, y] = (r, g, b, 0)

    return img


def trim_alpha(img: Image.Image, pad: int = 4) -> Image.Image:
    box = img.getbbox()
    if not box:
        return img
    x0, y0, x1, y1 = box
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.size[0], x1 + pad)
    y1 = min(img.size[1], y1 + pad)
    return img.crop((x0, y0, x1, y1))


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")

    out = trim_alpha(flood_transparent(Image.open(SRC)))
    out.save(OUT, optimize=True)
    print(f"Wrote {OUT.name} ({out.size[0]} x {out.size[1]})")


if __name__ == "__main__":
    main()
