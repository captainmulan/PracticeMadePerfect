import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
STAMP = "1787401000000"
EXPORTED_AT = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

BOOKS = [
    {"id": "english-american-idioms-meaning-way-of-uses", "title": "English American Idioms", "pages": 117, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "💬"},
    {"id": "english-writing-upper-intermediate-part-3", "title": "English Writing Upper Intermediate Part 3", "pages": 216, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "✍️"},
    {"id": "high-school-english-grammar-and-composation", "title": "High School English Grammar and Composition", "pages": 275, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "📘"},
    {"id": "how-to-write-in-english", "title": "How to Write in English", "pages": 235, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "📝"},
    {"id": "modern-american-english-speaking-and-grammar", "title": "Modern American English Speaking and Grammar", "pages": 200, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "🗣️"},
    {"id": "practice-with-exercises", "title": "Practice with Exercises", "pages": 199, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "✅"},
    {"id": "speak-english-for-nurses", "title": "Speak English for Nurses", "pages": 123, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "🩺"},
    {"id": "the-easiest-idioms", "title": "The Easiest Idioms", "pages": 133, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "💡"},
    {"id": "the-good-grammar-book-with-answers", "title": "The Good Grammar Book with Answers", "pages": 318, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "📗"},
    {"id": "the-most-beautiful-idiom", "title": "The Most Beautiful Idiom", "pages": 167, "category": "Language, MM, Eng", "authorName": "Unknown", "icon": "🌸"},
    {"id": "writing-method-essay-and-letter", "title": "Writing Method Essay and Letter", "pages": 185, "category": "Language, MM, Eng", "authorName": "Saw Han Nyunt", "icon": "✉️"},
    {"id": "modern-japanese-language-conversation", "title": "Modern Japanese Language Conversation", "pages": 211, "category": "Language, MM, Jap", "authorName": "Unknown", "icon": "🇯🇵"},
    {"id": "the-easiest-way-to-speak-japanese", "title": "The Easiest Way to Speak Japanese", "pages": 118, "category": "Language, MM, Jap", "authorName": "Unknown", "icon": "🇯🇵"},
    {"id": "speak-thai-burmese-and-english-daily", "title": "Speak Thai Burmese and English Daily", "pages": 225, "category": "Language, MM, Thai", "authorName": "Unknown", "icon": "🇹🇭"},
]


def make_course(book: dict, course_index: int) -> dict:
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
        "description": f"{book['title']}. Language study book.",
        "isPublished": True,
        "authorName": book["authorName"],
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
        "courseIndex": course_index,
        "category": book["category"],
        "artifactType": "book",
        "pageViewType": "NormalView",
        "bookHtmlFolder": bid,
        "stepCount": book["pages"],
        "chapters": chapters,
    }


def summary_from_course(course: dict) -> dict:
    keep = [
        "id", "title", "description", "color", "coverColorStart", "coverColorMiddle",
        "coverColorEnd", "coverWidth", "coverHeight", "coverImageUrl", "icon",
        "iconColorStart", "iconColorMiddle", "iconColorEnd", "iconSize", "iconPosition",
        "courseIndex", "category", "artifactType", "bookHtmlFolder", "stepCount",
        "pageViewType", "authorName", "isPublished",
    ]
    return {k: course[k] for k in keep if k in course}


def main() -> None:
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
        print(f"{b['id']}\t{b['pages']}\t{b['category']}\t{b['authorName']}")


if __name__ == "__main__":
    main()
