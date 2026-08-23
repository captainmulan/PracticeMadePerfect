import json
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
ASSET = Path(r"C:\Users\65966\.cursor\projects\c-Users-65966-PracticeMadePerfect\assets")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
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
FILL_WHITE = {"tootpee-parent-love"}


def fill_white_bubbles(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"))
    h, w = arr.shape[:2]
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mask = (r > 248) & (g > 248) & (b > 248)
    visited = np.zeros((h, w), dtype=bool)
    out = arr.copy()
    dirs = ((1, 0), (-1, 0), (0, 1), (0, -1))
    min_area = int(w * h * 0.008)
    max_area = int(w * h * 0.12)
    for y in range(h):
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
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx] and mask[ny, nx]:
                        visited[ny, nx] = True
                        q.append((nx, ny))
                        cells.append((nx, ny))
            if not (min_area <= len(cells) <= max_area):
                continue
            xs = [c[0] for c in cells]
            ys = [c[1] for c in cells]
            x0, x1 = max(0, min(xs) - 10), min(w - 1, max(xs) + 10)
            y0, y1 = max(0, min(ys) - 10), min(h - 1, max(ys) + 10)
            ring = [out[yy, xx] for yy in range(y0, y1 + 1) for xx in range(x0, x1 + 1) if not mask[yy, xx]]
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
            course["coverImageUrl"] = f"/book_covers/thumbs/{course['id']}.webp?v=notxt1"
            n += 1
    return n


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for book_id in IDS:
        img = Image.open(ASSET / f"cover-{book_id}.png").convert("RGB")
        if book_id in FILL_WHITE:
            img = fill_white_bubbles(img)
        img.save(COVERS / f"{book_id}.webp", "WEBP", quality=90, method=6)
        thumb = img.copy()
        thumb.thumbnail((400, 600))
        thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=84, method=6)
        print("cover", book_id, img.size)

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
