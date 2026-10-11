from __future__ import annotations

import json
import os
import posixpath
import re
import shutil
import sys
import tempfile
import urllib.parse
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
BOOK_ROOT = ROOT / "book_html"
COMIC_ROOT = BOOK_ROOT / "Comic"
ARCHIVE_ROOT = ROOT / "comic-source-epubs"
EXPORT_PATH = ROOT / "public" / "data" / "indexeddb-export.json"
HOME_PATH = ROOT / "public" / "data" / "home-catalog.json"
VERSION_PATH = ROOT / "public" / "data" / "catalog-version.json"
MAX_FILE_BYTES = 25 * 1024 * 1024
TARGET_FILE_BYTES = 23 * 1024 * 1024
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
PARAGRAPH_PATTERN = re.compile(r"<p\b[^>]*>.*?</p>", re.IGNORECASE | re.DOTALL)
ANCHOR_PATTERN = re.compile(r"<a\b[^>]*\bid=['\"](p\d+)['\"]", re.IGNORECASE)
IMAGE_PATTERN = re.compile(r"<img\b[^>]*\bsrc=['\"]([^'\"]+)['\"]", re.IGNORECASE)
EPUB_OPF_NS = "http://www.idpf.org/2007/opf"

ElementTree.register_namespace("", EPUB_OPF_NS)
ElementTree.register_namespace("dc", "http://purl.org/dc/elements/1.1/")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_zip_path(base: str, reference: str) -> str | None:
    value = urllib.parse.unquote(reference.split("#", 1)[0].split("?", 1)[0]).replace("\\", "/")
    if not value or value.startswith("/") or re.match(r"^[a-z][a-z0-9+.-]*:", value, re.IGNORECASE):
        return None
    return posixpath.normpath(posixpath.join(base, value))


def asset_url(path: Path) -> str:
    return "/book_html/" + path.relative_to(BOOK_ROOT).as_posix()


def locate_course(export_data: dict, source_path: Path) -> tuple[dict, list[dict]]:
    source_url = asset_url(source_path)
    matches: list[tuple[dict, list[dict]]] = []
    for course in export_data.get("courses", []):
        steps = [step for chapter in course.get("chapters", []) for step in chapter.get("steps", [])]
        mapped = [
            step for step in steps
            if step.get("stepType") == "epub"
            and str(step.get("contentHtml", "")).split("#", 1)[0] == source_url
        ]
        if mapped:
            matches.append((course, mapped))
    if len(matches) != 1:
        raise ValueError(f"{source_url} maps to {len(matches)} admin courses; expected exactly one.")
    return matches[0]


def get_page_location(step: dict) -> tuple[str, str]:
    content = str(step.get("contentHtml", ""))
    suffix = content.split("#", 1)[1] if "#" in content else ""
    document, separator, fragment = suffix.partition("#")
    match = re.search(r"^(p\d+)$", fragment, re.IGNORECASE) if separator else None
    if not document:
        raise ValueError(f"EPUB step {step.get('id')} has no internal document location.")
    anchor = match.group(1) if match else f"p{step.get('stepIndex')}"
    return urllib.parse.unquote(document), anchor


def read_page_blocks(archive: zipfile.ZipFile, course: dict, steps: list[dict]) -> tuple[dict, dict]:
    container = ElementTree.fromstring(archive.read("META-INF/container.xml"))
    rootfile = next((node for node in container.iter() if node.tag.endswith("rootfile")), None)
    if rootfile is None or not rootfile.get("full-path"):
        raise ValueError(f"{course['id']}: EPUB package root file is missing.")

    opf_path = urllib.parse.unquote(rootfile.attrib["full-path"])
    opf_base = posixpath.dirname(opf_path)
    package = ElementTree.fromstring(archive.read(opf_path))
    manifest = package.find(f"{{{EPUB_OPF_NS}}}manifest")
    spine = package.find(f"{{{EPUB_OPF_NS}}}spine")
    if manifest is None or spine is None:
        raise ValueError(f"{course['id']}: EPUB package has no manifest or spine.")

    manifest_paths: dict[str, str] = {}
    for item in manifest.findall(f"{{{EPUB_OPF_NS}}}item"):
        item_path = normalize_zip_path(opf_base, item.get("href", ""))
        if item_path:
            manifest_paths[item.get("id", "")] = item_path

    page_documents = {
        manifest_paths.get(itemref.get("idref", ""), "")
        for itemref in spine.findall(f"{{{EPUB_OPF_NS}}}itemref")
    }
    page_documents = {
        path for path in page_documents
        if path.lower().endswith((".html", ".xhtml", ".htm")) and path in archive.namelist()
    }
    page_blocks: dict[tuple[str, str], tuple[str, set[str]]] = {}
    for document_path in page_documents:
        html = archive.read(document_path).decode("utf-8", errors="replace")
        for paragraph in PARAGRAPH_PATTERN.finditer(html):
            block = paragraph.group(0)
            anchors = {match.group(1) for match in ANCHOR_PATTERN.finditer(block)}
            if not anchors:
                continue
            image_paths = {
                image_path
                for image_reference in IMAGE_PATTERN.findall(block)
                if (image_path := normalize_zip_path(posixpath.dirname(document_path), image_reference))
            }
            for anchor in anchors:
                page_blocks[(document_path, anchor)] = (block, image_paths)

    page_records: list[dict] = []
    missing: list[str] = []
    for step in sorted(steps, key=lambda item: item.get("stepIndex", 0)):
        document_path, anchor = get_page_location(step)
        block = page_blocks.get((document_path, anchor))
        if block is None or not block[1]:
            missing.append(f"{step.get('id')} ({document_path}#{anchor})")
            continue
        page_records.append({
            "step": step,
            "document": document_path,
            "anchor": anchor,
            "block": block[0],
            "images": block[1],
        })
    if missing:
        raise ValueError(f"{course['id']}: page anchors lack image paragraphs: {', '.join(missing[:8])}")
    if len(page_records) != len(steps):
        raise ValueError(f"{course['id']}: mapped {len(page_records)} of {len(steps)} EPUB steps.")

    for page in page_records:
        for image_path in page["images"]:
            try:
                archive.getinfo(image_path)
            except KeyError as error:
                raise ValueError(f"{course['id']}: missing page image {image_path}.") from error
    return {"path": opf_path, "base": opf_base, "package": package, "manifest": manifest_paths}, {
        "documents": page_documents,
        "records": page_records,
    }


def group_pages(archive: zipfile.ZipFile, page_documents: set[str], records: list[dict]) -> list[list[dict]]:
    image_paths = set().union(*(page["images"] for page in records))
    shared_size = sum(
        info.compress_size for info in archive.infolist()
        if info.filename not in image_paths
        and info.filename not in page_documents
        and info.filename not in {"mimetype"}
    )
    groups: list[list[dict]] = []
    current: list[dict] = []
    current_images: set[str] = set()
    current_size = shared_size

    for page in records:
        additions = page["images"] - current_images
        page_size = sum(archive.getinfo(path).compress_size for path in additions)
        if current and current_size + page_size > TARGET_FILE_BYTES:
            groups.append(current)
            current = []
            current_images = set()
            current_size = shared_size
            additions = page["images"]
            page_size = sum(archive.getinfo(path).compress_size for path in additions)
        if current_size + page_size >= MAX_FILE_BYTES:
            raise ValueError(f"Single EPUB page exceeds the 25 MiB output limit: {page['step'].get('id')}.")
        current.append(page)
        current_images.update(additions)
        current_size += page_size

    if current:
        groups.append(current)
    if len(groups) < 2:
        raise ValueError("Oversized EPUB did not produce multiple output parts.")
    return groups


def make_part(
    source: zipfile.ZipFile,
    package_info: dict,
    page_info: dict,
    group: list[dict],
    output_path: Path,
) -> set[str]:
    selected_by_document: dict[str, set[str]] = {}
    page_images: set[str] = set()
    for page in group:
        selected_by_document.setdefault(page["document"], set()).add(page["anchor"])
        page_images.update(page["images"])

    page_documents = page_info["documents"]
    all_page_images = set().union(*(page["images"] for page in page_info["records"]))
    shared_paths = {
        info.filename for info in source.infolist()
        if info.filename not in all_page_images
        and info.filename not in page_documents
        and info.filename not in {"mimetype", package_info["path"]}
    }
    resources = shared_paths | page_images | set(selected_by_document) | {package_info["path"], "META-INF/container.xml"}
    package = ElementTree.fromstring(
        ElementTree.tostring(package_info["package"], encoding="utf-8")
    )
    manifest = package.find(f"{{{EPUB_OPF_NS}}}manifest")
    spine = package.find(f"{{{EPUB_OPF_NS}}}spine")
    assert manifest is not None and spine is not None

    kept_ids: set[str] = set()
    for item in list(manifest.findall(f"{{{EPUB_OPF_NS}}}item")):
        item_path = package_info["manifest"].get(item.get("id", ""))
        if item_path in resources:
            kept_ids.add(item.get("id", ""))
        else:
            manifest.remove(item)
    for itemref in list(spine.findall(f"{{{EPUB_OPF_NS}}}itemref")):
        if itemref.get("idref", "") not in kept_ids:
            spine.remove(itemref)

    existing_ids = {item.get("id", "") for item in manifest.findall(f"{{{EPUB_OPF_NS}}}item")}
    existing_paths = {
        path for item_id, path in package_info["manifest"].items()
        if item_id in kept_ids
    }
    next_image_id = 1
    for image_path in sorted(page_images - existing_paths):
        extension = Path(image_path).suffix.lower()
        media_type = {
            ".gif": "image/gif",
            ".jpeg": "image/jpeg",
            ".jpg": "image/jpeg",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".webp": "image/webp",
        }.get(extension)
        if not media_type:
            continue
        while f"pmp-image-{next_image_id}" in existing_ids:
            next_image_id += 1
        image_id = f"pmp-image-{next_image_id}"
        next_image_id += 1
        existing_ids.add(image_id)
        href = posixpath.relpath(image_path, package_info["base"] or ".")
        manifest.append(ElementTree.Element(
            f"{{{EPUB_OPF_NS}}}item",
            {"id": image_id, "href": href, "media-type": media_type},
        ))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_path, "w") as target:
        target.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        for name in sorted(resources - {"mimetype"}):
            if name == package_info["path"]:
                data = ElementTree.tostring(package, encoding="utf-8", xml_declaration=True)
            elif name in selected_by_document:
                text = source.read(name).decode("utf-8", errors="replace")
                selected_anchors = selected_by_document[name]

                def retain_page(match: re.Match[str]) -> str:
                    block = match.group(0)
                    anchors = {anchor.group(1) for anchor in ANCHOR_PATTERN.finditer(block)}
                    return block if anchors & selected_anchors else ""

                data = PARAGRAPH_PATTERN.sub(retain_page, text).encode("utf-8")
            else:
                data = source.read(name)
            target.writestr(name, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)

    if output_path.stat().st_size >= MAX_FILE_BYTES:
        raise ValueError(f"Generated EPUB part is not below 25 MiB: {output_path} ({output_path.stat().st_size} bytes).")
    validate_part(output_path, group, page_info)
    return resources


def repair_split_epub_manifest(path: Path) -> int:
    with zipfile.ZipFile(path) as source:
        names = {info.filename for info in source.infolist()}
        container = ElementTree.fromstring(source.read("META-INF/container.xml"))
        rootfile = next((node for node in container.iter() if node.tag.endswith("rootfile")), None)
        if rootfile is None or not rootfile.get("full-path"):
            raise ValueError(f"{path}: EPUB package root file is missing.")
        opf_path = urllib.parse.unquote(rootfile.attrib["full-path"])
        package = ElementTree.fromstring(source.read(opf_path))
        manifest = package.find(f"{{{EPUB_OPF_NS}}}manifest")
        if manifest is None:
            raise ValueError(f"{path}: EPUB package manifest is missing.")

        opf_base = posixpath.dirname(opf_path)
        manifested_paths = {
            resolved for item in manifest.findall(f"{{{EPUB_OPF_NS}}}item")
            if (resolved := normalize_zip_path(opf_base, item.get("href", "")))
        }
        referenced_images: set[str] = set()
        for name in names:
            if not name.lower().endswith((".html", ".xhtml", ".htm")):
                continue
            text = source.read(name).decode("utf-8", errors="replace")
            for reference in IMAGE_PATTERN.findall(text):
                image_path = normalize_zip_path(posixpath.dirname(name), reference)
                if image_path in names and Path(image_path).suffix.lower() in IMAGE_EXTENSIONS:
                    referenced_images.add(image_path)

        missing_images = sorted(referenced_images - manifested_paths)
        if not missing_images:
            return 0

        existing_ids = {item.get("id", "") for item in manifest.findall(f"{{{EPUB_OPF_NS}}}item")}
        next_image_id = 1
        for image_path in missing_images:
            extension = Path(image_path).suffix.lower()
            media_type = {
                ".gif": "image/gif",
                ".jpeg": "image/jpeg",
                ".jpg": "image/jpeg",
                ".png": "image/png",
                ".webp": "image/webp",
            }[extension]
            while f"pmp-image-{next_image_id}" in existing_ids:
                next_image_id += 1
            image_id = f"pmp-image-{next_image_id}"
            next_image_id += 1
            existing_ids.add(image_id)
            href = posixpath.relpath(image_path, opf_base or ".")
            manifest.append(ElementTree.Element(
                f"{{{EPUB_OPF_NS}}}item",
                {"id": image_id, "href": href, "media-type": media_type},
            ))

        updated_opf = ElementTree.tostring(package, encoding="utf-8", xml_declaration=True)
        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(prefix=f"{path.stem}-", suffix=".epub", dir=path.parent, delete=False) as temp:
                temp_path = Path(temp.name)
            with zipfile.ZipFile(temp_path, "w") as target:
                for entry in source.infolist():
                    data = updated_opf if entry.filename == opf_path else source.read(entry.filename)
                    target.writestr(entry, data)
            with zipfile.ZipFile(temp_path) as repaired:
                if repaired.testzip() is not None:
                    raise ValueError(f"{path}: repaired EPUB failed ZIP CRC validation.")
            source.close()
            os.replace(temp_path, path)
            return len(missing_images)
        finally:
            if temp_path:
                temp_path.unlink(missing_ok=True)


def validate_part(path: Path, group: list[dict], page_info: dict) -> None:
    with zipfile.ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise ValueError(f"ZIP CRC validation failed for {path}.")
        if archive.namelist()[0] != "mimetype" or archive.read("mimetype") != b"application/epub+zip":
            raise ValueError(f"Invalid EPUB mimetype entry in {path}.")
        expected = {(page["document"], page["anchor"]) for page in group}
        actual: set[tuple[str, str]] = set()
        for document in {page["document"] for page in group}:
            html = archive.read(document).decode("utf-8", errors="replace")
            for anchor in ANCHOR_PATTERN.findall(html):
                actual.add((document, anchor))
        if not expected.issubset(actual):
            raise ValueError(f"Generated EPUB part is missing page anchors: {path}.")
        for page in group:
            for image_path in page["images"]:
                archive.getinfo(image_path)


def process_epub(source_path: Path, export_data: dict, staging: Path) -> dict:
    course, steps = locate_course(export_data, source_path)
    relative = source_path.relative_to(BOOK_ROOT)
    with zipfile.ZipFile(source_path) as source:
        package_info, page_info = read_page_blocks(source, course, steps)
        groups = group_pages(source, page_info["documents"], page_info["records"])
        parts = []
        stem = source_path.stem
        for index, group in enumerate(groups, start=1):
            filename = f"{stem}-part-{index:02}.epub"
            staging_path = staging / course["id"] / filename
            make_part(source, package_info, page_info, group, staging_path)
            parts.append({
                "filename": filename,
                "first": min(page["step"].get("stepIndex", 0) for page in group),
                "last": max(page["step"].get("stepIndex", 0) for page in group),
                "staging": staging_path,
                "destination": source_path.parent / filename,
                "bytes": staging_path.stat().st_size,
            })

    by_step_id = {step["id"]: step for step in steps}
    for group_index, group in enumerate(groups):
        part_url = "/book_html/" + (relative.parent / parts[group_index]["filename"]).as_posix()
        for page in group:
            step = by_step_id[page["step"]["id"]]
            original = str(step.get("contentHtml", ""))
            location = original.split("#", 1)[1] if "#" in original else ""
            step["contentHtml"] = f"{part_url}#{location}" if location else part_url

    archive_path = ARCHIVE_ROOT / relative
    if archive_path.exists():
        raise FileExistsError(f"Refusing to overwrite archived EPUB: {archive_path}")
    for part in parts:
        if part["destination"].exists():
            raise FileExistsError(f"Refusing to overwrite EPUB part: {part['destination']}")
    return {
        "id": course["id"],
        "title": course.get("title", course["id"]),
        "source": source_path,
        "archive": archive_path,
        "parts": parts,
        "page_count": len(steps),
    }


def main() -> None:
    if "--repair-existing" in sys.argv:
        split_epubs = sorted(COMIC_ROOT.rglob("*-part-*.epub"))
        repaired_count = 0
        for path in split_epubs:
            added = repair_split_epub_manifest(path)
            repaired_count += added
            if added:
                print(f"{path.relative_to(BOOK_ROOT).as_posix()}: added {added} image manifest entries")
        print(f"Checked {len(split_epubs)} split EPUBs; repaired {repaired_count} missing image manifest entries.")
        return

    export_data = read_json(EXPORT_PATH)
    home_catalog = read_json(HOME_PATH)
    oversized_epubs = sorted(
        path for path in COMIC_ROOT.rglob("*.epub")
        if path.stat().st_size >= MAX_FILE_BYTES
    )
    oversized_pdfs = sorted(
        path for path in COMIC_ROOT.rglob("*.pdf")
        if path.stat().st_size >= MAX_FILE_BYTES
    )
    if oversized_pdfs:
        raise ValueError(
            "Oversized comic PDFs also exist; split them with scripts/split-oversized-comic-pdfs.cjs first: "
            + ", ".join(path.relative_to(BOOK_ROOT).as_posix() for path in oversized_pdfs)
        )
    if not oversized_epubs:
        print("No Comic EPUB is at or above 25 MiB.")
        return

    staging_root = Path(tempfile.mkdtemp(prefix="pmp-comic-epub-parts-"))
    original_export = EXPORT_PATH.read_bytes()
    original_home = HOME_PATH.read_bytes()
    original_version = VERSION_PATH.read_bytes()
    plans: list[dict] = []
    moved_parts: list[Path] = []
    archived_sources: list[tuple[Path, Path]] = []
    replaced_catalogs: list[tuple[Path, bytes]] = []
    temporary_catalogs: list[tuple[Path, Path]] = []
    try:
        for source_path in oversized_epubs:
            plans.append(process_epub(source_path, export_data, staging_root))

        exported_at = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
        export_data["exportedAt"] = exported_at
        course_by_id = {course["id"]: course for course in export_data["courses"]}
        home_by_id = {course["id"]: course for course in home_catalog["courses"]}
        for plan in plans:
            course = course_by_id[plan["id"]]
            summary = home_by_id.get(plan["id"])
            if summary is None:
                raise KeyError(f"{plan['id']} is missing from home-catalog.json.")
            summary["bookHtmlFolder"] = course.get("bookHtmlFolder")
        home_catalog["exportedAt"] = exported_at
        version = {
            "exportedAt": f"{exported_at}:shelf-index-v2",
            "courseCount": len(export_data["courses"]),
        }

        for target, value in (
            (EXPORT_PATH, export_data),
            (HOME_PATH, home_catalog),
            (VERSION_PATH, version),
        ):
            temp_path = target.with_name(f"{target.name}.split-tmp")
            write_json(temp_path, value)
            temporary_catalogs.append((temp_path, target))

        for plan in plans:
            for part in plan["parts"]:
                part["destination"].parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(part["staging"], part["destination"])
                moved_parts.append(part["destination"])

        for plan in plans:
            plan["archive"].parent.mkdir(parents=True, exist_ok=True)
            os.replace(plan["source"], plan["archive"])
            archived_sources.append((plan["source"], plan["archive"]))

        for temp_path, target in temporary_catalogs:
            replaced_catalogs.append((target, target.read_bytes()))
            target.write_bytes(temp_path.read_bytes())
            temp_path.unlink()

        for plan in plans:
            print(
                f"{plan['title']}: {plan['page_count']} pages -> {len(plan['parts'])} parts; "
                + ", ".join(
                    f"{part['filename']} {part['bytes'] / 1024 / 1024:.2f} MiB "
                    f"(pages {part['first']}-{part['last']})"
                    for part in plan["parts"]
                )
            )
        print(f"Updated admin catalogs at {exported_at}; originals archived under {ARCHIVE_ROOT}.")
    except Exception:
        for target, previous_bytes in reversed(replaced_catalogs):
            target.write_bytes(previous_bytes)
        for source, archive in reversed(archived_sources):
            if archive.exists() and not source.exists():
                source.parent.mkdir(parents=True, exist_ok=True)
                os.replace(archive, source)
        for part_path in moved_parts:
            part_path.unlink(missing_ok=True)
        raise
    finally:
        for temp_path, _ in temporary_catalogs:
            temp_path.unlink(missing_ok=True)
        shutil.rmtree(staging_root, ignore_errors=True)


if __name__ == "__main__":
    main()