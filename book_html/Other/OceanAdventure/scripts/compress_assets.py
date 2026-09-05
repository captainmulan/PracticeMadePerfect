#!/usr/bin/env python3
"""Compress chapter PNGs to JPG (max width 1280, q=78)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
MAX_WIDTH = 1280
QUALITY = 78
REMOVE_PNG = "--remove-png" in sys.argv


def compress_png(src: Path) -> tuple[int, int]:
    dest = src.with_suffix(".jpg")
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        if w > MAX_WIDTH:
            nh = max(1, int(h * MAX_WIDTH / w))
            im = im.resize((MAX_WIDTH, nh), Image.Resampling.LANCZOS)
        im.save(dest, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    before = src.stat().st_size
    after = dest.stat().st_size
    print(f"{src.name} -> {dest.name} ({after // 1024} KB, was {before // 1024} KB)")
    if REMOVE_PNG:
        src.unlink()
    return before, after


def main() -> None:
    pngs = sorted(ASSETS.glob("*.png"))
    if not pngs:
        print("No PNG files in assets/")
        return
    saved = 0
    for src in pngs:
        before, after = compress_png(src)
        saved += before - after
    print(f"Converted {len(pngs)} files. Saved ~{saved / 1024 / 1024:.1f} MB vs PNG sources")
    if REMOVE_PNG:
        print("Removed source PNG files (--remove-png)")


if __name__ == "__main__":
    main()
