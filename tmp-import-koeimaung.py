import json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
STAMP = "1787400000000"

BOOKS = [
    {
        "id": "lyra-and-silent-frequency",
        "title": "Lyra and Silent Frequency",
        "description": "A cinematic story of Lyra and a silent frequency. Original fiction by KoEiMaung.",
        "category": "Fiction",
        "pages": 306,
        "courseIndex": 28,
        "icon": "🌅",
    },
    {
        "id": "rockstar-developer-2025",
        "title": "Rockstar Developer 2025",
        "description": "Full stack JavaScript handbook for 2025.",
        "category": "IT",
        "pages": 435,
        "courseIndex": 29,
        "icon": "🎸",
    },
    {
        "id": "n8n-book",
        "title": "n8n",
        "description": "Concise n8n automation guide.",
        "category": "IT, AI",
        "pages": 177,
        "courseIndex": 30,
        "icon": "🔗",
    },
    {
        "id": "openclaw-book",
        "title": "OpenClaw",
        "description": "Concise OpenClaw guide.",
        "category": "IT, AI",
        "pages": 129,
        "courseIndex": 31,
        "icon": "🦞",
    },
    {
        "id": "vibe-book-final",
        "title": "Vibe Coding",
        "description": "Concise vibe coding guide.",
        "category": "IT, AI",
        "pages": 209,
        "courseIndex": 32,
        "icon": "✨",
    },
    {
        "id": "koeimaung-programming-for-kids",
        "title": "Programming for Kids",
        "description": "Fun with logic and problem solving. Kids programming stories by KoEiMaung.",
        "category": "IT, Kid",
        "pages": 125,
        "courseIndex": 33,
        "icon": "🧸",
    },
]


def make_course(book: dict) -> dict:
    bid = book["id"]
    pdf = f"/book_html/{bid}/{bid}.pdf"
    chapters = []
    for n in range(1, book["pages"] + 1):
        ch_id = f"{bid}-ch-import-{STAMP}-{n}"
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
        "description": book["description"],
        "isPublished": True,
        "authorName": "KoEiMaung",
        "color": "#2563eb",
        "coverColorStart": "#2563eb",
        "coverColorMiddle": "#2563eb",
        "coverColorEnd": "#2563eb",
        "coverWidth": 100,
        "coverHeight": 150,
        "coverImageUrl": f"/book_covers/thumbs/{bid}.webp",
        "icon": book["icon"],
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
        "courseIndex": book["courseIndex"],
        "category": book["category"],
        "artifactType": "book",
        "pageViewType": "Auto",
        "bookHtmlFolder": bid,
        "stepCount": book["pages"],
        "chapters": chapters,
    }


def summary_from_course(course: dict) -> dict:
    keep = [
        "id",
        "title",
        "description",
        "color",
        "coverColorStart",
        "coverColorMiddle",
        "coverColorEnd",
        "coverWidth",
        "coverHeight",
        "coverImageUrl",
        "icon",
        "iconColorStart",
        "iconColorMiddle",
        "iconColorEnd",
        "iconSize",
        "iconPosition",
        "courseIndex",
        "category",
        "artifactType",
        "bookHtmlFolder",
        "stepCount",
        "pageViewType",
        "authorName",
        "isPublished",
    ]
    return {k: course[k] for k in keep if k in course}


def main() -> None:
    new_courses = [make_course(b) for b in BOOKS]
    new_ids = {c["id"] for c in new_courses}

    export_path = ROOT / "public" / "data" / "indexeddb-export.json"
    export = json.loads(export_path.read_text(encoding="utf-8"))
    export["courses"] = [c for c in export["courses"] if c.get("id") not in new_ids]
    export["courses"].extend(new_courses)
    export_path.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    home_path = ROOT / "public" / "data" / "home-catalog.json"
    home = json.loads(home_path.read_text(encoding="utf-8"))
    home["courses"] = [c for c in home["courses"] if c.get("id") not in new_ids]
    home["courses"].extend(summary_from_course(c) for c in new_courses)
    exported_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    home["exportedAt"] = exported_at
    home_path.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    version_path = ROOT / "public" / "data" / "catalog-version.json"
    version_path.write_text(
        json.dumps({"exportedAt": exported_at, "courseCount": len(export["courses"])}, indent=2) + "\n",
        encoding="utf-8",
    )

    deploy = ROOT / "deploy" / "indexeddb-export.json"
    if deploy.exists():
        deploy.write_text(export_path.read_text(encoding="utf-8"), encoding="utf-8")

    print("courses", len(export["courses"]), "exportedAt", exported_at)
    for b in BOOKS:
        print(f"{b['id']}\t{b['pages']}\t{b['category']}")


if __name__ == "__main__":
    main()
