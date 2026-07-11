#!/usr/bin/env python3
import shutil
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DB = ROOT / 'data' / 'tasks.db'
PUBLIC_DB = ROOT / 'public' / 'data' / 'tasks.db'
DIST_DIR = ROOT / 'dist'
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
    
    if DIST_DIR.exists():
        dist_indexeddb = DIST_DIR / 'data' / 'indexeddb-export.json'
        dist_indexeddb.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(DEPLOY_INDEXEDDB_SRC, dist_indexeddb)
        print(f'Copied IndexedDB export: {DEPLOY_INDEXEDDB_SRC} -> {dist_indexeddb}')

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
    if ADMIN_SRC.exists():
        print(f'Copied {ADMIN_SRC} -> {dist_admin} and injected into {index_path}')
    