import type { Course } from "../data/courses";
import { canonicalAuthorName } from "./authorName";
import { getHomePageData, loadAdminData, saveAdminData } from "./contentStore";
import {
  AUTHOR_SHELF_ID,
  collectCategoryChildren,
  formatCategoryLabel,
  getCategoryLevels,
  isSeriesFolderTag,
} from "./bookCategories";

export type ShelfItemKind = "book" | "subcategory" | "series" | "author";

export type ShelfIndexValues = {
  pIndex?: number;
  scIndex?: number;
  sIndex?: number;
};

export type ShelfCatalogItem = {
  key: string;
  kind: ShelfItemKind;
  title: string;
  pathLabel: string;
  browsePath: string[];
  bookId?: string;
} & ShelfIndexValues;

export function folderIndexKey(path: string[]): string {
  return path.filter(Boolean).join("/");
}

export function authorIndexKey(authorName: string): string {
  return `author/${canonicalAuthorName(authorName)}`;
}

export function readFolderIndexes(): Record<string, ShelfIndexValues> {
  return { ...(getHomePageData().shelfFolderIndexes ?? {}) };
}

export function writeFolderIndexes(indexes: Record<string, ShelfIndexValues>) {
  const data = loadAdminData();
  const cleaned: Record<string, ShelfIndexValues> = {};
  for (const [key, value] of Object.entries(indexes)) {
    const next: ShelfIndexValues = {};
    if (typeof value.pIndex === "number" && value.pIndex > 0) next.pIndex = value.pIndex;
    if (typeof value.scIndex === "number" && value.scIndex > 0) next.scIndex = value.scIndex;
    if (typeof value.sIndex === "number" && value.sIndex > 0) next.sIndex = value.sIndex;
    if (next.pIndex || next.scIndex || next.sIndex) {
      cleaned[key] = next;
    }
  }
  saveAdminData({
    ...data,
    homePageData: {
      ...data.homePageData,
      shelfFolderIndexes: cleaned,
    },
  });
}

export function indexesForFolder(path: string[], folderIndexes = readFolderIndexes()): ShelfIndexValues {
  return folderIndexes[folderIndexKey(path)] ?? {};
}

export function indexesForAuthor(authorName: string, folderIndexes = readFolderIndexes()): ShelfIndexValues {
  return folderIndexes[authorIndexKey(authorName)] ?? {};
}

export function sortByShelfIndex<T>(
  items: T[],
  getIndex: (item: T) => number | undefined,
  getTitle: (item: T) => string,
): T[] {
  return items
    .map((item, order) => ({ item, order }))
    .sort((a, b) => {
      const ai = positiveIndex(getIndex(a.item));
      const bi = positiveIndex(getIndex(b.item));
      if (ai !== bi) return ai - bi;
      const byTitle = getTitle(a.item).localeCompare(getTitle(b.item), undefined, { sensitivity: "base" });
      if (byTitle !== 0) return byTitle;
      return a.order - b.order;
    })
    .map((entry) => entry.item);
}

function positiveIndex(value: number | undefined): number {
  return typeof value === "number" && value > 0 ? value : Number.MAX_SAFE_INTEGER;
}

function collectFolderNodes(courses: Course[]): Array<{ tag: string; path: string[]; kind: "series" | "subcategory" }> {
  const nodes: Array<{ tag: string; path: string[]; kind: "series" | "subcategory" }> = [];
  const walk = (path: string[]) => {
    for (const tag of collectCategoryChildren(courses, path)) {
      const next = [...path, tag];
      nodes.push({
        tag,
        path: next,
        kind: isSeriesFolderTag(tag) ? "series" : "subcategory",
      });
      walk(next);
    }
  };
  walk([]);
  if (!nodes.some((node) => node.tag === AUTHOR_SHELF_ID)) {
    nodes.push({ tag: AUTHOR_SHELF_ID, path: [AUTHOR_SHELF_ID], kind: "subcategory" });
  }
  return nodes;
}

export function listShelfCatalogItems(courses: Course[]): ShelfCatalogItem[] {
  const folderIndexes = readFolderIndexes();
  const items: ShelfCatalogItem[] = [];

  for (const course of courses) {
    const path = getCategoryLevels(course);
    items.push({
      key: `book/${course.id}`,
      kind: "book",
      title: course.title,
      pathLabel: path.map(formatCategoryLabel).join(" > ") || "—",
      browsePath: path,
      bookId: course.id,
      pIndex: course.pIndex,
      scIndex: course.scIndex,
      sIndex: course.sIndex,
    });
  }

  for (const node of collectFolderNodes(courses)) {
    const indexes = indexesForFolder(node.path, folderIndexes);
    items.push({
      key: `folder/${folderIndexKey(node.path)}`,
      kind: node.kind,
      title: formatCategoryLabel(node.tag),
      pathLabel: node.path.map(formatCategoryLabel).join(" > "),
      browsePath: node.path,
      pIndex: indexes.pIndex,
      scIndex: indexes.scIndex,
      sIndex: indexes.sIndex,
    });
  }

  const authors = new Map<string, string>();
  for (const course of courses) {
    const name = canonicalAuthorName(course.authorName);
    if (!authors.has(name.toLowerCase())) authors.set(name.toLowerCase(), name);
  }
  for (const name of [...authors.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))) {
    const indexes = indexesForAuthor(name, folderIndexes);
    items.push({
      key: `author/${name}`,
      kind: "author",
      title: name,
      pathLabel: "Author",
      browsePath: [AUTHOR_SHELF_ID],
      pIndex: indexes.pIndex,
      scIndex: indexes.scIndex,
      sIndex: indexes.sIndex,
    });
  }

  return items;
}
