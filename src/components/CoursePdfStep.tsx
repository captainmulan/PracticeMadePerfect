import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import {
  defaultZoomForPageViewType,
  normalizePageViewType,
  PAGE_VIEW_TYPE_ZOOM,
  type PageViewType,
} from "../data/pageViewType";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { extractPdfPageNumber, getPdfBuffer, resolvePdfStepFileUrl } from "../utils/pdfCache";
import "../styles/course.css";

const PDF_ZOOM_STORAGE_KEY = "pmp-pdf-page-zoom-v11";
const PDF_ZOOM_LEVELS = Array.from({ length: 31 }, (_, i) => 100 + i * 5); // 100..250

function snapPdfZoom(value: number): number {
  return PDF_ZOOM_LEVELS.reduce((best, level) =>
    Math.abs(level - value) < Math.abs(best - value) ? level : best,
  );
}

function initialZoomForView(view: PageViewType): number {
  const preset = PAGE_VIEW_TYPE_ZOOM[view];
  if (typeof preset === "number") return snapPdfZoom(preset);
  try {
    const raw = Number(localStorage.getItem(PDF_ZOOM_STORAGE_KEY));
    if (Number.isFinite(raw) && raw >= 50 && raw <= 300) {
      return snapPdfZoom(raw);
    }
  } catch {
    /* ignore */
  }
  return defaultZoomForPageViewType(view);
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
  pageViewType?: PageViewType | null;
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
  pageViewType: pageViewTypeProp,
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
  const configuredView = normalizePageViewType(pageViewTypeProp);
  const pdfSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, pageNumber, viewerBindKey } = useMemo(() => {
    const file = resolvePdfStepFileUrl(pdfSource, bookHtmlFolder);
    const hasPageHint = /(?:#|\?)page=\d+/i.test(pdfSource);
    const page = hasPageHint
      ? extractPdfPageNumber(pdfSource)
      : Math.max(1, (typeof step.stepIndex === "number" ? step.stepIndex : 0) + 1);
    const bindKey = file ? `${file}::${page}::${configuredView}` : null;
    return { fileUrl: file, pageNumber: page, viewerBindKey: bindKey };
  }, [bookHtmlFolder, pdfSource, step.stepIndex, configuredView]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [bufferReady, setBufferReady] = useState<"idle" | "loading" | "ready">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageZoom, setPageZoom] = useState(() => initialZoomForView(configuredView));
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const keyRef = useRef(`${fileUrl}::${pageIndex}`);

  useEffect(() => {
    setPageZoom(initialZoomForView(configuredView));
  }, [configuredView]);

  useEffect(() => {
    if (!fileUrl) {
      setViewerSrc(null);
      return;
    }
    setViewerSrc(
      `/pdf-viewer.html?v=viewz3&file=${encodeURIComponent(fileUrl)}&page=${pageNumber}&zoom=${pageZoom}&view=${encodeURIComponent(configuredView)}&panel=0`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, pageNumber, configuredView]);

  const postToViewer = useCallback((payload: Record<string, unknown>) => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { target: "pdf-viewer", ...payload },
        window.location.origin,
      );
    } catch {
      /* ignore */
    }
  }, []);

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
        const payload: {
          target: "pdf-viewer";
          type: "load-buffer";
          url: string;
          buffer?: ArrayBuffer;
          view?: string;
          panel?: number;
        } = {
          target: "pdf-viewer",
          type: "load-buffer",
          url: fileUrl,
          view: configuredView,
          panel: 0,
        };
        if (buffer && !isIOS) payload.buffer = buffer.slice(0);
        frame.contentWindow.postMessage(payload, window.location.origin);
      } catch {
        /* ignore */
      }
    };

    setBufferReady("loading");
    let active = true;
    const bufferPromise = getPdfBuffer(fileUrl);

    bufferPromise
      .then((buffer) => {
        if (!active || keyRef.current !== myKey) return;
        setBufferReady("ready");
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
      const pending = (frame as any)._pendingBuffer as ArrayBuffer | undefined;
      if (pending) {
        sendToIframe(pending);
        return;
      }
      bufferPromise
        .then((buffer) => {
          if (!active || keyRef.current !== myKey) return;
          if ((frame as any)._ready) sendToIframe(buffer);
        })
        .catch(() => {
          /* already handled */
        });
    };

    iframeRef.current?.addEventListener("load", onIframeLoad);

    return () => {
      active = false;
      iframeRef.current?.removeEventListener("load", onIframeLoad);
    };
  }, [fileUrl, pageIndex, configuredView]);

  const sendZoom = useCallback(
    (zoom: number) => {
      postToViewer({ type: "set-zoom", zoom });
    },
    [postToViewer],
  );

  useEffect(() => {
    if (bufferReady !== "ready") return;
    postToViewer({ type: "goto-page", page: pageNumber });
    postToViewer({ type: "set-view", view: configuredView });
    postToViewer({ type: "set-panel", panel: 0 });
    sendZoom(pageZoom);
  }, [pageNumber, bufferReady, pageZoom, configuredView, postToViewer, sendZoom]);

  const handlePageZoomChange = (zoom: number) => {
    setPageZoom(zoom);
    if (!PAGE_VIEW_TYPE_ZOOM[configuredView]) {
      try {
        localStorage.setItem(PDF_ZOOM_STORAGE_KEY, String(zoom));
      } catch {
        /* ignore */
      }
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
      contentIframeBindKey={viewerBindKey}
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
