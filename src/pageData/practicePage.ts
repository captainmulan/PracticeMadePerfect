import { categories } from "../data/tasks";
import type { PracticeTask } from "../data/tasks";

export const practicePageData = {
  pageTitle: "Practice workspace",
  introHtml:
    "<p>Three-panel focus mode: top prompt, left instructions, right workspace.</p><p>Pick a task, follow the checklist, and use the right panel for code or notes.</p>",
  categories,
  tasks: [] as PracticeTask[],
  placeholder: "Type your code, SQL, or free-form answer here...",
};

export type PracticePageData = typeof practicePageData;
