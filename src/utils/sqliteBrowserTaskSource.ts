import type { PracticeTask } from "../data/tasks";
import type { Database } from "sql.js";
import { normalizeTaskRow, openBrowserDb, queryTasks } from "./sqliteBrowserDb";
import { sortTasks } from "./taskSort";

const TASKS_ORDER_SQL =
  "SELECT id, filename, category, title, raw, Category_Index, Task_Index, type FROM tasks ORDER BY COALESCE(Category_Index, 999), category COLLATE NOCASE, COALESCE(Task_Index, 999), title COLLATE NOCASE";

export async function loadTasksFromBrowserSqlite(): Promise<PracticeTask[]> {
  const db: Database = await openBrowserDb();
  const rows = queryTasks(db, TASKS_ORDER_SQL);

  const tasks = rows.map((row) => {
    const normalized = normalizeTaskRow(row) as Record<string, unknown>;
    const categoryIndex =
      typeof normalized.categoryIndex === "number" ? normalized.categoryIndex : row.categoryIndex ?? undefined;
    const taskIndex =
      typeof normalized.taskIndex === "number"
        ? normalized.taskIndex
        : typeof normalized.index === "number"
          ? normalized.index
          : row.taskIndex ?? undefined;

    return {
      id: String(normalized.id ?? row.id),
      category: String(normalized.category ?? row.category),
      title: String(normalized.title ?? row.title),
      description: String(normalized.description ?? ""),
      checklist: Array.isArray(normalized.checklist)
        ? (normalized.checklist as string[])
        : [],
      categoryIndex,
      taskIndex,
      index: taskIndex,
      detailedInstructions: Array.isArray(normalized.detailedInstructions)
        ? (normalized.detailedInstructions as string[])
        : undefined,
      verificationKeywords: Array.isArray(normalized.verificationKeywords)
        ? (normalized.verificationKeywords as string[][])
        : undefined,
      starterCode: normalized.starterCode ? String(normalized.starterCode) : undefined,
      answerHtml: normalized.answerHtml ? String(normalized.answerHtml) : undefined,
      page: typeof normalized.page === "object" && normalized.page !== null ? (normalized.page as PracticeTask["page"]) : undefined,
      type: (normalized.type as PracticeTask["type"]) ?? (row.type as PracticeTask["type"]),
      loadError: undefined,
    };
  });

  return sortTasks(tasks);
}
