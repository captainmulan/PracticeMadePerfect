import json
from datetime import datetime, timezone
from pathlib import Path

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


def patch(courses) -> int:
    n = 0
    for course in courses:
        if course.get("id") in IDS:
            course["coverImageUrl"] = f"/book_covers/thumbs/{course['id']}.webp?v=full1"
            n += 1
    return n


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for book_id in IDS:
        img = Image.open(ASSET / f"cover-{book_id}.png").convert("RGB")
        img.save(COVERS / f"{book_id}.webp", "WEBP", quality=90, method=6)
        thumb = img.copy()
        thumb.thumbnail((400, 600))
        thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=84, method=6)
        print("full", book_id, img.size)

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
