"""One-off batch import: copy PDFs, covers, catalog records. Not app source."""
from __future__ import annotations

import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

import pymupdf
from PIL import Image

SRC = Path(r"C:\JC\Aung\Other\Dream\MagicLibrary\ToUpload\Comic\MM\ShweThway")
ROOT = Path(r"C:\Users\65966\PracticeMadePerfect")
BOOK_HTML = ROOT / "book_html"
COVERS = ROOT / "public" / "book_covers"
THUMBS = COVERS / "thumbs"
EXPORT = ROOT / "public" / "data" / "indexeddb-export.json"
HOME = ROOT / "public" / "data" / "home-catalog.json"
CATVER = ROOT / "public" / "data" / "catalog-version.json"
DEPLOY_EXPORT = ROOT / "deploy" / "indexeddb-export.json"

STAMP = int(datetime.now(timezone.utc).timestamp() * 1000)


def slug_id(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def title_from_name(stem: str) -> str:
    m = re.search(r"vol-(\d+)-no-(\d+)", stem, re.I)
    if m:
        return f"Shwe Thway {m.group(1)}/{m.group(2)}"
    return "Shwe Thway"


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
    page = doc[0]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6), alpha=False)
    doc.close()
    img = trim_raster(pix)
    img.thumbnail((360, 540), Image.Resampling.LANCZOS)
    thumb = THUMBS / f"{book_id}.webp"
    full = COVERS / f"{book_id}.webp"
    img.save(thumb, "WEBP", quality=72, method=6)
    shutil.copyfile(thumb, full)
    return f"/book_covers/thumbs/{book_id}.webp"


def build_course(book_id: str, title: str, folder: str, pdf_name: str, page_count: int, cover: str, course_index: int) -> dict:
    chapters = []
    for n in range(1, page_count + 1):
        ch_id = f"{book_id}-ch-import-{STAMP}-{n}"
        step_id = f"{ch_id}-step-0"
        chapters.append(
            {
                "id": ch_id,
                "courseId": book_id,
                "chapterIndex": 0,
                "title": f"Page {n}",
                "steps": [
                    {
                        "id": step_id,
                        "courseId": book_id,
                        "chapterId": ch_id,
                        "chapterTitle": f"Page {n}",
                        "chapterIndex": 0,
                        "stepIndex": n,
                        "stepType": "pdf",
                        "title": f"Page {n}",
                        "description": "",
                        "contentHtml": f"/book_html/{folder}/{pdf_name}#page={n}",
                    }
                ],
            }
        )
    return {
        "id": book_id,
        "title": title,
        "description": f"Shwe Thway comic journal {title}. Burmese and English stories for kids.",
        "isPublished": True,
        "authorName": "Shwe Thway Writer",
        "color": "#2563eb",
        "coverColorStart": "#2563eb",
        "coverColorMiddle": "#2563eb",
        "coverColorEnd": "#2563eb",
        "coverWidth": 100,
        "coverHeight": 150,
        "coverImageUrl": cover,
        "icon": "📘",
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
        "category": "Kid",
        "pIndex": 6,
        "artifactType": "book",
        "pageViewType": "ComicView",
        "bookHtmlFolder": folder,
        "stepCount": page_count,
        "chapters": chapters,
    }


def home_summary(course: dict) -> dict:
    keys = [
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
        "pIndex",
        "artifactType",
        "bookHtmlFolder",
        "stepCount",
        "pageViewType",
        "authorName",
        "isPublished",
    ]
    return {k: course[k] for k in keys if k in course}


def main() -> None:
    pdfs = sorted(SRC.glob("*.pdf"))
    export = json.loads(EXPORT.read_text(encoding="utf-8"))
    home = json.loads(HOME.read_text(encoding="utf-8"))
    existing = {c["id"] for c in export.get("courses", [])}
    max_idx = max((c.get("courseIndex") or 0) for c in export.get("courses", []))
    results = []
    imported = []

    for pdf in pdfs:
        stem = pdf.stem
        book_id = slug_id(stem)
        size_mb = pdf.stat().st_size / (1024 * 1024)
        row = {
            "file": pdf.name,
            "id": book_id,
            "sizeMB": round(size_mb, 2),
            "compressed": False,
            "status": "",
            "reason": "",
            "pages": 0,
        }
        if size_mb > 20:
            row["status"] = "failed"
            row["reason"] = f"over 20MB ({row['sizeMB']}) and compress not applied"
            results.append(row)
            continue
        if book_id in existing:
            row["status"] = "skipped"
            row["reason"] = "id already exists"
            results.append(row)
            continue

        folder = stem
        dest_dir = BOOK_HTML / folder
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_pdf = dest_dir / f"{stem}.pdf"
        shutil.copy2(pdf, dest_pdf)

        doc = pymupdf.open(dest_pdf)
        page_count = doc.page_count
        doc.close()
        row["pages"] = page_count

        cover = save_cover(dest_pdf, book_id)
        max_idx += 1
        title = title_from_name(stem)
        course = build_course(book_id, title, folder, dest_pdf.name, page_count, cover, max_idx)
        export["courses"].append(course)
        home["courses"].append(home_summary(course))
        existing.add(book_id)
        imported.append(course)
        row["status"] = "imported"
        row["reason"] = f"copied {page_count} pages, cover {cover}"
        results.append(row)
        print(json.dumps(row, ensure_ascii=True))

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    export["exportedAt"] = now
    home["exportedAt"] = now
    EXPORT.write_text(json.dumps(export, ensure_ascii=False, indent=2), encoding="utf-8")
    HOME.write_text(json.dumps(home, ensure_ascii=False, indent=2), encoding="utf-8")
    CATVER.write_text(
        json.dumps({"exportedAt": now, "courseCount": len(export["courses"])}, indent=2),
        encoding="utf-8",
    )
    if DEPLOY_EXPORT.exists():
        shutil.copy2(EXPORT, DEPLOY_EXPORT)

    report = ROOT / "tmp-shwethway-import-report.json"
    report.write_text(json.dumps({"exportedAt": now, "results": results}, indent=2), encoding="utf-8")
    print("REPORT", report)
    print("IMPORTED", len(imported), "of", len(pdfs))


if __name__ == "__main__":
    main()
