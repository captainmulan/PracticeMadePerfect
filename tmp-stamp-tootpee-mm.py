"""Render တွတ်ပီ with HarfBuzz (correct Myanmar shaping) onto covers."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import uharfbuzz as hb
from freetype import Face, FT_LOAD_RENDER
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
ASSET = Path(r"C:\Users\65966\.cursor\projects\c-Users-65966-PracticeMadePerfect\assets")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
FONT_MM = Path(r"C:\Windows\Fonts\mmrtext.ttf")
FONT_EN = Path(r"C:\Windows\Fonts\arialbd.ttf")
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
MM = "တွတ်ပီ"

BOOKS = [
    ("tootpee-immortal-pill", "IMMORTAL PILL"),
    ("tootpee-monster-from-maze-mountain", "MONSTER FROM MAZE MOUNTAIN"),
    ("tootpee-monster-messenger", "MONSTER MESSENGER"),
    ("tootpee-naughty-tiger", "NAUGHTY TIGER"),
    ("tootpee-parent-love", "PARENT LOVE"),
    ("tootpee-royal", "ROYAL"),
    ("tootpee-short-story-1", "SHORT STORY 1"),
    ("tootpee-single-men-trouble", "SINGLE MEN TROUBLE"),
    ("tootpee-victim", "VICTIM"),
    ("tootpee-village-donation", "VILLAGE DONATION"),
]


def render_shaped(text: str, font_path: Path, pixel_size: int, fill: tuple[int, int, int]) -> Image.Image:
    fontdata = font_path.read_bytes()
    hb_font = hb.Font(hb.Face(fontdata))
    hb_font.scale = (pixel_size * 64, pixel_size * 64)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf)

    ft = Face(str(font_path))
    ft.set_pixel_sizes(0, pixel_size)

    glyphs = []
    pen_x = 0
    minx, miny, maxx, maxy = 10**9, 10**9, -10**9, -10**9
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        ft.load_glyph(info.codepoint, FT_LOAD_RENDER)
        bmp = ft.glyph.bitmap
        top = ft.glyph.bitmap_top
        left = ft.glyph.bitmap_left
        x0 = pen_x + (pos.x_offset / 64) + left
        y0 = -(pos.y_offset / 64) - top
        if bmp.width and bmp.rows:
            arr = np.array(bmp.buffer, dtype=np.uint8).reshape(bmp.rows, bmp.width)
            x1 = x0 + bmp.width
            y1 = y0 + bmp.rows
            minx, miny = min(minx, x0), min(miny, y0)
            maxx, maxy = max(maxx, x1), max(maxy, y1)
            glyphs.append((x0, y0, arr))
        pen_x += pos.x_advance / 64

    if not glyphs:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))

    pad = 18
    w = int(np.ceil(maxx - minx)) + pad * 2
    h = int(np.ceil(maxy - miny)) + pad * 2
    out = np.zeros((h, w, 4), dtype=np.uint8)
    fr, fg, fb = fill
    for x0, y0, arr in glyphs:
        x = int(round(x0 - minx + pad))
        y = int(round(y0 - miny + pad))
        hh, ww = arr.shape
        region = out[y : y + hh, x : x + ww]
        a = arr.astype(np.uint16)
        region[..., 0] = np.maximum(region[..., 0], (a * fr // 255).astype(np.uint8))
        region[..., 1] = np.maximum(region[..., 1], (a * fg // 255).astype(np.uint8))
        region[..., 2] = np.maximum(region[..., 2], (a * fb // 255).astype(np.uint8))
        region[..., 3] = np.maximum(region[..., 3], arr)
    return Image.fromarray(out, "RGBA")


def with_outline(glyph: Image.Image, stroke: tuple[int, int, int], width: int) -> Image.Image:
    w, h = glyph.size
    canvas = Image.new("RGBA", (w + width * 2, h + width * 2), (0, 0, 0, 0))
    alpha = glyph.split()[-1]
    stroke_img = Image.new("RGBA", glyph.size, stroke + (0,))
    stroke_img.putalpha(alpha)
    for dx in range(-width, width + 1):
        for dy in range(-width, width + 1):
            if dx * dx + dy * dy > width * width:
                continue
            canvas.alpha_composite(stroke_img, (width + dx + 3, width + dy + 5))
    canvas.alpha_composite(glyph, (width, width))
    return canvas


def fit_en(text: str, max_w: int, start: int) -> ImageFont.FreeTypeFont:
    size = start
    while size > 18:
        font = ImageFont.truetype(str(FONT_EN), size)
        box = font.getbbox(text)
        if box[2] - box[0] <= max_w:
            return font
        size -= 2
    return ImageFont.truetype(str(FONT_EN), 18)


def stamp(base: Image.Image, subtitle: str, mm_img: Image.Image) -> Image.Image:
    img = base.convert("RGBA")
    w, h = img.size
    plate = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(plate)
    band_h = int(h * 0.36)
    draw.rectangle((0, 0, w, band_h), fill=(12, 16, 30, 255))
    draw.rectangle((0, band_h, w, band_h + 6), fill=(212, 160, 48, 255))

    max_w = int(w * 0.90)
    logo = mm_img.copy()
    lw, lh = logo.size
    scale = min(max_w / lw, (band_h * 0.58) / lh)
    logo = logo.resize((max(1, int(lw * scale)), max(1, int(lh * scale))), Image.Resampling.LANCZOS)
    lx = (w - logo.size[0]) // 2
    ly = int(h * 0.03)
    plate.alpha_composite(logo, (lx, ly))

    font = fit_en(subtitle, int(w * 0.90), int(h * 0.042))
    box = font.getbbox(subtitle)
    tw, th = box[2] - box[0], box[3] - box[1]
    tx = (w - tw) // 2 - box[0]
    ty = ly + logo.size[1] + int(h * 0.012) - box[1]
    for dx in range(-3, 4):
        for dy in range(-3, 4):
            draw.text((tx + dx, ty + dy), subtitle, font=font, fill=(0, 0, 0, 255))
    draw.text((tx, ty), subtitle, font=font, fill=(255, 255, 255, 255))
    return Image.alpha_composite(img, plate).convert("RGB")


def save_thumbs(rgb: Image.Image, book_id: str, mm_img: Image.Image) -> None:
    rgb.save(COVERS / f"{book_id}.webp", "WEBP", quality=90, method=6)
    overlay = Image.new("RGBA", rgb.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = rgb.size
    bar_h = int(h * 0.16)
    draw.rectangle((0, h - bar_h, w, h), fill=(12, 18, 32, 210))
    mini = mm_img.copy()
    mini.thumbnail((int(w * 0.55), int(bar_h * 0.72)))
    overlay.alpha_composite(mini, (int(w * 0.06), h - bar_h + (bar_h - mini.size[1]) // 2))
    thumb = Image.alpha_composite(rgb.convert("RGBA"), overlay).convert("RGB")
    thumb.thumbnail((400, 600))
    thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=84, method=6)


def patch(courses) -> int:
    ids = {b[0] for b in BOOKS}
    n = 0
    for course in courses:
        if course.get("id") in ids:
            course["coverImageUrl"] = f"/book_covers/thumbs/{course['id']}.webp?v=mm5"
            n += 1
    return n


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    raw = render_shaped(MM, FONT_MM, 200, (255, 220, 70))
    mm_img = with_outline(raw, (140, 16, 22), 3)
    mm_img.save(ROOT / "tmp-cover-refs" / "tootpee-mm-correct.png")

    for book_id, subtitle in BOOKS:
        src = ASSET / f"cover-{book_id}.png"
        rgb = stamp(Image.open(src), subtitle, mm_img)
        save_thumbs(rgb, book_id, mm_img)
        if book_id in ("tootpee-immortal-pill", "tootpee-parent-love", "tootpee-short-story-1"):
            rgb.save(ROOT / "tmp-cover-refs" / f"{book_id}-stamped.png")
        print("stamped", book_id)

    export_path = ROOT / "public" / "data" / "indexeddb-export.json"
    export = json.loads(export_path.read_text(encoding="utf-8"))
    print("export", patch(export["courses"]))
    export["exportedAt"] = STAMP
    write(export_path, export)

    home_path = ROOT / "public" / "data" / "home-catalog.json"
    home = json.loads(home_path.read_text(encoding="utf-8"))
    print("home", patch(home["courses"]))
    home["exportedAt"] = STAMP
    write(home_path, home)

    deploy_path = ROOT / "deploy" / "indexeddb-export.json"
    if deploy_path.exists():
        deploy = json.loads(deploy_path.read_text(encoding="utf-8"))
        print("deploy", patch(deploy["courses"]))
        deploy["exportedAt"] = STAMP
        write(deploy_path, deploy)

    ver_path = ROOT / "public" / "data" / "catalog-version.json"
    ver = json.loads(ver_path.read_text(encoding="utf-8"))
    ver["exportedAt"] = STAMP
    write(ver_path, ver)
    print("stamp", STAMP)


if __name__ == "__main__":
    main()
