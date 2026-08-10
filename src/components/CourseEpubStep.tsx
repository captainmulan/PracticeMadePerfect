import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { getEpubBuffer, normalizeEpubFileUrl } from "../utils/epubCache";
import "../styles/course.css";

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
  bookmarked,
  bookmarks,
  onToggleBookmark,
  onRemoveBookmark,
  onJumpToBookmark,
}: CourseEpubStepProps) {
  const epubSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, viewerSrc } = useMemo(() => {
    const raw = epubSource;
    const isUrl = raw && (raw.startsWith("/") || /^https?:\/\//i.test(raw));
    const file = normalizeEpubFileUrl(isUrl ? raw : "");
    const src = isUrl ? `/epub-viewer.html?file=${encodeURIComponent(raw)}` : null;
    return { fileUrl: file, viewerSrc: src };
  }, [epubSource]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [bufferReady, setBufferReady] = useState<"idle" | "loading" | "ready">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const keyRef = useRef(`${fileUrl}::${pageIndex}`);

  useEffect(() => {
    keyRef.current = `${fileUrl}::${pageIndex}`;
    const myKey = keyRef.current;
    if (!fileUrl) return;

    console.log("[CourseEpubStep] Loading EPUB:", fileUrl, "pageIndex:", pageIndex);
    setLoadError(null);

    const sendToIframe = (buffer?: ArrayBuffer) => {
      const frame = iframeRef.current;
      if (!frame || !frame.contentWindow) return;
      try {
        const payload: { target: "epub-viewer"; type: "load-buffer"; url: string; buffer?: ArrayBuffer } = {
          target: "epub-viewer",
          type: "load-buffer",
          url: fileUrl,
        };
        if (buffer) payload.buffer = buffer.slice(0);
        console.log("[CourseEpubStep] Sending buffer to iframe, size:", buffer?.byteLength);
        frame.contentWindow.postMessage(payload, window.location.origin);
      } catch (e) {
        console.error("[CourseEpubStep] Failed to send to iframe:", e);
      }
    };

    setBufferReady("loading");
    let active = true;
    const bufferPromise = getEpubBuffer(fileUrl);

    bufferPromise
      .then((buffer) => {
        if (!active || keyRef.current !== myKey) return;
        console.log("[CourseEpubStep] Buffer loaded, size:", buffer.byteLength);
        setBufferReady("ready");
        const frame = iframeRef.current;
        if (frame?.contentWindow && (frame as any)._ready) {
          sendToIframe(buffer);
        }
        if (iframeRef.current) {
          (iframeRef.current as any)._pendingBuffer = buffer.slice(0);
        }
      })
      .catch((err) => {
        if (!active || keyRef.current !== myKey) return;
        console.error("[CourseEpubStep] Buffer load error:", err);
        setBufferReady("idle");
        setLoadError(err instanceof Error ? err.message : "Failed to fetch EPUB.");
      });

    const onIframeLoad = () => {
      console.log("[CourseEpubStep] Iframe loaded");
      if (!active || keyRef.current !== myKey) return;
      const frame = iframeRef.current;
      if (!frame) return;
      (frame as any)._ready = true;
      const pending = (frame as any)._pendingBuffer as ArrayBuffer | undefined;
      if (pending) {
        console.log("[CourseEpubStep] Sending pending buffer");
        sendToIframe(pending);
        return;
      }
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
          <pre>No EPUB source is available for this page.</pre>
        </div>
      )}
    </PracticeWorkspace>
  );
}
