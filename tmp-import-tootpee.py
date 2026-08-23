import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
STAMP_CH = "1787412000000"
EXPORTED_AT = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
ASSET = Path(r"C:\Users\65966\.cursor\projects\c-Users-65966-PracticeMadePerfect\assets")
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
FONT = Path(r"C:\Windows\Fonts\mmrtextb.ttf")
FONT_REG = Path(r"C:\Windows\Fonts\mmrtext.ttf")

BOOKS = [
    {"id": "tootpee-immortal-pill", "title": "Tootpee and Immortal Pill", "pages": 147},
    {"id": "tootpee-mandaly-trip", "title": "Tootpee and Mandalay Trip", "pages": 85},
    {"id": "tootpee-monster-from-maze-mountain", "title": "Tootpee and Monster from Maze Mountain", "pages": 259},
    {"id": "tootpee-monster-messenger", "title": "Tootpee and Monster Messenger", "pages": 80},
    {"id": "tootpee-naughty-tiger", "title": "Tootpee and Naughty Tiger", "pages": 142},
    {"id": "tootpee-parent-love", "title": "Tootpee and Parent Love", "pages": 224},
    {"id": "tootpee-royal", "title": "Tootpee and Royal", "pages": 204},
    {"id": "tootpee-short-story-1", "title": "Tootpee Short Story 1", "pages": 135},
    {"id": "tootpee-single-men-trouble", "title": "Tootpee and Single Men Trouble", "pages": 189},
    {"id": "tootpee-victim", "title": "Tootpee and Victim", "pages": 259},
    {"id": "tootpee-village-donation", "title": "Tootpee and Village Donation", "pages": 113},
    {"id": "tootpee-wild-and-civilized", "title": "Tootpee Wild and Civilized", "pages": 145},
]


def save_covers() -> None:
    import subprocess
    # converted below with PIL
    for book in BOOKS:
        png = ASSET / f"cover-{book['id']}.png"
        img = Image.open(png).convert("RGB")
        img.save(COVERS / f"{book['id']}.webp", "WEBP", quality=88, method=6)
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
        rgb.save(THUMBS / f"{book['id']}.webp", "WEBP", quality=82, method=6)
        print("cover", book["id"])


def make_course(book: dict, course_index: int) -> dict:
    bid = book["id"]
    pdf = f"/book_html/{bid}/{bid}.pdf"
    chapters = []
    for n in range(1, book["pages"] + 1):
        ch_id = f"{bid}-ch-import-{STAMP_CH}-{n}"
        chapters.append(
            {
                "id": ch_id,
                "courseId": bid,
                "chapterIndex": 0,
                "title": f"Page {n}",
                "steps": [
                    {
                        "id": f"{ch_id}-step-0",
                        "courseId": bid,
                        "chapterId": ch_id,
                        "chapterTitle": f"Page {n}",
                        "chapterIndex": 0,
                        "stepIndex": n,
                        "stepType": "pdf",
                        "title": f"Page {n}",
                        "description": "",
                        "contentHtml": f"{pdf}#page={n}",
                    }
                ],
            }
        )
    return {
        "id": bid,
        "title": book["title"],
        "description": f"{book['title']}. Tootpee Myanmar comic by Swe Min.",
        "isPublished": True,
        "authorName": "ဆွေမင်း (ဓနုဖြူ)",
        "color": "#2563eb",
        "coverColorStart": "#facc15",
        "coverColorMiddle": "#f59e0b",
        "coverColorEnd": "#d97706",
        "coverWidth": 100,
        "coverHeight": 150,
        "coverImageUrl": f"/book_covers/thumbs/{bid}.webp",
        "icon": "📒",
        "iconColorStart": "#fff",
        "iconColorMiddle": "#fff",
        "iconColorEnd": "#fff",
        "iconSize": 80,
        "titleFontSize": 50,
        "titleFontWeight": "bolder",
        "titleColor": "#faf5f5",
        "titlePosition": "bottom-left",
        "titleTextAlign": "left",
        "iconPosition": "center-center",
        "courseIndex": course_index,
        "category": "Comic, Other, Tootpee, MM",
        "cat1": "Comic",
        "cat2": "Other",
        "cat3": "Tootpee",
        "artifactType": "book",
        "pageViewType": "ComicView",
        "bookHtmlFolder": bid,
        "stepCount": book["pages"],
        "chapters": chapters,
    }


def summary_from_course(course: dict) -> dict:
    keep = [
        "id", "title", "description", "color", "coverColorStart", "coverColorMiddle",
        "coverColorEnd", "coverWidth", "coverHeight", "coverImageUrl", "icon",
        "iconColorStart", "iconColorMiddle", "iconColorEnd", "iconSize", "iconPosition",
        "courseIndex", "category", "cat1", "cat2", "cat3", "cat4", "artifactType",
        "bookHtmlFolder", "stepCount", "pageViewType", "authorName", "isPublished",
    ]
    return {k: course[k] for k in keep if k in course and course[k] is not None}


def main() -> None:
    import shutil
    folder_src = ASSET / "folder-tootpee.png"
    from PIL import Image as PImage
    tile = PImage.open(folder_src).convert("RGB")
    tile.thumbnail((240, 360))
    (ROOT / "public" / "flags").mkdir(exist_ok=True)
    tile.save(ROOT / "public" / "flags" / "tootpee.webp", "WEBP", quality=84, method=6)

    save_covers()

    export_path = ROOT / "public" / "data" / "indexeddb-export.json"
    export = json.loads(export_path.read_text(encoding="utf-8"))
    max_index = max((c.get("courseIndex") or 0) for c in export["courses"])
    new_courses = [make_course(b, max_index + i + 1) for i, b in enumerate(BOOKS)]
    new_ids = {c["id"] for c in new_courses}
    export["courses"] = [c for c in export["courses"] if c.get("id") not in new_ids]
    export["courses"].extend(new_courses)
    export["exportedAt"] = EXPORTED_AT
    export_path.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    home_path = ROOT / "public" / "data" / "home-catalog.json"
    home = json.loads(home_path.read_text(encoding="utf-8"))
    home["courses"] = [c for c in home["courses"] if c.get("id") not in new_ids]
    home["courses"].extend(summary_from_course(c) for c in new_courses)
    home["exportedAt"] = EXPORTED_AT
    home_path.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (ROOT / "public" / "data" / "catalog-version.json").write_text(
        json.dumps({"exportedAt": EXPORTED_AT, "courseCount": len(export["courses"])}, indent=2) + "\n",
        encoding="utf-8",
    )
    deploy = ROOT / "deploy" / "indexeddb-export.json"
    if deploy.exists():
        deploy.write_text(export_path.read_text(encoding="utf-8"), encoding="utf-8")
    print("courses", len(export["courses"]), EXPORTED_AT)
    for b in BOOKS:
        print(b["id"], b["pages"])


if __name__ == "__main__":
    main()
