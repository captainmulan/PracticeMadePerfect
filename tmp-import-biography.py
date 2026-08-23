"""One-off Biography PDF import. Not app source."""
from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

import pymupdf
from PIL import Image

SRC = Path(r"C:\JC\Aung\Other\Dream\MagicLibrary\ToUpload\Unknown (If found from pdf use)\Biography\MM")
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

BOOKS = [
    {"id": "che-guevara", "file": "che-guevara.pdf", "title": "Che Guevara", "icon": "⭐"},
    {"id": "elon-musk", "file": "elon-musk.pdf", "title": "Elon Musk", "icon": "🚀"},
    {"id": "florence-nightingale", "file": "florence-nightingale.pdf", "title": "Florence Nightingale", "icon": "🕯️"},
    {"id": "georg-washington", "file": "georg-washington.pdf", "title": "George Washington", "icon": "🇺🇸"},
]


def author_from_pdf(doc: pymupdf.Document) -> str:
    meta = doc.metadata or {}
    author = (meta.get("author") or "").strip()
    return author or "Unknown"


def compress_to_limit(src: Path, dest: Path) -> tuple[int, str]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if src.stat().st_size <= MAX_BYTES:
        shutil.copyfile(src, dest)
        return dest.stat().st_size, "copied"

    doc = pymupdf.open(src)
    tmp = dest.with_suffix(".deflate.pdf")
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    doc.close()
    if tmp.stat().st_size <= MAX_BYTES:
        tmp.replace(dest)
        return dest.stat().st_size, "deflate"

    for scale, quality in ((1.0, 72), (0.85, 65), (0.7, 55), (0.6, 50)):
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
            return size, f"jpeg-{scale}-{quality}"
        trial.unlink(missing_ok=True)

    tmp.replace(dest)
    return dest.stat().st_size, "deflate-over-limit"


def trim_raster(pix: pymupdf.Pixmap) -> Image.Image:
    mode = "RGB" if pix.n < 4 else "RGBA"
    img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
    if img.mode != "RGB":
        img = img.convert("RGB")
    gray = img.convert("L")
    bw = gray.point(lambda p: 0 if p < 250 else 255)
    bbox = bw.getbbox()
    if not bbox:
        return img
    pad = max(4, int(min(img.size) * 0.012))
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


def save_cover(pdf_path: Path, book_id: str) -> str:
    THUMBS.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6), alpha=False)
    doc.close()
    img = trim_raster(pix)
    canvas = Image.new("RGB", (720, 1080), (18, 24, 38))
    img.thumbnail((720, 1080), Image.Resampling.LANCZOS)
    x = (720 - img.width) // 2
    y = (1080 - img.height) // 2
    canvas.paste(img, (x, y))
    thumb = canvas.copy()
    thumb.thumbnail((360, 540), Image.Resampling.LANCZOS)
    canvas.save(COVERS / f"{book_id}.webp", "WEBP", quality=78, method=6)
    thumb.save(THUMBS / f"{book_id}.webp", "WEBP", quality=72, method=6)
    return f"/book_covers/thumbs/{book_id}.webp"


def make_course(book: dict, page_count: int, author: str, cover: str, course_index: int) -> dict:
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
        "description": f"{book['title']}. Biography.",
        "isPublished": True,
        "authorName": author,
        "color": "#2563eb",
        "coverColorStart": "#2563eb",
        "coverColorMiddle": "#2563eb",
        "coverColorEnd": "#2563eb",
        "coverWidth": 100,
        "coverHeight": 150,
        "coverImageUrl": cover,
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
        "category": "Biography, MM",
        "artifactType": "book",
        "pageViewType": "NormalView",
        "bookHtmlFolder": bid,
        "stepCount": page_count,
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
    results = []
    prepared = []
    for book in BOOKS:
        src = SRC / book["file"]
        dest_dir = BOOK_HTML / book["id"]
        dest = dest_dir / f"{book['id']}.pdf"
        print("import", book["id"])
        if not src.exists():
            results.append((book["id"], "failed", "source missing"))
            continue
        size, how = compress_to_limit(src, dest)
        if size > MAX_BYTES:
            results.append((book["id"], "failed", f"still {size / 1e6:.2f} MB after {how}"))
            continue
        doc = pymupdf.open(dest)
        pages = doc.page_count
        author = author_from_pdf(doc)
        doc.close()
        cover = save_cover(dest, book["id"])
        prepared.append({**book, "pages": pages, "author": author, "cover": cover, "size": size, "how": how})
        results.append((book["id"], "imported", f"{pages}p {size / 1e6:.2f}MB {how}"))

    if not prepared:
        print("nothing to catalog")
        for r in results:
            print("\t".join(r))
        return

    export = json.loads(EXPORT.read_text(encoding="utf-8"))
    max_index = max((c.get("courseIndex") or 0) for c in export["courses"])
    new_courses = [
        make_course(b, b["pages"], b["author"], b["cover"], max_index + i + 1)
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
    for r in results:
        print("\t".join(r))


if __name__ == "__main__":
    main()
