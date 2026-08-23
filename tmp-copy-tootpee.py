import json
import os
import shutil
from pathlib import Path

ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
SRC = Path(r"C:\JC\Aung\Other\Dream\MagicLibrary\ToUpload")
REFS = ROOT / "tmp-cover-refs"
REFS.mkdir(exist_ok=True)

BOOKS = [
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ ImmortalPill.pdf", "id": "tootpee-immortal-pill", "title": "Tootpee and Immortal Pill", "en": "ImmortalPill"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ MandalyTrip.pdf", "id": "tootpee-mandaly-trip", "title": "Tootpee and Mandalay Trip", "en": "MandalyTrip"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ MonsterFromMazeMountain.pdf", "id": "tootpee-monster-from-maze-mountain", "title": "Tootpee and Monster from Maze Mountain", "en": "MonsterFromMazeMountain"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ MonsterMessenger.pdf", "id": "tootpee-monster-messenger", "title": "Tootpee and Monster Messenger", "en": "MonsterMessenger"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ NaughtyTiger.pdf", "id": "tootpee-naughty-tiger", "title": "Tootpee and Naughty Tiger", "en": "NaughtyTiger"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ Parent Love.pdf", "id": "tootpee-parent-love", "title": "Tootpee and Parent Love", "en": "Parent Love"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ Royal.pdf", "id": "tootpee-royal", "title": "Tootpee and Royal", "en": "Royal"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ ShorStory1.pdf", "id": "tootpee-short-story-1", "title": "Tootpee Short Story 1", "en": "ShorStory1"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ SingleMenTrouble.pdf", "id": "tootpee-single-men-trouble", "title": "Tootpee and Single Men Trouble", "en": "SingleMenTrouble"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ Victim.pdf", "id": "tootpee-victim", "title": "Tootpee and Victim", "en": "Victim"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ VillageDonation.pdf", "id": "tootpee-village-donation", "title": "Tootpee and Village Donation", "en": "VillageDonation"},
    {"src_name": "တွတ်ပီ - ကျွန်ုပ် နဲ့ အရိုင်းအယဉ်.pdf", "id": "tootpee-wild-and-civilized", "title": "Tootpee Wild and Civilized", "en": "ayar"},
]


def find_pdf(name: str) -> Path:
    for dirpath, _, files in os.walk(SRC):
        if name in files:
            return Path(dirpath) / name
    raise FileNotFoundError(name)


def main() -> None:
    import pymupdf

    report = []
    for book in BOOKS:
        src = find_pdf(book["src_name"])
        dest_dir = ROOT / "book_html" / book["id"]
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / f"{book['id']}.pdf"
        shutil.copy2(src, dest)
        doc = pymupdf.open(dest)
        pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(1.1, 1.1), alpha=False)
        png = REFS / f"{book['id']}-p1.png"
        pix.save(str(png))
        report.append({"id": book["id"], "title": book["title"], "pages": doc.page_count, "bytes": dest.stat().st_size, "png": str(png)})
        doc.close()
        print("copied", book["id"], "pages", report[-1]["pages"])
    (ROOT / "tmp-tootpee-meta.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
