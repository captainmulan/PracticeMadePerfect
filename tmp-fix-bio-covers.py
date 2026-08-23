"""Regenerate Biography covers: fill 2:3 cards, no letterbox slivers."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pymupdf
from PIL import Image

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
TARGET = (720, 1080)
VERSION = "bio3"
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
IDS = [
    "che-guevara",
    "elon-musk",
    "florence-nightingale",
    "georg-washington",
]


def cover_crop(img: Image.Image, size: tuple[int, int], bias_top: float = 0.12) -> Image.Image:
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    nw = max(1, int(round(img.width * scale)))
    nh = max(1, int(round(img.height * scale)))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = max(0, int((nh - th) * bias_top))
    if top + th > nh:
        top = nh - th
    return resized.crop((left, top, left + tw, top + th))


def art_window(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"))
    h, w, _ = arr.shape
    chroma = arr.max(axis=2) - arr.min(axis=2)
    luma = arr.mean(axis=2)
    mask = (chroma > 28) | ((luma > 28) & (luma < 245))
    ys = np.where(mask.mean(axis=1) > 0.035)[0]
    xs = np.where(mask.mean(axis=0) > 0.035)[0]
    if len(xs) < 8 or len(ys) < 8:
        return img
    x0, x1 = int(xs[0]), int(xs[-1])
    y0, y1 = int(ys[0]), int(ys[-1])
    pad_x = max(4, int((x1 - x0) * 0.02))
    pad_y = max(4, int((y1 - y0) * 0.02))
    x0 = max(0, x0 - pad_x)
    y0 = max(0, y0 - pad_y)
    x1 = min(w - 1, x1 + pad_x)
    y1 = min(h - 1, y1 + pad_y)
    if (x1 - x0) * (y1 - y0) < w * h * 0.28:
        return img
    cropped = img.crop((x0, y0, x1 + 1, y1 + 1))
    c = np.array(cropped.convert("RGB"))
    core = (c.max(axis=2) - c.min(axis=2)) > 40
    core[: int(c.shape[0] * 0.08)] = False
    core[int(c.shape[0] * 0.78) :] = False
    ys2, xs2 = np.where(core)
    if len(xs2) < 20:
        return cropped
    cx0, cx1 = int(xs2.min()), int(xs2.max())
    cy0, cy1 = int(ys2.min()), int(ys2.max())
    if (cx1 - cx0 + 1) / max(1, cropped.width) > 0.82:
        return cropped
    side = int((cx1 - cx0 + 1) * 0.08)
    cx0 = max(0, cx0 - side)
    cx1 = min(cropped.width - 1, cx1 + side)
    extra_h = int((cx1 - cx0 + 1) / (2 / 3) - (cy1 - cy0 + 1))
    if extra_h > 0:
        cy0 = max(0, cy0 - extra_h // 3)
        cy1 = min(cropped.height - 1, cy1 + extra_h - extra_h // 3)
    return cropped.crop((cx0, cy0, cx1 + 1, cy1 + 1))


def page_image(pdf_path: Path) -> Image.Image:
    doc = pymupdf.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(2.4, 2.4), alpha=False)
    doc.close()
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def patch(courses) -> int:
    n = 0
    for course in courses:
        if course.get("id") in IDS:
            course["coverImageUrl"] = f"/book_covers/thumbs/{course['id']}.webp?v={VERSION}"
            n += 1
    return n


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    THUMBS.mkdir(parents=True, exist_ok=True)
    for book_id in IDS:
        pdf = ROOT / "book_html" / book_id / f"{book_id}.pdf"
        img = cover_crop(art_window(page_image(pdf)), TARGET)
        img.save(COVERS / f"{book_id}.webp", "WEBP", quality=88, method=6)
        thumb = img.copy()
        thumb.thumbnail((400, 600), Image.Resampling.LANCZOS)
        thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=84, method=6)
        print(book_id, img.size, thumb.size)

    for path in (
        ROOT / "public" / "data" / "indexeddb-export.json",
        ROOT / "public" / "data" / "home-catalog.json",
        ROOT / "deploy" / "indexeddb-export.json",
    ):
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        print(path.name, patch(data["courses"]))
        data["exportedAt"] = STAMP
        write(path, data)

    ver_path = ROOT / "public" / "data" / "catalog-version.json"
    ver = json.loads(ver_path.read_text(encoding="utf-8"))
    ver["exportedAt"] = STAMP
    write(ver_path, ver)
    print("stamp", STAMP)


if __name__ == "__main__":
    main()
