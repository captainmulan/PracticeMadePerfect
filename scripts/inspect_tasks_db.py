#!/usr/bin/env python3
import sqlite3, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / 'data' / 'tasks.db'

if not DB.exists():
    print('DB not found:', DB)
    sys.exit(2)

conn = sqlite3.connect(str(DB))
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM tasks')
total = cur.fetchone()[0]
cur.execute(
    "SELECT id, title, category, Category_Index, Task_Index FROM tasks ORDER BY COALESCE(Category_Index, 999), category, COALESCE(Task_Index, 999), title LIMIT 10"
)
rows = []
for id_, title, category, category_index, task_index in cur.fetchall():
    rows.append({
        'id': id_,
        'title': title,
        'category': category,
        'categoryIndex': category_index,
        'taskIndex': task_index,
    })

print(json.dumps({ 'total': total, 'sample': rows }, ensure_ascii=False, indent=2))
conn.close()
