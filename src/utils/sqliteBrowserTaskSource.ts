import type { PracticeTask } from "../data/tasks";
import { getTasks, migrateFromSqlJs } from "./indexedDb";

export async function loadTasksFromBrowserSqlite(): Promise<PracticeTask[]> {
  await migrateFromSqlJs(); // Ensure migration runs!
  return await getTasks();
}
