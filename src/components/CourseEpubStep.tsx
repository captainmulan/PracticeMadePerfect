import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import PdfFunLoader from "./PdfFunLoader";
import {
  defaultPdfViewForCategory,
  normalizePageViewType,
  type PageViewType,
} from "../data/pageViewType";
import { extractEpubLocation, getEpubBuffer, resolveEpubFileUrl } from "../utils/epubCache";
import "../styles/course.css";

type EpubContents = { document?: Document };

type EpubRendition = {
  display: (target?: string) => Promise<unknown>;
  destroy?: () => void;
  getContents?: () => EpubContents[] | EpubContents;
  hooks?: { content?: { register: (callback: (contents: EpubContents) => void) => void } };
  themes?: {
    fontSize?: (size: string) => void;
    default?: (styles: Record<string, Record<string, string>>) => void;
  };
  resize?: () => void;
};

type EpubBook = {
  ready?: Promise<unknown>;
  renderTo: (target: string, options: Record<string, string>) => EpubRendition;
  packaging?: { metadata?: { layout?: string } };
  destroy?: () => void;
};

type EpubFactory = (source: string | Uint8Array, options?: Record<string, unknown>) => EpubBook;

let epubLibraryPromise: Promise<EpubFactory> | null = null;
const EPUB_LOADING_INDICATOR_DELAY_MS = 300;

function loadScript(src: string, ready: () => boolean): Promise<void> {
  if (ready()) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => (ready() ? resolve() : reject(new Error("EPUB reader library did not initialize.")));
    script.onerror = () => reject(new Error(`Unable to load EPUB reader library: ${src}`));
    document.head.appendChild(script);
  });
}

function loadEpubLibrary(): Promise<EpubFactory> {
  const globals = window as Window & { ePub?: EpubFactory; JSZip?: unknown };
  if (!epubLibraryPromise) {
    epubLibraryPromise = (async () => {
      await Promise.all([
        loadScript("https://unpkg.com/jszip@3.10.1/dist/jszip.min.js", () => typeof globals.JSZip === "function"),
        loadScript("https://unpkg.com/epubjs@0.3.93/dist/epub.min.js", () => typeof globals.ePub === "function"),
      ]);
      if (typeof globals.ePub !== "function") throw new Error("EPUB.js failed to load. Please retry.");
      return globals.ePub;
    })();
  }
  return epubLibraryPromise;
}

function locationFragment(location: string | null) {
  const hash = location?.lastIndexOf("#") ?? -1;
  return hash < 0 ? "" : location!.slice(hash + 1);
}

function removeObjectReplacementCharacters(doc: Document) {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.textContent?.includes("\uFFFC")) {
      node.textContent = node.textContent.replace(/\uFFFC/g, "");
    }
    node = walker.nextNode();
  }
}

function findChapterAnchor(doc: Document, fragment: string) {
  if (!fragment) return null;
  let decoded = fragment;
  try {
    decoded = decodeURIComponent(fragment);
  } catch {
    /* Keep the literal fragment when it is not URI-encoded. */
  }
  return (
    doc.getElementById(decoded) ??
    doc.getElementById(fragment) ??
    [...doc.querySelectorAll("[name]")].find((element) => element.getAttribute("name") === decoded) ??
    null
  );
}

function clearChapterIsolation(doc: Document) {
  doc.getElementById("pmp-isolate-style")?.remove();
  doc.querySelectorAll("[data-pmp-hide='1']").forEach((element) => element.removeAttribute("data-pmp-hide"));
}

function hideAnchorSiblings(anchor: Element, hideBefore: boolean) {
  const parent = anchor.parentNode;
  if (!parent) return;
  const siblings = [...parent.childNodes];
  const anchorIndex = siblings.indexOf(anchor);
  const clipped = hideBefore ? siblings.slice(0, anchorIndex) : siblings.slice(anchorIndex);
  for (const node of clipped) {
    if (node.nodeType === Node.TEXT_NODE) {
      const wrapper = anchor.ownerDocument.createElement("span");
      wrapper.setAttribute("data-pmp-hide", "1");
      parent.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      (node as Element).setAttribute("data-pmp-hide", "1");
    }
  }
}

function applyChapterIsolation(
  doc: Document,
  fragment: string,
  nextFragment?: string,
  imageIndex?: number,
) {
  if (!doc.body) return;
  clearChapterIsolation(doc);
  const anchors = [...doc.querySelectorAll("[id], a[name]")];
  const start = findChapterAnchor(doc, fragment) ?? (!fragment
    ? anchors.find((element) => /^p\d+$/i.test(element.id || element.getAttribute("name") || "")) ?? null
    : null);
  if (!start) return;

  const startIndex = anchors.indexOf(start);
  const requestedEnd = nextFragment ? findChapterAnchor(doc, nextFragment) : null;
  const endIndex = requestedEnd ? anchors.indexOf(requestedEnd) : -1;
  const marker = /^(?:p\d+|pgepubid|chap|chapter|part|sec|section)[-_]?\d*/i;
  const end = endIndex > startIndex
    ? requestedEnd
    : anchors.slice(startIndex + 1).find((element) => marker.test(element.id || element.getAttribute("name") || ""));
  const style = doc.createElement("style");
  style.id = "pmp-isolate-style";
  style.textContent = "[data-pmp-hide='1']{display:none!important;}";
  (doc.head || doc.documentElement).appendChild(style);

  const preceding = doc.defaultView?.Node.DOCUMENT_POSITION_PRECEDING ?? 2;
  const following = doc.defaultView?.Node.DOCUMENT_POSITION_FOLLOWING ?? 4;
  for (const element of doc.body.querySelectorAll("*")) {
    if (element.contains(start)) continue;
    if (start.compareDocumentPosition(element) & preceding) {
      element.setAttribute("data-pmp-hide", "1");
    } else if (end && (element === end || end.contains(element) || (end.compareDocumentPosition(element) & following))) {
      element.setAttribute("data-pmp-hide", "1");
    }
  }
  hideAnchorSiblings(start, true);
  if (end) hideAnchorSiblings(end, false);
  if (typeof imageIndex === "number" && Number.isInteger(imageIndex) && imageIndex >= 0) {
    const pageImages = [...doc.images].filter((image) => !image.closest("[data-pmp-hide='1']"));
    const selectedImage = pageImages[imageIndex];
    if (selectedImage) {
      for (const image of pageImages) {
        if (image === selectedImage) continue;
        const paragraph = image.parentElement;
        if (paragraph?.querySelectorAll("img").length === 1 && paragraph.tagName.toLowerCase() === "p") {
          paragraph.setAttribute("data-pmp-hide", "1");
        } else {
          image.setAttribute("data-pmp-hide", "1");
        }
      }
    }
  }
  start.scrollIntoView({ block: "start" });
  doc.documentElement.scrollTop = 0;
  doc.body.scrollTop = 0;
}

const comicSpreadOriginalStyles = new WeakMap<Element, string | null>();

function applyComicSpreadPage(
  doc: Document,
  side: "left" | "right",
  getHostWidth: () => number,
  getHostHeight: () => number,
): { sides: Array<"left" | "right">; activeSide: "left" | "right" } | null {
  doc.querySelectorAll("[data-pmp-comic-spread], [data-pmp-comic-spread-image]").forEach((element) => {
    const originalStyle = comicSpreadOriginalStyles.get(element);
    if (originalStyle === null) element.removeAttribute("style");
    else if (typeof originalStyle === "string") element.setAttribute("style", originalStyle);
    comicSpreadOriginalStyles.delete(element);
    element.removeAttribute("data-pmp-comic-spread");
    element.removeAttribute("data-pmp-comic-spread-image");
  });

  const image = [...doc.images].find((item) =>
    item.complete &&
    item.naturalWidth > item.naturalHeight * 1.05 &&
    !item.closest("[data-pmp-hide='1']"),
  );
  const wrapper = image?.parentElement;
  if (!image || !wrapper) return null;

  let split = 0.5;
  let sides: Array<"left" | "right"> = ["left", "right"];
  try {
    const sampleWidth = 320;
    const sampleHeight = Math.max(120, Math.round(sampleWidth * image.naturalHeight / image.naturalWidth));
    const canvas = doc.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context) {
      context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
      const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
      const columns = new Float32Array(sampleWidth);
      let leftInk = 0;
      let rightInk = 0;
      const midTop = Math.floor(sampleHeight * 0.08);
      const midBottom = Math.ceil(sampleHeight * 0.92);
      let leftSamples = 0;
      let rightSamples = 0;
      for (let y = midTop; y < midBottom; y += 1) {
        for (let x = 0; x < sampleWidth; x += 1) {
          const offset = (y * sampleWidth + x) * 4;
          const ink = pixels[offset] < 242 || pixels[offset + 1] < 242 || pixels[offset + 2] < 242;
          if (ink) {
            columns[x] += 1;
            if (x < sampleWidth / 2) leftInk += 1;
            else rightInk += 1;
          }
          if (x < sampleWidth / 2) leftSamples += 1;
          else rightSamples += 1;
        }
      }

      const leftDensity = leftInk / Math.max(1, leftSamples);
      const rightDensity = rightInk / Math.max(1, rightSamples);
      if (leftDensity < 0.012 && rightDensity >= 0.02) sides = ["right"];
      else if (rightDensity < 0.012 && leftDensity >= 0.02) sides = ["left"];
      else {
        const windowWidth = Math.max(3, Math.round(sampleWidth * 0.025));
        const minX = Math.floor(sampleWidth * 0.35);
        const maxX = Math.ceil(sampleWidth * 0.65);
        let bestX = Math.floor(sampleWidth / 2);
        let bestDensity = Number.POSITIVE_INFINITY;
        for (let x = minX; x <= maxX; x += 1) {
          const start = Math.max(0, x - Math.floor(windowWidth / 2));
          const end = Math.min(sampleWidth, start + windowWidth);
          let total = 0;
          for (let column = start; column < end; column += 1) total += columns[column];
          const density = total / Math.max(1, (end - start) * (midBottom - midTop));
          if (density < bestDensity) {
            bestDensity = density;
            bestX = x;
          }
        }
        const centerDensity = columns.slice(minX, maxX).reduce((sum, value) => sum + value, 0) /
          Math.max(1, (maxX - minX) * (midBottom - midTop));
        if (bestDensity < 0.12 && bestDensity < centerDensity * 0.45) {
          split = bestX / sampleWidth;
        }
      }
    }
  } catch {
    // Some EPUB image URLs may be canvas-tainted; retain a centered split in that case.
  }

  const activeSide = sides.includes(side) ? side : sides[0];
  const sideStart = activeSide === "left" ? 0 : split;
  const sideEnd = activeSide === "left" ? split : 1;
  const sideFraction = Math.max(0.1, sideEnd - sideStart);

  let style = doc.getElementById("pmp-comic-spread-style");
  if (!style) {
    style = doc.createElement("style");
    style.id = "pmp-comic-spread-style";
    doc.head.appendChild(style);
  }
  style.textContent = `
    [data-pmp-comic-spread="1"]{position:relative!important;display:block!important;width:var(--pmp-comic-visible-width)!important;height:var(--pmp-comic-page-height)!important;min-height:var(--pmp-comic-page-height)!important;overflow:hidden!important;box-sizing:border-box!important;margin:0 auto!important;padding:0!important;transform:none!important}
    [data-pmp-comic-spread-image="1"]{position:absolute!important;display:block!important;left:var(--pmp-comic-image-left)!important;top:0!important;width:var(--pmp-comic-image-width)!important;height:var(--pmp-comic-page-height)!important;max-width:none!important;max-height:none!important;object-fit:fill!important;transform:none!important;margin:0!important}
  `;

  const hostWidth = Math.max(1, getHostWidth());
  const hostHeight = Math.max(1, getHostHeight());
  const cropWidth = image.naturalWidth * sideFraction;
  const scale = Math.min((hostWidth - 24) / cropWidth, (hostHeight - 24) / image.naturalHeight);
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const pageHeight = image.naturalHeight * scale;
  const visibleWidth = cropWidth * scale;
  const imageWidth = image.naturalWidth * scale;
  comicSpreadOriginalStyles.set(wrapper, wrapper.getAttribute("style"));
  comicSpreadOriginalStyles.set(image, image.getAttribute("style"));
  wrapper.setAttribute("data-pmp-comic-spread", "1");
  image.setAttribute("data-pmp-comic-spread-image", "1");
  wrapper.style.setProperty("--pmp-comic-page-height", `${pageHeight}px`);
  wrapper.style.setProperty("--pmp-comic-visible-width", `${visibleWidth}px`);
  wrapper.style.setProperty("position", "relative", "important");
  wrapper.style.setProperty("display", "block", "important");
  wrapper.style.setProperty("left", "auto", "important");
  wrapper.style.setProperty("width", `${visibleWidth}px`, "important");
  wrapper.style.setProperty("height", `${pageHeight}px`, "important");
  wrapper.style.setProperty("min-height", `${pageHeight}px`, "important");
  wrapper.style.setProperty("overflow", "hidden", "important");
  wrapper.style.setProperty("transform", "none", "important");
  wrapper.style.setProperty("margin", "0 auto", "important");
  image.style.setProperty("--pmp-comic-page-height", `${pageHeight}px`);
  image.style.setProperty("--pmp-comic-image-width", `${imageWidth}px`);
  image.style.setProperty("--pmp-comic-image-left", `${-sideStart * imageWidth}px`);
  image.style.setProperty("position", "absolute", "important");
  image.style.setProperty("left", `${-sideStart * imageWidth}px`, "important");
  image.style.setProperty("top", "0", "important");
  image.style.setProperty("width", `${imageWidth}px`, "important");
  image.style.setProperty("height", `${pageHeight}px`, "important");
  image.style.setProperty("max-width", "none", "important");
  image.style.setProperty("max-height", "none", "important");
  image.style.setProperty("transform", "none", "important");
  return { sides, activeSide };
}

function configureFixedEpubPage(
  doc: Document,
  mode: PageViewType,
  getHostWidth: () => number,
): boolean {
  const page = doc.querySelector<HTMLElement>(".body");
  if (!page) return false;

  const positioned = [...page.querySelectorAll<HTMLElement>("[style]")].filter((element) => {
    if (element.style.position !== "absolute") return false;
    let ancestor = element.parentElement;
    while (ancestor && ancestor !== page) {
      if (ancestor.style.position === "absolute") return false;
      ancestor = ancestor.parentElement;
    }
    return ancestor === page;
  });
  if (positioned.length === 0) return false;
  const viewport = doc.defaultView;
  if (viewport && (viewport.innerWidth <= 640 || Math.min(viewport.innerWidth, viewport.innerHeight) <= 640)) {
    return false;
  }

  const bounds = positioned.map((element) => ({
    left: Number.parseFloat(element.style.left) || 0,
    top: Number.parseFloat(element.style.top) || 0,
    width: Number.parseFloat(element.style.width) || element.scrollWidth,
    height: Number.parseFloat(element.style.height) || element.scrollHeight,
  }));
  const minLeft = Math.min(...bounds.map((box) => box.left));
  const minTop = Math.min(...bounds.map((box) => box.top));
  const maxRight = Math.max(...bounds.map((box) => box.left + box.width));
  const maxBottom = Math.max(...bounds.map((box) => box.top + box.height));
  const pageWidth = Math.max(maxRight, maxRight + minLeft);
  const pageHeight = Math.max(maxBottom, maxBottom + minTop);
  if (!Number.isFinite(pageWidth) || !Number.isFinite(pageHeight) || pageWidth <= 0 || pageHeight <= 0) {
    return false;
  }

  doc.body.classList.add("pmp-fixed-epub-layout");
  const layoutPage = () => {
    const hostWidth = getHostWidth();
    const availableWidth = Math.max(
      1,
      doc.documentElement.clientWidth,
      hostWidth > 640 ? hostWidth : 0,
    );
    const fullBleed = minLeft <= 1 && minTop <= 1 && maxRight >= pageWidth - 1;
    const crop = mode === "Crop" && !fullBleed;
    const contentWidth = Math.max(1, maxRight - minLeft);
    const scale = crop
      ? Math.max(1, (availableWidth * 1.35) / contentWidth)
      : availableWidth > 640
        ? availableWidth / pageWidth
        : Math.min(1, availableWidth / pageWidth);
    page.style.setProperty("position", "relative", "important");
    page.style.setProperty("width", `${pageWidth}px`, "important");
    page.style.setProperty("height", `${pageHeight}px`, "important");
    page.style.setProperty(
      "transform",
      crop
        ? `translate(${-minLeft * scale}px, ${-minTop * scale}px) scale(${scale})`
        : `scale(${scale})`,
      "important",
    );
    page.style.setProperty("transform-origin", "top left", "important");
    doc.body.style.setProperty("width", `${(crop ? contentWidth : pageWidth) * scale}px`, "important");
    doc.body.style.setProperty("height", `${(crop ? maxBottom - minTop : pageHeight) * scale}px`, "important");
    doc.body.style.setProperty("min-height", `${(crop ? maxBottom - minTop : pageHeight) * scale}px`, "important");
    doc.body.style.setProperty("padding", "0", "important");
    doc.body.style.setProperty("transform", "none", "important");
    doc.body.style.setProperty("transform-origin", "top left", "important");
    doc.body.style.setProperty("overflow-x", crop ? "auto" : "hidden", "important");
    doc.body.style.setProperty("overflow-y", "auto", "important");
  };

  layoutPage();
  const pageWindow = doc.defaultView as (Window & {
    __pmpFixedPageResize?: boolean;
    __pmpFixedPageLayout?: () => void;
  }) | null;
  if (pageWindow) pageWindow.__pmpFixedPageLayout = layoutPage;
  if (!pageWindow?.__pmpFixedPageResize) {
    pageWindow?.addEventListener("resize", () => pageWindow.__pmpFixedPageLayout?.());
    if (pageWindow) pageWindow.__pmpFixedPageResize = true;
  }
  return true;
}

function styleEpubContents(doc: Document, mode: PageViewType, getHostWidth: () => number) {
  if (!doc.head) return;
  configureFixedEpubPage(doc, mode, getHostWidth);
  if (doc.getElementById("pmp-epub-reader-style")) return;
  const style = doc.createElement("style");
  style.id = "pmp-epub-reader-style";
  style.textContent = `
    html,body{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;overflow-x:hidden!important}
    body{padding:.5em 12px 1.5em!important;box-sizing:border-box!important;line-height:1.55!important}
    body:not(.pmp-fixed-epub-layout) p,body:not(.pmp-fixed-epub-layout) li,body:not(.pmp-fixed-epub-layout) td,body:not(.pmp-fixed-epub-layout) th,body:not(.pmp-fixed-epub-layout) blockquote,body:not(.pmp-fixed-epub-layout) p *,body:not(.pmp-fixed-epub-layout) li *,body:not(.pmp-fixed-epub-layout) td *,body:not(.pmp-fixed-epub-layout) th *,body:not(.pmp-fixed-epub-layout) blockquote *{font-size:16px!important;line-height:1.65!important}
    @media(max-width:640px){body:not(.pmp-fixed-epub-layout) p,body:not(.pmp-fixed-epub-layout) li,body:not(.pmp-fixed-epub-layout) td,body:not(.pmp-fixed-epub-layout) th,body:not(.pmp-fixed-epub-layout) blockquote,body:not(.pmp-fixed-epub-layout) p *,body:not(.pmp-fixed-epub-layout) li *,body:not(.pmp-fixed-epub-layout) td *,body:not(.pmp-fixed-epub-layout) th *,body:not(.pmp-fixed-epub-layout) blockquote *{font-size:20px!important;line-height:1.7!important}}
    @media(min-width:641px) and (max-width:1024px){
      body:not(.pmp-fixed-epub-layout) p,body:not(.pmp-fixed-epub-layout) li,body:not(.pmp-fixed-epub-layout) td,body:not(.pmp-fixed-epub-layout) th,body:not(.pmp-fixed-epub-layout) blockquote,body:not(.pmp-fixed-epub-layout) p *,body:not(.pmp-fixed-epub-layout) li *,body:not(.pmp-fixed-epub-layout) td *,body:not(.pmp-fixed-epub-layout) th *,body:not(.pmp-fixed-epub-layout) blockquote *{font-size:20px!important;line-height:1.7!important}
      body:not(.pmp-fixed-epub-layout),body:not(.pmp-fixed-epub-layout) .body{width:100%!important;max-width:100%!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
      body:not(.pmp-fixed-epub-layout)>.body{display:block!important;width:100%!important}
      body:not(.pmp-fixed-epub-layout)>.body>div{display:block!important;width:100%!important}
    }
    img,svg,video,canvas,object,embed,table{box-sizing:border-box!important;max-width:100%!important;max-height:none!important}
    body:not(.pmp-fixed-epub-layout) h1,body:not(.pmp-fixed-epub-layout) h2,body:not(.pmp-fixed-epub-layout) h3,body:not(.pmp-fixed-epub-layout) h4,body:not(.pmp-fixed-epub-layout) h5,body:not(.pmp-fixed-epub-layout) h6,body:not(.pmp-fixed-epub-layout) p,body:not(.pmp-fixed-epub-layout) div,body:not(.pmp-fixed-epub-layout) section,body:not(.pmp-fixed-epub-layout) article,body:not(.pmp-fixed-epub-layout) blockquote,body:not(.pmp-fixed-epub-layout) pre{position:static!important;float:none!important;transform:none!important;column-count:1!important;text-indent:0!important}
    img,svg,video,canvas,object,embed{height:auto!important;position:relative!important;float:none!important;display:block!important;margin:.6em auto!important}
    body.pmp-fixed-epub-layout img{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;object-fit:fill!important}
    table{width:100%!important;table-layout:auto!important;border-collapse:collapse!important}
    @media(max-width:640px){
      body:not(.pmp-fixed-epub-layout),body:not(.pmp-fixed-epub-layout) .body{width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important;min-height:0!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
      body:not(.pmp-fixed-epub-layout)>.body{display:block!important;width:100%!important}
      body:not(.pmp-fixed-epub-layout)>.body,body:not(.pmp-fixed-epub-layout)>.body *:not(img):not(span:has(>img)){position:static!important;inset:auto!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;width:auto!important;max-width:100%!important;height:auto!important;min-height:0!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;float:none!important;transform:none!important}
      body:not(.pmp-fixed-epub-layout)>.body{position:relative!important}
      body:not(.pmp-fixed-epub-layout)>.body>div{display:block!important;width:100%!important}
      body:not(.pmp-fixed-epub-layout)>.body span:has(>img){display:block!important;position:static!important;inset:auto!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;width:auto!important;max-width:100%!important;height:auto!important;min-height:0!important;white-space:normal!important;float:none!important;transform:none!important}
      body:not(.pmp-fixed-epub-layout)>.body span:has(>img)>img{width:auto!important;height:auto!important;max-width:100%!important;max-height:none!important;object-fit:contain!important}
    }
  `;
  doc.head.appendChild(style);
}

function applyEpubViewMode(doc: Document, mode: PageViewType) {
  if (!doc.head) return;
  let style = doc.getElementById("pmp-epub-view-mode-style") as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = "pmp-epub-view-mode-style";
    doc.head.appendChild(style);
  }

  const theme = {
    Normal: { background: "#ffffff", color: "#111827", link: "#1d4ed8", lineHeight: "1.55", padding: ".5em 12px 1.5em", filter: "none", overlay: "none" },
    Crop: { background: "#ffffff", color: "#111827", link: "#1d4ed8", lineHeight: "1.55", padding: "0 2px .5em", filter: "none", overlay: "none" },
    Dark: { background: "#0b1016", color: "#d6dce6", link: "#93c5fd", lineHeight: "1.55", padding: ".5em 12px 1.5em", filter: "brightness(0.96) contrast(1.08) saturate(0.72) sepia(0.12) hue-rotate(-8deg)", overlay: "linear-gradient(180deg, rgba(12, 16, 22, 0.08), rgba(12, 16, 22, 0.26))" },
    Night: { background: "#34383b", color: "#d6dce6", link: "#a9c9ef", lineHeight: "1.55", padding: ".5em 12px 1.5em", filter: "brightness(0.96) contrast(1.04) saturate(0.88) sepia(0.03)", overlay: "linear-gradient(180deg, rgba(11, 15, 22, 0.03), rgba(11, 15, 22, 0.08))" },
    Sepia: { background: "#f0e4cc", color: "#43352a", link: "#795329", lineHeight: "1.65", padding: ".5em 12px 1.5em", filter: "none", overlay: "none" },
    Comfort: { background: "#efe5d9", color: "#44382f", link: "#795b3e", lineHeight: "1.8", padding: ".6em 14px 1.6em", filter: "none", overlay: "none" },
  }[mode as "Normal" | "Crop" | "Dark" | "Night" | "Sepia" | "Comfort"] ?? {
    background: "#ffffff",
    color: "#111827",
    link: "#1d4ed8",
    lineHeight: "1.55",
    padding: ".5em 12px 1.5em",
    filter: "none",
    overlay: "none",
  };
  style.textContent = `
    html,body{background:${theme.background}!important;color:${theme.color}!important}
    body{padding:${theme.padding}!important;line-height:${theme.lineHeight}!important;filter:${theme.filter ?? "none"}!important}
    body::after{content:"";position:fixed;inset:0;z-index:2147483647;pointer-events:none;background:${theme.overlay}}
    body *:not(img):not(svg):not(canvas):not(video){color:inherit!important;background-color:transparent!important}
    a,a *{color:${theme.link}!important}
  `;
}

function isNarrowEpubViewport() {
  if (typeof window === "undefined") return true;
  return window.innerWidth <= 640 || Math.min(window.innerWidth, window.innerHeight) <= 640;
}

interface CourseEpubStepProps {
  step: CourseStep;
  bookName: string;
  chapterName: string;
  chapterNumber: number;
  pageType: string;
  pageIndex: number;
  totalPages: number;
  pageBrief: string;
  bookHtmlFolder?: string | null;
  category?: string | null;
  pageViewType?: PageViewType | null;
  courseId?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onNavigateToPage?: (pageIndex: number) => void;
  canPrevious?: boolean;
  canNext?: boolean;
  bookId?: string | null;
  stepIndex?: number;
  bookmarked?: boolean;
  bookmarks?: BookBookmark[];
  onToggleBookmark?: () => void;
  onRemoveBookmark?: (bookmarkId: string) => void;
  onJumpToBookmark?: (stepIndex: number) => void;
}

export default function CourseEpubStep({
  step,
  bookName,
  chapterName,
  chapterNumber,
  pageType,
  pageIndex,
  totalPages,
  pageBrief,
  category,
  pageViewType: pageViewTypeProp,
  onPrevious,
  onNext,
  onNavigateToPage,
  canPrevious = false,
  canNext = false,
  bookId,
  stepIndex,
  bookmarked,
  bookmarks,
  onToggleBookmark,
  onRemoveBookmark,
  onJumpToBookmark,
}: CourseEpubStepProps) {
  const baseConfiguredView = pageViewTypeProp &&
    pageViewTypeProp !== "NormalView" &&
    pageViewTypeProp !== "ComicView" &&
    pageViewTypeProp !== "Auto"
    ? normalizePageViewType(pageViewTypeProp)
    : defaultPdfViewForCategory(category);
  const [narrowViewport, setNarrowViewport] = useState(isNarrowEpubViewport);
  const configuredView = narrowViewport && baseConfiguredView === "ComicView"
    ? "Crop"
    : ["Normal", "Crop"].includes(baseConfiguredView)
      ? narrowViewport ? "Crop" : "Normal"
      : baseConfiguredView;
  const [activeView, setActiveView] = useState<PageViewType>(configuredView);
  const [comicSpreadSide, setComicSpreadSide] = useState<"left" | "right">("left");
  const [comicSpreadSides, setComicSpreadSides] = useState<Array<"left" | "right">>(["left"]);
  const viewerId = useId().replace(/:/g, "");
  const epubSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, location } = useMemo(() => {
    const raw = epubSource;
    const isUrl = Boolean(raw && (raw.startsWith("/") || /^https?:\/\//i.test(raw)));
    const file = resolveEpubFileUrl(isUrl ? raw : "", category);
    const loc = extractEpubLocation(isUrl ? raw : "");
    if (!isUrl || !file) {
      return { fileUrl: "", location: null as string | null };
    }
    return { fileUrl: file, location: loc };
  }, [category, epubSource]);
  const nextLocation = step.epubNextLocation ?? null;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<EpubRendition | null>(null);
  const displayLocationRef = useRef<((target: string) => Promise<void>) | null>(null);
  const displayedLocationRef = useRef<string | null>(null);
  const locationRef = useRef<string | null>(location);
  const nextLocationRef = useRef<string | null>(nextLocation);
  const epubImageIndexRef = useRef<number | undefined>(step.epubImageIndex);
  const activeViewRef = useRef<PageViewType>(activeView);
  const comicSpreadSideRef = useRef<"left" | "right">(comicSpreadSide);
  const comicSpreadSidesRef = useRef<Array<"left" | "right">>(comicSpreadSides);
  const stepStartSideRef = useRef<"left" | "right">("left");
  const [viewerReady, setViewerReady] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dictionarySelection, setDictionarySelection] = useState<string | null>(null);
  const [dictionaryMode, setDictionaryMode] = useState(false);
  const dictionaryModeRef = useRef(false);

  locationRef.current = location;
  nextLocationRef.current = nextLocation;
  epubImageIndexRef.current = step.epubImageIndex;
  activeViewRef.current = activeView;
  comicSpreadSideRef.current = comicSpreadSide;
  comicSpreadSidesRef.current = comicSpreadSides;
  dictionaryModeRef.current = dictionaryMode;
  const isComicBook = /\bcomic\b/i.test(category ?? "");

  useEffect(() => {
    setComicSpreadSide("left");
  }, [fileUrl]);

  useEffect(() => {
    setComicSpreadSide(stepStartSideRef.current);
    stepStartSideRef.current = "left";
  }, [location, pageIndex]);

  const applyPagePresentation = (doc: Document, fragment: string) => {
    styleEpubContents(doc, activeViewRef.current, () => viewerRef.current?.clientWidth ?? 0);
    applyEpubViewMode(doc, activeViewRef.current);
    applyChapterIsolation(doc, fragment, locationFragment(nextLocationRef.current), epubImageIndexRef.current);
    const layout = isComicBook ? applyComicSpreadPage(
      doc,
      comicSpreadSideRef.current,
      () => viewerRef.current?.clientWidth ?? 0,
      () => viewerRef.current?.parentElement?.clientHeight ?? 0,
    ) : null;
    if (layout) {
      setComicSpreadSides(layout.sides);
      if (layout.activeSide !== comicSpreadSideRef.current) setComicSpreadSide(layout.activeSide);
    } else {
      setComicSpreadSides(["left"]);
    }
  };

  useEffect(() => {
    if (!contentLoading) {
      setShowLoadingIndicator(false);
      return;
    }
    const timeoutId = window.setTimeout(
      () => setShowLoadingIndicator(true),
      EPUB_LOADING_INDICATOR_DELAY_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [contentLoading, pageIndex]);

  useEffect(() => {
    const updateViewportMode = () => setNarrowViewport(isNarrowEpubViewport());
    window.addEventListener("resize", updateViewportMode);
    window.addEventListener("orientationchange", updateViewportMode);
    return () => {
      window.removeEventListener("resize", updateViewportMode);
      window.removeEventListener("orientationchange", updateViewportMode);
    };
  }, []);

  useEffect(() => {
    setActiveView(configuredView);
  }, [configuredView]);

  useEffect(() => {
    if (!fileUrl) return;

    setLoadError(null);
    setViewerReady(false);
    setContentLoading(true);
    displayedLocationRef.current = null;
    let active = true;
    viewerRef.current?.replaceChildren();

    void (async () => {
      try {
        const createEpub = await loadEpubLibrary();
        if (!active || !viewerRef.current) return;

        const epubBuffer = await getEpubBuffer(fileUrl);
        if (!active || !viewerRef.current) return;
        const book = createEpub(new Uint8Array(epubBuffer), { storage: false });
        bookRef.current = book;
        if (book.ready) await book.ready;
        if (!active || !viewerRef.current) return;

        const rendition = book.renderTo(viewerId, {
          width: "100%",
          height: "100%",
          flow: "scrolled-doc",
          layout: narrowViewport ? "reflowable" : book.packaging?.metadata?.layout || "reflowable",
          spread: "none",
        });
        renditionRef.current = rendition;

        const shortSide = Math.min(window.innerWidth || 400, window.innerHeight || 700);
        rendition.themes?.fontSize?.(shortSide <= 430 ? "118%" : shortSide <= 768 ? "110%" : "100%");
        rendition.themes?.default?.({
          html: { margin: "0 !important", padding: "0 !important", width: "100% !important", "max-width": "none !important" },
          body: { margin: "0 !important", padding: "0.5em 10px 1.25em !important", "box-sizing": "border-box !important", "line-height": "1.55 !important" },
          img: { "max-width": "100% !important", height: "auto !important" },
        });

        const contentsList = () => {
          const contents = rendition.getContents?.();
          return Array.isArray(contents) ? contents : contents ? [contents] : [];
        };
        const applyContents = (fragment: string) => {
          const documents = new Set<Document>();
          for (const contents of contentsList()) {
            if (contents.document) documents.add(contents.document);
          }
          const contentDocument = viewerRef.current?.querySelector("iframe")?.contentDocument;
          if (contentDocument) documents.add(contentDocument);
          for (const doc of documents) {
            removeObjectReplacementCharacters(doc);
            applyPagePresentation(doc, fragment);
          }
        };

        const handleDictionaryInteraction = (doc: Document, event: MouseEvent | TouchEvent) => {
          if (!dictionaryModeRef.current) return;
          const selection = doc.getSelection();
          const selectedText = selection?.toString().trim();
          if (selectedText) {
            setDictionarySelection(selectedText);
            return;
          }
          if (event.type !== "click") return;
          const point = "touches" in event ? event.touches[0] : event;
          if (!point) return;
          const caretDoc = doc as Document & {
            caretRangeFromPoint?: (x: number, y: number) => Range | null;
            caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
          };
          let range = caretDoc.caretRangeFromPoint?.(point.clientX, point.clientY) ?? null;
          if (!range) {
            const position = caretDoc.caretPositionFromPoint?.(point.clientX, point.clientY);
            if (position) {
              range = doc.createRange();
              range.setStart(position.offsetNode, position.offset);
              range.collapse(true);
            }
          }
          const node = range?.startContainer;
          if (!node || node.nodeType !== Node.TEXT_NODE) return;
          const text = node.textContent ?? "";
          const offset = range?.startOffset ?? 0;
          const wordPattern = /[\p{L}\p{N}'’-]/u;
          let start = Math.min(offset, text.length);
          let end = start;
          while (start > 0 && wordPattern.test(text[start - 1])) start -= 1;
          while (end < text.length && wordPattern.test(text[end])) end += 1;
          if (start === end) return;
          const wordRange = doc.createRange();
          wordRange.setStart(node, start);
          wordRange.setEnd(node, end);
          selection?.removeAllRanges();
          selection?.addRange(wordRange);
          setDictionarySelection(wordRange.toString().trim());
        };

        const bindDictionarySelection = (doc: Document) => {
          if ((doc as Document & { __pmpDictionaryBound?: boolean }).__pmpDictionaryBound) return;
          doc.addEventListener("selectionchange", () => {
            if (!dictionaryModeRef.current) return;
            const selected = doc.getSelection()?.toString().trim();
            if (selected) setDictionarySelection(selected);
          });
          doc.addEventListener("mouseup", (event) => handleDictionaryInteraction(doc, event));
          doc.addEventListener("touchend", (event) => handleDictionaryInteraction(doc, event), { passive: true });
          doc.addEventListener("click", (event) => handleDictionaryInteraction(doc, event));
          (doc as Document & { __pmpDictionaryBound?: boolean }).__pmpDictionaryBound = true;
        };

        rendition.hooks?.content?.register((contents) => {
          if (!contents.document) return;
          const doc = contents.document;
          doc.defaultView?.requestAnimationFrame(() => {
            removeObjectReplacementCharacters(doc);
            applyPagePresentation(doc, locationFragment(locationRef.current));
            bindDictionarySelection(doc);
            bindDictionarySelection(doc);
          });
        });

        let displaySequence = 0;
        const displayLocation = (target: string) => {
          if (displayedLocationRef.current === target) return Promise.resolve();
          displayedLocationRef.current = target;
          setContentLoading(true);
          const sequence = ++displaySequence;
          for (const contents of contentsList()) {
            if (contents.document) clearChapterIsolation(contents.document);
          }
          return rendition.display(target).then(() => {
            if (!active || sequence !== displaySequence) return;
            applyContents(locationFragment(target));
            window.requestAnimationFrame(() => {
              if (active && sequence === displaySequence) applyContents(locationFragment(target));
            });
            window.setTimeout(() => {
              if (active && sequence === displaySequence) {
                rendition.resize?.();
                window.requestAnimationFrame(() => {
                  if (active && sequence === displaySequence) {
                    applyContents(locationFragment(target));
                  }
                });
              }
            }, 200);
          }).finally(() => {
            if (active && sequence === displaySequence) setContentLoading(false);
          });
        };
        displayLocationRef.current = displayLocation;

        const initialLocation = locationRef.current;
        const initialDisplay = initialLocation ? displayLocation(initialLocation) : rendition.display();
        if (!initialLocation) {
          void initialDisplay.then(() => {
            if (active) {
              applyContents("");
              setContentLoading(false);
            }
          }).catch((err) => {
            if (active) {
              setContentLoading(false);
              setLoadError(err instanceof Error ? err.message : "Unable to display EPUB page.");
            }
          });
        }
        window.requestAnimationFrame(() => {
          iframeRef.current = viewerRef.current?.querySelector("iframe") ?? null;
        });
        setViewerReady(true);
        void initialDisplay.catch((err) => {
          if (active) setLoadError(err instanceof Error ? err.message : "Unable to display EPUB chapter.");
        });
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : "Failed to load EPUB.");
      }
    })();

    return () => {
      active = false;
      displayLocationRef.current = null;
      iframeRef.current = null;
      renditionRef.current?.destroy?.();
      bookRef.current?.destroy?.();
      renditionRef.current = null;
      bookRef.current = null;
    };
  }, [fileUrl, narrowViewport, viewerId]);

  useEffect(() => {
    if (!location || !viewerReady) return;
    void displayLocationRef.current?.(location).catch((err) => {
      setLoadError(err instanceof Error ? err.message : "Unable to display EPUB chapter.");
    });
  }, [location, viewerReady, pageIndex]);

  useEffect(() => {
    if (!viewerReady) return;
    const documents = new Set<Document>();
    const contents = renditionRef.current?.getContents?.();
    for (const content of Array.isArray(contents) ? contents : contents ? [contents] : []) {
      if (content.document) documents.add(content.document);
    }
    const contentDocument = viewerRef.current?.querySelector("iframe")?.contentDocument;
    if (contentDocument) documents.add(contentDocument);
    for (const doc of documents) {
      applyPagePresentation(doc, locationFragment(location));
    }
  }, [activeView, comicSpreadSide, isComicBook, location, nextLocation, step.epubImageIndex, viewerReady]);

  const handlePreviousPage = () => {
    const sides = comicSpreadSidesRef.current;
    const sideIndex = sides.indexOf(comicSpreadSideRef.current);
    if (sideIndex > 0) {
      setComicSpreadSide(sides[sideIndex - 1]);
      return;
    }
    stepStartSideRef.current = "right";
    onPrevious?.();
  };

  const handleNextPage = () => {
    const sides = comicSpreadSidesRef.current;
    const sideIndex = sides.indexOf(comicSpreadSideRef.current);
    if (sideIndex >= 0 && sideIndex < sides.length - 1) {
      setComicSpreadSide(sides[sideIndex + 1]);
      return;
    }
    stepStartSideRef.current = "left";
    setComicSpreadSide("left");
    onNext?.();
  };

  const handleNavigateToPage = (targetStepIndex: number) => {
    stepStartSideRef.current = "left";
    setComicSpreadSide("left");
    onNavigateToPage?.(targetStepIndex);
  };

  const handleJumpToBookmark = (targetStepIndex: number) => {
    stepStartSideRef.current = "left";
    setComicSpreadSide("left");
    onJumpToBookmark?.(targetStepIndex);
  };

  return (
    <PracticeWorkspace
      bookName={bookName}
      chapterName={chapterName}
      chapterNumber={chapterNumber}
      pageType={pageType}
      pageIndex={pageIndex}
      totalPages={totalPages}
      title={step.title}
      pageBrief=""
      onPrevious={handlePreviousPage}
      onNext={handleNextPage}
      onNavigateToPage={handleNavigateToPage}
      canPrevious={canPrevious || comicSpreadSides.indexOf(comicSpreadSide) > 0}
      canNext={canNext || comicSpreadSides.indexOf(comicSpreadSide) >= 0 && comicSpreadSides.indexOf(comicSpreadSide) < comicSpreadSides.length - 1}
      loadError={loadError ?? undefined}
      contentIframeRef={iframeRef}
      contentIframeBindKey={viewerReady ? fileUrl : null}
      bookId={bookId}
      stepIndex={typeof stepIndex === "number" ? stepIndex : Math.max(0, pageIndex - 2)}
      stepTitle={step.title}
      bookmarked={bookmarked}
      bookmarks={bookmarks}
      onToggleBookmark={onToggleBookmark}
      onRemoveBookmark={onRemoveBookmark}
      onJumpToBookmark={handleJumpToBookmark}
      viewMode={activeView}
      onViewModeChange={setActiveView}
      dictionarySelection={dictionarySelection}
      onDictionaryModeChange={(enabled) => {
        setDictionaryMode(enabled);
        dictionaryModeRef.current = enabled;
        if (!enabled) setDictionarySelection(null);
      }}
    >
      {fileUrl ? (
        <div className="practice-epub-frame-wrap">
          <div
            id={viewerId}
            ref={viewerRef}
            className="practice-html-iframe practice-epub-iframe"
            aria-label={step.title}
          />
          {showLoadingIndicator && contentLoading && !loadError ? (
            <div className="pdf-fun-loader-overlay">
              <PdfFunLoader label="Opening your book…" />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="practice-error-message">
          <pre>No EPUB source is available for this page.</pre>
        </div>
      )}
    </PracticeWorkspace>
  );
}
