import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { extractPdfPageNumber, getPdfBuffer, normalizePdfFileUrl } from "../utils/pdfCache";
import "../styles/course.css";

const PDF_ZOOM_STORAGE_KEY = "pmp-pdf-page-zoom";
const PDF_ZOOM_LEVELS = [90, 100, 125, 150, 175, 200];
const DEFAULT_PDF_ZOOM = 100;

function readStoredPdfZoom(): number {
  try {
    const raw = Number(localStorage.getItem(PDF_ZOOM_STORAGE_KEY));
    if (PDF_ZOOM_LEVELS.includes(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_PDF_ZOOM;
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
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
  bookId,
  bookmarked,
  bookmarks,
  onToggleBookmark,
  onRemoveBookmark,
  onJumpToBookmark,
}: CoursePdfStepProps) {
  const pdfSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, pageNumber, viewerSrc } = useMemo(() => {
    const raw = pdfSource;
    const isUrl = raw && (raw.startsWith("/") || /^https?:\/\//i.test(raw));
    const file = normalizePdfFileUrl(isUrl ? raw : "");
    const page = extractPdfPageNumber(raw);
    const src = isUrl ? `/pdf-viewer.html?file=${encodeURIComponent(raw)}` : null;
    return { fileUrl: file, pageNumber: page, viewerSrc: src };
  }, [pdfSource]);

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
      stepIndex={pageIndex - 1}
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
