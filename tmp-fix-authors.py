"""Normalize Ko Ei Maung and copy authorName onto home-catalog summaries."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
EXPORT = ROOT / "public" / "data" / "indexeddb-export.json"
HOME = ROOT / "public" / "data" / "home-catalog.json"
CATVER = ROOT / "public" / "data" / "catalog-version.json"
DEPLOY = ROOT / "deploy" / "indexeddb-export.json"
KO = "Ko Ei Maung"
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

KEEP = [
    "id", "title", "description", "color", "coverColorStart", "coverColorMiddle",
    "coverColorEnd", "coverWidth", "coverHeight", "coverImageUrl", "icon",
    "iconColorStart", "iconColorMiddle", "iconColorEnd", "iconSize", "iconPosition",
    "courseIndex", "category", "cat1", "cat2", "cat3", "pIndex", "scIndex", "sIndex",
    "artifactType", "bookHtmlFolder", "stepCount", "pageViewType", "authorName",
    "authorPicture", "isPublished",
]


def compact(name: str) -> str:
    return re.sub(r"[^a-z0-9\u1000-\u109f]", "", name.lower())


def canonical(raw: str | None, book_id: str, category: str) -> str:
    text = re.sub(r"\s+", " ", (raw or "").strip())
    if compact(text) == "koeimaung" or "koeimaung" in book_id.lower():
        return KO
    if text:
        return text
    if book_id.startswith("tootpee") or "Tootpee" in category:
        return "ဆွေမင်း (ဓနုဖြူ)"
    if book_id.startswith("shwe-thway") or "Shwe Thway" in category:
        return "Shwe Thway Writer"
    return "Unknown"


def summary(course: dict) -> dict:
    return {k: course[k] for k in KEEP if k in course and course[k] is not None}


def main() -> None:
    export = json.loads(EXPORT.read_text(encoding="utf-8"))
    counts: dict[str, int] = {}
    for course in export["courses"]:
        before = course.get("authorName")
        after = canonical(before if isinstance(before, str) else None, course.get("id") or "", course.get("category") or "")
        course["authorName"] = after
        counts[after] = counts.get(after, 0) + 1
    export["exportedAt"] = STAMP
    EXPORT.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    home = json.loads(HOME.read_text(encoding="utf-8"))
    by_id = {c["id"]: c for c in export["courses"]}
    home["courses"] = [summary(by_id[c["id"]]) if c.get("id") in by_id else c for c in home["courses"]]
    # Keep export-only new books too
    home_ids = {c.get("id") for c in home["courses"]}
    for course in export["courses"]:
        if course["id"] not in home_ids:
            home["courses"].append(summary(course))
    home["exportedAt"] = STAMP
    HOME.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    CATVER.write_text(
        json.dumps({"exportedAt": STAMP, "courseCount": len(export["courses"])}, indent=2) + "\n",
        encoding="utf-8",
    )
    if DEPLOY.exists():
        DEPLOY.write_text(EXPORT.read_text(encoding="utf-8"), encoding="utf-8")
    print("stamp", STAMP)
    for name, n in sorted(counts.items(), key=lambda x: (-x[1], x[0])):
        print(f"{n:3} {name}")


if __name__ == "__main__":
    main()
