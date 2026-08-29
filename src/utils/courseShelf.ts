import type { Course } from "../data/courses";
import {
  indexesForAuthor,
  indexesForFolder,
  sortByShelfIndex,
} from "./shelfItemIndexes";
import { resolveBookCoverUrl } from "./bookCoverSeeds";
import {
  AUTHOR_SHELF_ID,
  LANGUAGE_SUBCATEGORY_FLAGS,
  isSeriesFolderTag,
  collectCategoryChildren,
  collectTopCategoryNames,
  courseIsExactCategoryPath,
  formatCategoryLabel,
  getCategoryShelfStyle,
} from "./bookCategories";
import { canonicalAuthorName } from "./authorName";

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
  coverImageUrl?: string;
  icon: string;
  iconImageUrl?: string;
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
  actionType?: "book" | "author" | "category" | "language-sub";
  folderKind?: "emoji" | "books-3d";
  artifactType?: "book" | "magazine" | "newspaper" | "game";
  authorName?: string;
  browsePath?: string[];
  itemKind?: "book" | "subcategory" | "series" | "author";
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
    title: "PersonalDevelopment",
    items: [
      {
        id: "personal-dev-sample-1",
        title: "Coming soon",
        description: "PersonalDevelopment category placeholder",
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
        description: "PersonalDevelopment category placeholder",
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
        description: "PersonalDevelopment category placeholder",
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
        description: "PersonalDevelopment category placeholder",
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
        description: "PersonalDevelopment category placeholder",
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

  if (title === "Author") {
    return {
      title,
      items: base,
    };
  }

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
    coverImageUrl: resolveBookCoverUrl(course, { variant: "thumb" }),
    authorName: course.authorName,
    icon: course.icon,
    iconColorStart: course.iconColorStart ?? "#fff",
    iconColorMiddle: course.iconColorEnd ?? "#fff",
    iconColorEnd: course.iconColorEnd ?? "#fff",
    iconSize: course.iconSize ?? undefined,
    titleFontSize: course.titleFontSize ?? undefined,
    titleFontWeight: course.titleFontWeight ?? undefined,
    titleColor: course.titleColor ?? undefined,
    titlePosition: course.titlePosition ?? undefined,
    titleTextAlign: course.titleTextAlign ?? undefined,
    titleAlignment: course.titleAlignment ?? course.titleTextAlign ?? undefined,
    iconPosition: course.iconPosition ?? undefined,
    meta: `${course.stepCount ?? course.chapters.length} pages`,
    link: `/courses/${course.id}`,
    category,
    artifactType: course.artifactType,
    itemKind: "book",
  };
}

export function getPopularCourses(courses: Course[]): Course[] {
  return courses
    .filter((course) => typeof course.pIndex === "number" && (course.pIndex ?? 0) > 0)
    .slice()
    .sort((a, b) => (a.pIndex ?? Number.MAX_SAFE_INTEGER) - (b.pIndex ?? Number.MAX_SAFE_INTEGER));
}

export function pickRandomPopularCourse(courses: Course[]): Course | null {
  const popular = getPopularCourses(courses);
  if (popular.length === 0) {
    return courses[0] ?? null;
  }
  return popular[Math.floor(Math.random() * popular.length)];
}

export function getUnpublishedBooksRow(courses: Course[]): CourseShelfRow {
  const unpublishedItems = courses
    .map((course) => createShelfItemFromCourse(course, "Unpublished Books"));

  return buildShelfRow("Unpublished Books", unpublishedItems);
}

export function getHomeCourseShelfRows(courses: Course[]): CourseShelfRow[] {
  const popularBooks = getPopularCourses(courses).map((course) => ({
    item: createShelfItemFromCourse(course, "Selection"),
    pIndex: course.pIndex,
  }));
  const folderNodes: Array<{ item: CourseShelfItem; pIndex?: number }> = [];
  const walk = (path: string[]) => {
    for (const tag of collectCategoryChildren(courses, path)) {
      const next = [...path, tag];
      const pIndex = indexesForFolder(next).pIndex;
      if (typeof pIndex === "number" && pIndex > 0) {
        folderNodes.push({
          item: makeCategoryFolderItem(tag, "category", isSeriesFolderTag(tag), next),
          pIndex,
        });
      }
      walk(next);
    }
  };
  walk([]);
  const authorPIndex = indexesForFolder([AUTHOR_SHELF_ID]).pIndex;
  if (typeof authorPIndex === "number" && authorPIndex > 0) {
    folderNodes.push({
      item: makeCategoryFolderItem(AUTHOR_SHELF_ID, "category", false, [AUTHOR_SHELF_ID]),
      pIndex: authorPIndex,
    });
  }
  const authors = new Map<string, { authorName: string; authorPicture?: string }>();
  for (const course of courses) {
    const authorName = canonicalAuthorName(course.authorName);
    const key = authorName.toLowerCase();
    if (!authors.has(key)) {
      authors.set(key, { authorName, authorPicture: course.authorPicture });
    }
  }
  const authorTiles = [...authors.values()]
    .map((author) => ({ author, pIndex: indexesForAuthor(author.authorName).pIndex }))
    .filter((entry) => typeof entry.pIndex === "number" && (entry.pIndex ?? 0) > 0)
    .map((entry) => ({
      item: createAuthorShelfItem(entry.author.authorName, entry.author.authorPicture),
      pIndex: entry.pIndex,
    }));

  const mixed = sortByShelfIndex(
    [...popularBooks, ...folderNodes, ...authorTiles],
    (entry) => entry.pIndex,
    (entry) => entry.item.title,
  ).map((entry) => entry.item);

  return [buildShelfRow("Selection", mixed)];
}

export function getCategoryPickerRow(courses: Course[]): CourseShelfRow {
  const authorStyle = getCategoryShelfStyle(AUTHOR_SHELF_ID);
  const authorItem = makeCategoryFolderItem(AUTHOR_SHELF_ID, "category", false, [AUTHOR_SHELF_ID]);
  authorItem.title = "Author";
  authorItem.description = "Browse books by author";
  authorItem.icon = authorStyle.icon;
  authorItem.coverColorStart = authorStyle.coverColorStart;
  authorItem.coverColorMiddle = authorStyle.coverColorMiddle;
  authorItem.coverColorEnd = authorStyle.coverColorEnd;
  authorItem.color = authorStyle.coverColorStart;

  const rootOrder: Record<string, number> = { Kid: 1, Other: 2, Author: 3 };
  const folderItems = [
    ...collectTopCategoryNames(courses).map((tag) =>
      makeCategoryFolderItem(tag, "category", false, [tag]),
    ),
    authorItem,
  ];
  const items = sortByShelfIndex(
    folderItems.map((item) => {
      const tag = item.browsePath?.[0] ?? item.category ?? "";
      return {
        item,
        scIndex: indexesForFolder([tag]).scIndex ?? rootOrder[tag],
      };
    }),
    (entry) => entry.scIndex,
    (entry) => entry.item.title,
  ).map((entry) => entry.item);

  return { title: "Category", items };
}

const EMOJI_ROOT_FOLDERS = new Set(["Kid", "Other", AUTHOR_SHELF_ID]);

function makeCategoryFolderItem(
  tag: string,
  actionType: "category" | "language-sub",
  books3d = false,
  browsePath?: string[],
): CourseShelfItem {
  const path = browsePath ?? [tag];
  const style = getCategoryShelfStyle(tag);
  const flag = LANGUAGE_SUBCATEGORY_FLAGS[tag];
  const label = formatCategoryLabel(tag);
  const useBooks3d = books3d && !EMOJI_ROOT_FOLDERS.has(tag);
  const series = isSeriesFolderTag(tag);
  return {
    id: `category-${path.join("/")}`,
    title: label,
    description: `Browse ${label} books`,
    color: style.coverColorStart,
    coverColorStart: style.coverColorStart,
    coverColorMiddle: style.coverColorMiddle,
    coverColorEnd: style.coverColorEnd,
    icon: flag?.icon ?? style.icon,
    iconImageUrl: flag?.flagSrc,
    iconColorStart: "#fff",
    iconColorMiddle: "#fff",
    iconColorEnd: "#fff",
    iconSize: 88,
    iconPosition: "center-center",
    titlePosition: "top-center",
    titleColor: "#0f172a",
    meta: series ? "Series" : "Category",
    category: tag,
    actionType: flag?.flagSrc ? "language-sub" : actionType,
    folderKind: useBooks3d || series ? "books-3d" : "emoji",
    artifactType: "book",
    browsePath: path,
    itemKind: series ? "series" : "subcategory",
  };
}

function createAuthorShelfItem(authorName: string, authorPicture?: string): CourseShelfItem {
  return {
    id: `author-${authorName}`,
    title: authorName,
    description: `Browse ${authorName}'s books`,
    color: "#e0e7ff",
    coverColorStart: "#e0e7ff",
    coverColorMiddle: "#c7d2fe",
    coverColorEnd: "#a5b4fc",
    coverWidth: 100,
    coverHeight: 150,
    coverImageUrl: authorPicture?.trim(),
    icon: authorPicture?.trim() || "👤",
    iconColorStart: "#fff",
    iconColorMiddle: "#fff",
    iconColorEnd: "#fff",
    meta: "Author",
    category: "Author",
    actionType: "author",
    artifactType: "book",
    browsePath: [AUTHOR_SHELF_ID],
    itemKind: "author",
  };
}

export function getCategoryBrowseRow(courses: Course[], path: string[]): CourseShelfRow {
  const inSeries = isSeriesFolderTag(path[path.length - 1] ?? "");
  const childItems = collectCategoryChildren(courses, path).map((tag) => {
    const next = [...path, tag];
    const indexes = indexesForFolder(next);
    return {
      item: makeCategoryFolderItem(tag, "category", isSeriesFolderTag(tag), next),
      scIndex: indexes.scIndex,
      sIndex: indexes.sIndex,
    };
  });
  const bookItems = courses
    .filter((course) => courseIsExactCategoryPath(course, path))
    .map((course) => ({
      item: createShelfItemFromCourse(course, path[path.length - 1] ?? "Category"),
      scIndex: course.scIndex,
      sIndex: course.sIndex,
    }));
  const mixed = sortByShelfIndex(
    [...childItems, ...bookItems],
    (entry) => (inSeries ? entry.sIndex : entry.scIndex) ?? entry.sIndex,
    (entry) => entry.item.title,
  ).map((entry) => entry.item);
  const title = path.map(formatCategoryLabel).join(" > ") || "Category";
  return { title, items: mixed };
}

export function getAuthorShelfRow(authorGroups: Array<{ authorName?: string; authorPicture?: string }>): CourseShelfRow {
  const items = sortByShelfIndex(
    authorGroups.map((author) => {
      const authorName = canonicalAuthorName(author.authorName);
      return {
        item: createAuthorShelfItem(authorName, author.authorPicture),
        scIndex: indexesForAuthor(authorName).scIndex,
      };
    }),
    (entry) => entry.scIndex,
    (entry) => entry.item.title,
  ).map((entry) => entry.item);

  return { title: "Author", items };
}

export function getCourseShelfRowForAuthor(courses: Course[], authorName: string): CourseShelfRow {
  const items = sortByShelfIndex(
    courses
      .filter((course) => canonicalAuthorName(course.authorName) === canonicalAuthorName(authorName))
      .map((course) => ({
        item: createShelfItemFromCourse(course, "Author"),
        scIndex: course.scIndex,
      })),
    (entry) => entry.scIndex,
    (entry) => entry.item.title,
  ).map((entry) => entry.item);

  return { title: authorName, items };
}

export function getLanguageSubcategoryPickerRow(courses: Course[]): CourseShelfRow {
  return getCategoryBrowseRow(courses, ["Language"]);
}

export function getCourseShelfRowForLanguageSub(courses: Course[], subTag: string): CourseShelfRow {
  return getCategoryBrowseRow(courses, ["Language", subTag.trim()]);
}

export function getCourseShelfRowForCategory(courses: Course[], category: string): CourseShelfRow {
  return getCategoryBrowseRow(courses, [category.trim()]);
}
