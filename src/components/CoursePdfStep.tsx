import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { extractPdfPageNumber, getPdfBuffer, resolvePdfStepFileUrl } from "../utils/pdfCache";
import "../styles/course.css";

const PDF_ZOOM_STORAGE_KEY = "pmp-pdf-page-zoom";
const PDF_ZOOM_LEVELS = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190];
const DESKTOP_PDF_ZOOM = 100;
const MOBILE_PDF_ZOOM = 100;

function isMobilePdfViewport(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isIOS || window.matchMedia("(max-width: 767px)").matches;
}

function snapPdfZoom(value: number): number {
  return PDF_ZOOM_LEVELS.reduce((best, level) =>
    Math.abs(level - value) < Math.abs(best - value) ? level : best,
  );
}

function readStoredPdfZoom(): number {
  const fallback = isMobilePdfViewport() ? MOBILE_PDF_ZOOM : DESKTOP_PDF_ZOOM;
  try {
    const raw = Number(localStorage.getItem(PDF_ZOOM_STORAGE_KEY));
    if (Number.isFinite(raw) && raw >= 50 && raw <= 300) {
      return snapPdfZoom(raw);
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

interface CoursePdfStepProps {
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

export default function CoursePdfStep({
  step,
  bookName,
  chapterName,
  chapterNumber,
  pageType,
  pageIndex,
  totalPages,
  pageBrief,
  bookHtmlFolder,
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
}: CoursePdfStepProps) {
  const pdfSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, pageNumber, viewerSrc } = useMemo(() => {
    const file = resolvePdfStepFileUrl(pdfSource, bookHtmlFolder);
    const hasPageHint = /(?:#|\?)page=\d+/i.test(pdfSource);
    const page = hasPageHint
      ? extractPdfPageNumber(pdfSource)
      : Math.max(1, (typeof step.stepIndex === "number" ? step.stepIndex : 0) + 1);
    const src = file ? `/pdf-viewer.html?file=${encodeURIComponent(file)}&page=${page}` : null;
    return { fileUrl: file, pageNumber: page, viewerSrc: src };
  }, [bookHtmlFolder, pdfSource, step.stepIndex]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [bufferReady, setBufferReady] = useState<"idle" | "loading" | "ready">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageZoom, setPageZoom] = useState(readStoredPdfZoom);
  const keyRef = useRef(`${fileUrl}::${pageIndex}`);

  useEffect(() => {
    keyRef.current = `${fileUrl}::${pageIndex}`;
    const myKey = keyRef.current;
    if (!fileUrl) return;

    setLoadError(null);

    const sendToIframe = (buffer?: ArrayBuffer) => {
      const frame = iframeRef.current;
      if (!frame || !frame.contentWindow) return;
      try {
        const ua = navigator.userAgent || "";
        const isIOS =
          /iPad|iPhone|iPod/.test(ua) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const payload: { target: "pdf-viewer"; type: "load-buffer"; url: string; buffer?: ArrayBuffer } = {
          target: "pdf-viewer",
          type: "load-buffer",
          url: fileUrl,
        };
        /* Avoid cloning a large ArrayBuffer into the iframe on iOS — Safari OOMs
           on books like Richest Man in Babylon. The viewer fetches the URL instead. */
        if (buffer && !isIOS) payload.buffer = buffer.slice(0);
        frame.contentWindow.postMessage(payload, window.location.origin);
      } catch {
        /* ignore cross-origin sandbox errors */
      }
    };

    // Start loading the buffer immediately.
    // getPdfBuffer() handles the 3-level cache internally:
    //   1. In-memory (fastest)
    //   2. IndexedDB (persists across reloads)
    //   3. Network (only on miss)
    setBufferReady("loading");
    let active = true;
    const bufferPromise = getPdfBuffer(fileUrl);

    bufferPromise
      .then((buffer) => {
        if (!active || keyRef.current !== myKey) return;
        setBufferReady("ready");
        // If iframe is already loaded, send now. Otherwise send in the iframe onload handler.
        const frame = iframeRef.current;
        if (frame?.contentWindow && (frame as any)._ready) {
          sendToIframe(buffer);
        }
        if (iframeRef.current) {
          (iframeRef.current as any)._pendingBuffer = buffer;
        }
      })
      .catch((err) => {
        if (!active || keyRef.current !== myKey) return;
        setBufferReady("idle");
        setLoadError(err instanceof Error ? err.message : "Failed to fetch PDF.");
      });

    const onIframeLoad = () => {
      if (!active || keyRef.current !== myKey) return;
      const frame = iframeRef.current;
      if (!frame) return;
      (frame as any)._ready = true;
      // Check if buffer is already ready (stored on iframe ref as pending)
      const pending = (frame as any)._pendingBuffer as ArrayBuffer | undefined;
      if (pending) {
        sendToIframe(pending);
        return;
      }
      // Otherwise wait for bufferPromise to resolve (it'll send via the .then handler above)
      bufferPromise.then((buffer) => {
        if (!active || keyRef.current !== myKey) return;
        if ((frame as any)._ready) sendToIframe(buffer);
      }).catch(() => {
        /* already handled above */
      });
    };

    iframeRef.current?.addEventListener("load", onIframeLoad);

    return () => {
      active = false;
      iframeRef.current?.removeEventListener("load", onIframeLoad);
    };
  }, [fileUrl, pageIndex]);

  const sendZoom = useCallback((zoom: number) => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { target: "pdf-viewer", type: "set-zoom", zoom },
        window.location.origin,
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (bufferReady !== "ready") return;
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { target: "pdf-viewer", type: "goto-page", page: pageNumber },
        window.location.origin,
      );
      sendZoom(pageZoom);
    } catch {
      /* ignore */
    }
  }, [pageNumber, bufferReady, pageZoom, sendZoom]);

  const handlePageZoomChange = (zoom: number) => {
    setPageZoom(zoom);
    try {
      localStorage.setItem(PDF_ZOOM_STORAGE_KEY, String(zoom));
    } catch {
      /* ignore */
    }
    sendZoom(zoom);
  };

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
      contentIframeBindKey={viewerSrc}
      bookId={bookId}
      stepIndex={typeof stepIndex === "number" ? stepIndex : Math.max(0, pageIndex - 2)}
      stepTitle={step.title}
      bookmarked={bookmarked}
      bookmarks={bookmarks}
      onToggleBookmark={onToggleBookmark}
      onRemoveBookmark={onRemoveBookmark}
      onJumpToBookmark={onJumpToBookmark}
      pageZoom={pageZoom}
      pageZoomLevels={PDF_ZOOM_LEVELS}
      onPageZoomChange={handlePageZoomChange}
    >
      {viewerSrc ? (
        <iframe
          ref={iframeRef}
          title={step.title}
          className="practice-html-iframe practice-pdf-iframe"
          src={viewerSrc}
          loading="lazy"
        />
      ) : (
        <div className="practice-error-message">
          <pre>No PDF source is available for this page.</pre>
        </div>
      )}
    </PracticeWorkspace>
  );
}
