import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { extractPdfPageNumber, getCachedPdfBuffer, getPdfBuffer, normalizePdfFileUrl } from "../utils/pdfCache";
import "../styles/course.css";

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
        const payload: { target: "pdf-viewer"; type: "load-buffer"; url: string; buffer?: ArrayBuffer } = {
          target: "pdf-viewer",
          type: "load-buffer",
          url: fileUrl,
        };
        if (buffer) payload.buffer = buffer.slice(0);
        frame.contentWindow.postMessage(payload, window.location.origin);
      } catch {
        /* ignore cross-origin sandbox errors */
      }
    };

    const cached = getCachedPdfBuffer(fileUrl);
    if (cached) {
      setBufferReady("ready");
      const frame = iframeRef.current;
      if (frame?.contentWindow) {
        sendToIframe(cached);
      } else {
        const onLoad = () => {
          if (keyRef.current !== myKey) return;
          sendToIframe(cached);
          frame?.removeEventListener("load", onLoad);
        };
        frame?.addEventListener("load", onLoad);
        return () => frame?.removeEventListener("load", onLoad);
      }
      return;
    }

    setBufferReady("loading");
    let active = true;
    getPdfBuffer(fileUrl)
      .then((buffer) => {
        if (!active || keyRef.current !== myKey) return;
        setBufferReady("ready");
        sendToIframe(buffer);
      })
      .catch((err) => {
        if (!active || keyRef.current !== myKey) return;
        setBufferReady("idle");
        setLoadError(err instanceof Error ? err.message : "Failed to fetch PDF.");
      });

    const onLoadFallback = () => {
      if (!active || keyRef.current !== myKey) return;
      const fallback = getCachedPdfBuffer(fileUrl);
      if (fallback) sendToIframe(fallback);
    };
    iframeRef.current?.addEventListener("load", onLoadFallback);

    return () => {
      active = false;
      iframeRef.current?.removeEventListener("load", onLoadFallback);
    };
  }, [fileUrl, pageIndex]);

  useEffect(() => {
    if (bufferReady !== "ready") return;
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    try {
      frame.contentWindow.postMessage(
        { target: "pdf-viewer", type: "goto-page", page: pageNumber },
        window.location.origin,
      );
    } catch {
      /* ignore */
    }
  }, [pageNumber, bufferReady]);

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
