import type { Course } from "../data/courses";

export interface CourseShelfItem {
  id: string;
  title: string;
  description: string;
  color: string;
  coverColorStart: string;
  coverColorMiddle: string;
  coverColorEnd: string;
  coverWidth?: number;
  coverHeight?: number;
  icon: string;
  iconColorStart: string;
  iconColorMiddle: string;
  iconColorEnd: string;
  iconSize?: number;
  titleFontSize?: number;
  titleFontWeight?: string;
  titleColor?: string;
  titlePosition?: "top-left" | "top-center" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  titleTextAlign?: "left" | "center" | "right";
  titleAlignment?: "left" | "center" | "right";
  iconPosition?: "top-left" | "top-center" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  meta: string;
  link?: string;
  placeholder?: boolean;
  category?: string;
}

export interface CourseShelfRow {
  title: string;
  items: CourseShelfItem[];
}

const placeholderRows: CourseShelfRow[] = [
  {
    title: "Language",
    items: [
      {
        id: "language-sample-1",
        title: "Coming soon",
        description: "Language category placeholder",
        color: "#22c55e",
        coverColorStart: "#22c55e",
        coverColorMiddle: "#22c55e",
        coverColorEnd: "#22c55e",
        icon: "🌐",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-2",
        title: "Coming soon",
        description: "Language category placeholder",
        color: "#4f46e5",
        coverColorStart: "#4f46e5",
        coverColorMiddle: "#4f46e5",
        coverColorEnd: "#4f46e5",
        icon: "✍️",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-3",
        title: "Coming soon",
        description: "Language category placeholder",
        color: "#a855f7",
        coverColorStart: "#a855f7",
        coverColorMiddle: "#a855f7",
        coverColorEnd: "#a855f7",
        icon: "📘",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-4",
        title: "Coming soon",
        description: "Language category placeholder",
        color: "#0ea5e9",
        coverColorStart: "#0ea5e9",
        coverColorMiddle: "#0ea5e9",
        coverColorEnd: "#0ea5e9",
        icon: "📝",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-5",
        title: "Coming soon",
        description: "Language category placeholder",
        color: "#f97316",
        coverColorStart: "#f97316",
        coverColorMiddle: "#f97316",
        coverColorEnd: "#f97316",
        icon: "📚",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
    ],
  },
  {
    title: "Kid",
    items: [
      {
        id: "kid-sample-1",
        title: "Coming soon",
        description: "Kid category placeholder",
        color: "#f97316",
        coverColorStart: "#f97316",
        coverColorMiddle: "#f97316",
        coverColorEnd: "#f97316",
        icon: "🧸",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-2",
        title: "Coming soon",
        description: "Kid category placeholder",
        color: "#ec4899",
        coverColorStart: "#ec4899",
        coverColorMiddle: "#ec4899",
        coverColorEnd: "#ec4899",
        icon: "🎨",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-3",
        title: "Coming soon",
        description: "Kid category placeholder",
        color: "#3b82f6",
        coverColorStart: "#3b82f6",
        coverColorMiddle: "#3b82f6",
        coverColorEnd: "#3b82f6",
        icon: "🧩",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-4",
        title: "Coming soon",
        description: "Kid category placeholder",
        color: "#14b8a6",
        coverColorStart: "#14b8a6",
        coverColorMiddle: "#14b8a6",
        coverColorEnd: "#14b8a6",
        icon: "🚂",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-5",
        title: "Coming soon",
        description: "Kid category placeholder",
        color: "#8b5cf6",
        coverColorStart: "#8b5cf6",
        coverColorMiddle: "#8b5cf6",
        coverColorEnd: "#8b5cf6",
        icon: "🍭",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
    ],
  },
  {
    title: "Migration",
    items: [
      {
        id: "migration-sample-1",
        title: "Coming soon",
        description: "Migration category placeholder",
        color: "#8b5cf6",
        coverColorStart: "#8b5cf6",
        coverColorMiddle: "#8b5cf6",
        coverColorEnd: "#8b5cf6",
        icon: "🚚",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-2",
        title: "Coming soon",
        description: "Migration category placeholder",
        color: "#0ea5e9",
        coverColorStart: "#0ea5e9",
        coverColorMiddle: "#0ea5e9",
        coverColorEnd: "#0ea5e9",
        icon: "🗺️",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-3",
        title: "Coming soon",
        description: "Migration category placeholder",
        color: "#f97316",
        coverColorStart: "#f97316",
        coverColorMiddle: "#f97316",
        coverColorEnd: "#f97316",
        icon: "✈️",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-4",
        title: "Coming soon",
        description: "Migration category placeholder",
        color: "#22c55e",
        coverColorStart: "#22c55e",
        coverColorMiddle: "#22c55e",
        coverColorEnd: "#22c55e",
        icon: "📦",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-5",
        title: "Coming soon",
        description: "Migration category placeholder",
        color: "#f43f5e",
        coverColorStart: "#f43f5e",
        coverColorMiddle: "#f43f5e",
        coverColorEnd: "#f43f5e",
        icon: "🌍",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
    ],
  },
  {
    title: "Fiction",
    items: [
      {
        id: "fiction-sample-1",
        title: "Coming soon",
        description: "Fiction category placeholder",
        color: "#ef4444",
        coverColorStart: "#ef4444",
        coverColorMiddle: "#ef4444",
        coverColorEnd: "#ef4444",
        icon: "📖",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "fiction-sample-2",
        title: "Coming soon",
        description: "Fiction category placeholder",
        color: "#f59e0b",
        coverColorStart: "#f59e0b",
        coverColorMiddle: "#f59e0b",
        coverColorEnd: "#f59e0b",
        icon: "⚔️",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "fiction-sample-3",
        title: "Coming soon",
        description: "Fiction category placeholder",
        color: "#10b981",
        coverColorStart: "#10b981",
        coverColorMiddle: "#10b981",
        coverColorEnd: "#10b981",
        icon: "🗡️",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "fiction-sample-4",
        title: "Coming soon",
        description: "Fiction category placeholder",
        color: "#8b5cf6",
        coverColorStart: "#8b5cf6",
        coverColorMiddle: "#8b5cf6",
        coverColorEnd: "#8b5cf6",
        icon: "📜",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "fiction-sample-5",
        title: "Coming soon",
        description: "Fiction category placeholder",
        color: "#06b6d4",
        coverColorStart: "#06b6d4",
        coverColorMiddle: "#06b6d4",
        coverColorEnd: "#06b6d4",
        icon: "🏰",
        iconColorStart: "#fff",
        iconColorMiddle: "#fff",
        iconColorEnd: "#fff",
        meta: "Coming soon",
        placeholder: true,
      },
    ],
  },
];


function buildShelfRow(title: string, items: CourseShelfItem[]): CourseShelfRow {
  const CHUNK = 7;
  const placeholder = placeholderRows.find((row) => row.title === title);
  const base = items.length > 0
    ? items
    : placeholder?.items.map((it, i) => ({ ...it, id: `${it.id}-placeholder-${i}`, placeholder: true, category: title })) ?? [];

  const completedItems = [...base];
  while (completedItems.length < CHUNK) {
    completedItems.push({
      id: `empty-${completedItems.length}`,
      title: "Coming soon",
      description: "",
      color: "#f1f5f9",
      coverColorStart: "#f1f5f9",
      coverColorMiddle: "#f1f5f9",
      coverColorEnd: "#f1f5f9",
      icon: "",
      iconColorStart: "#fff",
      iconColorMiddle: "#fff",
      iconColorEnd: "#fff",
      meta: "",
      placeholder: true,
      category: title,
    });
  }

  return {
    title,
    items: completedItems,
  };
}

export function createShelfItemFromCourse(course: Course, category: string): CourseShelfItem {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    color: course.color,
    coverColorStart: course.coverColorStart ?? course.color,
    coverColorMiddle: course.coverColorMiddle ?? course.color,
    coverColorEnd: course.coverColorEnd ?? course.color,
    coverWidth: course.coverWidth ?? undefined,
    coverHeight: course.coverHeight ?? undefined,
    icon: course.icon,
    iconColorStart: course.iconColorStart ?? "#fff",
    iconColorMiddle: course.iconColorMiddle ?? "#fff",
    iconColorEnd: course.iconColorEnd ?? "#fff",
    iconSize: course.iconSize ?? undefined,
    titleFontSize: course.titleFontSize ?? undefined,
    titleFontWeight: course.titleFontWeight ?? undefined,
    titleColor: course.titleColor ?? undefined,
    titlePosition: course.titlePosition ?? undefined,
    titleTextAlign: course.titleTextAlign ?? undefined,
    iconPosition: course.iconPosition ?? undefined,
    meta: `${course.chapters.length} chapters`,
    link: `/courses/${course.id}`,
    category,
  };
}

export function getHomeCourseShelfRows(courses: Course[]): CourseShelfRow[] {
  const popularItems = courses
    .filter((course) => typeof course.pIndex === "number" && (course.pIndex ?? 0) > 0)
    .slice()
    .sort((a, b) => (a.pIndex ?? Number.MAX_SAFE_INTEGER) - (b.pIndex ?? Number.MAX_SAFE_INTEGER))
    .map((course) => createShelfItemFromCourse(course, "Popular"));

  const kidItems = courses
    .filter((course) => course.category === "Kid")
    .map((course) => createShelfItemFromCourse(course, "Kid"));

  return [
    buildShelfRow("Popular", popularItems),
    { title: "Search", items: [] },
    buildShelfRow("Kid", kidItems),
    { title: "Other", items: [] },
  ];
}

export function getCourseShelfRowForCategory(courses: Course[], category: string): CourseShelfRow {
  const items = courses
    .filter((course) => course.category === category)
    .map((course) => createShelfItemFromCourse(course, category));

  return buildShelfRow(category, items);
}
