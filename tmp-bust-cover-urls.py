import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
IDS = {
    "english-american-idioms-meaning-way-of-uses",
    "english-writing-upper-intermediate-part-3",
    "high-school-english-grammar-and-composation",
    "how-to-write-in-english",
    "modern-american-english-speaking-and-grammar",
    "practice-with-exercises",
    "speak-english-for-nurses",
    "the-easiest-idioms",
    "the-good-grammar-book-with-answers",
    "the-most-beautiful-idiom",
    "writing-method-essay-and-letter",
    "modern-japanese-language-conversation",
    "the-easiest-way-to-speak-japanese",
    "speak-thai-burmese-and-english-daily",
}


def patch(courses):
    count = 0
    for course in courses:
        if course.get("id") in IDS:
            course["coverImageUrl"] = "/book_covers/thumbs/" + course["id"] + ".webp?v=mm1"
            count += 1
    return count


def main():
    export_path = ROOT / "public" / "data" / "indexeddb-export.json"
    export = json.loads(export_path.read_text(encoding="utf-8"))
    print("export", patch(export["courses"]))
    export["exportedAt"] = STAMP
    export_path.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    home_path = ROOT / "public" / "data" / "home-catalog.json"
    home = json.loads(home_path.read_text(encoding="utf-8"))
    print("home", patch(home["courses"]))
    home["exportedAt"] = STAMP
    home_path.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (ROOT / "public" / "data" / "catalog-version.json").write_text(
        json.dumps({"exportedAt": STAMP, "courseCount": len(export["courses"])}, indent=2) + "\n",
        encoding="utf-8",
    )
    deploy = ROOT / "deploy" / "indexeddb-export.json"
    if deploy.exists():
        deploy.write_text(export_path.read_text(encoding="utf-8"), encoding="utf-8")
    print("stamp", STAMP)


if __name__ == "__main__":
    main()
