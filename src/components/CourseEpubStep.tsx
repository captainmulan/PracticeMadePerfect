import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { extractEpubLocation, normalizeEpubFileUrl } from "../utils/epubCache";
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
  destroy?: () => void;
};

type EpubFactory = (source: string | Uint8Array, options?: Record<string, unknown>) => EpubBook;

let epubLibraryPromise: Promise<EpubFactory> | null = null;

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
  const hash = location?.indexOf("#") ?? -1;
  return hash < 0 ? "" : location!.slice(hash + 1);
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

function applyChapterIsolation(doc: Document, fragment: string) {
  if (!doc.body || !fragment) return;
  clearChapterIsolation(doc);
  const start = findChapterAnchor(doc, fragment);
  if (!start) return;

  const marker = /^(?:pgepubid|chap|chapter|part|sec|section)[-_]?\d*/i;
  const anchors = [...doc.querySelectorAll("[id], a[name]")];
  const startIndex = anchors.indexOf(start);
  const end = anchors.slice(startIndex + 1).find((element) => marker.test(element.id || element.getAttribute("name") || ""));
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
  start.scrollIntoView({ block: "start" });
  doc.documentElement.scrollTop = 0;
  doc.body.scrollTop = 0;
}

function styleEpubContents(doc: Document) {
  if (!doc.head || doc.getElementById("pmp-epub-reader-style")) return;
  const style = doc.createElement("style");
  style.id = "pmp-epub-reader-style";
  style.textContent = `
    html,body{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;overflow-x:hidden!important}
    body{padding:.5em 12px 1.5em!important;box-sizing:border-box!important;line-height:1.55!important}
    img,svg,video,canvas,object,embed,table{box-sizing:border-box!important;max-width:100%!important}
    h1,h2,h3,h4,h5,h6,p,div,section,article,blockquote,pre{position:static!important;float:none!important;transform:none!important;column-count:1!important;text-indent:0!important}
    img,svg,video,canvas,object,embed{height:auto!important;position:relative!important;float:none!important;display:block!important;margin:.6em auto!important}
    table{width:100%!important;table-layout:auto!important;border-collapse:collapse!important}
  `;
  doc.head.appendChild(style);
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
  courseId?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
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
  onPrevious,
  onNext,
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
  const viewerId = useId().replace(/:/g, "");
  const epubSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, location } = useMemo(() => {
    const raw = epubSource;
    const isUrl = Boolean(raw && (raw.startsWith("/") || /^https?:\/\//i.test(raw)));
    const file = normalizeEpubFileUrl(isUrl ? raw : "");
    const loc = extractEpubLocation(isUrl ? raw : "");
    if (!isUrl || !file) {
      return { fileUrl: "", location: null as string | null };
    }
    return { fileUrl: file, location: loc };
  }, [epubSource]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<EpubRendition | null>(null);
  const displayLocationRef = useRef<((target: string) => Promise<void>) | null>(null);
  const displayedLocationRef = useRef<string | null>(null);
  const locationRef = useRef<string | null>(location);
  const [viewerReady, setViewerReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  locationRef.current = location;

  useEffect(() => {
    if (!fileUrl) return;

    setLoadError(null);
    setViewerReady(false);
    displayedLocationRef.current = null;
    let active = true;
    viewerRef.current?.replaceChildren();

    void (async () => {
      try {
        const createEpub = await loadEpubLibrary();
        if (!active || !viewerRef.current) return;

        const book = createEpub(fileUrl, { storage: false });
        bookRef.current = book;
        if (book.ready) await book.ready;
        if (!active || !viewerRef.current) return;

        const rendition = book.renderTo(viewerId, {
          width: "100%",
          height: "100%",
          flow: "scrolled-doc",
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
            styleEpubContents(doc);
            applyChapterIsolation(doc, fragment);
          }
        };

        rendition.hooks?.content?.register((contents) => {
          if (!contents.document) return;
          const doc = contents.document;
          doc.defaultView?.requestAnimationFrame(() => {
            styleEpubContents(doc);
            applyChapterIsolation(doc, locationFragment(locationRef.current));
          });
        });

        let displaySequence = 0;
        const displayLocation = (target: string) => {
          if (displayedLocationRef.current === target) return Promise.resolve();
          displayedLocationRef.current = target;
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
              if (active && sequence === displaySequence) rendition.resize?.();
            }, 200);
          });
        };
        displayLocationRef.current = displayLocation;

        const initialLocation = locationRef.current;
        const initialDisplay = initialLocation ? displayLocation(initialLocation) : rendition.display();
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
  }, [fileUrl, viewerId]);

  useEffect(() => {
    if (!location || !viewerReady) return;
    void displayLocationRef.current?.(location).catch((err) => {
      setLoadError(err instanceof Error ? err.message : "Unable to display EPUB chapter.");
    });
  }, [location, viewerReady, pageIndex]);

  return (
    <PracticeWorkspace
      bookName={bookName}
      chapterName={chapterName}
      chapterNumber={chapterNumber}
      pageType={pageType}
      pageIndex={pageIndex}
      totalPages={totalPages}
      pageBrief={pageBrief}
      title={step.title}
      onPrevious={onPrevious}
      onNext={onNext}
      canPrevious={canPrevious}
      canNext={canNext}
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
      onJumpToBookmark={onJumpToBookmark}
    >
      {fileUrl ? (
        <div
          id={viewerId}
          ref={viewerRef}
          className="practice-html-iframe practice-pdf-iframe"
          aria-label={step.title}
        />
      ) : (
        <div className="practice-error-message">
          <pre>No EPUB source is available for this page.</pre>
        </div>
      )}
    </PracticeWorkspace>
  );
}
