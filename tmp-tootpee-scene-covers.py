import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
ASSET = Path(r"C:\Users\65966\.cursor\projects\c-Users-65966-PracticeMadePerfect\assets")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
TARGET = (1024, 1536)
IDS = [
    "tootpee-immortal-pill",
    "tootpee-monster-from-maze-mountain",
    "tootpee-monster-messenger",
    "tootpee-naughty-tiger",
    "tootpee-parent-love",
    "tootpee-royal",
    "tootpee-short-story-1",
    "tootpee-single-men-trouble",
    "tootpee-victim",
    "tootpee-village-donation",
]


def cover_fit(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    nw, nh = max(1, int(img.width * scale)), max(1, int(img.height * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def scene_only(src: Image.Image) -> Image.Image:
    w, h = src.size
    top = int(h * 0.42)
    cropped = src.crop((0, top, w, h))
    filled = fill_text_blobs(cropped)
    return cover_fit(filled, TARGET)


def fill_text_blobs(img: Image.Image) -> Image.Image:
    """Cover leftover title/speech-bubble text with nearby scene color."""
    import numpy as np

    arr = np.array(img.convert("RGB"))
    h, w = arr.shape[:2]
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    white = (r > 245) & (g > 245) & (b > 245)
    mask = white
    # ignore tiny speckles
    from collections import deque

    visited = np.zeros((h, w), dtype=bool)
    out = arr.copy()
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    min_area = int(w * h * 0.004)
    for y in range(h):
        row = mask[y]
        if not row.any():
            continue
        for x in range(w):
            if not mask[y, x] or visited[y, x]:
                continue
            q = deque([(x, y)])
            visited[y, x] = True
            cells = [(x, y)]
            while q:
                cx, cy = q.popleft()
                for dx, dy in dirs:
                    nx, ny = cx + dx, cy + dy
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    if visited[ny, nx] or not mask[ny, nx]:
                        continue
                    visited[ny, nx] = True
                    q.append((nx, ny))
                    cells.append((nx, ny))
            if len(cells) < min_area or len(cells) > int(w * h * 0.12):
                continue
            xs = [c[0] for c in cells]
            ys = [c[1] for c in cells]
            x0, x1 = max(0, min(xs) - 8), min(w - 1, max(xs) + 8)
            y0, y1 = max(0, min(ys) - 8), min(h - 1, max(ys) + 8)
            ring = []
            for yy in range(y0, y1 + 1):
                for xx in range(x0, x1 + 1):
                    if not mask[yy, xx]:
                        ring.append(out[yy, xx])
            if not ring:
                continue
            color = np.median(np.array(ring), axis=0).astype(np.uint8)
            for xx, yy in cells:
                out[yy, xx] = color
    return Image.fromarray(out)


def patch(courses) -> int:
    n = 0
    for course in courses:
        if course.get("id") in IDS:
            course["coverImageUrl"] = f"/book_covers/thumbs/{course['id']}.webp?v=scene3"
            n += 1
    return n


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for book_id in IDS:
        png = ASSET / f"cover-{book_id}.png"
        rgb = scene_only(Image.open(png).convert("RGB"))
        rgb.save(COVERS / f"{book_id}.webp", "WEBP", quality=90, method=6)
        thumb = rgb.copy()
        thumb.thumbnail((400, 600))
        thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=84, method=6)
        print("scene", book_id)

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
