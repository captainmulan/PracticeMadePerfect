import type { PracticeTask } from "../data/tasks";

const MAX_SORT = Number.MAX_SAFE_INTEGER;

/** Global task list: category order first, then task order within category. */
export function compareTasksByIndex(a: PracticeTask, b: PracticeTask): number {
  const categoryA = a.categoryIndex ?? MAX_SORT;
  const categoryB = b.categoryIndex ?? MAX_SORT;
  if (categoryA !== categoryB) return categoryA - categoryB;

  const taskA = a.taskIndex ?? MAX_SORT;
  const taskB = b.taskIndex ?? MAX_SORT;
  if (taskA !== taskB) return taskA - taskB;

  return a.title.localeCompare(b.title);
}

/** Tasks within one category: task order only. */
export function compareTasksInCategory(a: PracticeTask, b: PracticeTask): number {
  const taskA = a.taskIndex ?? MAX_SORT;
  const taskB = b.taskIndex ?? MAX_SORT;
  if (taskA !== taskB) return taskA - taskB;
  return a.title.localeCompare(b.title);
}

export function sortTasks(tasks: PracticeTask[]): PracticeTask[] {
  return [...tasks].sort(compareTasksByIndex);
}

export function sortTasksInCategory(tasks: PracticeTask[]): PracticeTask[] {
  return [...tasks].sort(compareTasksInCategory);
}
