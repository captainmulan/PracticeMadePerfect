#!/usr/bin/env python3
import sqlite3
import json
import glob
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TASKDEF_DIRS = [
    ROOT / 'src' / 'data' / 'taskDefs',
    ROOT / 'src' / 'data' / 'taskDefs_ToDelete',
]
DB_PATH = ROOT / 'data' / 'tasks.db'
PUBLIC_DB_PATH = ROOT / 'public' / 'data' / 'tasks.db'

CATEGORY_INDEX_BY_KEY = {
    'angular-concepts': 0,
    'solid': 1,
    'react': 2,
    'angular': 3,
    'csharp': 4,
    'sql': 5,
}

def infer_category_from_filename(name: str) -> str:
    if name.startswith('react-'):
        return 'react'
    if name.startswith('angular-concepts-'):
        return 'angular-concepts'
    if name.startswith('angular-flashcards-'):
        return 'angular-concepts'
    if name.startswith('angular-'):
        return 'angular'
    if name.startswith('csharp-'):
        return 'csharp'
    if name.startswith('sql-'):
        return 'sql'
    if name.startswith('solid-'):
        return 'solid'
    return 'angular'

def collect_task_files():
    files = []
    seen = set()
    for task_dir in TASKDEF_DIRS:
        if not task_dir.exists():
            continue
        for fpath in sorted(glob.glob(str(task_dir / '*.json'))):
            if fpath not in seen:
                seen.add(fpath)
                files.append(fpath)
    return files

def main():
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        filename TEXT,
        category TEXT,
        title TEXT,
        raw TEXT,
        Category_Index INTEGER,
        Task_Index INTEGER,
        type TEXT
    )
    ''')

    files = collect_task_files()
    for fpath in files:
        fname = os.path.basename(fpath)
        key = os.path.splitext(fname)[0]
        try:
            with open(fpath, 'r', encoding='utf-8') as fh:
                raw = fh.read()
                parsed = json.loads(raw)
        except Exception as e:
            print(f'Failed to parse {fpath}: {e}')
            parsed = { 'id': f'invalid-{key}', 'title': f'Invalid JSON: {key}', 'description': f'Failed to parse: {e}', 'checklist': [] }
            raw = json.dumps(parsed, ensure_ascii=False)

        tid = parsed.get('id') or key
        title = parsed.get('title') or ''
        category = parsed.get('category') or infer_category_from_filename(key)
        ttype = parsed.get('type') or 'text'

        task_index = parsed.get('taskIndex')
        if not isinstance(task_index, int):
            task_index = parsed.get('index') if isinstance(parsed.get('index'), int) else None

        category_index = parsed.get('categoryIndex')
        if not isinstance(category_index, int):
            category_index = CATEGORY_INDEX_BY_KEY.get(category, 999)

        parsed['taskIndex'] = task_index
        parsed['categoryIndex'] = category_index
        if 'index' in parsed:
            del parsed['index']

        cur.execute(
            'REPLACE INTO tasks (id, filename, category, title, raw, Category_Index, Task_Index, type) VALUES (?,?,?,?,?,?,?,?)',
            (
                tid,
                fname,
                category,
                title,
                json.dumps(parsed, ensure_ascii=False),
                category_index,
                task_index,
                ttype,
            ),
        )

    conn.commit()
    conn.close()

    if PUBLIC_DB_PATH.parent.exists() or PUBLIC_DB_PATH.parent.name == 'data':
        os.makedirs(PUBLIC_DB_PATH.parent, exist_ok=True)
        import shutil
        shutil.copy2(DB_PATH, PUBLIC_DB_PATH)

    print(f'Migrated {len(files)} task files into {DB_PATH}')

if __name__ == '__main__':
    main()
