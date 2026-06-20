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
    title: "React CRUD",
    description: "Wizard-style course: overview lessons, code exams, and quizzes for CRUD fundamentals.",
    color: "#61dafb",
    icon: "⚛️",
    courseIndex: 0,
    chapters: [
      {
        id: "react-crud-ch1",
        courseId: REACT_CRUD_COURSE_ID,
        chapterIndex: 0,
        title: "Overview",
        description: "What CRUD means in React apps.",
        steps: [
          {
            id: "react-crud-ch1-lesson",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch1",
            chapterTitle: "Overview",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "html",
            title: "Overview",
            description: "Understand Create, Read, Update, Delete in UI terms.",
            contentHtml: `<div class="course-lesson">
<h2>CRUD in React</h2>
<p><strong>Create</strong> adds a record. <strong>Read</strong> lists or finds records. <strong>Update</strong> edits an existing record. <strong>Delete</strong> removes it.</p>
<ul>
  <li>State holds the current list of items.</li>
  <li>Forms capture new or edited data.</li>
  <li>Buttons trigger add, save, and remove handlers.</li>
</ul>
<p>In this course you will build each piece step by step.</p>
</div>`,
          },
          {
            id: "react-crud-ch1-exam",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch1",
            chapterTitle: "Overview",
            chapterIndex: 0,
            stepIndex: 1,
            stepType: "code-exam",
            title: "Overview exam",
            description: "Write a tiny component that renders a list from props.",
            codeType: "code",
            checklist: ["Defines a function component", "Renders a ul list", "Maps items to li elements"],
            starterCode: "",
            verificationKeywords: [["function", "const"], ["ul", "<ul"], ["map", ".map"]],
            detailedInstructions: [
              "Create a component named ItemList",
              "Accept a prop items (array of strings)",
              "Return a ul with each item as li",
            ],
          },
          {
            id: "react-crud-ch1-quiz",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch1",
            chapterTitle: "Overview",
            chapterIndex: 0,
            stepIndex: 2,
            stepType: "quiz",
            title: "Overview quiz",
            description: "Quick check on CRUD vocabulary.",
            quizQuestions: [
              {
                id: "q1",
                prompt: "Which letter in CRUD means removing an item?",
                options: [
                  { id: "a", text: "Create" },
                  { id: "b", text: "Read" },
                  { id: "c", text: "Update" },
                  { id: "d", text: "Delete" },
                ],
                correctOptionId: "d",
                explanation: "Delete removes a record from your data set.",
              },
            ],
          },
        ],
      },
      {
        id: "react-crud-ch2",
        courseId: REACT_CRUD_COURSE_ID,
        chapterIndex: 1,
        title: "Variables & State",
        description: "useState and immutable updates.",
        steps: [
          {
            id: "react-crud-ch2-lesson",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch2",
            chapterTitle: "Variables & State",
            chapterIndex: 1,
            stepIndex: 0,
            stepType: "html",
            title: "Variables",
            description: "How React state replaces mutable variables in UI code.",
            contentHtml: `<div class="course-lesson">
<h2>State instead of mutating variables</h2>
<p>Use <code>useState</code> for values that change when the user interacts with the UI.</p>
<pre>const [items, setItems] = useState([]);</pre>
<p>Never mutate arrays directly. Spread into a new array when adding or removing.</p>
<pre>setItems([...items, newItem]);</pre>
</div>`,
          },
          {
            id: "react-crud-ch2-exam",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch2",
            chapterTitle: "Variables & State",
            chapterIndex: 1,
            stepIndex: 1,
            stepType: "code-exam",
            title: "Variables exam",
            description: "Add an item to state immutably.",
            codeType: "code",
            checklist: ["Uses useState", "Adds item with spread syntax", "Exports a component"],
            verificationKeywords: [["useState"], ["...", "spread"], ["export"]],
            detailedInstructions: [
              "Create TodoApp with useState for todos array",
              "Implement addTodo that appends using spread",
              "Return a div with a button calling addTodo",
            ],
          },
        ],
      },
      {
        id: "react-crud-ch3",
        courseId: REACT_CRUD_COURSE_ID,
        chapterIndex: 2,
        title: "Full CRUD",
        description: "Wire create, update, and delete together.",
        steps: [
          {
            id: "react-crud-ch3-lesson",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch3",
            chapterTitle: "Full CRUD",
            chapterIndex: 2,
            stepIndex: 0,
            stepType: "html",
            title: "CRUD pattern",
            description: "Typical handler names and flows.",
            contentHtml: `<div class="course-lesson">
<h2>Handler pattern</h2>
<ul>
  <li><strong>handleAdd</strong> — validate input, append to state</li>
  <li><strong>handleUpdate</strong> — map over items, replace matching id</li>
  <li><strong>handleDelete</strong> — filter out matching id</li>
</ul>
<p>Keep handlers pure: compute next state, then call setState once.</p>
</div>`,
          },
          {
            id: "react-crud-ch3-exam",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch3",
            chapterTitle: "Full CRUD",
            chapterIndex: 2,
            stepIndex: 1,
            stepType: "code-exam",
            title: "CRUD exam",
            description: "Implement delete by filtering state.",
            codeType: "code",
            checklist: ["Defines handleDelete function", "Uses filter on items", "Updates state with setItems"],
            verificationKeywords: [["handleDelete", "delete"], ["filter"], ["setItems", "setState"]],
            detailedInstructions: [
              "Given items state and setItems",
              "Write handleDelete(id) that filters out the item",
              "Wire a button to call handleDelete",
            ],
          },
        ],
      },
    ],
  },
];
