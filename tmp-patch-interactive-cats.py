"""Patch Kid Interactive / Kid IT categories on the four HTML books."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
EXPORT = ROOT / "public" / "data" / "indexeddb-export.json"
HOME = ROOT / "public" / "data" / "home-catalog.json"
CATVER = ROOT / "public" / "data" / "catalog-version.json"
DEPLOY = ROOT / "deploy" / "indexeddb-export.json"
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

PATCH = {
    "solarsystem": ("Kid, Interactive", "Kid", "Interactive", ""),
    "myfirst100mmwords": ("Kid, Interactive", "Kid", "Interactive", ""),
    "oceanadventure": ("Kid, Interactive", "Kid", "Interactive", ""),
    "little-programmer": ("Kid, IT", "Kid", "IT", ""),
}


def apply(course: dict) -> bool:
    spec = PATCH.get(course.get("id"))
    if not spec:
        return False
    category, cat1, cat2, cat3 = spec
    course["category"] = category
    course["cat1"] = cat1
    course["cat2"] = cat2
    course["cat3"] = cat3
    return True


def main() -> None:
    export = json.loads(EXPORT.read_text(encoding="utf-8"))
    hit = 0
    for course in export["courses"]:
        if apply(course):
            hit += 1
            print("export", course["id"], course["category"])
    export["exportedAt"] = STAMP
    EXPORT.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    home = json.loads(HOME.read_text(encoding="utf-8"))
    for course in home["courses"]:
        apply(course)
    home["exportedAt"] = STAMP
    HOME.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    CATVER.write_text(
        json.dumps({"exportedAt": STAMP, "courseCount": len(export["courses"])}, indent=2) + "\n",
        encoding="utf-8",
    )
    if DEPLOY.exists():
        DEPLOY.write_text(EXPORT.read_text(encoding="utf-8"), encoding="utf-8")
    print("patched", hit, "stamp", STAMP)


if __name__ == "__main__":
    main()
