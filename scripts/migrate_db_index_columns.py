#!/usr/bin/env python3
"""Migrate tasks.idx -> Category_Index + Task_Index columns."""
import json
import shutil
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CATEGORY_INDEX_BY_KEY = {
    "angular-concepts": 0,
    "solid": 1,
    "react": 2,
    "angular": 3,
    "csharp": 4,
    "sql": 5,
}

DB_PATHS = [
    ROOT / "data" / "tasks.db",
    ROOT / "public" / "data" / "tasks.db",
]


def table_columns(cur: sqlite3.Cursor, table: str) -> list[str]:
    cur.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in cur.fetchall()]


def migrate_db(db_path: Path) -> None:
    if not db_path.exists():
        print(f"Skip missing DB: {db_path}")
        return

    backup = db_path.with_suffix(".db.bak")
    shutil.copy2(db_path, backup)
    print(f"Backup: {backup}")

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    columns = table_columns(cur, "tasks")

    if "Category_Index" in columns and "Task_Index" in columns:
        print(f"Already migrated: {db_path}")
        conn.close()
        return

    cur.execute("SELECT id, filename, category, title, raw, idx, type FROM tasks")
    rows = cur.fetchall()

    cur.execute("DROP TABLE IF EXISTS tasks_new")
    cur.execute(
        """
        CREATE TABLE tasks_new (
            id TEXT PRIMARY KEY,
            filename TEXT,
            category TEXT,
            title TEXT,
            raw TEXT,
            Category_Index INTEGER,
            Task_Index INTEGER,
            type TEXT
        )
        """
    )

    migrated = 0
    for row_id, filename, category, title, raw, idx, ttype in rows:
        task_index = idx
        category_index = CATEGORY_INDEX_BY_KEY.get(category, 999)

        try:
            parsed = json.loads(raw)
            if isinstance(parsed.get("index"), int) and task_index is None:
                task_index = parsed["index"]
            if isinstance(parsed.get("taskIndex"), int):
                task_index = parsed["taskIndex"]
            if isinstance(parsed.get("categoryIndex"), int):
                category_index = parsed["categoryIndex"]
            parsed["taskIndex"] = task_index
            parsed["categoryIndex"] = category_index
            if "index" in parsed:
                del parsed["index"]
            raw = json.dumps(parsed, ensure_ascii=False)
        except Exception:
            pass

        cur.execute(
            """
            INSERT INTO tasks_new (id, filename, category, title, raw, Category_Index, Task_Index, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (row_id, filename, category, title, raw, category_index, task_index, ttype),
        )
        migrated += 1

    cur.execute("DROP TABLE tasks")
    cur.execute("ALTER TABLE tasks_new RENAME TO tasks")
    conn.commit()
    conn.close()
    print(f"Migrated {migrated} rows in {db_path}")


def main() -> None:
    for path in DB_PATHS:
        migrate_db(path)


if __name__ == "__main__":
    main()
