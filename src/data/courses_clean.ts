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
        title: "Welcome",
        description: "Course introduction and goals.",
        steps: [
          {
            id: "react-crud-ch1-lesson",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch1",
            chapterTitle: "Welcome",
            chapterIndex: 0,
            stepIndex: 0,
            stepType: "html",
            title: "What this course covers",
            description: "High level overview and outcomes.",
            contentHtml: `<div class="course-lesson"><h2>Build a realistic CRUD UI</h2><p>In this course you'll implement Create, Read, Update, and Delete flows.</p></div>`,
          },
        ],
      },
      {
        id: "react-crud-ch3",
        courseId: REACT_CRUD_COURSE_ID,
        chapterIndex: 2,
        title: "Intro to React",
        description: "How React fits into job roles and popularity.",
        steps: [
          {
            id: "react-crud-ch3-exam",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch3",
            chapterTitle: "Intro to React",
            chapterIndex: 2,
            stepIndex: 1,
            stepType: "quiz",
            title: "React fundamentals quiz",
            description: "Check your understanding of React basics.",
            quizQuestions: [
              {
                id: "react-crud-ch3-q1",
                prompt: "What hook is used to manage state in a function component?",
                options: [
                  { id: "a", text: "useState" },
                  { id: "b", text: "useEffect" },
                  { id: "c", text: "useMemo" },
                  { id: "d", text: "useContext" },
                ],
                correctOptionId: "a",
              },
              {
                id: "react-crud-ch3-q2",
                prompt: "Which React feature lets you render a list of items?",
                options: [
                  { id: "a", text: "Array.map" },
                  { id: "b", text: "useState" },
                  { id: "c", text: "memo" },
                  { id: "d", text: "Context" },
                ],
                correctOptionId: "a",
              },
            ],
          },
          {
            id: "react-crud-ch3-code",
            courseId: REACT_CRUD_COURSE_ID,
            chapterId: "react-crud-ch3",
            chapterTitle: "Intro to React",
            chapterIndex: 2,
            stepIndex: 2,
            stepType: "code-exam",
            title: "Intro code exam",
            description: "Implement a simple function component and render a list.",
            codeType: "code",
            checklist: ["Defines a function component", "Returns a list with <li> items"],
          },
        ],
      },
    ],
  },
];
