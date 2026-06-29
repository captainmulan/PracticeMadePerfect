import type { Course } from "../data/courses";

export interface CourseShelfItem {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  iconSize?: number;
  titleFontSize?: number;
  titleFontWeight?: string;
  titleColor?: string;
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
        title: "Sample 1",
        description: "Language category placeholder",
        color: "#22c55e",
        icon: "🌐",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-2",
        title: "Sample 2",
        description: "Language category placeholder",
        color: "#4f46e5",
        icon: "✍️",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-3",
        title: "Sample 3",
        description: "Language category placeholder",
        color: "#a855f7",
        icon: "📘",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-4",
        title: "Sample 4",
        description: "Language category placeholder",
        color: "#0ea5e9",
        icon: "📝",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "language-sample-5",
        title: "Sample 5",
        description: "Language category placeholder",
        color: "#f97316",
        icon: "📚",
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
        title: "Sample 1",
        description: "Kid category placeholder",
        color: "#f97316",
        icon: "🧸",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-2",
        title: "Sample 2",
        description: "Kid category placeholder",
        color: "#ec4899",
        icon: "🎨",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-3",
        title: "Sample 3",
        description: "Kid category placeholder",
        color: "#3b82f6",
        icon: "🧩",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-4",
        title: "Sample 4",
        description: "Kid category placeholder",
        color: "#14b8a6",
        icon: "🚂",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "kid-sample-5",
        title: "Sample 5",
        description: "Kid category placeholder",
        color: "#8b5cf6",
        icon: "🍭",
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
        title: "Sample 1",
        description: "Migration category placeholder",
        color: "#8b5cf6",
        icon: "🚚",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-2",
        title: "Sample 2",
        description: "Migration category placeholder",
        color: "#0ea5e9",
        icon: "🗺️",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-3",
        title: "Sample 3",
        description: "Migration category placeholder",
        color: "#f97316",
        icon: "✈️",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-4",
        title: "Sample 4",
        description: "Migration category placeholder",
        color: "#22c55e",
        icon: "📦",
        meta: "Coming soon",
        placeholder: true,
      },
      {
        id: "migration-sample-5",
        title: "Sample 5",
        description: "Migration category placeholder",
        color: "#f43f5e",
        icon: "🌍",
        meta: "Coming soon",
        placeholder: true,
      },
    ],
  },
];

const courseRowDefinitions: Array<{
  title: string;
  matcher: (course: Course) => boolean;
}> = [
  {
    title: "IT",
    matcher: (course) => /react|solid|angular|c#|sql/i.test(course.title),
  },
  {
    title: "Language",
    matcher: () => false,
  },
  {
    title: "Kid",
    matcher: () => false,
  },
  {
    title: "Migration",
    matcher: () => false,
  },
];

function createShelfItemFromCourse(course: Course, category: string): CourseShelfItem {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    color: course.color,
    icon: course.icon,
    iconSize: course.iconSize ?? undefined,
    titleFontSize: course.titleFontSize ?? undefined,
    titleFontWeight: course.titleFontWeight ?? undefined,
    titleColor: course.titleColor ?? undefined,
    iconPosition: course.iconPosition ?? undefined,
    meta: `${course.chapters.length} chapters`,
    link: `/courses/${course.id}`,
    category,
  };
}

export function getHomeCourseShelfRows(courses: Course[]): CourseShelfRow[] {
  const CHUNK = 7;

  const courseRows = courseRowDefinitions.map((definition) => {
    const items = courses.filter(definition.matcher).map((course) => createShelfItemFromCourse(course, definition.title));
    const placeholder = placeholderRows.find((row) => row.title === definition.title);
    const base = items.length > 0
      ? items
      : placeholder?.items.map((it, i) => ({ ...it, id: `${it.id}-placeholder-${i}`, placeholder: true, category: definition.title })) ?? [];

    const completedItems = [...base];
    while (completedItems.length < CHUNK) completedItems.push({ id: `empty-${completedItems.length}`, title: "", description: "", color: "#f1f5f9", icon: "", meta: "", placeholder: true, category: definition.title });

    return {
      title: definition.title,
      items: completedItems,
    };
  });

  return courseRows;
}
