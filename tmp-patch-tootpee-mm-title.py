import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
ASSET = Path(r"C:\Users\65966\.cursor\projects\c-Users-65966-PracticeMadePerfect\assets")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
FONT = Path(r"C:\Windows\Fonts\mmrtextb.ttf")
FONT_REG = Path(r"C:\Windows\Fonts\mmrtext.ttf")
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
IDS = [
    "tootpee-immortal-pill",
    "tootpee-monster-from-maze-mountain",
    "tootpee-monster-messenger",
    "tootpee-parent-love",
    "tootpee-royal",
    "tootpee-short-story-1",
    "tootpee-single-men-trouble",
    "tootpee-victim",
    "tootpee-village-donation",
    "tootpee-wild-and-civilized",
]


def save_cover(book_id: str) -> None:
    png = ASSET / f"cover-{book_id}.png"
    img = Image.open(png).convert("RGB")
    img.save(COVERS / f"{book_id}.webp", "WEBP", quality=88, method=6)
    thumb = img.copy()
    overlay = Image.new("RGBA", thumb.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = thumb.size
    bar_h = int(h * 0.22)
    draw.rectangle((0, h - bar_h, w, h), fill=(12, 18, 32, 205))
    font = ImageFont.truetype(str(FONT if FONT.exists() else FONT_REG), max(28, int(h * 0.06)))
    draw.text((int(w * 0.07), h - bar_h + int(h * 0.05)), "တွတ်ပီ", font=font, fill=(255, 214, 102, 255))
    rgb = Image.alpha_composite(thumb.convert("RGBA"), overlay).convert("RGB")
    rgb.thumbnail((400, 600))
    rgb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=82, method=6)
    print("cover", book_id)


def patch(courses):
    n = 0
    for course in courses:
        if course.get("id") in IDS:
            course["coverImageUrl"] = f"/book_covers/thumbs/{course['id']}.webp?v=mm3"
            n += 1
    return n


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for book_id in IDS:
        save_cover(book_id)

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
