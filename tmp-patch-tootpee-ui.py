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

TITLES = {
    "tootpee-immortal-pill": "တွတ်ပီ - ကျွန်ုပ် နဲ့ ImmortalPill",
    "tootpee-mandaly-trip": "တွတ်ပီ - ကျွန်ုပ် နဲ့ MandalyTrip",
    "tootpee-monster-from-maze-mountain": "တွတ်ပီ - ကျွန်ုပ် နဲ့ MonsterFromMazeMountain",
    "tootpee-monster-messenger": "တွတ်ပီ - ကျွန်ုပ် နဲ့ MonsterMessenger",
    "tootpee-naughty-tiger": "တွတ်ပီ - ကျွန်ုပ် နဲ့ NaughtyTiger",
    "tootpee-parent-love": "တွတ်ပီ - ကျွန်ုပ် နဲ့ Parent Love",
    "tootpee-royal": "တွတ်ပီ - ကျွန်ုပ် နဲ့ Royal",
    "tootpee-short-story-1": "တွတ်ပီ - ကျွန်ုပ် နဲ့ ShorStory1",
    "tootpee-single-men-trouble": "တွတ်ပီ - ကျွန်ုပ် နဲ့ SingleMenTrouble",
    "tootpee-victim": "တွတ်ပီ - ကျွန်ုပ် နဲ့ Victim",
    "tootpee-village-donation": "တွတ်ပီ - ကျွန်ုပ် နဲ့ VillageDonation",
    "tootpee-wild-and-civilized": "တွတ်ပီ - ကျွန်ုပ် နဲ့ အရိုင်းအယဉ်",
}

REGEN = [
    "tootpee-mandaly-trip",
    "tootpee-naughty-tiger",
    "tootpee-short-story-1",
    "tootpee-parent-love",
    "tootpee-village-donation",
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


def patch_courses(courses):
    n = 0
    for course in courses:
        cid = course.get("id")
        if cid not in TITLES:
            continue
        title = TITLES[cid]
        course["title"] = title
        course["description"] = f"{title}. Tootpee Myanmar comic by Swe Min."
        version = "tp2" if cid in REGEN else "tp1"
        course["coverImageUrl"] = f"/book_covers/thumbs/{cid}.webp?v={version}"
        n += 1
    return n


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    for bid in REGEN:
        save_cover(bid)

    export_path = ROOT / "public" / "data" / "indexeddb-export.json"
    export = json.loads(export_path.read_text(encoding="utf-8"))
    print("export", patch_courses(export["courses"]))
    export["exportedAt"] = STAMP
    write_json(export_path, export)

    home_path = ROOT / "public" / "data" / "home-catalog.json"
    home = json.loads(home_path.read_text(encoding="utf-8"))
    print("home", patch_courses(home["courses"]))
    home["exportedAt"] = STAMP
    write_json(home_path, home)

    deploy_path = ROOT / "deploy" / "indexeddb-export.json"
    if deploy_path.exists():
        deploy = json.loads(deploy_path.read_text(encoding="utf-8"))
        print("deploy", patch_courses(deploy["courses"]))
        deploy["exportedAt"] = STAMP
        write_json(deploy_path, deploy)

    ver_path = ROOT / "public" / "data" / "catalog-version.json"
    ver = json.loads(ver_path.read_text(encoding="utf-8"))
    ver["exportedAt"] = STAMP
    ver["courseCount"] = len(export["courses"])
    write_json(ver_path, ver)
    print("stamp", STAMP)


if __name__ == "__main__":
    main()
