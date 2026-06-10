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
  type: TaskType;
}

export interface Category {
  key: string;
  label: string;
  description?: string;
  color?: string; // hex color for Netflix-style display
  icon?: string; // emoji or icon
}

export const categories: Category[] = [
  {
    key: "react",
    label: "React",
    color: "#61dafb",
    icon: "⚛️",
    description:
      "React concepts crucial for technical interviews — hooks, state, props, JSX, Redux, and component lifecycle.",
  },
  {
    key: "angular",
    label: "Angular",
    color: "#dd0031",
    icon: "🅰️",
    description:
      "Angular concepts vital for interviews — lifecycle hooks, services, routing, directives, and NgRx.",
  },
  {
    key: "csharp",
    label: "C#",
    color: "#239120",
    icon: "🔷",
    description:
      "C# essentials for technical interviews — async/await, LINQ, OOP patterns, and algorithm problems.",
  },
  {
    key: "sql",
    label: "SQL",
    color: "#336791",
    icon: "🗄️",
    description:
      "SQL skills for technical interviews — JOINs, views, aggregations, and query writing.",
  },
];

type TaskModule = { default: PracticeTask };
const taskModules = import.meta.glob("./taskDefs/*.json", { eager: true }) as Record<string, TaskModule>;

export const tasks: PracticeTask[] = Object.values(taskModules)
  .map((module) => module.default)
  .sort((a, b) => a.id.localeCompare(b.id));
