#!/usr/bin/env python3
import sqlite3
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / 'data' / 'tasks.db'
OUT_PATH = ROOT / 'src' / 'data' / 'tasks_bundle.json'

def main():
    if not DB_PATH.exists():
        print(f'Database not found at {DB_PATH}. Run migrate_taskdefs_to_sqlite.py first.')
        return

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    # Order by category, idx (nulls last), title
    cur.execute(
        "SELECT raw FROM tasks ORDER BY COALESCE(Category_Index, 999), category COLLATE NOCASE, COALESCE(Task_Index, 999), title COLLATE NOCASE"
    )
    rows = cur.fetchall()
    tasks = []
    for (raw,) in rows:
        try:
            tasks.append(json.loads(raw))
        except Exception:
            # skip invalid
            continue

    os.makedirs(OUT_PATH.parent, exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as fh:
        json.dump(tasks, fh, ensure_ascii=False, indent=2)

    print(f'Wrote {len(tasks)} tasks to {OUT_PATH}')

if __name__ == '__main__':
    main()
