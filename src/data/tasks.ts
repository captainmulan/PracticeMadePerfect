export type TaskType = "code" | "sql" | "text";

export interface PracticeTask {
  id: string;
  category: string;
  title: string;
  description: string;
  checklist: string[];
  detailedInstructions?: string[]; // Step-by-step instructions
  verificationKeywords?: string[][]; // Keywords to verify for each checklist item
  starterCode?: string;
  answerHtml?: string;
  type: TaskType;
  loadError?: string;
}

export interface Category {
  key: string;
  label: string;
  description?: string;
  color?: string; // hex color for Netflix-style display
  icon?: string; // emoji or icon
  pageType?: TaskType;
}

export const categories: Category[] = [
  {
    key: "angular-concepts",
    label: "Angular",
    color: "#7c3aed",
    icon: "🧠",
    pageType: "text",
    description:
      "Concept review flashcards for Angular interview topics like routing, lifecycle, services, testing, and state management.",
  },
  {
    key: "solid",
    label: "SOLID",
    color: "#f59e0b",
    icon: "🏗️",
    pageType: "text",
    description:
      "Interview-facing flashcards for SOLID design principles and architectural patterns.",
  },
  {
    key: "react",
    label: "React",
    color: "#61dafb",
    icon: "⚛️",
    description:
      "React code practice — hooks, state, props, JSX, Redux, and component lifecycle.",
  },
  {
    key: "angular",
    label: "Angular",
    color: "#dd0031",
    icon: "🅰️",
    description:
      "Angular code practice — components, services, routing, directives, and forms.",
  },
  {
    key: "csharp",
    label: "C#",
    color: "#239120",
    icon: "🔷",
    description:
      "C# code practice — async/await, LINQ, OOP patterns, and algorithm problems.",
  },
  {
    key: "sql",
    label: "SQL",
    color: "#336791",
    icon: "🗄️",
    description:
      "SQL code practice — JOINs, views, aggregations, and query optimization.",
  },
];

const categoryOrder = categories.reduce<Record<string, number>>((acc, category, index) => {
  acc[category.key] = index;
  return acc;
}, {});

type RawTaskModule = string;
const rawTaskModules = import.meta.glob("./taskDefs/*.json", {
  eager: true,
  as: "raw",
}) as Record<string, string>;

function inferCategoryFromFileName(fileName: string): string {
  if (fileName.startsWith("react-")) return "react";
  if (fileName.startsWith("angular-concepts-")) return "angular-concepts";
  if (fileName.startsWith("angular-flashcards-")) return "angular-concepts";
  if (fileName.startsWith("angular-")) return "angular";
  if (fileName.startsWith("csharp-")) return "csharp";
  if (fileName.startsWith("sql-")) return "sql";
  if (fileName.startsWith("solid-")) return "solid";
  return "angular";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createInvalidJsonTask(filePath: string, error: string): PracticeTask {
  const fileName = filePath.split("/").pop() ?? filePath;
  const key = fileName.replace(/\.json$/i, "");
  const category = inferCategoryFromFileName(key);

  return {
    id: `invalid-${key}`,
    category,
    title: `Invalid JSON: ${key}`,
    description: "This task file could not be loaded because the JSON was invalid.",
    checklist: [],
    answerHtml: `<div class="practice-error-message"><strong>Task load error</strong><pre>${escapeHtml(error)}</pre></div>`,
    type: "text",
    loadError: error,
  };
}

const taskModules = Object.entries(rawTaskModules).flatMap(([path, raw]) => {
  try {
    return [JSON.parse(raw) as PracticeTask];
  } catch (error) {
    return [createInvalidJsonTask(path, String(error))];
  }
});

export const tasks: PracticeTask[] = taskModules.sort((a, b) => {
  const categoryDifference = (categoryOrder[a.category] ?? 0) - (categoryOrder[b.category] ?? 0);
  if (categoryDifference !== 0) return categoryDifference;

  const indexDifference = (a.index ?? 0) - (b.index ?? 0);
  if (indexDifference !== 0) return indexDifference;

  return a.title.localeCompare(b.title);
});
