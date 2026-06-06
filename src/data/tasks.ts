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

export const tasks: PracticeTask[] = [
  {
    id: "react-counter",
    category: "react",
    title: "Counter with useState",
    description:
      "Build a simple React counter using useState with increment and decrement button handlers.",
    checklist: [
      "Import useState from React",
      "Create count state with initial value 0",
      "Add increment handler (setCount(count + 1))",
      "Add decrement handler (setCount(count - 1))",
      "Display Count: {count} in the UI",
      "Render Increment and Decrement buttons",
    ],
    verificationKeywords: [
      ["useState", "import"],
      ["useState", "count", "0"],
      ["increment", "setCount"],
      ["decrement", "setCount"],
      ["Count:", "{count}"],
      ["Increment", "Decrement"],
    ],
    starterCode:
      "import React, { useState } from 'react';\n\nconst CounterComponent = () => {\n  // 1: Create state variable 'count' with useState(0)\n  // 2: Add increment handler (setCount(count + 1))\n  // 3: Add decrement handler (setCount(count - 1))\n  // 4: Render <h2>Count: {count}</h2>\n  // 5: Add Increment and Decrement buttons\n\n  return (\n    <div>\n    </div>\n  );\n};\n\nexport default CounterComponent;",
    type: "code",
  },
  {
    id: "react-counter-reducer",
    category: "react",
    title: "Counter with Reducer",
    description:
      "Build a counter using useReducer with INCREMENT and DECREMENT actions dispatched from button clicks.",
    checklist: [
      "Import useReducer from React",
      "Define initialState with count: 0",
      "Create reducer with INCREMENT and DECREMENT cases",
      "Use useReducer(reducer, initialState)",
      "Dispatch INCREMENT and DECREMENT from buttons",
      "Display state.count in the UI",
    ],
    verificationKeywords: [
      ["useReducer", "import"],
      ["initialState", "count", "0"],
      ["reducer", "INCREMENT", "DECREMENT"],
      ["useReducer"],
      ["dispatch", "INCREMENT", "DECREMENT"],
      ["state.count"],
    ],
    starterCode:
      "import React, { useReducer } from 'react';\n\nconst initialState = { count: 0 };\n\n// 1: Reducer handles INCREMENT (+1) and DECREMENT (-1)\nconst reducer = (state, action) => {\n  switch (action.type) {\n    default:\n      return state;\n  }\n};\n\nconst CounterComponent = () => {\n  // 2: useReducer with reducer and initialState\n  // 3: increment/decrement dispatch actions\n  // 4: Render Count: {state.count} with buttons\n\n  return (\n    <div>\n    </div>\n  );\n};\n\nexport default CounterComponent;",
    type: "code",
  },
  {
    id: "react-counter-advanced",
    category: "react",
    title: "Counter Variations",
    description:
      "Extend a counter with step control using Math.max/min, reset, multiple counters, and double/triple increment buttons.",
    checklist: [
      "Use Math.max or Math.min to clamp count or step",
      "Support configurable step increment",
      "Add reset button to return count to 0",
      "Render multiple counter instances or values",
      "Add double (+2) and triple (+3) increment actions",
    ],
    verificationKeywords: [
      ["Math.max", "Math.min"],
      ["step"],
      ["reset", "0"],
      ["count"],
      ["double", "2"],
      ["triple", "3"],
    ],
    starterCode:
      "import React, { useState } from 'react';\n\nconst CounterComponent = () => {\n  // 1: Use Math.max / Math.min to clamp count or step\n  // 2: Add step-based increment (e.g. step = 1, 2, 5)\n  // 3: Reset button sets count back to 0\n  // 4: Support multiple counters or multiple step buttons\n  // 5: Double (+2) and Triple (+3) increment handlers\n\n  return (\n    <div>\n    </div>\n  );\n};\n\nexport default CounterComponent;",
    type: "code",
  },
  {
    id: "react-counter-redux",
    category: "react",
    title: "Counter with Redux",
    description:
      "Wire a counter to Redux using combineReducers, a counterReducer, useSelector, and useDispatch.",
    checklist: [
      "Create counterReducer with INCREMENT and DECREMENT",
      "Combine reducers with combineReducers",
      "Read count via useSelector",
      "Dispatch INCREMENT and DECREMENT with useDispatch",
      "Render count and increment/decrement buttons",
    ],
    verificationKeywords: [
      ["counterReducer", "INCREMENT"],
      ["combineReducers"],
      ["useSelector"],
      ["useDispatch"],
      ["dispatch", "INCREMENT"],
      ["count"],
    ],
    starterCode:
      "// counterReducer.js\n// 1: initialState { count: 0 }, reducer with INCREMENT / DECREMENT\n\n// reducers/index.js\n// 2: combineReducers({ counter: counterReducer })\n\n// CounterComponent.js\nimport React from 'react';\nimport { useSelector, useDispatch } from 'react-redux';\n\nconst CounterComponent = () => {\n  // 3: useSelector(state => state.counter.count)\n  // 4: useDispatch() for INCREMENT / DECREMENT\n  // 5: Render count with Increment / Decrement buttons\n\n  return (\n    <div>\n    </div>\n  );\n};\n\nexport default CounterComponent;",
    type: "code",
  },
  {
    id: "react-toggle-visibility",
    category: "react",
    title: "Toggle Visibility",
    description:
      "Toggle message visibility using useReducer with a TOGGLE_VISIBILITY action and conditional rendering.",
    checklist: [
      "Define TOGGLE_VISIBILITY action type",
      "Set initialState with visible: true",
      "Reducer flips visible on TOGGLE_VISIBILITY",
      "Conditionally render message when visible",
      "Button label switches between Hide and Show",
    ],
    verificationKeywords: [
      ["TOGGLE_VISIBILITY"],
      ["visible", "true"],
      ["reducer"],
      ["state.visible", "&&"],
      ["Hide", "Show"],
    ],
    starterCode:
      "import React, { useReducer } from 'react';\n\nconst TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';\nconst initialState = { visible: true };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    default:\n      return state;\n  }\n}\n\nfunction ToggleVisibility() {\n  // 1: useReducer with reducer and initialState\n  // 2: Conditionally render message when state.visible\n  // 3: Button dispatches TOGGLE_VISIBILITY, label Hide / Show\n\n  return (\n    <div>\n    </div>\n  );\n}\n\nexport default ToggleVisibility;",
    type: "code",
  },
  {
    id: "react-form-input",
    category: "react",
    title: "Form Input Handling",
    description:
      "Build a controlled form input with useReducer. Display the typed value live as the user types.",
    checklist: [
      "Import useReducer from React",
      "Define SET_INPUT action type",
      "Reducer updates input from action.payload",
      "Controlled input with value={state.input}",
      "onChange dispatches SET_INPUT with e.target.value",
      "Display entered text below the input",
    ],
    verificationKeywords: [
      ["useReducer", "import"],
      ["SET_INPUT"],
      ["reducer", "payload"],
      ["value", "state.input"],
      ["onChange", "dispatch", "SET_INPUT"],
      ["Entered Text", "state.input"],
    ],
    starterCode:
      "import React, { useReducer } from 'react';\n\nconst SET_INPUT = 'SET_INPUT';\nconst initialState = { input: '' };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    default:\n      return state;\n  }\n}\n\nfunction FormInput() {\n  // 1: useReducer with reducer and initialState\n  // 2: Controlled input value={state.input}\n  // 3: onChange dispatches SET_INPUT with e.target.value\n  // 4: Show <p>Entered Text: {state.input}</p>\n\n  return (\n    <div>\n    </div>\n  );\n}\n\nexport default FormInput;",
    type: "code",
  },
  {
    id: "react-fetch-data",
    category: "react",
    title: "Fetch Data on Button Click",
    description:
      "Fetch API data on button click using useReducer with FETCH_SUCCESS and FETCH_ERROR actions.",
    checklist: [
      "Define FETCH_SUCCESS and FETCH_ERROR actions",
      "Initial state with data: null and error: null",
      "Async fetchData function calls API",
      "Dispatch FETCH_SUCCESS with response on success",
      "Dispatch FETCH_ERROR with message on failure",
      "Render data or error in the UI",
    ],
    verificationKeywords: [
      ["FETCH_SUCCESS", "FETCH_ERROR"],
      ["data", "error", "null"],
      ["fetch"],
      ["FETCH_SUCCESS", "payload"],
      ["FETCH_ERROR", "payload"],
      ["JSON.stringify", "state.error"],
    ],
    starterCode:
      "import React, { useReducer } from 'react';\n\nconst FETCH_SUCCESS = 'FETCH_SUCCESS';\nconst FETCH_ERROR = 'FETCH_ERROR';\nconst initialState = { data: null, error: null };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    default:\n      return state;\n  }\n}\n\nfunction FetchData() {\n  // 1: async fetchData with try/catch\n  // 2: fetch API, dispatch FETCH_SUCCESS or FETCH_ERROR\n  // 3: Button triggers fetchData\n  // 4: Render state.data and state.error\n\n  return (\n    <div>\n    </div>\n  );\n};\n\nexport default FetchData;",
    type: "code",
  },
  {
    id: "react-manage-list",
    category: "react",
    title: "Manage List of Items",
    description:
      "Add and remove list items using useReducer for the list and useState for the input field.",
    checklist: [
      "Define ADD_ITEM and REMOVE_ITEM actions",
      "Reducer appends item on ADD_ITEM",
      "Reducer filters out item by index on REMOVE_ITEM",
      "useState holds current input text",
      "Add button dispatches ADD_ITEM and clears input",
      "Render list with Remove button per item",
    ],
    verificationKeywords: [
      ["ADD_ITEM", "REMOVE_ITEM"],
      ["items", "[]"],
      ["ADD_ITEM", "payload"],
      ["REMOVE_ITEM", "filter"],
      ["useState", "input"],
      ["Add Item", "Remove"],
    ],
    starterCode:
      "import React, { useReducer, useState } from 'react';\n\nconst ADD_ITEM = 'ADD_ITEM';\nconst REMOVE_ITEM = 'REMOVE_ITEM';\nconst initialState = { items: [] };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    default:\n      return state;\n  }\n}\n\nfunction ManageList() {\n  // 1: useReducer for items, useState for input\n  // 2: addItem dispatches ADD_ITEM, clears input\n  // 3: Remove dispatches REMOVE_ITEM with index\n  // 4: Map items to <li> with Remove button\n\n  return (\n    <div>\n    </div>\n  );\n}\n\nexport default ManageList;",
    type: "code",
  },
  {
    id: "react-tab-navigation",
    category: "react",
    title: "Tab Navigation",
    description:
      "Build tab navigation with useReducer. Switch between Tab1, Tab2, and Tab3 content panels.",
    checklist: [
      "Define SELECT_TAB action type",
      "Initial state selectedTab: 'Tab1'",
      "Reducer updates selectedTab from payload",
      "Render Tab 1, Tab 2, Tab 3 buttons",
      "Each button dispatches SELECT_TAB with tab name",
      "Show content matching state.selectedTab",
    ],
    verificationKeywords: [
      ["SELECT_TAB"],
      ["selectedTab", "Tab1"],
      ["reducer", "payload"],
      ["Tab 1", "Tab 2", "Tab 3"],
      ["SELECT_TAB", "dispatch"],
      ["selectedTab", "==="],
    ],
    starterCode:
      "import React, { useReducer } from 'react';\n\nconst SELECT_TAB = 'SELECT_TAB';\nconst initialState = { selectedTab: 'Tab1' };\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    default:\n      return state;\n  }\n}\n\nfunction TabNavigation() {\n  // 1: useReducer with reducer and initialState\n  // 2: Tab buttons dispatch SELECT_TAB with payload\n  // 3: Conditionally render content for selected tab\n\n  return (\n    <div>\n    </div>\n  );\n}\n\nexport default TabNavigation;",
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
    starterCode:
      "-- 1: SELECT the columns to check for duplicates\n-- 2: GROUP BY those columns\n-- 3: HAVING COUNT(*) > 1\n-- 4: Return the duplicate values",
    type: "sql",
  },
];
