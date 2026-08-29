"""Import Tootpee PDFs from ToUpload Kid/Comic/တွတ်ပီ. One book per PDF. Not app source."""
from __future__ import annotations

import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

import pymupdf
from PIL import Image

SRC = Path(r"C:\JC\Aung\Other\Dream\MagicLibrary\ToUpload")
ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
BOOK_HTML = ROOT / "book_html"
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
EXPORT = ROOT / "public" / "data" / "indexeddb-export.json"
HOME = ROOT / "public" / "data" / "home-catalog.json"
CATVER = ROOT / "public" / "data" / "catalog-version.json"
DEPLOY_EXPORT = ROOT / "deploy" / "indexeddb-export.json"
MAX_BYTES = 20 * 1024 * 1024
STAMP = int(datetime.now(timezone.utc).timestamp() * 1000)
EXPORTED_AT = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
AUTHOR = "ဆွေမင်း (ဓနုဖြူ)"


def discover() -> list[Path]:
    files: list[Path] = []
    for path in SRC.rglob("*.pdf"):
        parts = [p.lower() for p in path.relative_to(SRC).parts]
        joined = "/".join(parts)
        if "kid" in parts and "comic" in parts:
            files.append(path)
            continue
        if "တွတ်ပီ" in path.parts:
            files.append(path)
    return sorted(files, key=lambda p: p.name.lower())


def english_slug(stem: str) -> str:
    match = re.search(r"([A-Za-z][A-Za-z0-9_-]*)$", stem.strip())
    raw = match.group(1) if match else stem
    raw = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", raw)
    slug = raw.lower().replace("_", "-")
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    if not slug.startswith("tootpee-"):
        slug = f"tootpee-{slug}"
    return slug


def title_from_stem(stem: str) -> str:
    return re.sub(r"\s+", " ", stem).strip()


def compress_to_limit(src: Path, dest: Path) -> tuple[int, str, int]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    original = src.stat().st_size
    if original <= MAX_BYTES:
        shutil.copyfile(src, dest)
        return dest.stat().st_size, "copied", original

    doc = pymupdf.open(src)
    tmp = dest.with_suffix(".deflate.pdf")
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    doc.close()
    if tmp.stat().st_size <= MAX_BYTES:
        tmp.replace(dest)
        return dest.stat().st_size, "deflate", original

    for scale, quality in ((1.0, 72), (0.85, 65), (0.7, 55), (0.6, 50), (0.5, 45), (0.4, 40), (0.35, 38)):
        src_doc = pymupdf.open(src)
        out = pymupdf.open()
        for page in src_doc:
            pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
            img = pix.tobytes("jpeg", jpg_quality=quality)
            npage = out.new_page(width=page.rect.width, height=page.rect.height)
            npage.insert_image(npage.rect, stream=img)
        src_doc.close()
        trial = dest.with_suffix(f".q{quality}.pdf")
        out.save(trial, garbage=4, deflate=True)
        out.close()
        size = trial.stat().st_size
        print(f"  jpeg scale={scale} q={quality} -> {size / 1e6:.2f} MB")
        if size <= MAX_BYTES:
            if dest.exists():
                dest.unlink()
            trial.replace(dest)
            tmp.unlink(missing_ok=True)
            return size, f"jpeg-{scale}-{quality}", original
        trial.unlink(missing_ok=True)

    tmp.replace(dest)
    return dest.stat().st_size, "deflate-over-limit", original


def cover_fill(img: Image.Image, tw: int, th: int) -> Image.Image:
    scale = max(tw / img.width, th / img.height)
    nw, nh = max(1, int(img.width * scale)), max(1, int(img.height * scale))
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, (nw - tw) // 2)
    top = max(0, (nh - th) // 2)
    return img.crop((left, top, left + tw, top + th))


def save_cover(pdf_path: Path, book_id: str) -> str:
    THUMBS.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6), alpha=False)
    doc.close()
    mode = "RGB" if pix.n < 4 else "RGBA"
    img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
    if img.mode != "RGB":
        img = img.convert("RGB")
    canvas = cover_fill(img, 720, 1080)
    thumb = canvas.copy()
    thumb.thumbnail((360, 540), Image.Resampling.LANCZOS)
    canvas.save(COVERS / f"{book_id}.webp", "WEBP", quality=78, method=6)
    thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=72, method=6)
    return f"/book_covers/thumbs/{book_id}.webp"


def make_course(book: dict, page_count: int, cover: str, course_index: int) -> dict:
    bid = book["id"]
    pdf = f"/book_html/{bid}/{bid}.pdf"
    chapters = []
    for n in range(1, page_count + 1):
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
        "description": f"{book['title']}. Tootpee Myanmar comic by Swe Min.",
        "isPublished": True,
        "authorName": AUTHOR,
        "color": "#2563eb",
        "coverColorStart": "#facc15",
        "coverColorMiddle": "#f59e0b",
        "coverColorEnd": "#d97706",
        "coverWidth": 100,
        "coverHeight": 150,
        "coverImageUrl": cover,
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
        "category": "Kid, Comic, Tootpee, MM",
        "cat1": "Kid",
        "cat2": "Comic",
        "cat3": "Tootpee",
        "artifactType": "book",
        "pageViewType": "ComicView",
        "bookHtmlFolder": bid,
        "stepCount": page_count,
        "chapters": chapters,
    }


def summary_from_course(course: dict) -> dict:
    keep = [
        "id", "title", "description", "color", "coverColorStart", "coverColorMiddle",
        "coverColorEnd", "coverWidth", "coverHeight", "coverImageUrl", "icon",
        "iconColorStart", "iconColorMiddle", "iconColorEnd", "iconSize", "iconPosition",
        "courseIndex", "category", "cat1", "cat2", "cat3", "artifactType", "bookHtmlFolder",
        "stepCount", "pageViewType", "authorName", "isPublished",
    ]
    return {k: course[k] for k in keep if k in course}


def main() -> None:
    export = json.loads(EXPORT.read_text(encoding="utf-8"))
    existing = {c.get("id") for c in export["courses"]}
    results = []
    prepared = []
    files = discover()
    print("found", len(files), "pdfs")

    for src in files:
        bid = english_slug(src.stem)
        title = title_from_stem(src.stem)
        print("import", bid, "|", title.encode("unicode_escape").decode("ascii"))
        if bid in existing or any(p["id"] == bid for p in prepared):
            results.append((bid, "skipped", "id exists"))
            continue
        dest = BOOK_HTML / bid / f"{bid}.pdf"
        size, how, original = compress_to_limit(src, dest)
        print(f"  size {original / 1e6:.2f} -> {size / 1e6:.2f} MB ({how})")
        if size > MAX_BYTES:
            results.append((bid, "failed", f"still {size / 1e6:.2f} MB after {how}"))
            continue
        doc = pymupdf.open(dest)
        pages = doc.page_count
        doc.close()
        cover = save_cover(dest, bid)
        prepared.append(
            {
                "id": bid,
                "title": title,
                "pages": pages,
                "cover": cover,
                "size": size,
                "how": how,
                "original": original,
            }
        )
        results.append((bid, "imported", f"{pages}p {original / 1e6:.2f}->{size / 1e6:.2f}MB {how}"))

    if prepared:
        max_index = max((c.get("courseIndex") or 0) for c in export["courses"])
        new_courses = [
            make_course(b, b["pages"], b["cover"], max_index + i + 1)
            for i, b in enumerate(prepared)
        ]
        new_ids = {c["id"] for c in new_courses}
        export["courses"] = [c for c in export["courses"] if c.get("id") not in new_ids]
        export["courses"].extend(new_courses)
        export["exportedAt"] = EXPORTED_AT
        EXPORT.write_text(json.dumps(export, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        home = json.loads(HOME.read_text(encoding="utf-8"))
        home["courses"] = [c for c in home["courses"] if c.get("id") not in new_ids]
        home["courses"].extend(summary_from_course(c) for c in new_courses)
        home["exportedAt"] = EXPORTED_AT
        HOME.write_text(json.dumps(home, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        CATVER.write_text(
            json.dumps({"exportedAt": EXPORTED_AT, "courseCount": len(export["courses"])}, indent=2) + "\n",
            encoding="utf-8",
        )
        if DEPLOY_EXPORT.exists():
            DEPLOY_EXPORT.write_text(EXPORT.read_text(encoding="utf-8"), encoding="utf-8")
        print("catalog courses", len(export["courses"]), EXPORTED_AT)

    for row in results:
        print("\t".join(row))


if __name__ == "__main__":
    main()
