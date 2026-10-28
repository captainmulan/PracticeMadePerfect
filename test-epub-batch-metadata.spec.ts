import { expect, test } from "@playwright/test";

test("batch EPUB metadata inference respects page limits and fallbacks", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { inferEpubAuthorFromPages, inferEpubDescriptionFromPages } =
      await import("/src/utils/epubImport.ts");
    const longDescription = Array.from({ length: 60 }, (_, index) => `storyword${index}`).join(" ");
    return {
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
  expect(result.authorFallback).toBe("UNKNOWN");
  expect(result.description).toMatch(/\.\.\.$/);
  expect(result.description.length).toBeLessThanOrEqual(283);
  expect(result.description).not.toContain("Later page description");
  expect(result.descriptionFallback).toBe("");
});
