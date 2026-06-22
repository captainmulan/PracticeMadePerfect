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
  page?: {
    editor?: {
      hints?: Array<{
        guide?: string;
        code?: string;
      }>;
    };
  };
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
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Flux_diagram.svg"
          alt="Flux architecture diagram"
          style="width:100%; max-width:100%; height:auto; border-radius: 16px; border: 1px solid #e6eef8;"
        />
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
            description: "Add and remove list items using useReducer for the list and useState for the input field.",
            codeType: "code",
            checklist: [
              "Import useReducer and useState from React",
              "Define ADD_ITEM and REMOVE_ITEM actions",
              "Reducer appends item on ADD_ITEM",
              "Reducer filters out item by index on REMOVE_ITEM",
              "useState holds current input text",
              "Add button dispatches ADD_ITEM and clears input",
              "Render list with Remove button per item",
              "Export default ManageList",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// guide hints: Import: import React, { useReducer, useState } from react",
                    code: "import React, { useReducer, useState } from 'react';",
                  },
                  {
                    guide: "// guide hints: Define ADD_ITEM and REMOVE_ITEM actions and initialState",
                    code: "const ADD_ITEM = 'ADD_ITEM';\nconst REMOVE_ITEM = 'REMOVE_ITEM';\nconst initialState = { items: [] };",
                  },
                  {
                    guide: "// guide hints: Reducer appends item on ADD_ITEM and removes by index on REMOVE_ITEM",
                    code: "function reducer(state, action) {\n  switch (action.type) {\n    case ADD_ITEM:\n      return { items: [...state.items, action.payload] };\n    case REMOVE_ITEM:\n      return { items: state.items.filter((item, index) => index !== action.payload) };\n    default:\n      return state;\n  }\n}",
                  },
                  {
                    guide: "// guide hints: useReducer for items and useState for input",
                    code: "const [state, dispatch] = useReducer(reducer, initialState);\nconst [input, setInput] = useState('');",
                  },
                  {
                    guide: "// guide hints: addItem dispatches ADD_ITEM and clears input",
                    code: "const addItem = () => {\n  dispatch({ type: ADD_ITEM, payload: input });\n  setInput('');\n};",
                  },
                  {
                    guide: "// guide hints: Map items to list with Remove button",
                    code: "<ul>{state.items.map((item, index) => (\n  <li key={index}>\n    {item} <button onClick={() => dispatch({ type: REMOVE_ITEM, payload: index })}>Remove</button>\n  </li>\n))}</ul>",
                  },
                  {
                    guide: "// guide hints: Export: export default ManageList;",
                    code: "export default ManageList;",
                  },
                ],
              },
            },
          },
          {
            id: "react-form-input",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "code-exam",
            title: "Form Input Handling",
            description: "Build a controlled form input with useReducer. Display the typed value live as the user types.",
            codeType: "code",
            checklist: [
              "Import useReducer from React",
              "Define SET_INPUT action type",
              "Reducer updates input from action.payload",
              "Controlled input with value={state.input}",
              "onChange dispatches SET_INPUT with e.target.value",
              "Display entered text below the input",
              "Export default FormInput",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// guide hints: Import: import React, { useReducer } from react",
                    code: "import React, { useReducer } from 'react';",
                  },
                  {
                    guide: "// guide hints: Define SET_INPUT action type and initialState",
                    code: "const SET_INPUT = 'SET_INPUT';\nconst initialState = { input: '' };",
                  },
                  {
                    guide: "// guide hints: Reducer updates input from action.payload",
                    code: "function reducer(state, action) {\n  switch (action.type) {\n    case SET_INPUT:\n      return { input: action.payload };\n    default:\n      return state;\n  }\n}",
                  },
                  {
                    guide: "// guide hints: useReducer with reducer and initialState",
                    code: "const [state, dispatch] = useReducer(reducer, initialState);",
                  },
                  {
                    guide: "// guide hints: Controlled input with value=state.input",
                    code: "<input value={state.input} onChange={(e) => dispatch({ type: SET_INPUT, payload: e.target.value })} />",
                  },
                  {
                    guide: "// guide hints: Show Entered Text below the input",
                    code: "<p>Entered Text: {state.input}</p>",
                  },
                  {
                    guide: "// guide hints: Export: export default FormInput;",
                    code: "export default FormInput;",
                  },
                ],
              },
            },
          },
          {
            id: "react-toggle-visibility",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 2,
            stepType: "code-exam",
            title: "Toggle Visibility",
            description: "Toggle message visibility using useReducer with a TOGGLE_VISIBILITY action and conditional rendering.",
            codeType: "code",
            checklist: [
              "Import useReducer from React",
              "Define TOGGLE_VISIBILITY action type",
              "Set initialState with visible: true",
              "Reducer flips visible on TOGGLE_VISIBILITY",
              "Conditionally render message when visible",
              "Button label switches between Hide and Show",
              "Export default ToggleVisibility",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// guide hints: Import: import React, { useReducer } from react",
                    code: "import React, { useReducer } from 'react';",
                  },
                  {
                    guide: "// guide hints: Define TOGGLE_VISIBILITY action type and initialState",
                    code: "const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';\nconst initialState = { visible: true };",
                  },
                  {
                    guide: "// guide hints: Reducer flips visible on TOGGLE_VISIBILITY",
                    code: "function reducer(state, action) {\n  switch (action.type) {\n    case TOGGLE_VISIBILITY:\n      return { visible: !state.visible };\n    default:\n      return state;\n  }\n}",
                  },
                  {
                    guide: "// guide hints: useReducer with reducer and initialState",
                    code: "const [state, dispatch] = useReducer(reducer, initialState);",
                  },
                  {
                    guide: "// guide hints: Conditionally render message when state.visible",
                    code: "{state.visible && <p>The message is visible.</p>}",
                  },
                  {
                    guide: "// guide hints: Button dispatches TOGGLE_VISIBILITY, label Hide / Show",
                    code: "<button onClick={() => dispatch({ type: TOGGLE_VISIBILITY })}>{state.visible ? 'Hide' : 'Show'}</button>",
                  },
                  {
                    guide: "// guide hints: Export: export default ToggleVisibility;",
                    code: "export default ToggleVisibility;",
                  },
                ],
              },
            },
          },
          {
            id: "react-tab-navigation",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 3,
            stepType: "code-exam",
            title: "Tab Navigation",
            description: "Build tab navigation with useReducer. Switch between Tab1, Tab2, and Tab3 content panels.",
            codeType: "code",
            checklist: [
              "Import useReducer from React",
              "Define SELECT_TAB action type",
              "Initial state selectedTab: 'Tab1'",
              "Reducer updates selectedTab from payload",
              "Render Tab 1, Tab 2, Tab 3 buttons",
              "Each button dispatches SELECT_TAB with tab name",
              "Show content matching state.selectedTab",
              "Export default TabNavigation",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// guide hints: Import: import React, { useReducer } from react",
                    code: "import React, { useReducer } from 'react';",
                  },
                  {
                    guide: "// guide hints: Define SELECT_TAB action type and initial state",
                    code: "const SELECT_TAB = 'SELECT_TAB';\nconst initialState = { selectedTab: 'Tab1' };",
                  },
                  {
                    guide: "// guide hints: Reducer updates selectedTab from action.payload",
                    code: "function reducer(state, action) {\n  switch (action.type) {\n    case SELECT_TAB:\n      return { selectedTab: action.payload };\n    default:\n      return state;\n  }\n}",
                  },
                  {
                    guide: "// guide hints: useReducer with reducer and initialState",
                    code: "const [state, dispatch] = useReducer(reducer, initialState);",
                  },
                  {
                    guide: "// guide hints: Tab buttons dispatch SELECT_TAB with tab name",
                    code: "<button onClick={() => dispatch({ type: SELECT_TAB, payload: 'Tab1' })}>Tab1</button>\n<button onClick={() => dispatch({ type: SELECT_TAB, payload: 'Tab2' })}>Tab2</button>\n<button onClick={() => dispatch({ type: SELECT_TAB, payload: 'Tab3' })}>Tab3</button>",
                  },
                  {
                    guide: "// guide hints: Conditionally render content for selected tab",
                    code: "{state.selectedTab === 'Tab1' && <div>Tab1 Content</div>}\n{state.selectedTab === 'Tab2' && <div>Tab2 Content</div>}\n{state.selectedTab === 'Tab3' && <div>Tab3 Content</div>}",
                  },
                  {
                    guide: "// guide hints: Export: export default TabNavigation;",
                    code: "export default TabNavigation;",
                  },
                ],
              },
            },
          },
          {
            id: "react-fetch-data",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 4,
            stepType: "code-exam",
            title: "Fetch Data on Button Click",
            description: "Fetch API data on button click using useReducer with FETCH_SUCCESS and FETCH_ERROR actions.",
            codeType: "code",
            checklist: [
              "Import useReducer from React",
              "Define FETCH_SUCCESS and FETCH_ERROR actions",
              "Initial state with data: null and error: null",
              "Async fetchData function calls API",
              "Dispatch FETCH_SUCCESS with response on success",
              "Dispatch FETCH_ERROR with message on failure",
              "Render data or error in the UI",
              "Export default FetchData",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// guide hints: Import: import React, { useReducer } from react",
                    code: "import React, { useReducer } from 'react';",
                  },
                  {
                    guide: "// guide hints: Define FETCH_SUCCESS and FETCH_ERROR actions and initial state",
                    code: "const FETCH_SUCCESS = 'FETCH_SUCCESS';\nconst FETCH_ERROR = 'FETCH_ERROR';\nconst initialState = { data: null, error: null };",
                  },
                  {
                    guide: "// guide hints: Reducer handles FETCH_SUCCESS and FETCH_ERROR",
                    code: "function reducer(state, action) {\n  switch (action.type) {\n    case FETCH_SUCCESS:\n      return { ...state, data: action.payload, error: null };\n    case FETCH_ERROR:\n      return { ...state, error: action.payload };\n    default:\n      return state;\n  }\n}",
                  },
                  {
                    guide: "// guide hints: async fetchData with try/catch",
                    code: "const [state, dispatch] = useReducer(reducer, initialState);\nconst fetchData = async () => {\n  try {\n    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');\n    const data = await response.json();\n    dispatch({ type: FETCH_SUCCESS, payload: data });\n  } catch (error) {\n    dispatch({ type: FETCH_ERROR, payload: error.message });\n  }\n};",
                  },
                  {
                    guide: "// guide hints: Button triggers fetchData",
                    code: "<button onClick={fetchData}>Fetch Data</button>",
                  },
                  {
                    guide: "// guide hints: Render state.data and state.error",
                    code: "{state.error && <p>{state.error}</p>}\n{state.data && <pre>{JSON.stringify(state.data, null, 2)}</pre>}",
                  },
                  {
                    guide: "// guide hints: Export: export default FetchData;",
                    code: "export default FetchData;",
                  },
                ],
              },
            },
          },
          {
            id: "react-counter-advanced",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 5,
            stepType: "code-exam",
            title: "Counter Variations",
            description: "Extend a counter with step control using Math.max/min, reset, multiple counters, and double/triple increment buttons.",
            codeType: "code",
            checklist: [
              "Import React and useState from React",
              "Create a Counter component with count and step state",
              "Use Math.max and Math.min to enforce counter limits",
              "Add reset, double, and triple actions",
              "Render multiple counter instances in App",
              "Export default App",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// Import React and useState from React",
                    code: "import React, { useState } from 'react';",
                  },
                  {
                    guide: "// Create a reusable Counter component and declare required state variables",
                    code: "const CounterComponent = () => {\n  const [count, setCount] = useState(0);\n  const [step, setStep] = useState(1);",
                  },
                  {
                    guide: "// Use Math.max() and Math.min() to enforce counter limits",
                    code: "const increase = () => {\n  setCount(Math.min(count + step, 100));\n};\n\nconst decrease = () => {\n  setCount(Math.max(count - step, 0));\n};",
                  },
                  {
                    guide: "// Create UI for the counter, step control, and action buttons",
                    code: "return (\n  <div>\n    <h2>Count: {count}</h2>\n    <label>Step:<input type=\"number\" value={step} onChange={(e) => setStep(Number(e.target.value))} /></label>\n    <button onClick={increase}>Increase</button>\n    <button onClick={decrease}>Decrease</button>\n    <button onClick={() => setCount(0)}>Reset</button>\n    <button onClick={() => setCount(Math.min(count + step * 2, 100))}>Double</button>\n    <button onClick={() => setCount(Math.min(count + step * 3, 100))}>Triple</button>\n  </div>\n);",
                  },
                  {
                    guide: "// Render multiple counter instances",
                    code: "const App = () => {\n  return (\n    <div>\n      <CounterComponent />\n      <CounterComponent />\n    </div>\n  );\n};",
                  },
                  {
                    guide: "// Export the main App component",
                    code: "export default App;",
                  },
                ],
              },
            },
          },
          {
            id: "react-counter-redux",
            courseId: "react-interview-practice",
            chapterId: "react-interview-ch1",
            chapterTitle: "React Tasks",
            chapterIndex: 0,
            stepIndex: 6,
            stepType: "code-exam",
            title: "Counter with Redux",
            description: "Wire a counter to Redux using combineReducers, a counterReducer, useSelector, and useDispatch.",
            codeType: "code",
            checklist: [
              "Import React and react-redux hooks",
              "Create counterReducer with INCREMENT and DECREMENT",
              "Combine reducers with combineReducers",
              "Read count via useSelector",
              "Dispatch INCREMENT and DECREMENT with useDispatch",
              "Render count and increment/decrement buttons",
              "Export default CounterComponent",
            ],
            page: {
              editor: {
                hints: [
                  {
                    guide: "// guide hints: Import: import React from 'react';",
                    code: "import React from 'react';",
                  },
                  {
                    guide: "// guide hints: Import: useSelector and useDispatch from react-redux, and combineReducers from redux",
                    code: "import { combineReducers } from 'redux';\nimport { useSelector, useDispatch } from 'react-redux';",
                  },
                  {
                    guide: "// guide hints: initialState { count: 0 }, reducer with INCREMENT / DECREMENT",
                    code: "const initialState = { count: 0 };\nconst counterReducer = (state = initialState, action) => {\n  switch (action.type) {\n    case 'INCREMENT':\n      return { count: state.count + 1 };\n    case 'DECREMENT':\n      return { count: state.count - 1 };\n    default:\n      return state;\n  }\n};",
                  },
                  {
                    guide: "// guide hints: combineReducers({ counter: counterReducer })",
                    code: "const rootReducer = combineReducers({ counter: counterReducer });",
                  },
                  {
                    guide: "// guide hints: useSelector(state => state.counter.count)",
                    code: "const count = useSelector((state) => state.counter.count);",
                  },
                  {
                    guide: "// guide hints: useDispatch() for INCREMENT / DECREMENT",
                    code: "const dispatch = useDispatch();\nconst increment = () => dispatch({ type: 'INCREMENT' });\nconst decrement = () => dispatch({ type: 'DECREMENT' });",
                  },
                  {
                    guide: "// guide hints: Render count with Increment / Decrement buttons",
                    code: "return (\n  <div>\n    <h2>Count: {count}</h2>\n    <button onClick={increment}>Increment</button>\n    <button onClick={decrement}>Decrement</button>\n  </div>\n);",
                  },
                  {
                    guide: "// guide hints: Export: export default CounterComponent;",
                    code: "export default CounterComponent;",
                  },
                ],
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "solid-interview-practice",
    title: "SOLID Interview Practice",
    description: "SOLID principles and design patterns practice for interviews.",
    color: "#4a90e2",
    icon: "📐",
    courseIndex: 2,
    chapters: [
      {
        id: "solid-interview-ch1",
        courseId: "solid-interview-practice",
        chapterIndex: 0,
        title: "SOLID Principles",
        description: "Core SOLID and OOP concepts",
        steps: [
          {
            id: "solid-core-concepts",
            courseId: "solid-interview-practice",
            chapterId: "solid-interview-ch1",
            chapterTitle: "SOLID Principles",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "html",
            title: "What is SOLID?",
            description: "Review the SOLID principles, abstract/interface differences, and polymorphism for interview readiness.",
            codeType: "text",
            checklist: [
              "Explain the SOLID principles in plain language",
              "Describe Abstract class vs Interface",
              "Summarize how polymorphism improves design",
            ],
            contentHtml: "<div class=\"solid-flashcards\">\n  </div>\n  <section class=\"solid-section\"><table>\n      <thead><tr><th>Sub Question</th><th>Answer</th><th>More Explanation</th><th>Example</th><th>Benefit</th></tr></thead>\n      <tbody>\n        <tr><td>What is SOLID</td><td>Design principles for clean code</td><td>Reduces complexity and future risks</td><td>Add new policy without breaking existing code</td><td>Maintainable system</td></tr>\n        <tr><td>SRP - Single Responsibility</td><td>One class = one job</td><td>Avoid mixed responsibilities</td><td>PremiumCalculator only calculates premium</td><td>Easy testing</td></tr>\n        <tr><td>OCP - Open/Closed</td><td>Extend, don't modify</td><td>Add features without changing old code</td><td>Add TravelPolicy without changing core logic</td><td>Safer changes</td></tr>\n        <tr><td>LSP - Liskov Substitution</td><td>Child behaves like parent</td><td>No broken behaviour when substituting</td><td>MotorPolicy works as Policy</td><td>Reliable code</td></tr>\n        <tr><td>ISP - Interface Segregation Principle</td><td>Small focused interfaces</td><td>Don't force unused methods</td><td>IClaimable, IRenewable separated</td><td>Cleaner design</td></tr>\n        <tr><td>DIP - Dependency Inversion</td><td>Depend on abstraction</td><td>Not concrete classes</td><td>ClaimService uses IPaymentService</td><td>Flexible + testable</td></tr>\n        <tr><td>Explain Abstract vs Interface</td><td>Abstract = partial logic, Interface = contract</td><td>Abstract has code, interface only rules</td><td>Policy vs IClaimable</td><td>Flexible design</td></tr>\n        <tr><td>Explain Polymorphism</td><td>Same method, different behaviour</td><td>Behaviour depends on object</td><td>CalculateClaim varies by policy</td><td>Reusable logic</td></tr>\n      </tbody>\n    </table>\n  </section>\n</div>",
          },
          {
            id: "solid-oop-fundamentals",
            courseId: "solid-interview-practice",
            chapterId: "solid-interview-ch1",
            chapterTitle: "SOLID Principles",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "html",
            title: "OOP Fundamentals",
            description: "Review key object-oriented programming concepts with short definitions, explanations, examples, and benefits.",
            codeType: "text",
            checklist: [
              "Explain the core OOP concepts clearly",
              "Describe how objects, classes, and encapsulation relate",
              "Summarize polymorphism, abstraction, and constructors",
            ],
            contentHtml: "<div class=\"solid-flashcards\">\n  </div>\n  <section class=\"solid-section\"><table>\n      <thead><tr><th>Sub Question</th><th>Answer</th><th>More Explanation</th><th>Example</th><th>Benefit</th></tr></thead>\n      <tbody>\n        <tr><td>What is Inheritance?</td><td>Parent-child relationship of classes</td><td>A subclass inherits properties and methods from its superclass for hierarchy and reuse</td><td>class Dog extends Animal {}</td><td>Reduces duplication and supports extension</td></tr>\n        <tr><td>What is Polymorphism?</td><td>One interface, many forms</td><td>Same call can do different things depending on the object type</td><td>add(int, int) / add(float) or Dog overrides sound()</td><td>Makes code more flexible and reusable</td></tr>\n        <tr><td>What is an Object?</td><td>Instance of a class</td><td>Objects are concrete runtime values created from class blueprints</td><td>Dog myDog = new Dog();</td><td>Enables real-world modeling in code</td></tr>\n        <tr><td>What is a Class?</td><td>Blueprint for objects</td><td>Classes define the properties and behavior that objects can have</td><td>class Animal { int age; }</td><td>Structures code and organizes behavior</td></tr>\n        <tr><td>What is Encapsulation?</td><td>Protecting data by restricting access</td><td>Hide state behind methods and control how it changes</td><td>private int age; public int getAge()</td><td>Improves security and prevents misuse</td></tr>\n        <tr><td>What is Abstraction?</td><td>Hide implementation, show only essentials</td><td>Simplifies complex systems by exposing only required behavior</td><td>abstract class Shape { abstract void draw(); }</td><td>Simplifies interfaces and reduces complexity</td></tr>\n        <tr><td>What is a Constructor?</td><td>Initializes an object automatically</td><td>Called when an object is created to set up its initial state</td><td>public Dog() { this.age = 1; }</td><td>Ensures objects start with valid data</td></tr>\n      </tbody>\n    </table>\n  </section>\n</div>",
          },
          {
            id: "solid-design-patterns",
            courseId: "solid-interview-practice",
            chapterId: "solid-interview-ch1",
            chapterTitle: "SOLID Principles",
            chapterIndex: 0,
            stepIndex: 2,
            stepType: "html",
            title: "Explain Design Patterns",
            description: "Review common design patterns for interview-ready explanations.",
            codeType: "text",
            checklist: [
              "Explain Singleton and Factory patterns",
              "Describe Observer and reuse patterns",
              "Summarize when to use these design patterns",
            ],
            contentHtml: "<div class=\"solid-flashcards\">\n  </div>\n  <section class=\"solid-section\"><table>\n      <thead><tr><th>Sub Question</th><th>Answer</th><th>More Explanation</th><th>Example</th><th>Benefit</th></tr></thead>\n      <tbody>\n        <tr><td>Singleton</td><td>One instance only</td><td>Global shared object</td><td>Logger</td><td>Saves resources</td></tr>\n        <tr><td>Factory</td><td>Create objects centrally</td><td>No direct new</td><td>PolicyFactory</td><td>Clean code</td></tr>\n        <tr><td>Observer</td><td>Notify changes</td><td>One-to-many update</td><td>Email alerts</td><td>Auto updates</td></tr>\n      </tbody>\n    </table>\n  </section>\n</div>",
          },
          {
            id: "solid-architecture-and-system",
            courseId: "solid-interview-practice",
            chapterId: "solid-interview-ch1",
            chapterTitle: "SOLID Principles",
            chapterIndex: 0,
            stepIndex: 3,
            stepType: "html",
            title: "Explain ARCHITECTURE & SYSTEM",
            description: "Review architecture and system concepts for interview fluency.",
            codeType: "text",
            checklist: [
              "Explain hybrid architecture",
              "Describe monolith vs microservices",
              "Summarize scalability and polymorphism in architecture",
            ],
            contentHtml: "<div class=\"solid-flashcards\">\n  </div>\n  <section class=\"solid-section\"><table>\n      <thead><tr><th>Sub Question</th><th>Answer</th><th>More Explanation</th><th>Example</th><th>Benefit</th></tr></thead>\n      <tbody>\n        <tr><td>Hybrid Architecture</td><td>UI + API separation</td><td>Frontend and backend separated</td><td>MVC + REST API</td><td>Clean structure</td></tr>\n        <tr><td>Monolith vs Microservices</td><td>One app vs many services</td><td>Services run independently</td><td>Policy, Claims, Billing separate</td><td>Scalability</td></tr>\n        <tr><td>Scalability</td><td>Handle more load</td><td>Add resources when needed</td><td>Claim system during peak traffic</td><td>Performance</td></tr>\n        <tr><td>Compile vs Runtime Polymorphism</td><td>Overloading vs Overriding</td><td>Compile-time vs runtime decision</td><td>Overload / override methods</td><td>Flexibility</td></tr>\n        <tr><td>Singleton vs Factory</td><td>One instance vs object creation</td><td>Singleton reused, Factory creates objects</td><td>Logger vs PolicyFactory</td><td>Control objects</td></tr>\n      </tbody>\n    </table>\n  </section>\n</div>",
          },
        ],
      },
    ],
  },
];
