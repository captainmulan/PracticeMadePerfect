export type TaskType = "code" | "sql" | "text";

export interface PracticeTask {
  id: string;
  category: string;
  title: string;
  description: string;
  checklist: string[];
  starterCode?: string;
  type: TaskType;
}

export const categories = [
  { key: "react", label: "React" },
  { key: "angular", label: "Angular" },
  { key: "csharp", label: "C#" },
  { key: "sql", label: "SQL" },
];

export const tasks: PracticeTask[] = [
  {
    id: "react-counter",
    category: "react",
    title: "Counter with useState",
    description:
      "Build a simple React counter using useState. Include increment, decrement, and reset actions.",
    checklist: [
      "Use useState for count state",
      "Render current value to the screen",
      "Add increment and decrement buttons",
      "Provide a reset action",
    ],
    starterCode: "function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <div>Count: {count}</div>\n      <button onClick={() => setCount(count + 1)}>+</button>\n      <button onClick={() => setCount(count - 1)}>-</button>\n      <button onClick={() => setCount(0)}>Reset</button>\n    </div>\n  );\n}",
    type: "code",
  },
  {
    id: "react-form-input",
    category: "react",
    title: "Form Input Handling",
    description:
      "Create a React form with a controlled input field. Display the typed value live below the form.",
    checklist: [
      "Use value and onChange on the input",
      "Store input text in state",
      "Render the current text below the form",
    ],
    starterCode: "function NameForm() {\n  const [name, setName] = useState(\"\");\n\n  return (\n    <form>\n      <label>Enter your name</label>\n      <input value={name} onChange={(e) => setName(e.target.value)} />\n      <p>Current value: {name}</p>\n    </form>\n  );\n}",
    type: "code",
  },
  {
    id: "csharp-bubble-sort",
    category: "csharp",
    title: "Bubble Sort Implementation",
    description:
      "Write a C# method that sorts an integer array in ascending order using bubble sort.",
    checklist: [
      "Use nested loops",
      "Compare adjacent values",
      "Swap when needed",
      "Return the sorted array",
    ],
    starterCode: "public int[] BubbleSort(int[] items) {\n  for (int i = 0; i < items.Length - 1; i++) {\n    for (int j = 0; j < items.Length - 1 - i; j++) {\n      if (items[j] > items[j + 1]) {\n        int temp = items[j];\n        items[j] = items[j + 1];\n        items[j + 1] = temp;\n      }\n    }\n  }\n  return items;\n}",
    type: "code",
  },
  {
    id: "csharp-bouncing-ball",
    category: "csharp",
    title: "Bounce Count and Distance",
    description:
      "Given an initial height, calculate the total distance traveled by a bouncing ball and the number of bounces until it stops.",
    checklist: [
      "Use a loop to simulate bouncing",
      "Track bounce count",
      "Calculate total distance traveled",
      "Stop when the height becomes negligible",
    ],
    type: "text",
  },
  {
    id: "sql-project-count",
    category: "sql",
    title: "Count Employees in Project P1",
    description:
      "Write a SQL query that returns the number of employees working in project 'P1'.",
    checklist: [
      "Use COUNT()",
      "Filter by project name 'P1'",
      "Return a single numeric result",
    ],
    starterCode: "SELECT COUNT(*) AS EmployeeCount\nFROM EmployeeDetails\nWHERE ProjectName = 'P1';",
    type: "sql",
  },
  {
    id: "sql-duplicate-records",
    category: "sql",
    title: "Find Duplicate Records",
    description:
      "Write a SQL query to identify duplicate rows in a table based on one or more columns.",
    checklist: [
      "Group by the target column(s)",
      "Use HAVING COUNT(*) > 1",
      "Return the duplicate values",
    ],
    type: "sql",
  },
];
