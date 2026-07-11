import initSqlJs from "sql.js";
import type { Database } from "sql.js";
import wasmURL from "sql.js/dist/sql-wasm.wasm?url";
import { categoryIndexByKey } from "../data/tasks";

const DB_FILE_URL = "/data/tasks.db";
const DEPLOY_DB_FILE_URL = "/data/tasks.db";
export const LOCAL_STORAGE_DB_KEY = "pmp-sqlite-db";

export interface TaskRow {
  id: string;
  filename: string;
  category: string;
  title: string;
  raw: string;
  categoryIndex: number | null;
  taskIndex: number | null;
  type: string;
}

let cachedDb: Database | null = null;

export async function loadSqlJs(): Promise<ReturnType<typeof initSqlJs>> {
  return initSqlJs({ locateFile: () => wasmURL });
}

async function fetchBundledDatabaseBytes(): Promise<Uint8Array> {
  const response = await fetch(DB_FILE_URL);
  if (!response.ok) {
    throw new Error(`Unable to load database file from ${DB_FILE_URL}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function fetchDeployDatabaseBytes(): Promise<Uint8Array> {
  const response = await fetch(DEPLOY_DB_FILE_URL);
  if (!response.ok) {
    throw new Error(`Unable to load deploy database file from ${DEPLOY_DB_FILE_URL}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

function countTasksInDb(db: Database): number {
  const stmt = db.prepare("SELECT COUNT(*) AS c FROM tasks");
  try {
    if (stmt.step()) {
      const row = stmt.getAsObject() as { c?: number | string };
      return Number(row.c ?? 0);
    }
  } finally {
    stmt.free();
  }
  return 0;
}

function isLikelyTruncatedCache(cachedCount: number, bundledCount: number): boolean {
  if (bundledCount <= 1) return false;
  if (cachedCount >= bundledCount) return false;
  // Recover from the old single-row save bug and other severe truncation.
  return cachedCount <= 1 || cachedCount < bundledCount * 0.25;
}

export function shouldUsePersistedBrowserDb(): boolean {
  return typeof window !== "undefined" && !import.meta.env.PROD;
}

async function fetchDatabaseFile(): Promise<Uint8Array> {
  if (!shouldUsePersistedBrowserDb()) {
    try {
      return await fetchDeployDatabaseBytes();
    } catch {
      return fetchBundledDatabaseBytes();
    }
  }

  const cached = window.localStorage.getItem(LOCAL_STORAGE_DB_KEY);
  if (cached) {
    try {
      const cachedBytes = new Uint8Array(JSON.parse(cached) as number[]);
      const SQL = await loadSqlJs();
      const cachedDb = new SQL.Database(cachedBytes);
      migrateLegacySchema(cachedDb);
      cachedDb.close();
      return cachedBytes;
    } catch {
      window.localStorage.removeItem(LOCAL_STORAGE_DB_KEY);
    }
  }

  const bundledBytes = await fetchBundledDatabaseBytes();
  try {
    window.localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(Array.from(bundledBytes)));
  } catch (e) {
    console.warn("Failed to save database to localStorage (quota exceeded)", e);
  }
  return bundledBytes;
}

function readRowNumber(row: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function getTableColumns(db: Database): string[] {
  const columns: string[] = [];
  const stmt = db.prepare("PRAGMA table_info(tasks)");
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject() as { name?: string };
      if (row.name) columns.push(String(row.name));
    }
  } finally {
    stmt.free();
  }
  return columns;
}

function migrateLegacySchema(db: Database) {
  const columns = getTableColumns(db);
  const hasLegacyIdx = columns.includes("idx");
  const hasNewColumns = columns.includes("Category_Index") && columns.includes("Task_Index");

  if (!hasLegacyIdx || hasNewColumns) {
    return;
  }

  const legacyRows = queryTasks(
    db,
    "SELECT id, filename, category, title, raw, idx, type FROM tasks",
  );

  db.run("DROP TABLE IF EXISTS tasks_new");
  db.run(
    `CREATE TABLE tasks_new (
      id TEXT PRIMARY KEY,
      filename TEXT,
      category TEXT,
      title TEXT,
      raw TEXT,
      Category_Index INTEGER,
      Task_Index INTEGER,
      type TEXT
    )`,
  );

  const statement = db.prepare(
    "INSERT INTO tasks_new (id, filename, category, title, raw, Category_Index, Task_Index, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );

  try {
    legacyRows.forEach((row) => {
      const categoryIndex = categoryIndexByKey[row.category] ?? 999;
      statement.bind([
        row.id,
        row.filename,
        row.category,
        row.title,
        row.raw,
        categoryIndex,
        row.taskIndex,
        row.type,
      ]);
      statement.step();
      statement.reset();
    });
  } finally {
    statement.free();
  }

  db.run("DROP TABLE tasks");
  db.run("ALTER TABLE tasks_new RENAME TO tasks");
}

export async function openBrowserDb(): Promise<Database> {
  if (cachedDb) return cachedDb;
  if (typeof window === "undefined") {
    throw new Error("Browser SQLite can only be opened in a browser environment.");
  }

  const SQL = await loadSqlJs();
  const bytes = await fetchDatabaseFile();
  cachedDb = new SQL.Database(bytes);
  migrateLegacySchema(cachedDb);
  return cachedDb;
}

export function queryTasks(db: Database, sql: string, params: unknown[] = []): TaskRow[] {
  const results: TaskRow[] = [];
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    while (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, unknown>;
      results.push({
        id: String(row.id ?? ""),
        filename: String(row.filename ?? ""),
        category: String(row.category ?? ""),
        title: String(row.title ?? ""),
        raw: String(row.raw ?? ""),
        categoryIndex: readRowNumber(row, "Category_Index", "category_index", "categoryIndex"),
        taskIndex: readRowNumber(row, "Task_Index", "task_index", "taskIndex", "idx"),
        type: String(row.type ?? "text"),
      });
    }
  } finally {
    stmt.free();
  }
  return results;
}

function ensureTasksTable(db: Database) {
  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      filename TEXT,
      category TEXT,
      title TEXT,
      raw TEXT,
      Category_Index INTEGER,
      Task_Index INTEGER,
      type TEXT
    )`,
  );
}

function bindTaskRow(statement: ReturnType<Database["prepare"]>, row: TaskRow) {
  statement.bind([
    row.id,
    row.filename,
    row.category,
    row.title,
    row.raw,
    row.categoryIndex,
    row.taskIndex,
    row.type,
  ]);
}

export function upsertTaskInBrowserDb(db: Database, row: TaskRow) {
  ensureTasksTable(db);
  const statement = db.prepare(
    "REPLACE INTO tasks (id, filename, category, title, raw, Category_Index, Task_Index, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  try {
    bindTaskRow(statement, row);
    statement.step();
  } finally {
    statement.free();
  }
}

export function deleteTaskFromBrowserDb(db: Database, taskId: string) {
  ensureTasksTable(db);
  const statement = db.prepare("DELETE FROM tasks WHERE id = ?");
  try {
    statement.bind([taskId]);
    statement.step();
  } finally {
    statement.free();
  }
}

export function saveTasksToBrowserDb(db: Database, tasks: TaskRow[]) {
  db.run("BEGIN TRANSACTION;");
  ensureTasksTable(db);
  db.run("DELETE FROM tasks;");

  const statement = db.prepare(
    "REPLACE INTO tasks (id, filename, category, title, raw, Category_Index, Task_Index, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  try {
    tasks.forEach((row) => {
      bindTaskRow(statement, row);
      statement.step();
      statement.reset();
    });
  } finally {
    statement.free();
  }

  db.run("COMMIT;");
}

export function persistBrowserDbToLocalStorage(db: Database) {
  const bytes = db.export();
  if (shouldUsePersistedBrowserDb()) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(Array.from(bytes)));
    } catch (e) {
      console.warn("Failed to save database to localStorage (quota exceeded)", e);
      // If we hit quota, try to remove old entry to free space
      try {
        window.localStorage.removeItem(LOCAL_STORAGE_DB_KEY);
      } catch {}
    }
  }
  cachedDb = null;
}

export function resetBrowserDbCache() {
  if (shouldUsePersistedBrowserDb()) {
    window.localStorage.removeItem(LOCAL_STORAGE_DB_KEY);
  }
  if (cachedDb) {
    cachedDb.close();
  }
  cachedDb = null;
}

export async function restoreBundledBrowserDb(): Promise<void> {
  resetBrowserDbCache();
  const bytes = await fetchBundledDatabaseBytes();
  if (shouldUsePersistedBrowserDb()) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(Array.from(bytes)));
    } catch (e) {
      console.warn("Failed to save bundled database to localStorage (quota exceeded)", e);
    }
  }
}

export function normalizeTaskRow(row: TaskRow) {
  try {
    const parsed = JSON.parse(row.raw) as Record<string, unknown>;
    const categoryIndex =
      row.categoryIndex ??
      (typeof parsed.categoryIndex === "number" ? parsed.categoryIndex : categoryIndexByKey[row.category]);
    const taskIndex =
      row.taskIndex ??
      (typeof parsed.taskIndex === "number"
        ? parsed.taskIndex
        : typeof parsed.index === "number"
          ? parsed.index
          : undefined);

    return {
      ...parsed,
      id: row.id,
      category: row.category,
      title: row.title,
      type: row.type,
      categoryIndex,
      taskIndex,
      index: taskIndex,
    } as Record<string, unknown>;
  } catch {
    return { ...row, raw: row.raw };
  }
}
