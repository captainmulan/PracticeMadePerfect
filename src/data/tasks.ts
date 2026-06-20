export type TaskType = "code" | "sql" | "text";

export interface PracticeTask {
  id: string;
  category: string;
  title: string;
  description: string;
  checklist: string[];
  categoryIndex?: number;
  taskIndex?: number;
  /** @deprecated Use taskIndex */
  index?: number;
  detailedInstructions?: string[]; // Step-by-step instructions
  verificationKeywords?: string[][]; // Keywords to verify for each checklist item
  starterCode?: string;
  answerHtml?: string;
  page?: {
    editor?: {
      hints?: Array<{
        guide?: string;
        code?: string;
      }>;
    };
  };
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

export const categoryIndexByKey = categoryOrder;

// Runtime task loading now happens from the browser SQLite database.
// This module only exports static category metadata.

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
  const category = "angular";

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
