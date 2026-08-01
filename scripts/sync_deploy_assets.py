#!/usr/bin/env python3
import shutil
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DB = ROOT / 'data' / 'tasks.db'
PUBLIC_DB = ROOT / 'public' / 'data' / 'tasks.db'
DIST_DIR = ROOT / 'dist'
BOOK_HTML_SRC = ROOT / 'book_html'
ADMIN_SRC = ROOT / 'deploy' / 'admin.json'
DEPLOY_DB_SRC = ROOT / 'deploy' / 'tasks.db'
DEPLOY_INDEXEDDB_SRC = ROOT / 'deploy' / 'indexeddb-export.json'

if not SRC_DB.exists():
    raise SystemExit(f'Missing source database: {SRC_DB}')

PUBLIC_DB.parent.mkdir(parents=True, exist_ok=True)
if DEPLOY_DB_SRC.exists():
    shutil.copy2(DEPLOY_DB_SRC, PUBLIC_DB)
    print(f'Using deploy database override: {DEPLOY_DB_SRC}')
else:
    shutil.copy2(SRC_DB, PUBLIC_DB)

if DIST_DIR.exists():
    dist_db = DIST_DIR / 'data' / 'tasks.db'
    dist_db.parent.mkdir(parents=True, exist_ok=True)
    if DEPLOY_DB_SRC.exists():
        shutil.copy2(DEPLOY_DB_SRC, dist_db)
    else:
        shutil.copy2(SRC_DB, dist_db)

# Copy indexeddb-export.json if it exists (new format for IndexedDB data)
if DEPLOY_INDEXEDDB_SRC.exists():
    public_indexeddb = ROOT / 'public' / 'data' / 'indexeddb-export.json'
    public_indexeddb.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DEPLOY_INDEXEDDB_SRC, public_indexeddb)
    print(f'Copied IndexedDB export: {DEPLOY_INDEXEDDB_SRC} -> {public_indexeddb}')

    # Tiny version stamp so clients can detect catalog updates without downloading ~5MB
    try:
        export_meta = json.loads(DEPLOY_INDEXEDDB_SRC.read_text(encoding='utf-8'))
        version_payload = {
            'exportedAt': export_meta.get('exportedAt') or '',
            'courseCount': len(export_meta.get('courses') or []),
        }
    except Exception as exc:
        print(f'Warning: could not read export metadata ({exc}); writing empty catalog-version.json')
        version_payload = {'exportedAt': '', 'courseCount': 0}

    version_json = json.dumps(version_payload, separators=(',', ':'))
    public_version = ROOT / 'public' / 'data' / 'catalog-version.json'
    public_version.write_text(version_json, encoding='utf-8')
    print(f'Wrote catalog version: {public_version} ({version_payload})')

    # Tiny home shelf catalog (summaries only, popular first) for cold-start paint
    try:
        export_courses = export_meta.get('courses') or []
        summary_keys = (
            'id', 'title', 'description', 'color', 'coverColorStart', 'coverColorMiddle',
            'coverColorEnd', 'coverWidth', 'coverHeight', 'coverImageUrl', 'icon',
            'iconColorStart', 'iconColorMiddle', 'iconColorEnd', 'iconSize', 'iconPosition',
            'courseIndex', 'category', 'pIndex', 'artifactType', 'bookHtmlFolder', 'stepCount',
        )

        def pick_summary(course: dict) -> dict:
            return {k: course[k] for k in summary_keys if k in course and course[k] is not None}

        def is_popular(course: dict) -> bool:
            p = course.get('pIndex')
            return isinstance(p, (int, float)) and p > 0

        summaries = [pick_summary(c) for c in export_courses if isinstance(c, dict)]
        popular = sorted(
            [c for c in summaries if is_popular(c)],
            key=lambda c: (c.get('pIndex', 0), c.get('courseIndex', 0)),
        )
        rest = sorted(
            [c for c in summaries if not is_popular(c)],
            key=lambda c: c.get('courseIndex', 0),
        )
        home_catalog = {
            'exportedAt': version_payload.get('exportedAt') or '',
            'courses': popular + rest,
        }
        home_json = json.dumps(home_catalog, ensure_ascii=False, indent=2) + '\n'
        public_home = ROOT / 'public' / 'data' / 'home-catalog.json'
        public_home.write_text(home_json, encoding='utf-8')
        print(f'Wrote home catalog: {public_home} ({len(home_catalog["courses"])} courses)')
    except Exception as exc:
        print(f'Warning: could not write home-catalog.json ({exc})')
        home_json = None

    if DIST_DIR.exists():
        dist_indexeddb = DIST_DIR / 'data' / 'indexeddb-export.json'
        dist_indexeddb.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(DEPLOY_INDEXEDDB_SRC, dist_indexeddb)
        print(f'Copied IndexedDB export: {DEPLOY_INDEXEDDB_SRC} -> {dist_indexeddb}')
        dist_version = DIST_DIR / 'data' / 'catalog-version.json'
        dist_version.write_text(version_json, encoding='utf-8')
        print(f'Wrote catalog version: {dist_version}')
        if home_json:
            dist_home = DIST_DIR / 'data' / 'home-catalog.json'
            dist_home.write_text(home_json, encoding='utf-8')
            print(f'Wrote home catalog: {dist_home}')

# If a deploy/admin.json exists, copy it into public and dist and inject into index.html
if ADMIN_SRC.exists():
    public_admin = ROOT / 'public' / 'data' / 'admin.json'
    public_admin.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ADMIN_SRC, public_admin)

    if DIST_DIR.exists():
        dist_admin = DIST_DIR / 'data' / 'admin.json'
        dist_admin.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ADMIN_SRC, dist_admin)

        # inject into dist/index.html so runtime can synchronously read it
        index_path = DIST_DIR / 'index.html'
        if index_path.exists():
            with open(ADMIN_SRC, 'r', encoding='utf-8') as fh:
                admin_json = fh.read()
            script = f"<script>window.__DEPLOYED_ADMIN_DATA = {json.dumps(json.loads(admin_json))};</script>\n"
            content = index_path.read_text(encoding='utf-8')
            if script not in content:
                # insert before closing </head> if present, else prepend
                if '</head>' in content:
                    content = content.replace('</head>', script + '</head>')
                else:
                    content = script + content
                index_path.write_text(content, encoding='utf-8')

print(f'Copied {SRC_DB} -> {PUBLIC_DB}')
if DIST_DIR.exists():
    print(f'Copied {SRC_DB} -> {dist_db}')
    if BOOK_HTML_SRC.exists():
        dist_book_html = DIST_DIR / 'book_html'
        if dist_book_html.exists():
            shutil.rmtree(dist_book_html)
        shutil.copytree(BOOK_HTML_SRC, dist_book_html)
        print(f'Copied book_html -> {dist_book_html}')
    if ADMIN_SRC.exists():
        print(f'Copied {ADMIN_SRC} -> {dist_admin} and injected into {index_path}')
    