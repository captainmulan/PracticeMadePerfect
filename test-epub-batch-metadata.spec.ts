import { expect, test } from "@playwright/test";

test("batch EPUB metadata inference respects page limits and fallbacks", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const {
      inferEpubAuthorFromPages,
      inferEpubDescriptionFromPages,
      supplementChapterPlansWithSpine,
    } =
      await import("/src/utils/epubImport.ts");
    const { resolveEpubLocation } = await import("/src/utils/epubCache.ts");
    const longDescription = Array.from({ length: 60 }, (_, index) => `storyword${index}`).join(" ");
    const spineSupplement = supplementChapterPlansWithSpine(
      [
        { title: "Chapter A", pages: [{ title: "Chapter A", href: "Text/part-a.xhtml#start" }] },
        { title: "Chapter C", pages: [{ title: "Chapter C", href: "Text/part-c.xhtml#start" }] },
      ],
      [
        { title: "Front matter", href: "Text/front.xhtml" },
        { title: "Part A", href: "Text/part-a.xhtml" },
        { title: "Part B", href: "Text/part-b.xhtml" },
        { title: "Part C", href: "Text/part-c.xhtml" },
      ],
    );
    return {
      spineSupplement: spineSupplement.map((chapter) => ({
        title: chapter.title,
        href: chapter.pages[0]?.href,
      })),
      resolvedShortLocation: resolveEpubLocation("Section0001.xhtml#pmp-p2", [
        "Text/Title.xhtml",
        "Text/Section0001.xhtml",
      ]),
      unchangedLocation: resolveEpubLocation("Text/Title.xhtml#pmp-p2", [
        "Text/Title.xhtml",
        "Text/Section0001.xhtml",
      ]),
      ambiguousLocation: resolveEpubLocation("Section0001.xhtml#pmp-p2", [
        "Text/Section0001.xhtml",
        "Other/Section0001.xhtml",
      ]),
      authorFromSecondPage: inferEpubAuthorFromPages([
        ["A story begins."],
        ["Author: Jane Austen"],
        ["Author: Must Not Be Read"],
      ]),
      authorFallback: inferEpubAuthorFromPages([
        ["A story begins."],
        ["The second page has no byline."],
        ["By Later Author"],
      ]),
      description: inferEpubDescriptionFromPages([
        ["Copyright and all rights reserved."],
        [longDescription],
        ["Later page description must not replace the first relevant description."],
      ]),
      descriptionFallback: inferEpubDescriptionFromPages([
        ["Contents"],
        ["Copyright © publisher"],
        ["Short text only."],
        [""],
        [longDescription],
      ]),
    };
  });

  expect(result.authorFromSecondPage).toBe("Jane Austen");
  expect(result.spineSupplement).toEqual([
    { title: "Front matter", href: "Text/front.xhtml" },
    { title: "Chapter A", href: "Text/part-a.xhtml#start" },
    { title: "Part B", href: "Text/part-b.xhtml" },
    { title: "Chapter C", href: "Text/part-c.xhtml#start" },
  ]);
  expect(result.resolvedShortLocation).toBe("Text/Section0001.xhtml#pmp-p2");
  expect(result.unchangedLocation).toBe("Text/Title.xhtml#pmp-p2");
  expect(result.ambiguousLocation).toBe("Section0001.xhtml#pmp-p2");
  expect(result.authorFallback).toBe("UNKNOWN");
  expect(result.description).toMatch(/\.\.\.$/);
  expect(result.description.length).toBeLessThanOrEqual(283);
  expect(result.description).not.toContain("Later page description");
  expect(result.descriptionFallback).toBe("");
});
