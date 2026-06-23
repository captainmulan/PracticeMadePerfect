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
  {
    id: "angular-interview-practice",
    title: "Angular Interview Practice",
    description: "Angular concept interview questions and answers.",
    color: "#dd0031",
    icon: "🅰️",
    courseIndex: 3,
    chapters: [
      {
        id: "angular-interview-ch1",
        courseId: "angular-interview-practice",
        chapterIndex: 0,
        title: "Angular Concepts",
        description: "Core Angular concept explanations and examples",
        steps: [
          {
            id: "angular-concepts-authguard",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch1",
            chapterTitle: "Angular Concepts",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "html",
            title: "AuthGuard & Route Protection",
            description: "Review Angular AuthGuard implementation, lifecycle hooks, NgRx patterns, and how Angular communicates with .NET Core APIs.",
            codeType: "text",
            checklist: [
              "Explain AuthGuard and route access control",
              "Describe all lifecycle hooks in Angular",
              "Understand NgRx for state management",
              "Explain Angular-to-.NET communication patterns",
              "Understand two-way data binding and routing",
            ],
            contentHtml: "<div class=\"solid-flashcards\">\n  <section class=\"solid-section\"><table>\n      <thead><tr><th>Sub Question</th><th>Answer</th><th>More Explanation</th><th>Example</th><th>Benefit</th></tr></thead>\n      <tbody>\n        <tr><td>What is AuthGuard?</td><td>A service that controls route access based on authentication</td><td>Implements CanActivate interface; returns boolean or Observable&lt;boolean&gt;</td><td>Redirect unauthenticated users to login page</td><td>Secure routes from unauthorized access</td></tr>\n        <tr><td>How do you implement AuthGuard?</td><td>Create service implementing CanActivate interface</td><td>Check authentication status in canActivate() method</td><td>AuthGuard checks JWT token validity before navigation</td><td>Control route access declaratively</td></tr>\n        <tr><td>What is ngOnChanges?</td><td>Lifecycle hook called when input properties change</td><td>Receives SimpleChanges object with previous/current values</td><td>Detect when @Input() value updates and respond</td><td>React to external property changes</td></tr>\n        <tr><td>What is ngOnInit?</td><td>Lifecycle hook called once after component initialization</td><td>Best place for initialization logic and data fetching</td><td>Load user profile data from API on component start</td><td>Initialize component safely after inputs are bound</td></tr>\n        <tr><td>What is ngDoCheck?</td><td>Lifecycle hook called during every change detection run</td><td>Implement custom change detection logic here</td><td>Detect value changes that Angular's default detection misses</td><td>Implement custom change detection strategies</td></tr>\n        <tr><td>What is ngAfterContentInit?</td><td>Lifecycle hook called after ng-content is projected</td><td>Initialize logic that depends on projected content</td><td>Access @ContentChild() after content is projected</td><td>Interact with content from parent component</td></tr>\n        <tr><td>What is ngAfterContentChecked?</td><td>Lifecycle hook called after every check of ng-content</td><td>Runs after ngAfterContentInit and after ngDoCheck</td><td>Perform additional checks after content initialization</td><td>Respond to content projection changes</td></tr>\n        <tr><td>What is ngAfterViewInit?</td><td>Lifecycle hook called after component view is initialized</td><td>Good place to access DOM elements and child components</td><td>Initialize jQuery plugins or access native DOM</td><td>Work with view elements safely</td></tr>\n        <tr><td>What is ngAfterViewChecked?</td><td>Lifecycle hook called after every check of component view</td><td>Runs after ngAfterViewInit and after change detection</td><td>Perform additional checks after view rendering</td><td>Update UI elements after view changes</td></tr>\n        <tr><td>What is ngOnDestroy?</td><td>Lifecycle hook called before component is destroyed</td><td>Essential for cleanup and resource release</td><td>Unsubscribe from observables, clear timers, detach event listeners</td><td>Prevent memory leaks and cleanup resources</td></tr>\n        <tr><td>What is NgRx?</td><td>Redux-inspired state management library for Angular</td><td>Manages application state predictably with immutable data</td><td>Use Store to hold user data, dispatch actions on login</td><td>Centralized state, easier debugging and testing</td></tr>\n        <tr><td>What are NgRx Actions?</td><td>Plain objects representing events or user interactions</td><td>Actions trigger reducers to update state</td><td>LoginAction, LogoutAction, FetchUserAction</td><td>Clear intent of what happened in the application</td></tr>\n        <tr><td>What are NgRx Reducers?</td><td>Pure functions that specify state changes in response to actions</td><td>Take current state and action, return new state</td><td>Reducer handles LoginAction by adding user to state</td><td>Predictable state transitions, easy to test</td></tr>\n        <tr><td>What are NgRx Effects?</td><td>Manage side effects like HTTP requests in NgRx</td><td>Listen for actions, perform async operations, dispatch new actions</td><td>Effect listens for FetchUserAction, calls API, dispatches LoadUserSuccess</td><td>Separate side effects from state management</td></tr>\n        <tr><td>What are NgRx Selectors?</td><td>Functions to extract specific pieces of state</td><td>Memoized selectors prevent unnecessary component updates</td><td>selectUserName selector extracts user.name from store</td><td>Efficient state access and component optimization</td></tr>\n        <tr><td>How do Angular and .NET communicate?</td><td>Angular uses HttpClient to send requests to .NET APIs</td><td>Communication over HTTP/HTTPS with JSON payloads</td><td>Angular calls GET /api/users/123 to .NET backend</td><td>Seamless frontend-backend integration</td></tr>\n        <tr><td>What is HttpClient?</td><td>Angular service for making HTTP requests</td><td>Provides methods for GET, POST, PUT, DELETE requests</td><td>this.http.get<User>(\'/api/users\')</td><td>Simplified HTTP communication with observables</td></tr>\n        <tr><td>How do you handle errors in HTTP calls?</td><td>Use error callbacks in subscribe() or catchError operator</td><td>.NET backend provides HTTP status codes; Angular handles errors</td><td>catchError() maps 404 to user-friendly message</td><td>Graceful error handling and user feedback</td></tr>\n        <tr><td>What is two-way data binding?</td><td>Automatic synchronization between model and view using ngModel</td><td>Changes in view update model; model changes update view</td><td>[(ngModel)]=\"user.name\" creates two-way binding</td><td>Reactive UI without manual DOM updates</td></tr>\n        <tr><td>What is Angular Routing?</td><td>Client-side routing allowing navigation without page reloads</td><td>RouterModule handles URL changes and component switching</td><td>Route to /dashboard or /settings without server request</td><td>Single Page Application (SPA) experience</td></tr>\n        <tr><td>What is Dependency Injection (DI)?</td><td>Components request dependencies rather than creating them</td><td>Injector provides instances through constructor, property, or method</td><td>UserService injected into component constructor</td><td>Loose coupling, easier testing with mock services</td></tr>\n      </tbody>\n    </table>\n  </section>\n</div>",
          },
          {
            id: "angular-dotnet-integration",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch1",
            chapterTitle: "Angular Concepts",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "html",
            title: "Angular & .NET Core Integration",
            description: "Connect Angular to a .NET Core API, handle CORS and secure API calls, and describe app structure.",
            codeType: "text",
            checklist: [
              "Use HttpClient to call a .NET Core endpoint",
              "Handle API errors cleanly in the component",
              "Configure CORS and secure communication",
              "Describe the Angular and .NET app folder structure",
              "Explain how environment settings support backend URLs",
            ],
            contentHtml: "<div class=\"solid-flashcards\">\n  <section class=\"solid-section\"><table>\n      <thead><tr><th>Sub Question</th><th>Answer</th><th>More Explanation</th><th>Example</th><th>Benefit</th></tr></thead>\n      <tbody>\n        <tr><td>How do Angular and .NET communicate?</td><td>Angular uses HttpClient to send requests to .NET APIs</td><td>Communication over HTTP/HTTPS with JSON payloads</td><td>Angular calls GET /api/users/123 to .NET backend</td><td>Seamless frontend-backend integration</td></tr>\n        <tr><td>What is HttpClient?</td><td>Angular service for making HTTP requests</td><td>Provides methods for GET, POST, PUT, DELETE requests</td><td>this.http.get<User>(\'/api/users\')</td><td>Simplified HTTP communication with observables</td></tr>\n        <tr><td>How do you handle errors in HTTP calls?</td><td>Use error callbacks in subscribe() or catchError operator</td><td>.NET backend provides HTTP status codes; Angular handles errors</td><td>catchError() maps 404 to user-friendly message</td><td>Graceful error handling and user feedback</td></tr>\n        <tr><td>What is CORS?</td><td>Cross-Origin Resource Sharing - policy for browser requests</td><td>Configured on .NET backend to specify allowed origins</td><td>.NET allows requests from http://localhost:4200</td><td>Secure cross-origin API calls</td></tr>\n        <tr><td>How do you secure Angular-to-.NET communication?</td><td>Use HTTPS, token-based auth (JWT), and permission validation</td><td>Backend validates tokens on every request</td><td>Store JWT in localStorage, send in Authorization header</td><td>Protect sensitive data and user actions</td></tr>\n        <tr><td>How do you organize an Angular + .NET app?</td><td>Separate frontend (Angular) and backend (.NET) codebases</td><td>Organize by features/modules, separate concerns</td><td>/angular-app for frontend, /dotnet-api for backend</td><td>Clear structure, easier maintenance and testing</td></tr>\n      </tbody>\n    </table>\n  </section>\n</div>",
          },
        ],
      },
      {
        id: "angular-interview-ch2",
        courseId: "angular-interview-practice",
        chapterIndex: 1,
        title: "Angular & .NET Core Integration",
        description: "Connect Angular to a .NET Core API with HttpClient.",
        steps: [
          {
            id: "angular-dotnet-integration",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch2",
            chapterTitle: "Angular & .NET Core Integration",
            chapterIndex: 1,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Angular & .NET Core Integration",
            description: "Connect Angular to a .NET Core API, handle CORS and secure API calls.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\n\n@Component({\n  selector: 'app-dotnet-integration',\n  template: `\n    <button (click)=\"loadData()\">Load policies</button>\n    <div *ngIf=\"policies\">{{ policies | json }}</div>\n  `\n})\nexport class DotnetIntegrationComponent {\n  policies: any;\n\n  constructor(private http: HttpClient) {}\n\n  loadData() {\n    this.http.get('/api/policies').subscribe({\n      next: (result) => (this.policies = result),\n      error: (error) => console.error('API error', error),\n    });\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch3",
        courseId: "angular-interview-practice",
        chapterIndex: 2,
        title: "AuthGuard & Routing",
        description: "Create a route guard to protect authenticated routes.",
        steps: [
          {
            id: "angular-auth-routing",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch2",
            chapterTitle: "AuthGuard & Routing",
            chapterIndex: 1,
            stepIndex: 0,
            stepType: "code-exam",
            title: "AuthGuard & Routing",
            description: "Create a route guard to protect authenticated routes and understand Angular routing flow.",
            codeType: "code",
            starterCode: "import { Injectable } from '@angular/core';\nimport { CanActivate, Router } from '@angular/router';\n\n@Injectable({\n  providedIn: 'root',\n})\nexport class AuthGuard implements CanActivate {\n  constructor(private router: Router) {}\n\n  canActivate(): boolean {\n    const authenticated = false;\n    if (!authenticated) {\n      this.router.navigate(['/login']);\n    }\n    return authenticated;\n  }\n}\n",
            page: {
              editor: {
                hints: [
                  { guide: "Create an injectable route guard that implements CanActivate", code: "import { Injectable } from '@angular/core';\nimport { CanActivate, Router } from '@angular/router';\n\n@Injectable({ providedIn: 'root' })\nexport class AuthGuard implements CanActivate {\n  constructor(private router: Router) {}" },
                  { guide: "Redirect unauthenticated users and return a boolean from canActivate", code: "  canActivate(): boolean {\n    const authenticated = false;\n    if (!authenticated) {\n      this.router.navigate(['/login']);\n    }\n    return authenticated;\n  }\n}" },
                  { guide: "Use the guard in your route definition", code: "const routes = [\n  { path: 'secure', component: SecureComponent, canActivate: [AuthGuard] },\n  { path: 'login', component: LoginComponent }\n];" }
                ]
              }
            }
          }
        ]
      },
      {
        id: "angular-interview-ch3",
        courseId: "angular-interview-practice",
        chapterIndex: 2,
        title: "Counter Component",
        description: "Build a counter component with increment, decrement, reset controls.",
        steps: [
          {
            id: "angular-counter",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch3",
            chapterTitle: "Counter Component",
            chapterIndex: 3,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Counter Component",
            description: "Build a counter component with increment, decrement, reset controls and step/min/max bounds.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-counter',\n  template: `\n    <div>\n      <h2>Count: {{ count }}</h2>\n      <p>Step: {{ step }} | Min: {{ min }} | Max: {{ max }}</p>\n\n      <button (click)=\"decrement()\">-</button>\n      <button (click)=\"increment()\">+</button>\n      <button (click)=\"reset()\">Reset</button>\n    </div>\n  `\n})\nexport class CounterComponent {\n  count = 0;\n  step = 1;\n  min = 0;\n  max = 10;\n\n  increment() {\n    const next = this.count + this.step;\n    this.count = next <= this.max ? next : this.max;\n  }\n\n  decrement() {\n    const next = this.count - this.step;\n    this.count = next >= this.min ? next : this.min;\n  }\n\n  reset() {\n    this.count = 0;\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch4",
        courseId: "angular-interview-practice",
        chapterIndex: 3,
        title: "Custom Pipe",
        description: "Create a reusable pipe that transforms text in a template.",
        steps: [
          {
            id: "angular-custom-pipe",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch4",
            chapterTitle: "Custom Pipe",
            chapterIndex: 4,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Custom Pipe",
            description: "Create a reusable pipe that transforms text, then apply it in a template.",
            codeType: "code",
            starterCode: "import { Component, Pipe, PipeTransform } from '@angular/core';\n\n@Pipe({\n  name: 'reverseText'\n})\nexport class ReverseTextPipe implements PipeTransform {\n  transform(value: string): string {\n    return value.split('').reverse().join('');\n  }\n}\n\n@Component({\n  selector: 'app-custom-pipe',\n  template: `\n    <div>\n      <p>Original: {{ text }}</p>\n      <p>Transformed: {{ text | reverseText }}</p>\n    </div>\n  `\n})\nexport class CustomPipeComponent {\n  text = 'Angular';\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch5",
        courseId: "angular-interview-practice",
        chapterIndex: 4,
        title: "Fetch Data in ngOnInit",
        description: "Create a component that loads data from an API endpoint.",
        steps: [
          {
            id: "angular-fetch-data",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch5",
            chapterTitle: "Fetch Data in ngOnInit",
            chapterIndex: 5,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Fetch Data in ngOnInit",
            description: "Create a component that loads data from an API endpoint in ngOnInit.",
            codeType: "code",
            starterCode: "import { Component, OnInit } from '@angular/core';\n\n@Component({\n  selector: 'app-fetch-data',\n  template: `\n    <div>\n      <h2>Items</h2>\n      <ul>\n        <li *ngFor=\"let item of items\">{{ item }}</li>\n      </ul>\n    </div>\n  `\n})\nexport class FetchDataComponent implements OnInit {\n  items: string[] = [];\n\n  async ngOnInit() {\n    const response = await fetch('https://api.example.com/items');\n    const data = await response.json();\n    this.items = data.items || [];\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch6",
        courseId: "angular-interview-practice",
        chapterIndex: 5,
        title: "Form Input Binding",
        description: "Build an input form that updates component state in real time.",
        steps: [
          {
            id: "angular-form-input",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch6",
            chapterTitle: "Form Input Binding",
            chapterIndex: 6,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Form Input Binding",
            description: "Build an input form that updates component state and displays a greeting message.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-form-input',\n  template: `\n    <div>\n      <label>Enter your name:\n        <input type=\"text\" [value]=\"name\" (input)=\"updateName($event)\" />\n      </label>\n      <p>Hello, {{ name || 'Guest' }}!</p>\n    </div>\n  `\n})\nexport class FormInputComponent {\n  name = '';\n\n  updateName(event: Event) {\n    const input = event.target as HTMLInputElement;\n    this.name = input.value;\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch7",
        courseId: "angular-interview-practice",
        chapterIndex: 6,
        title: "Forms, Directives & ngLocale",
        description: "Build a form with two-way binding and custom directive.",
        steps: [
          {
            id: "angular-forms-directives",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch7",
            chapterTitle: "Forms, Directives & ngLocale",
            chapterIndex: 7,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Forms, Directives & ngLocale",
            description: "Build a form with two-way binding, custom directive, and locale-aware formatting.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-form-directives',\n  template: `\n    <form>\n      <label>Policy name\n        <input [(ngModel)]=\"policyName\" name=\"policyName\" />\n      </label>\n      <p appHighlight>Current policy: {{ policyName }}</p>\n    </form>\n  `\n})\nexport class FormDirectivesComponent {\n  policyName = '';\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch8",
        courseId: "angular-interview-practice",
        chapterIndex: 7,
        title: "Lifecycle Hooks",
        description: "Implement ngOnInit and ngOnDestroy for initialization and cleanup.",
        steps: [
          {
            id: "angular-lifecycle-hooks",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch8",
            chapterTitle: "Lifecycle Hooks",
            chapterIndex: 8,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Lifecycle Hooks",
            description: "Implement ngOnInit and ngOnDestroy to initialize data and clean up a timer.",
            codeType: "code",
            starterCode: "import { Component, OnInit, OnDestroy } from '@angular/core';\n\n@Component({\n  selector: 'app-lifecycle-hooks',\n  template: `\n    <div>\n      <h2>Lifecycle Example</h2>\n      <p>{{ message }}</p>\n    </div>\n  `\n})\nexport class LifecycleHooksComponent implements OnInit, OnDestroy {\n  message = '';\n  timerId: any;\n\n  ngOnInit() {\n    this.message = 'Initialized';\n    this.timerId = setInterval(() => {\n      this.message = `Tick: ${new Date().toLocaleTimeString()}`;\n    }, 1000);\n  }\n\n  ngOnDestroy() {\n    clearInterval(this.timerId);\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch9",
        courseId: "angular-interview-practice",
        chapterIndex: 8,
        title: "Manage List",
        description: "Build a list manager that adds and removes items.",
        steps: [
          {
            id: "angular-manage-list",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch9",
            chapterTitle: "Manage List",
            chapterIndex: 9,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Manage List",
            description: "Build a list manager that adds and removes items using Angular binding and ngFor.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-manage-list',\n  template: `\n    <div>\n      <label>New item:\n        <input type=\"text\" [(ngModel)]=\"newItem\" />\n      </label>\n      <button (click)=\"addItem()\">Add</button>\n      <ul>\n        <li *ngFor=\"let item of items; let i = index\">\n          {{ item }} <button (click)=\"removeItem(i)\">Remove</button>\n        </li>\n      </ul>\n    </div>\n  `\n})\nexport class ManageListComponent {\n  items: string[] = [];\n  newItem = '';\n\n  addItem() {\n    if (this.newItem.trim()) {\n      this.items.push(this.newItem.trim());\n      this.newItem = '';\n    }\n  }\n\n  removeItem(index: number) {\n    this.items.splice(index, 1);\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch10",
        courseId: "angular-interview-practice",
        chapterIndex: 9,
        title: "NgRx, Services & Dependency Injection",
        description: "Use Angular services and NgRx patterns for state management.",
        steps: [
          {
            id: "angular-ngrx-services",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch10",
            chapterTitle: "NgRx, Services & Dependency Injection",
            chapterIndex: 10,
            stepIndex: 0,
            stepType: "code-exam",
            title: "NgRx, Services & Dependency Injection",
            description: "Use Angular services and NgRx patterns to manage state and inject dependencies.",
            codeType: "code",
            starterCode: "import { Injectable } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\n\n@Injectable({ providedIn: 'root' })\nexport class DataService {\n  constructor(private http: HttpClient) {}\n\n  loadPolicies() {\n    return this.http.get('/api/policies');\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch11",
        courseId: "angular-interview-practice",
        chapterIndex: 10,
        title: "Route Params",
        description: "Read route parameters from ActivatedRoute and display dynamic data.",
        steps: [
          {
            id: "angular-routing-params",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch11",
            chapterTitle: "Route Params",
            chapterIndex: 11,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Route Params",
            description: "Read route parameters from ActivatedRoute and display dynamic data.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\nimport { ActivatedRoute } from '@angular/router';\n\n@Component({\n  selector: 'app-route-params',\n  template: `\n    <div>\n      <h2>Route Parameter</h2>\n      <p>ID: {{ id }}</p>\n    </div>\n  `\n})\nexport class RouteParamsComponent {\n  id: string | null = null;\n\n  constructor(private route: ActivatedRoute) {\n    this.id = this.route.snapshot.paramMap.get('id');\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch12",
        courseId: "angular-interview-practice",
        chapterIndex: 11,
        title: "Service Dependency Injection",
        description: "Create a data service and inject it into a component.",
        steps: [
          {
            id: "angular-service-dependency",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch12",
            chapterTitle: "Service Dependency Injection",
            chapterIndex: 12,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Service Dependency Injection",
            description: "Create a data service and inject it into a component to load and display items.",
            codeType: "code",
            starterCode: "import { Component, Injectable } from '@angular/core';\n\n@Injectable({\n  providedIn: 'root'\n})\nexport class DataService {\n  getItems(): string[] {\n    return ['Item 1', 'Item 2', 'Item 3'];\n  }\n}\n\n@Component({\n  selector: 'app-service-dependency',\n  template: `\n    <div>\n      <h2>Items</h2>\n      <ul>\n        <li *ngFor=\"let item of items\">{{ item }}</li>\n      </ul>\n    </div>\n  `\n})\nexport class ServiceDependencyComponent {\n  items: string[] = [];\n\n  constructor(private dataService: DataService) {\n    this.items = this.dataService.getItems();\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch13",
        courseId: "angular-interview-practice",
        chapterIndex: 12,
        title: "Tab Navigation",
        description: "Build a tabbed interface that switches content.",
        steps: [
          {
            id: "angular-tab-navigation",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch13",
            chapterTitle: "Tab Navigation",
            chapterIndex: 13,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Tab Navigation",
            description: "Build a simple tabbed interface that switches content using event binding.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-tab-navigation',\n  template: `\n    <div>\n      <button (click)=\"selectTab('home')\">Home</button>\n      <button (click)=\"selectTab('profile')\">Profile</button>\n      <button (click)=\"selectTab('settings')\">Settings</button>\n      <div *ngIf=\"selectedTab === 'home'\">Home content</div>\n      <div *ngIf=\"selectedTab === 'profile'\">Profile content</div>\n      <div *ngIf=\"selectedTab === 'settings'\">Settings content</div>\n    </div>\n  `\n})\nexport class TabNavigationComponent {\n  selectedTab = 'home';\n\n  selectTab(tab: string) {\n    this.selectedTab = tab;\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      },
      {
        id: "angular-interview-ch14",
        courseId: "angular-interview-practice",
        chapterIndex: 13,
        title: "Toggle Visibility",
        description: "Show or hide content using Angular directives.",
        steps: [
          {
            id: "angular-toggle-visibility",
            courseId: "angular-interview-practice",
            chapterId: "angular-interview-ch14",
            chapterTitle: "Toggle Visibility",
            chapterIndex: 14,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Toggle Visibility",
            description: "Create a component that shows or hides content using Angular structural directives.",
            codeType: "code",
            starterCode: "import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-toggle-visibility',\n  template: `\n    <div>\n      <button (click)=\"toggle()\">{{ visible ? 'Hide' : 'Show' }}</button>\n      <p *ngIf=\"visible\">The message is visible.</p>\n    </div>\n  `\n})\nexport class ToggleVisibilityComponent {\n  visible = true;\n\n  toggle() {\n    this.visible = !this.visible;\n  }\n}\n",
            page: { editor: { hints: [] } }
          }
        ]
      }
    ],
  },
  {
    id: "csharp-interview-practice",
    title: "C# Interview Practice",
    description: "C# concept and coding interview practice (code exams).",
    color: "#68217A",
    icon: "🔷",
    courseIndex: 4,
    chapters: [
      {
        id: "csharp-interview-ch1",
        courseId: "csharp-interview-practice",
        chapterIndex: 0,
        title: "C# Concepts & Code Exams",
        description: "Common C# interview tasks implemented as code exams.",
        steps: [
          {
            id: "csharp-api-json-deserialization",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "code-exam",
            title: "API Call and JSON Deserialization",
            description: "Write an async method that calls an API and deserializes the JSON response into a generic object.",
            codeType: "code",
            checklist: [
              "Create an async method that accepts a URL",
              "Use HttpClient to perform a GET request",
              "Read the response content as a string",
              "Deserialize JSON into type T",
              "Throw an exception when the request fails",
            ],
            starterCode: "// 1: Create an async generic method accepting apiUrl\n// 2: Use HttpClient to call the endpoint\n// 3: Read the response content\n// 4: Deserialize JSON into type T\n// 5: Throw when the call fails",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the async generic method", code: "public async Task<T> GetData<T>(string apiUrl)\n{" },
                  { guide: "// guide hints: Send the HTTP GET request", code: "    HttpResponseMessage response = await _httpClient.GetAsync(apiUrl);" },
                  { guide: "// guide hints: Read the response body as a string", code: "    string json = await response.Content.ReadAsStringAsync();" },
                  { guide: "// guide hints: Deserialize the JSON into T", code: "    T data = JsonConvert.DeserializeObject<T>(json);" },
                  { guide: "// guide hints: Throw if the response is not successful", code: "    if (!response.IsSuccessStatusCode)\n    {\n        throw new Exception(\"Failed\");\n    }" },
                  { guide: "// guide hints: Return the deserialized object", code: "    return data;\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-bouncing-ball",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "code-exam",
            title: "Bounce Count and Distance",
            description: "Calculate the total distance traveled by a bouncing ball and the number of bounces until it stops.",
            codeType: "code",
            starterCode: "",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Import: using System; and Collections", code: "using System;\nusing System.Collections.Generic;" },
                  { guide: "// guide hints: Create a method that accepts initial height and bounce factor", code: "public static (int bounces, double distance) CalculateBounce(double height, double factor = 0.66, double threshold = 0.01)\n{" },
                  { guide: "// guide hints: Initialize counters for bounces and distance", code: "    int bounces = 0;\n    double distance = 0;\n    double current = height;" },
                  { guide: "// guide hints: Add initial fall distance and loop while current > threshold", code: "    if (current <= 0) return (0, 0);\n    distance += current;\n    while (current > threshold)\n    {" },
                  { guide: "// guide hints: Compute next bounce height, add up down+up distances, increment bounces", code: "        current = current * factor;\n        distance += 2 * current;\n        bounces++;\n    }" },
                  { guide: "// guide hints: Return bounces and total distance", code: "    return (bounces, distance);\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-bubble-sort",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 2,
            stepType: "code-exam",
            title: "Bubble Sort Implementation",
            description: "Sort an integer array in ascending order using bubble sort.",
            codeType: "code",
            starterCode: "// 1: Create outer loop (i) to iterate through the array\n// 2: Create inner loop (j) to compare adjacent elements\n// 3: If items[j] > items[j+1], swap using a temp variable\n// 4: Continue passes until sorted\n// 5: Return the sorted array",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the bubble sort method signature", code: "public static int[] BubbleSort(int[] items)\n{" },
                  { guide: "// guide hints: Outer loop for passes", code: "    int n = items.Length;\n    for (int i = 0; i < n - 1; i++)\n    {" },
                  { guide: "// guide hints: Inner loop to compare adjacent elements", code: "        for (int j = 0; j < n - i - 1; j++)\n        {" },
                  { guide: "// guide hints: Swap when items[j] > items[j+1]", code: "            if (items[j] > items[j + 1])\n            {\n                int temp = items[j];\n                items[j] = items[j + 1];\n                items[j + 1] = temp;\n            }" },
                  { guide: "// guide hints: Close loops and return sorted array", code: "        }\n    }\n    return items;\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-character-count",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 3,
            stepType: "code-exam",
            title: "Character Count in a String",
            description: "Count the occurrence of each character in a string, ignoring spaces.",
            codeType: "code",
            starterCode: "// 1: Accept a string input\n// 2: Use a Dictionary<char, int> to count characters\n// 3: Ignore spaces while counting\n// 4: Return the character counts",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the character count method", code: "public static Dictionary<char, int> CountCharacters(string input)\n{" },
                  { guide: "// guide hints: Create the dictionary to store counts", code: "    Dictionary<char, int> charCount = new Dictionary<char, int>();" },
                  { guide: "// guide hints: Iterate through each character and skip spaces", code: "    foreach (char c in input)\n    {\n        if (c != ' ')\n        {\n            if (charCount.ContainsKey(c))\n            {\n                charCount[c]++;\n            }\n            else\n            {\n                charCount[c] = 1;\n            }\n        }\n    }" },
                  { guide: "// guide hints: Return the character count dictionary", code: "    return charCount;\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-dependency-injection",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 4,
            stepType: "code-exam",
            title: "Dependency Injection Example",
            description: "Implement a simple service and client class to demonstrate constructor dependency injection.",
            codeType: "code",
            starterCode: "// 1: Create a Service class with PerformOperation\n// 2: Create a Client class that receives Service through constructor injection\n// 3: Store the service in a readonly field\n// 4: Call the service method from the client",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the service class", code: "public class Service\n{\n    public void PerformOperation()\n    {\n        // Operation implementation\n    }\n}" },
                  { guide: "// guide hints: Define the client class with injected service", code: "public class Client\n{\n    private readonly Service _service;\n\n    public Client(Service service)\n    {\n        _service = service;\n    }" },
                  { guide: "// guide hints: Use the injected service in a method", code: "    public void UseService()\n    {\n        _service.PerformOperation();\n    }\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-exception-handling",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 5,
            stepType: "code-exam",
            title: "C# Exception Handling",
            description: "Implement a method that divides two integers and demonstrates correct exception handling with specific catch blocks.",
            codeType: "code",
            starterCode: "// 1: Create a method that accepts dividend and divisor\n// 2: Wrap the division in try/catch blocks\n// 3: Catch DivideByZeroException first\n// 4: Catch Exception afterward\n// 5: Return a success or error message",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the method signature", code: "public static string DivideWithHandling(int dividend, int divisor)\n{" },
                  { guide: "// guide hints: Start a try block for dividing the values", code: "    try\n    {\n        int result = dividend / divisor;" },
                  { guide: "// guide hints: Return the successful result string", code: "        return $\"Result: {result}\";\n    }" },
                  { guide: "// guide hints: Catch DivideByZeroException explicitly", code: "    catch (DivideByZeroException ex)\n    {\n        return \"Error: Cannot divide by zero\";\n    }" },
                  { guide: "// guide hints: Catch any other exceptions afterward", code: "    catch (Exception ex)\n    {\n        return $\"Error: {ex.Message}\";\n    }" },
                  { guide: "// guide hints: Close the method", code: "}" },
                ],
              },
            },
          },
          {
            id: "csharp-first-duplicate",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 6,
            stepType: "code-exam",
            title: "Find First Duplicate",
            description: "Create a method that returns the first duplicate value found in an integer array.",
            codeType: "code",
            starterCode: "// 1: Accept an integer array\n// 2: Use a HashSet<int> for seen values\n// 3: Return the first value that already exists in the set\n// 4: Return -1 when no duplicate exists",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the duplicate-finding method", code: "public static int FindFirstDuplicate(int[] numbers)\n{" },
                  { guide: "// guide hints: Create a HashSet to track seen values", code: "    HashSet<int> uniqueNumbers = new HashSet<int>();" },
                  { guide: "// guide hints: Iterate through each number", code: "    foreach (var num in numbers)\n    {" },
                  { guide: "// guide hints: Return the number if it already exists", code: "        if (!uniqueNumbers.Add(num))\n        {\n            return num;\n        }" },
                  { guide: "// guide hints: Return -1 after the loop if nothing duplicated", code: "    }\n    return -1;\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-linq-filter-array",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 7,
            stepType: "code-exam",
            title: "LINQ Array Filtering",
            description: "Use LINQ to filter an integer array and return values between two bounds.",
            codeType: "code",
            starterCode: "// 1: Accept an integer array input\n// 2: Use LINQ Where with a lambda predicate\n// 3: Filter numbers within the bounds\n// 4: Return the filtered result",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the LINQ filter method", code: "public static IEnumerable<int> FilterNumbers(int[] numbers, int minValue, int maxValue)\n{" },
                  { guide: "// guide hints: Use Where to filter values", code: "    var filteredNumbers = numbers.Where(n => n > minValue && n < maxValue);" },
                  { guide: "// guide hints: Return the filtered collection", code: "    return filteredNumbers;\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-multithreading",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 8,
            stepType: "code-exam",
            title: "Multithreading Example",
            description: "Start a background thread, run a simple action, and wait for it to complete.",
            codeType: "code",
            starterCode: "// 1: Create a thread with a lambda or ThreadStart delegate\n// 2: Start the thread\n// 3: Join the thread to wait for completion\n// 4: Return after the work is done",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the multithreading method", code: "public static void MultithreadingExample()\n{" },
                  { guide: "// guide hints: Create a new thread with a lambda", code: "    Thread thread = new Thread(() =>\n    {\n        // Work to do in the background\n    });" },
                  { guide: "// guide hints: Start the thread and wait for it to finish", code: "    thread.Start();\n    thread.Join();" },
                  { guide: "// guide hints: Close the method", code: "}" },
                ],
              },
            },
          },
          {
            id: "csharp-palindrome-check",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 9,
            stepType: "code-exam",
            title: "Palindrome Check",
            description: "Return true when the input string reads the same forward and backward.",
            codeType: "code",
            starterCode: "// 1: Accept a string input\n// 2: Reverse the string or compare to its reverse\n// 3: Return true when the string is a palindrome\n// 4: Return false otherwise",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the palindrome check method", code: "public static bool IsPalindrome(string input)\n{" },
                  { guide: "// guide hints: Compare input with reversed sequence", code: "    return input.SequenceEqual(input.Reverse());\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-reverse-string",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 10,
            stepType: "code-exam",
            title: "Reverse a String",
            description: "Return a reversed copy of the input string.",
            codeType: "code",
            starterCode: "// 1: Accept a string input parameter\n// 2: Convert input to a char array\n// 3: Reverse the char array\n// 4: Return a new string based on the reversed array",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the reverse string method", code: "public static string ReverseString(string input)\n{" },
                  { guide: "// guide hints: Convert the input to a char array", code: "    char[] charArray = input.ToCharArray();" },
                  { guide: "// guide hints: Reverse the char array", code: "    Array.Reverse(charArray);" },
                  { guide: "// guide hints: Create a new string and return it", code: "    return new string(charArray);\n}" },
                ],
              },
            },
          },
          {
            id: "csharp-singleton-pattern",
            courseId: "csharp-interview-practice",
            chapterId: "csharp-interview-ch1",
            chapterTitle: "C# Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 11,
            stepType: "code-exam",
            title: "Singleton Design Pattern",
            description: "Create a thread-safe singleton class with lazy initialization.",
            codeType: "code",
            starterCode: "// 1: Create a sealed Singleton class\n// 2: Use a private static instance field and lock object\n// 3: Make the constructor private\n// 4: Return a singleton instance in the Instance property",
            page: {
              editor: {
                hints: [
                  { guide: "// guide hints: Define the sealed singleton class", code: "public sealed class Singleton\n{" },
                  { guide: "// guide hints: Add a private static instance and lock object", code: "    private static Singleton instance;\n    private static readonly object lockObject = new object();" },
                  { guide: "// guide hints: Make the constructor private", code: "    private Singleton()\n    {\n    }" },
                  { guide: "// guide hints: Implement the lazy Instance property", code: "    public static Singleton Instance\n    {\n        get\n        {\n            lock (lockObject)\n            {\n                return instance ?? (instance = new Singleton());\n            }\n        }\n    }\n}" },
                ],
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "sql-interview-practice",
    title: "SQL Interview Practice",
    description: "SQL concept and coding interview practice (code exams).",
    color: "#d2691e",
    icon: "🧾",
    courseIndex: 5,
    chapters: [
      {
        id: "sql-interview-ch1",
        courseId: "sql-interview-practice",
        chapterIndex: 0,
        title: "SQL Concepts & Code Exams",
        description: "Common SQL interview tasks implemented as code exams.",
        steps: [
          {
            id: "sql-duplicate-records",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "code-exam",
            title: "Find Duplicate Records",
            description: "Write a SQL query to identify duplicate rows in a table based on one or more columns.",
            codeType: "sql",
            starterCode: "-- 1: SELECT the columns to check for duplicates\n-- 2: GROUP BY those columns\n-- 3: HAVING COUNT(*) > 1\n-- 4: Return the duplicate values",
            page: {
              editor: {
                hints: [
                  { "guide": "-- hint1: SELECT the columns to check for duplicates", "code": "SELECT column1, column2" },
                  { "guide": "-- hint2: GROUP BY those columns", "code": "GROUP BY column1, column2" },
                  { "guide": "-- hint3: HAVING COUNT(*) > 1", "code": "HAVING COUNT(*) > 1" },
                  { "guide": "-- hint4: Return the duplicate values", "code": "SELECT column1, column2, COUNT(*)\nFROM YourTable\nGROUP BY column1, column2\nHAVING COUNT(*) > 1;" }
                ]
              }
            }
          },
          {
            id: "react-crud-sql-sample",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "code-exam",
            title: "Products table SQL (CRUD)",
            description: "Practice basic CRUD SQL on a products table.",
            codeType: "sql",
            starterCode: "-- Create table\nCREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, sku TEXT UNIQUE, price REAL, qty INTEGER);\n\n-- Insert samples\nINSERT INTO products (name, sku, price, qty) VALUES ('Acme Widget','AW-100',12.99,100);\nINSERT INTO products (name, sku, price, qty) VALUES ('Blue Gadget','BG-200',9.5,50);\nINSERT INTO products (name, sku, price, qty) VALUES ('Clear Cable','CC-300',4.25,250);\n\n-- Read\nSELECT * FROM products ORDER BY name;\n\n-- Update (example)\nUPDATE products SET qty = qty - 1 WHERE sku = 'AW-100';\n\n-- Delete (example)\nDELETE FROM products WHERE sku = 'CC-300';",
            page: { editor: { hints: [] } }
          },
          {
            id: "sql-first-name-from-fullname",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 2,
            stepType: "code-exam",
            title: "Extract First Name",
            description: "Write a SQL query to fetch only the first name from the FullName column.",
            codeType: "sql",
            starterCode: "-- 1: Select the first name from FullName\n-- 2: Use LEFT and CHARINDEX\n-- 3: Return FirstName",
            page: { editor: { hints: [ { "guide": "-- hint1: Select the first name from FullName", "code": "SELECT LEFT(FullName, CHARINDEX(' ', FullName + ' ') - 1) AS FirstName" }, { "guide": "-- hint2: Read from EmployeeDetails table", "code": "FROM EmployeeDetails;" } ] } }
          },
          {
            id: "sql-inner-join-employee-salary",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 3,
            stepType: "code-exam",
            title: "Employees with Salary Records",
            description: "Return employee records only when they have a salary record.",
            codeType: "sql",
            starterCode: "-- 1: Select employee fields from EmployeeDetails\n-- 2: Inner join EmployeeSalary on EmpId\n-- 3: Return matched employee records",
            page: { editor: { hints: [ { "guide": "-- hint1: Select employee columns from EmployeeDetails", "code": "SELECT ED.*" }, { "guide": "-- hint2: Use INNER JOIN with EmployeeSalary", "code": "FROM EmployeeDetails ED\nINNER JOIN EmployeeSalary ES ON ED.EmpId = ES.EmpId;" } ] } }
          },
          {
            id: "sql-left-join-employee-salary",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 4,
            stepType: "code-exam",
            title: "Employee Details with Optional Salary",
            description: "Return employee names and salary including employees without salary records.",
            codeType: "sql",
            starterCode: "-- 1: Select employee name and salary\n-- 2: Use LEFT JOIN on EmpId\n-- 3: Return all employee records",
            page: { editor: { hints: [ { "guide": "-- hint1: Select employee name and salary", "code": "SELECT ED.FullName, ES.Salary" }, { "guide": "-- hint2: Use LEFT JOIN so employees without salary are included", "code": "FROM EmployeeDetails ED\nLEFT JOIN EmployeeSalary ES ON ED.EmpId = ES.EmpId;" } ] } }
          },
          {
            id: "sql-managers",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 5,
            stepType: "code-exam",
            title: "Employees Who Are Managers",
            description: "Fetch all employees who are also managers.",
            codeType: "sql",
            starterCode: "-- 1: Select all columns from EmployeeDetails\n-- 2: Filter employees whose EmpId appears as a ManagerId\n-- 3: Return manager employee rows",
            page: { editor: { hints: [ { "guide": "-- hint1: Select all employee columns", "code": "SELECT *" }, { "guide": "-- hint2: Use a subquery to find manager IDs", "code": "FROM EmployeeDetails\nWHERE EmpId IN (SELECT ManagerId FROM EmployeeDetails WHERE ManagerId IS NOT NULL);" } ] } }
          },
          {
            id: "sql-min-max-salary",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 6,
            stepType: "code-exam",
            title: "Min and Max Salary in One Query",
            description: "Display the employee with minimum and maximum salary in a single query.",
            codeType: "sql",
            starterCode: "-- 1: Use min and max salary in a single query\n-- 2: Select employee name, position, salary\n-- 3: Combine the two results",
            page: { editor: { hints: [ { "guide": "-- hint1: Select employee information for minimum salary", "code": "SELECT Name, Position, Salary\nFROM employee\nWHERE Salary = (SELECT MIN(Salary) FROM employee)" }, { "guide": "-- hint2: Select employee information for maximum salary", "code": "UNION\nSELECT Name, Position, Salary\nFROM employee\nWHERE Salary = (SELECT MAX(Salary) FROM employee);" } ] } }
          },
          {
            id: "sql-project-count",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 7,
            stepType: "code-exam",
            title: "Count Employees in Project P1",
            description: "Return the number of employees working in project 'P1'.",
            codeType: "sql",
            starterCode: "-- 1: Use SELECT COUNT(*) to count rows\n-- 2: FROM EmployeeDetails\n-- 3: WHERE ProjectName = 'P1'\n-- 4: Add AS EmployeeCount to label result",
            page: { editor: { hints: [ { "guide": "-- hint1: Use SELECT COUNT(*) to count rows", "code": "SELECT COUNT(*)" }, { "guide": "-- hint2: FROM EmployeeDetails", "code": "FROM EmployeeDetails" }, { "guide": "-- hint3: WHERE ProjectName = 'P1'", "code": "WHERE ProjectName = 'P1'" }, { "guide": "-- hint4: Add AS EmployeeCount to label result", "code": "SELECT COUNT(*) AS EmployeeCount\nFROM EmployeeDetails\nWHERE ProjectName = 'P1';" } ] } }
          },
          {
            id: "sql-project-employee-count-desc",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 8,
            stepType: "code-exam",
            title: "Project-wise Employee Count",
            description: "Fetch project-wise employee counts sorted by count descending.",
            codeType: "sql",
            starterCode: "-- 1: Count rows per project in EmployeeSalary\n-- 2: Group by project\n-- 3: Order results by descending count",
            page: { editor: { hints: [ { "guide": "-- hint1: Select project and count of EmpId", "code": "SELECT Project, COUNT(EmpId) AS EmployeeCount" }, { "guide": "-- hint2: Read from EmployeeSalary table", "code": "FROM EmployeeSalary" }, { "guide": "-- hint3: Group by project name", "code": "GROUP BY Project" }, { "guide": "-- hint4: Order counts in descending order", "code": "ORDER BY EmployeeCount DESC;" } ] } }
          },
          {
            id: "sql-remove-duplicates",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 9,
            stepType: "code-exam",
            title: "Remove Duplicate Records",
            description: "Remove duplicate rows from a table without using a temporary table.",
            codeType: "sql",
            starterCode: "-- 1: Use a CTE with ROW_NUMBER() to identify duplicates\n-- 2: Delete rows with row number > 1\n-- 3: Keep one unique row per group",
            page: { editor: { hints: [ { "guide": "-- hint1: Define a CTE to rank duplicate rows", "code": "WITH RankedData AS (\n    SELECT EmpId, FullName, ManagerId, DateOfJoining,\n           ROW_NUMBER() OVER (PARTITION BY FullName, ManagerId, DateOfJoining ORDER BY EmpId) AS RowNo\n    FROM EmployeeDetails\n)" }, { "guide": "-- hint2: Delete rows where row number is greater than 1", "code": "DELETE FROM RankedData WHERE RowNo > 1;" } ] } }
          },
          {
            id: "sql-salary-range",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 10,
            stepType: "code-exam",
            title: "Salary Range Query",
            description: "Fetch employee names whose salary is between 5000 and 10000 inclusive.",
            codeType: "sql",
            starterCode: "-- 1: Join EmployeeDetails with EmployeeSalary\n-- 2: Filter salary between 5000 and 10000\n-- 3: Select employee names",
            page: { editor: { hints: [ { "guide": "-- hint1: Select employee full names from EmployeeDetails", "code": "SELECT ED.FullName" }, { "guide": "-- hint2: Join EmployeeSalary with EmployeeDetails by EmpId", "code": "FROM EmployeeDetails ED\nJOIN EmployeeSalary ES ON ED.EmpId = ES.EmpId" }, { "guide": "-- hint3: Filter salary between 5000 and 10000", "code": "WHERE ES.Salary >= 5000 AND ES.Salary <= 10000" }, { "guide": "-- hint4: Return employee names for matching records", "code": "SELECT ED.FullName\nFROM EmployeeDetails ED\nJOIN EmployeeSalary ES ON ED.EmpId = ES.EmpId\nWHERE ES.Salary >= 5000 AND ES.Salary <= 10000;" } ] } }
          },
          {
            id: "sql-second-largest-salary",
            courseId: "sql-interview-practice",
            chapterId: "sql-interview-ch1",
            chapterTitle: "SQL Concepts & Code Exams",
            chapterIndex: 0,
            stepIndex: 11,
            stepType: "code-exam",
            title: "Second Largest Salary",
            description: "Fetch the second highest salary using ranking or OFFSET.",
            codeType: "sql",
            starterCode: "-- 1: Use ranking or OFFSET to locate the second largest salary\n-- 2: Return the salary value or row\n-- 3: Keep the query in a single statement",
            page: { editor: { hints: [ { "guide": "-- hint1: Rank salaries in descending order", "code": "WITH RankedSalaries AS (\n    SELECT EmployeeID, Salary, RANK() OVER (ORDER BY Salary DESC) AS SalaryRank\n    FROM Employees\n)" }, { "guide": "-- hint2: Select the row with rank 2", "code": "SELECT EmployeeID, Salary\nFROM RankedSalaries\nWHERE SalaryRank = 2;" } ] } }
          }
        ]
      }
    ]
  },
];
