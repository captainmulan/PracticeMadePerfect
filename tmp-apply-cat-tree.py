import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def infer(course: dict) -> tuple[str, str, str, str]:
    tags = [part.strip() for part in str(course.get("category") or "").split(",") if part.strip()]
    tagset = {tag.lower() for tag in tags}
    cid = str(course.get("id") or "").lower()

    def has(name: str) -> bool:
        return name.lower() in tagset

    if "shwe-thway" in cid:
        return "Comic", "Kid", "Shwe Thway", ""
    if has("Language"):
        lang = next((tag for tag in ("Eng", "Jap", "Thai") if has(tag)), "")
        return "Language", lang, "", ""
    if has("AI"):
        return "IT", "Kid" if has("Kid") else "Other", "AI", ""
    if has("IT") and has("Kid"):
        return "IT", "Kid", "", ""
    if has("IT"):
        return "IT", "Other", "", ""
    if has("Fiction"):
        return "Fiction", "", "", ""
    if has("PersonalDevelopment"):
        return "PersonalDevelopment", "", "", ""
    if has("Comic") and has("Kid"):
        return "Comic", "Kid", "", ""
    if has("Comic"):
        return "Comic", "Other", "", ""
    if has("Kid"):
        return "Comic", "Kid", "", ""
    if tags:
        return tags[0], tags[1] if len(tags) > 1 else "", tags[2] if len(tags) > 2 else "", tags[3] if len(tags) > 3 else ""
    return "", "", "", ""


def apply(course: dict) -> None:
    cat1, cat2, cat3, cat4 = infer(course)
    course["cat1"] = cat1 or None
    course["cat2"] = cat2 or None
    course["cat3"] = cat3 or None
    course["cat4"] = cat4 or None
    parts = [part for part in (cat1, cat2, cat3, cat4) if part]
    tags = [part.strip() for part in str(course.get("category") or "").split(",") if part.strip()]
    if "MM" in tags and "MM" not in parts:
        parts.append("MM")
    if parts:
        course["category"] = ", ".join(parts)


def main() -> None:
    export_path = ROOT / "public" / "data" / "indexeddb-export.json"
    export = json.loads(export_path.read_text(encoding="utf-8"))
    for course in export["courses"]:
        apply(course)
    export["exportedAt"] = STAMP
    export_path.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    home_path = ROOT / "public" / "data" / "home-catalog.json"
    home = json.loads(home_path.read_text(encoding="utf-8"))
    for course in home["courses"]:
        apply(course)
    home["exportedAt"] = STAMP
    home_path.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (ROOT / "public" / "data" / "catalog-version.json").write_text(
        json.dumps({"exportedAt": STAMP, "courseCount": len(export["courses"])}, indent=2) + "\n",
        encoding="utf-8",
    )
    deploy = ROOT / "deploy" / "indexeddb-export.json"
    if deploy.exists():
        deploy.write_text(export_path.read_text(encoding="utf-8"), encoding="utf-8")

    sample = [(c["id"], c.get("cat1"), c.get("cat2"), c.get("cat3")) for c in home["courses"] if c["id"] in {
        "n8n-book", "koeimaung-programming-for-kids", "shwe-thway-journal-vol-56-no-10", "lyra-and-silent-frequency", "the-easiest-way-to-speak-japanese", "solarsystem"
    }]
    print("stamp", STAMP)
    for row in sample:
        print(row)


if __name__ == "__main__":
    main()
