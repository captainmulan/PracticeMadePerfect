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
import PdfFunLoader from "./PdfFunLoader";
import {
  extractPdfPageNumber,
  PDF_VIEWER_CACHE_BUST,
  resolvePdfStepFileUrl,
} from "../utils/pdfCache";
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
  isWarming?: boolean;
  onViewerReady?: () => void;
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
  isWarming = false,
  onViewerReady,
}: CoursePdfStepProps) {
  const configuredView = normalizePageViewType(pageViewTypeProp);
  const pdfSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, pageNumber, viewerBindKey } = useMemo(() => {
    const file = resolvePdfStepFileUrl(pdfSource, bookHtmlFolder);
    const hasPageHint = /(?:#|\?)page=\d+/i.test(pdfSource);
    const page = hasPageHint
      ? extractPdfPageNumber(pdfSource)
      : Math.max(1, (typeof step.stepIndex === "number" ? step.stepIndex : 0) + 1);
    const bindKey = file ? `${file}::${configuredView}` : null;
    return { fileUrl: file, pageNumber: page, viewerBindKey: bindKey };
  }, [bookHtmlFolder, pdfSource, step.stepIndex, configuredView]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [drawnPage, setDrawnPage] = useState<number | null>(null);
  const [loadError] = useState<string | null>(null);
  const [pageZoom, setPageZoom] = useState(() => initialZoomForView(configuredView));
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  useEffect(() => {
    setPageZoom(initialZoomForView(configuredView));
  }, [configuredView]);

  useEffect(() => {
    if (!fileUrl) {
      setViewerSrc(null);
      return;
    }
    setViewerReady(false);
    setDrawnPage(null);
    setViewerSrc(
      `/pdf-viewer.html?v=${PDF_VIEWER_CACHE_BUST}&file=${encodeURIComponent(fileUrl)}&page=${pageNumber}&zoom=${pageZoom}&view=${encodeURIComponent(configuredView)}&panel=0`,
    );
    // Keep one iframe per book; page turns use postMessage goto-page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, configuredView]);

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
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.type === "pdf-viewer:ready") {
        setViewerReady(true);
        onViewerReady?.();
        return;
      }
      if (data.type === "pdf-viewer:page-ready" && typeof data.page === "number") {
        setDrawnPage(data.page);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [fileUrl, onViewerReady]);

  const sendZoom = useCallback(
    (zoom: number) => {
      postToViewer({ type: "set-zoom", zoom });
    },
    [postToViewer],
  );

  useEffect(() => {
    if (!viewerReady) return;
    postToViewer({ type: "goto-page", page: pageNumber });
  }, [pageNumber, viewerReady, postToViewer]);

  useEffect(() => {
    if (!viewerReady) return;
    postToViewer({ type: "set-view", view: configuredView });
  }, [configuredView, viewerReady, postToViewer]);

  useEffect(() => {
    if (!viewerReady) return;
    sendZoom(pageZoom);
  }, [pageZoom, viewerReady, sendZoom]);

  useEffect(() => {
    if (!viewerReady || isWarming) return;
    postToViewer({ type: "reflow" });
  }, [isWarming, viewerReady, postToViewer]);

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
        <div className="practice-pdf-frame-wrap">
          <iframe
            ref={iframeRef}
            title={step.title}
            className="practice-html-iframe practice-pdf-iframe"
            src={viewerSrc}
            loading="eager"
          />
          {!isWarming && (!viewerReady || drawnPage !== pageNumber) ? (
            <div className="pdf-fun-loader-overlay">
              <PdfFunLoader label={viewerReady ? "Turning the page…" : "Opening your book…"} />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="practice-error-message">
          <pre>No PDF source is available for this page.</pre>
        </div>
      )}
    </PracticeWorkspace>
  );
}
