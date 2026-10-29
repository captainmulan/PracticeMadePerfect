import { expect, test } from "@playwright/test";

test("legacy hosted EPUB URL resolves to its exact local book asset", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { getBookAssetFiles } = await import("/src/utils/bookAssetStorage.ts");
    const step = {
      id: "legacy-step",
      courseId: "legacy-book",
      chapterId: "legacy-chapter",
      chapterTitle: "Chapter 1",
      chapterIndex: 0,
      stepIndex: 0,
      stepType: "epub" as const,
      title: "Page 1",
      description: "",
      contentHtml: "https://magiclibrary-daw.pages.dev/နားဝင်မချိုတဲ့-အမှန်တရား-2/နားဝင်မချိုတဲ့-အမှန်တရား.epub#index_split_000.html#pmp-p1",
    };
    const course = {
      id: "legacy-book",
      title: "A different display title",
      category: "Other, Novel",
      chapters: [{ id: "legacy-chapter", courseId: "legacy-book", chapterIndex: 0, title: "Chapter 1", steps: [step] }],
    };
    const iframeCourse = {
      ...course,
      chapters: [{
        ...course.chapters[0],
        steps: [{ ...step, contentHtml: `<iframe src="${step.contentHtml}"></iframe>` }],
      }],
    };
    return {
      direct: getBookAssetFiles(course),
      iframe: getBookAssetFiles(iframeCourse),
      conflictingFolder: getBookAssetFiles({ ...course, bookHtmlFolder: "Other/unrelated-book" }),
      conflictingCategory: getBookAssetFiles({ ...course, category: "Comic", cat1: "Comic" }),
    };
  });

  const expected = [{
    name: "နားဝင်မချိုတဲ့-အမှန်တရား.epub",
    folder: "Other/နားဝင်မချိုတဲ့-အမှန်တရား-2",
  }];
  expect(result.direct).toEqual(expected);
  expect(result.iframe).toEqual(expected);
  expect(result.conflictingFolder).toEqual([]);
  expect(result.conflictingCategory).toEqual([]);
});

test("book deletion removes only the resolved book folder recursively", async ({ page }) => {
  await page.goto("/");
  const removals = await page.evaluate(async () => {
    const { deleteLocalBookAssets } = await import("/src/utils/bookAssetStorage.ts");
    const removed: Array<{ parent: string; name: string; recursive: boolean }> = [];
    const directory = (path: string): FileSystemDirectoryHandle => ({
      name: path.split("/").pop() ?? path,
      getDirectoryHandle: async (name: string) => directory(`${path}/${name}`),
      getFileHandle: async (name: string) => ({ name } as FileSystemFileHandle),
      removeEntry: async (name: string, options?: FileSystemRemoveOptions) => {
        removed.push({ parent: path, name, recursive: options?.recursive ?? false });
      },
    } as unknown as FileSystemDirectoryHandle);
    const projectRoot = directory("PracticeMadePerfect");
    const step = {
      id: "legacy-step",
      courseId: "legacy-book",
      chapterId: "legacy-chapter",
      chapterTitle: "Chapter 1",
      chapterIndex: 0,
      stepIndex: 0,
      stepType: "epub" as const,
      title: "Page 1",
      description: "",
      contentHtml: "https://magiclibrary-daw.pages.dev/နားဝင်မချိုတဲ့-အမှန်တရား-2/နားဝင်မချိုတဲ့-အမှန်တရား.epub#index_split_000.html#pmp-p1",
    };
    const course = {
      id: "legacy-book",
      title: "Book",
      category: "Other, Novel",
      chapters: [{ id: "legacy-chapter", courseId: "legacy-book", chapterIndex: 0, title: "Chapter 1", steps: [step] }],
    };
    await deleteLocalBookAssets(course, projectRoot);
    return removed;
  });

  expect(removals).toEqual([{
    parent: "PracticeMadePerfect/book_html/Other",
    name: "နားဝင်မချိုတဲ့-အမှန်တရား-2",
    recursive: true,
  }]);
});