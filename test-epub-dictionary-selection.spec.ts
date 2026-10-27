import { expect, test } from "@playwright/test";

test.use({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });

test("EPUB iframe selection reaches the dictionary watcher without a mouse event", async ({ page }) => {
  await page.goto("/");

  const selectedText = await page.evaluate(async () => {
    const { watchEpubDictionarySelection } = await import("/src/utils/epubDictionarySelection.ts");
    const iframe = document.createElement("iframe");
    iframe.srcdoc = "<p>Selected EPUB text</p>";
    document.body.appendChild(iframe);
    await new Promise<void>((resolve) => iframe.addEventListener("load", () => resolve(), { once: true }));

    const frameDocument = iframe.contentDocument;
    if (!frameDocument?.body.firstChild) throw new Error("EPUB fixture iframe did not load");
    return new Promise<string>((resolve, reject) => {
      const stopWatching = watchEpubDictionarySelection(() => [frameDocument], (text) => {
        stopWatching();
        resolve(text);
      }, 20);
      window.setTimeout(() => {
        const range = frameDocument.createRange();
        range.selectNodeContents(frameDocument.body.firstChild!);
        frameDocument.getSelection()?.addRange(range);
      }, 40);
      window.setTimeout(() => {
        stopWatching();
        reject(new Error("The EPUB selection was not forwarded"));
      }, 1000);
    });
  });

  expect(selectedText).toBe("Selected EPUB text");
});