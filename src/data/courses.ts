export type CourseStepType = "html" | "code-exam" | "quiz";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface CourseStep {
  id: string;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
  chapterIndex: number;
  stepIndex: number;
  stepType: CourseStepType;
  title: string;
  description: string;
  contentHtml?: string;
  checklist?: string[];
  starterCode?: string;
  verificationKeywords?: string[][];
  codeType?: "code" | "sql" | "text";
  quizQuestions?: QuizQuestion[];
  detailedInstructions?: string[];
}

export interface CourseChapter {
  id: string;
  courseId: string;
  chapterIndex: number;
  title: string;
  description?: string;
  steps: CourseStep[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  courseIndex: number;
  chapters: CourseChapter[];
}

export function flattenCourseSteps(course: Course): CourseStep[] {
  return course.chapters
    .slice()
    .sort((a, b) => a.chapterIndex - b.chapterIndex)
    .flatMap((chapter) => chapter.steps.slice().sort((a, b) => a.stepIndex - b.stepIndex));
}

export function courseStepLabel(step: CourseStep): string {
  if (step.stepType === "html") return "Lesson";
  if (step.stepType === "code-exam") return "Code exam";
  return "Quiz";
}

const REACT_CRUD_COURSE_ID = "react-crud";

export const DEFAULT_COURSES: Course[] = [
  {
    id: REACT_CRUD_COURSE_ID,
    title: "React CRUD Premium",
    description: "A premium teacher-led React CRUD course with real business scenarios, quizzes, and hands-on code exams.",
    color: "#61dafb",
    icon: "⚛️",
    courseIndex: 0,
    chapters: [
      {
        id: "react-crud-premium-ch1",
        courseId: REACT_CRUD_COURSE_ID,
        chapterIndex: 0,
        title: "React CRUD Premium",
        description: "A complete lesson sequence through React CRUD workflows.",
        steps: [
          {
            id: "react-crud-premium-step0",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "html",
            title: "Course introduction",
            description: "Meet the course and learn what you will build.",
            contentHtml: `<div class="course-lesson">
  <h2>Welcome to React CRUD Premium</h2>
  <p>This course is designed like an instructor-led workshop with step-by-step explanations, business examples, and practical code exercises.</p>
  <ul>
    <li>Understand how CRUD behavior maps to real applications.</li>
    <li>Learn React patterns that are used in customer portals, dashboards, and admin systems.</li>
    <li>Practice with quizzes and code exams that reinforce each concept.</li>
  </ul>
</div>`,
            detailedInstructions: [
              "Instructor: Welcome learners — explain that this workshop covers CRUD fundamentals in React with real examples and hands-on exercises.",
              "Explain the course flow: short lesson, code exam, then a quiz to confirm understanding. Encourage questions and live experimentation.",
              "Class tip: emphasize immutability early — it's the key to predictable UI updates in React.",
            ],
          },
          {
            id: "react-crud-premium-step1",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "html",
            title: "Real-world scenario",
            description: "See CRUD in action across POS, logistics, and admin systems.",
            contentHtml: `<div class="course-lesson">
  <h2>CRUD in the real world</h2>
  <p>CRUD workflows appear in many business applications. Examples include:</p>
  <ul>
    <li><strong>Point-of-sale systems</strong> where clerks add customers, products, and transactions.</li>
    <li><strong>Logistics dashboards</strong> that track orders, shipments, and inventory status.</li>
    <li><strong>Admin portals</strong> used to manage users, settings, and support tickets.</li>
  </ul>
  <p>These apps need reliable create, read, update, and delete behavior to keep data consistent and easy to manage.</p>
</div>`,
          },
          {
            id: "react-crud-premium-step2",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 2,
            stepType: "html",
            title: "Why React for CRUD",
            description: "Learn about React's popularity and the roles that use it.",
            contentHtml: `<div class="course-lesson">
  <div class="course-lesson">
    <div class="slide-card">
      <div class="slide-text">
        <h2>Why React?</h2>
        <p>React is a leading frontend library that maps well to data-driven UIs. It helps structure apps into components and manage dynamic state simply.</p>
        <ul>
          <li>Component-based architecture for reuse and composition.</li>
          <li>Lightweight rendering model for fast UI updates.</li>
          <li>Fits well for CRUD workflows and interactive dashboards.</li>
        </ul>
      </div>
      <div class="slide-diagram" aria-hidden>
        <svg viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg" role="img">
          <rect x="20" y="20" width="110" height="40" rx="6" class="box" />
          <text x="75" y="45" font-size="12" text-anchor="middle" fill="#0f172a">State</text>
          <rect x="150" y="20" width="110" height="40" rx="6" class="box" />
          <text x="205" y="45" font-size="12" text-anchor="middle" fill="#0f172a">UI</text>
          <rect x="85" y="90" width="110" height="40" rx="6" class="box" />
          <text x="140" y="115" font-size="12" text-anchor="middle" fill="#0f172a">Actions</text>
          <path class="arrow" d="M75 60 L75 90" marker-end="url(#arrowhead)" />
          <path class="arrow" d="M205 60 L205 90" marker-end="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  </div>`,
            detailedInstructions: [
              "Instructor notes: Explain component boundaries and when to lift state up vs. using context. Use the diagram to show how state, UI and actions interact.",
              "Demo: Show a tiny function component that renders a list and updates it with setState — explain re-rendering behavior.",
            ],
          },
          {
            id: "react-crud-premium-step3",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 3,
            stepType: "quiz",
            title: "React fundamentals quiz",
            description: "Confirm your understanding of React basics before coding.",
            quizQuestions: [
              {
                id: "react-crud-premium-q1",
                prompt: "Which hook is used to store simple state in a function component?",
                options: [
                  { id: "a", text: "useState" },
                  { id: "b", text: "useEffect" },
                  { id: "c", text: "useCallback" },
                  { id: "d", text: "useMemo" },
                ],
                correctOptionId: "a",
                explanation: "useState is the standard hook for local component state such as form values and lists.",
              },
              {
                id: "react-crud-premium-q2",
                prompt: "What happens when React state changes?",
                options: [
                  { id: "a", text: "The component re-renders with updated UI" },
                  { id: "b", text: "The browser reloads the page" },
                  { id: "c", text: "The network request restarts" },
                  { id: "d", text: "The component stops responding" },
                ],
                correctOptionId: "a",
                explanation: "React updates the component output and applies the changed UI to the DOM.",
              },
            ],
          },
          {
            id: "react-crud-premium-step4",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 4,
            stepType: "code-exam",
            title: "Code exam: render a list",
            description: "Build the first React component that displays a list of items.",
            codeType: "code",
            checklist: [
              "Defines a function component",
              "Uses useState to hold list data",
              "Renders items with map() and provides a key",
            ],
            starterCode: `// import React, { useState } from 'react';

// function ManageList() {
//   const [items, setItems] = useState(["Apple", "Banana", "Cherry"]);
//
//   return (
//     <div>
//       <h2>Item list</h2>
//       <ul>
//         {items.map((item, index) => (
//           <li key={index}>{item}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//
// export default ManageList;`,
            verificationKeywords: [["useState", "items.map("], ["key=", "li"], ["function ManageList", "return ("]],
          },
          {
            id: "react-crud-premium-step5",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 5,
            stepType: "html",
            title: "Create pattern",
            description: "Learn how controlled inputs turn user input into state updates.",
            contentHtml: `<div class="course-lesson">
  <div class="course-lesson">
    <div class="slide-card">
      <div class="slide-text">
        <h2>Create with controlled inputs</h2>
        <p>Controlled inputs keep the field value in React state so the component can validate and submit predictable data.</p>
        <ul>
          <li>Keep the input value in state via <code>useState</code>.</li>
          <li>Update state on every <code>onChange</code> event.</li>
          <li>On submit, append a new item immutably to your list state.</li>
        </ul>
      </div>
      <div class="slide-diagram" aria-hidden>
        <svg viewBox="0 0 380 140" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="40" width="120" height="36" rx="6" class="box" />
          <text x="80" y="63" font-size="12" text-anchor="middle" fill="#0f172a">Input</text>
          <rect x="150" y="40" width="120" height="36" rx="6" class="box" />
          <text x="210" y="63" font-size="12" text-anchor="middle" fill="#0f172a">State</text>
          <rect x="280" y="40" width="80" height="36" rx="6" class="box" />
          <text x="320" y="63" font-size="12" text-anchor="middle" fill="#0f172a">List</text>
          <path class="arrow" d="M140 58 L150 58" marker-end="url(#arrowhead2)" />
          <path class="arrow" d="M270 58 L280 58" marker-end="url(#arrowhead2)" />
          <defs>
            <marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  </div>`,
            detailedInstructions: [
              "Instructor script: Walk through a controlled input example line-by-line: useState hook, value binding, onChange handler, and submit handler.",
              "Tip: Validate input and trim whitespace before adding to the list. Encourage students to test corner cases (empty input, duplicates).",
            ],
          },
          {
            id: "react-crud-premium-step6",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 6,
            stepType: "quiz",
            title: "Create workflow quiz",
            description: "Review the create pattern and controlled input behavior.",
            quizQuestions: [
              {
                id: "react-crud-premium-q3",
                prompt: "What is a controlled input in React?",
                options: [
                  { id: "a", text: "An input whose value is stored in state" },
                  { id: "b", text: "An input that cannot be edited" },
                  { id: "c", text: "An input that submits automatically" },
                  { id: "d", text: "An input that only accepts numbers" },
                ],
                correctOptionId: "a",
                explanation: "Controlled inputs are driven by React state, so the component controls the input value.",
              },
              {
                id: "react-crud-premium-q4",
                prompt: "Which update is best when adding an item to list state?",
                options: [
                  { id: "a", text: "setItems(prev => [...prev, newItem])" },
                  { id: "b", text: "prev.push(newItem)" },
                  { id: "c", text: "setItems(items)" },
                  { id: "d", text: "items.pop()" },
                ],
                correctOptionId: "a",
                explanation: "Using a new array preserves immutable state updates in React.",
              },
            ],
          },
          {
            id: "react-crud-premium-step7",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 7,
            stepType: "code-exam",
            title: "Code exam: add items",
            description: "Implement a form that adds new items to the list.",
            codeType: "code",
            checklist: [
              "Uses useState for the draft input",
              "Handles input changes with onChange",
              "Adds a new item and clears the input",
            ],
            starterCode: `// import React, { useState } from 'react';

// function ManageList() {
//   const [items, setItems] = useState(["Apple", "Banana"]);
//   const [draft, setDraft] = useState("");
//
//   function addItem() {
//     const trimmed = draft.trim();
//     if (!trimmed) return;
//     setItems((prev) => [...prev, trimmed]);
//     setDraft("");
//   }
//
//   return (
//     <div>
//       <input value={draft} onChange={(event) => setDraft(event.target.value)} />
//       <button onClick={addItem}>Add item</button>
//       <ul>
//         {items.map((item, index) => (
//           <li key={index}>{item}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//
// export default ManageList;`,
            verificationKeywords: [["setDraft", "onChange"], ["setItems", "trim()"], ["map(", "key="]],
          },
          {
            id: "react-crud-premium-step8",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 8,
            stepType: "html",
            title: "Read pattern",
            description: "Learn how React reads and renders the state data.",
            contentHtml: `<div class="course-lesson">
  <h2>Read data in React</h2>
  <p>Showing current data in the UI means rendering state values. React keeps the display in sync whenever the state changes.</p>
  <ul>
    <li>Render arrays with map()</li>
    <li>Assign keys so React can track each item</li>
    <li>Use state values directly in JSX</li>
  </ul>
</div>`,
          },
          {
            id: "react-crud-premium-step9",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 9,
            stepType: "quiz",
            title: "Read workflow quiz",
            description: "Confirm that you understand React list rendering.",
            quizQuestions: [
              {
                id: "react-crud-premium-q5",
                prompt: "What does items.map(item => <li key={index}>{item}</li>) do?",
                options: [
                  { id: "a", text: "Creates rendered JSX list items from data" },
                  { id: "b", text: "Edits the list data" },
                  { id: "c", text: "Sends a request to the server" },
                  { id: "d", text: "Deletes the list" },
                ],
                correctOptionId: "a",
                explanation: "map() transforms each data item into JSX elements for rendering.",
              },
              {
                id: "react-crud-premium-q6",
                prompt: "Why are keys important when rendering lists?",
                options: [
                  { id: "a", text: "They help React identify items during renders" },
                  { id: "b", text: "They sort the list" },
                  { id: "c", text: "They make the list editable" },
                  { id: "d", text: "They validate the data" },
                ],
                correctOptionId: "a",
                explanation: "Keys help React match array items between renders and update only changed nodes.",
              },
            ],
          },
          {
            id: "react-crud-premium-step10",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 10,
            stepType: "code-exam",
            title: "Code exam: add filtering",
            description: "Implement a simple filter so users can search the list.",
            codeType: "code",
            checklist: [
              "Uses state for filter text",
              "Filters items before rendering",
              "Shows matching items only",
            ],
            starterCode: `// import React, { useState } from 'react';

// function ManageList() {
//   const [items] = useState(["Apple", "Banana", "Cherry"]);
//   const [filter, setFilter] = useState("");
//
//   const visibleItems = items.filter((item) =>
//     item.toLowerCase().includes(filter.toLowerCase()),
//   );
//
//   return (
//     <div>
//       <input value={filter} onChange={(event) => setFilter(event.target.value)} />
//       <ul>
//         {visibleItems.map((item, index) => (
//           <li key={index}>{item}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//
// export default ManageList;`,
            verificationKeywords: [["setFilter", "filter.toLowerCase"], ["items.filter", "includes("], ["map(", "key="]],
          },
          {
            id: "react-crud-premium-step11",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 11,
            stepType: "html",
            title: "Update pattern",
            description: "Learn how to edit items without mutating state.",
            contentHtml: `<div class="course-lesson">
  <div class="course-lesson">
    <div class="slide-card">
      <div class="slide-text">
        <h2>Update items immutably</h2>
        <p>When updating a specific item, return a new array using <code>map()</code> so React detects the change.</p>
        <ul>
          <li>Do not mutate the original array.</li>
          <li>Use <code>prev.map()</code> and replace the updated item.</li>
          <li>Call <code>setItems(newArray)</code> with the returned array.</li>
        </ul>
      </div>
      <div class="slide-diagram" aria-hidden>
        <svg viewBox="0 0 380 140" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="100" height="28" rx="6" class="box" />
          <text x="70" y="38" font-size="11" text-anchor="middle" fill="#0f172a">items[0]</text>
          <rect x="140" y="20" width="100" height="28" rx="6" class="box" />
          <text x="190" y="38" font-size="11" text-anchor="middle" fill="#0f172a">items[1]</text>
          <rect x="260" y="20" width="100" height="28" rx="6" class="box" />
          <text x="310" y="38" font-size="11" text-anchor="middle" fill="#0f172a">items[2]</text>
          <path class="arrow" d="M80 48 L80 70 L220 70 L220 48" marker-end="url(#arrowhead3)" />
          <defs>
            <marker id="arrowhead3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  </div>`,
            detailedInstructions: [
              "Instructor notes: Explain why mutating arrays can fail to update the UI — show splice() example versus returning a new array using map().",
              "Live exercise: Ask learners to change one item in the list and observe the UI behavior when using mutable vs immutable updates.",
            ],
          },
          {
            id: "react-crud-premium-step12",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 12,
            stepType: "quiz",
            title: "Update workflow quiz",
            description: "Confirm the right way to update list state.",
            quizQuestions: [
              {
                id: "react-crud-premium-q7",
                prompt: "Which approach is best to update one item in an array?",
                options: [
                  { id: "a", text: "map() and return a new array" },
                  { id: "b", text: "splice() the original array" },
                  { id: "c", text: "push() the updated item" },
                  { id: "d", text: "setItems(items)" },
                ],
                correctOptionId: "a",
                explanation: "map() creates a new array with the updated item while preserving immutability.",
              },
              {
                id: "react-crud-premium-q8",
                prompt: "Why avoid mutating the original list in React?",
                options: [
                  { id: "a", text: "React may not detect the change" },
                  { id: "b", text: "The list becomes read-only" },
                  { id: "c", text: "The browser crashes" },
                  { id: "d", text: "The UI disappears" },
                ],
                correctOptionId: "a",
                explanation: "React detects updates based on new state references, so mutations can be missed.",
              },
            ],
          },
          {
            id: "react-crud-premium-step13",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 13,
            stepType: "code-exam",
            title: "Code exam: edit items",
            description: "Implement a button that updates one item in the list.",
            codeType: "code",
            checklist: [
              "Uses map() to update the selected item",
              "Calls setItems with a new array",
              "Preserves unchanged items",
            ],
            starterCode: `// import React, { useState } from 'react';

// function ManageList() {
//   const [items, setItems] = useState(["Apple", "Banana"]);
//
//   function editItem(indexToEdit, value) {
//     setItems((prev) =>
//       prev.map((item, index) =>
//         index === indexToEdit ? value : item,
//       ),
//     );
//   }
//
//   return (
//     <div>
//       <ul>
//         {items.map((item, index) => (
//           <li key={index}>
//             {item}
//             <button onClick={() => editItem(index, item + ' (edited)')}>Edit</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//
// export default ManageList;`,
            verificationKeywords: [["map(", "setItems"], ["index === indexToEdit"], ["editItem("]],
          },
          {
            id: "react-crud-premium-step14",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 14,
            stepType: "html",
            title: "Delete pattern",
            description: "Learn how to remove items safely with immutable updates.",
            contentHtml: `<div class="course-lesson">
  <h2>Delete items carefully</h2>
  <p>Deleting an item should create a new list without the removed item, so React recognizes the state change.</p>
  <ul>
    <li>Use filter() to exclude the deleted item.</li>
    <li>Do not mutate the original array.</li>
    <li>Update state with the returned filtered array.</li>
  </ul>
</div>`,
          },
          {
            id: "react-crud-premium-step15",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 15,
            stepType: "quiz",
            title: "Delete workflow quiz",
            description: "Verify your understanding of delete patterns in React.",
            quizQuestions: [
              {
                id: "react-crud-premium-q9",
                prompt: "Which function is best for removing an item from an array immutably?",
                options: [
                  { id: "a", text: "filter()" },
                  { id: "b", text: "splice()" },
                  { id: "c", text: "push()" },
                  { id: "d", text: "pop()" },
                ],
                correctOptionId: "a",
                explanation: "filter() creates a new array without the removed item.",
              },
              {
                id: "react-crud-premium-q10",
                prompt: "Why is a new array reference important after delete?",
                options: [
                  { id: "a", text: "React can detect the changed state" },
                  { id: "b", text: "The list gets sorted" },
                  { id: "c", text: "The button becomes active" },
                  { id: "d", text: "CSS is applied correctly" },
                ],
                correctOptionId: "a",
                explanation: "React compares references and re-renders when the state object changes.",
              },
            ],
          },
          {
            id: "react-crud-premium-step16",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 16,
            stepType: "code-exam",
            title: "Code exam: delete items",
            description: "Implement a delete button to remove items from the list.",
            codeType: "code",
            checklist: [
              "Uses filter() to remove the selected item",
              "Updates state with a new array",
              "Renders the remaining items correctly",
            ],
            starterCode: `// import React, { useState } from 'react';

// function ManageList() {
//   const [items, setItems] = useState(["Apple", "Banana"]);
//
//   function deleteItem(indexToRemove) {
//     setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
//   }
//
//   return (
//     <div>
//       <ul>
//         {items.map((item, index) => (
//           <li key={index}>
//             {item}
//             <button onClick={() => deleteItem(index)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//
// export default ManageList;`,
            verificationKeywords: [["filter(", "setItems"], ["deleteItem("], ["map(", "key="]],
          },
          {
            id: "react-crud-premium-step17",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 17,
            stepType: "html",
            title: "Real-world recap",
            description: "Tie the course back to business use cases.",
            contentHtml: `<div class="course-lesson">
  <h2>Real-world recap</h2>
  <p>CRUD patterns are the backbone of many applications from logistics dashboards to admin portals.</p>
  <p>By practicing these React patterns, you are ready to build reliable data-driven interfaces.</p>
</div>`,
          },
          {
            id: "react-crud-premium-step18",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-premium-ch1",
            chapterTitle: "React CRUD Premium",
            chapterIndex: 0,
            stepIndex: 18,
            stepType: "html",
            title: "Course closing message",
            description: "Finish the premium course with next steps and encouragement.",
            contentHtml: `<div class="course-lesson">
  <h2>Congratulations</h2>
  <p>You now have a strong React CRUD foundation for real applications.</p>
  <p>Continue building on these skills by adding persistence, routing, and validation to your CRUD workflows.</p>
</div>`,
          },
        ],
      },
    ],
  },
  {
    id: "react-interview-practice",
    title: "React Interview Practice",
    description: "React practice tasks commonly asked in interviews.",
    color: "#61dafb",
    icon: "⚛️",
    courseIndex: 1,
    chapters: [
      {
        id: "react-interview-ch1",
        courseId: "react-interview-practice",
        chapterIndex: 0,
        title: "React Tasks",
        description: "Core React exercises",
        steps: [
          {
            id: "react-manage-list",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Manage List of Items",
            description: "Add and remove list items.",
            codeType: "code",
          },
        ],
      },
    ],
  },
];
