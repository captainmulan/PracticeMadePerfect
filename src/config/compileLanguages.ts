import type { PracticeTask, TaskType } from "../data/tasks";

/** Compile profile — future admin can override per category/task. */
export interface CompileLanguageConfig {
  id: string;
  label: string;
  category?: string;
  taskType?: TaskType;
}

export const DEFAULT_COMPILE_LANGUAGES: CompileLanguageConfig[] = [
  { id: "jsx", label: "React / JSX", category: "react" },
  { id: "javascript", label: "JavaScript", category: "angular" },
  { id: "csharp", label: "C#", category: "csharp" },
  { id: "sql", label: "SQL", taskType: "sql" },
  { id: "text", label: "Free text", taskType: "text" },
];

export function resolveCompileLanguage(task: PracticeTask): string {
  if (task.type === "sql") return "sql";
  if (task.type === "text") return "text";
  if (task.category === "react") return "jsx";
  if (task.category === "csharp") return "csharp";
  return "javascript";
}
