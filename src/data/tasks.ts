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
  { key: "react", label: "React", color: "#61dafb", icon: "⚛️" },
  { key: "angular", label: "Angular", color: "#dd0031", icon: "🅰️" },
  { key: "csharp", label: "C#", color: "#239120", icon: "🔷" },
  { key: "sql", label: "SQL", color: "#336791", icon: "🗄️" },
];

export const tasks: PracticeTask[] = [
  {
    id: "react-counter",
    category: "react",
    title: "Counter with useState",
    description:
      "Build a simple React counter using useState. Include increment, decrement, and reset actions.",
    checklist: [
      "Import useState hook",
      "Create state variable with initial value 0",
      "Display count on screen",
      "Add increment button (+1)",
      "Add decrement button (-1)",
      "Add reset button (back to 0)",
    ],
    detailedInstructions: [
      "Step 1: Import useState from React at the top of your file - this is the hook we need to manage state",
      "Step 2: Create a state variable called 'count' with setCount function and initial value of 0",
      "Step 3: Render the current count value inside a div so users can see it",
      "Step 4: Create a button that increments the count (add 1) when clicked",
      "Step 5: Create a button that decrements the count (subtract 1) when clicked",
      "Step 6: Create a button that resets the count back to 0",
    ],
    verificationKeywords: [
      ["useState", "import"],
      ["useState", "count", "0"],
      ["Count:", "count", "{count}"],
      ["onClick", "count + 1", "+"],
      ["onClick", "count - 1", "-"],
      ["onClick", "setCount(0)", "Reset"],
    ],
    starterCode: "// 1: Import useState from React\n// 2: Create state variable 'count' with setCount(0)\n// 3: Render the current count (e.g. Count: {count})\n// 4: Add increment button (+1)\n// 5: Add decrement button (-1)\n// 6: Add reset button (back to 0)",
    type: "code",
  },
  {
    id: "react-form-input",
    category: "react",
    title: "Form Input Handling",
    description:
      "Create a React form with a controlled input field. Display the typed value live below the form.",
    checklist: [
      "Import useState hook",
      "Create state for form input",
      "Create controlled input with value prop",
      "Add onChange handler to update state",
      "Display current input value below form",
    ],
    detailedInstructions: [
      "Step 1: Import useState hook from React",
      "Step 2: Create a state variable called 'name' to store the input value",
      "Step 3: Add an input element with value={name} to make it controlled",
      "Step 4: Add onChange handler that updates the state with e.target.value",
      "Step 5: Display the current input value using the state variable",
    ],
    verificationKeywords: [
      ["useState", "import"],
      ["useState", "name"],
      ["value", "name"],
      ["onChange", "e.target.value", "setName"],
      ["Current value", "{name}"],
    ],
    starterCode: "// 1: Import useState from React\n// 2: Create state variable 'name' with setName(\"\")\n// 3: Add an input element with value={name}\n// 4: Add onChange handler to update state with e.target.value\n// 5: Render current value below the form",
    type: "code",
  },
  {
    id: "csharp-bubble-sort",
    category: "csharp",
    title: "Bubble Sort Implementation",
    description:
      "Write a C# method that sorts an integer array in ascending order using bubble sort.",
    checklist: [
      "Create outer loop (i) to iterate through array",
      "Create inner loop (j) to compare adjacent elements",
      "Add comparison logic (if items[j] > items[j+1])",
      "Implement swap logic using temp variable",
      "Return sorted array",
    ],
    detailedInstructions: [
      "Step 1: Start with an outer for loop that goes from 0 to array length - 1",
      "Step 2: Inside, create an inner for loop that compares adjacent pairs",
      "Step 3: Check if the current element is greater than the next element",
      "Step 4: If yes, swap them using a temporary variable to hold one value",
      "Step 5: After all passes, the array is sorted in ascending order",
      "Step 6: Return the sorted array",
    ],
    verificationKeywords: [
      ["for", "i", "items.Length"],
      ["for", "j", "items.Length"],
      ["if", "items[j]", "items[j + 1]"],
      ["temp", "items[j]"],
      ["return", "items"],
    ],
    starterCode: "// 1: Create outer loop (i) to iterate through the array\n// 2: Create inner loop (j) to compare adjacent elements\n// 3: If items[j] > items[j+1], swap using a temp variable\n// 4: Continue passes until sorted\n// 5: Return the sorted array",
    type: "code",
  },
  {
    id: "csharp-bouncing-ball",
    category: "csharp",
    title: "Bounce Count and Distance",
    description:
      "Given an initial height, calculate the total distance traveled by a bouncing ball and the number of bounces until it stops.",
    checklist: [
      "Initialize bounce counter to 0",
      "Initialize distance to 0",
      "Create while loop for ball bouncing",
      "Add up distance from down and up movement",
      "Calculate bounce height (usually 2/3 or similar)",
      "Stop when height becomes negligible",
    ],
    detailedInstructions: [
      "Step 1: Create variables to track bounce count and total distance",
      "Step 2: Start with the initial height as distance traveled (falling down)",
      "Step 3: Use a loop that continues while the height is still significant",
      "Step 4: In each iteration: increment bounce count, add up distance, calculate new height",
      "Step 5: Add up and down distances for each bounce",
      "Step 6: When height becomes too small, exit loop and return results",
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
      "Use SELECT COUNT(*) to count rows",
      "Reference the EmployeeDetails table",
      "Filter WHERE ProjectName = 'P1'",
      "Provide a result alias like AS EmployeeCount",
    ],
    detailedInstructions: [
      "Step 1: Start with SELECT COUNT(*) to get the count of records",
      "Step 2: Add AS EmployeeCount to label the result column",
      "Step 3: Specify FROM EmployeeDetails table",
      "Step 4: Add WHERE clause to filter for ProjectName = 'P1'",
      "Step 5: Execute to get the count",
    ],
    verificationKeywords: [
      ["COUNT(*)"],
      ["EmployeeDetails"],
      ["ProjectName", "P1"],
      ["EmployeeCount"],
    ],
    starterCode: "-- 1: Use SELECT COUNT(*) to count rows\n-- 2: FROM EmployeeDetails\n-- 3: WHERE ProjectName = 'P1'\n-- 4: Add AS EmployeeCount to label result",
    type: "sql",
  },
  {
    id: "sql-duplicate-records",
    category: "sql",
    title: "Find Duplicate Records",
    description:
      "Write a SQL query to identify duplicate rows in a table based on one or more columns.",
    checklist: [
      "Select the columns to check for duplicates",
      "Use GROUP BY on those columns",
      "Add HAVING COUNT(*) > 1 to filter duplicates",
      "Return the duplicate values",
    ],
    detailedInstructions: [
      "Step 1: SELECT the columns you want to find duplicates for",
      "Step 2: GROUP BY those same columns to group identical values together",
      "Step 3: Use HAVING COUNT(*) > 1 to show only groups with more than 1 record",
      "Step 4: This shows you which values appear multiple times",
      "Step 5: You can also SELECT COUNT(*) to see how many times each appears",
    ],
    verificationKeywords: [
      ["SELECT"],
      ["GROUP BY"],
      ["HAVING", "COUNT(*)"],
      [">", "1"],
    ],
    type: "sql",
  },
];
