import { useEffect, useMemo, useRef, useState } from "react";
import type { CourseStep } from "../data/courses";
import type { BookBookmark } from "../services/types/account";
import PracticeWorkspace from "./PracticeWorkspace";
import { extractEpubLocation, getEpubBuffer, normalizeEpubFileUrl } from "../utils/epubCache";
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
  const epubSource = step.contentHtml?.trim() ?? "";
  const { fileUrl, location, viewerSrc } = useMemo(() => {
    const raw = epubSource;
    const isUrl = Boolean(raw && (raw.startsWith("/") || /^https?:\/\//i.test(raw)));
    const file = normalizeEpubFileUrl(isUrl ? raw : "");
    const loc = extractEpubLocation(isUrl ? raw : "");
    if (!isUrl || !file) {
      return { fileUrl: "", location: null as string | null, viewerSrc: null as string | null };
    }
    /*
      Keep iframe src stable (file only). Putting chapter location in the query
      reloads the viewer on every arrow click and races a stale load-buffer.
      Chapter changes go through postMessage goto-location instead.
    */
    const qs = new URLSearchParams({ file, v: "epad2" });
    return {
      fileUrl: file,
      location: loc,
      viewerSrc: `/epub-viewer.html?${qs.toString()}`,
    };
  }, [epubSource]);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const locationRef = useRef<string | null>(location);
  const [bufferReady, setBufferReady] = useState<"idle" | "loading" | "ready">("idle");
  const [viewerReady, setViewerReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileKeyRef = useRef(fileUrl);

  locationRef.current = location;

  const postToViewer = (payload: Record<string, unknown>) => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return false;
    try {
      frame.contentWindow.postMessage({ target: "epub-viewer", ...payload }, "*");
      return true;
    } catch {
      return false;
    }
  };

  const gotoCurrentLocation = () => {
    const loc = locationRef.current;
    if (!loc) return;
    postToViewer({ type: "goto-location", location: loc });
  };

  /* Load EPUB buffer once per file; always send the latest chapter from locationRef. */
  useEffect(() => {
    fileKeyRef.current = fileUrl;
    const myKey = fileUrl;
    if (!fileUrl) return;

    setLoadError(null);
    setBufferReady("loading");
    setViewerReady(false);

    let active = true;
    const bufferPromise = getEpubBuffer(fileUrl);

    const sendBuffer = (buffer: ArrayBuffer) => {
      postToViewer({
        type: "load-buffer",
        url: fileUrl,
        location: locationRef.current,
        buffer: buffer.slice(0),
      });
    };

    bufferPromise
      .then((buffer) => {
        if (!active || fileKeyRef.current !== myKey) return;
        setBufferReady("ready");
        const frame = iframeRef.current as (HTMLIFrameElement & { _ready?: boolean; _pendingBuffer?: ArrayBuffer }) | null;
        if (frame) frame._pendingBuffer = buffer.slice(0);
        if (frame?._ready) sendBuffer(buffer);
      })
      .catch((err) => {
        if (!active || fileKeyRef.current !== myKey) return;
        setBufferReady("idle");
        setLoadError(err instanceof Error ? err.message : "Failed to fetch EPUB.");
      });

    const onIframeLoad = () => {
      if (!active || fileKeyRef.current !== myKey) return;
      const frame = iframeRef.current as (HTMLIFrameElement & { _ready?: boolean; _pendingBuffer?: ArrayBuffer }) | null;
      if (!frame) return;
      frame._ready = true;
      setViewerReady(false);
      const pending = frame._pendingBuffer;
      if (pending) {
        sendBuffer(pending);
        return;
      }
      bufferPromise
        .then((buffer) => {
          if (!active || fileKeyRef.current !== myKey) return;
          if (frame._ready) sendBuffer(buffer);
        })
        .catch(() => {
          /* handled above */
        });
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data && typeof event.data === "object" ? event.data : null;
      if (!data || data.type !== "epub-viewer:ready") return;
      if (typeof data.url === "string" && normalizeEpubFileUrl(data.url) !== fileUrl) return;
      if (!active || fileKeyRef.current !== myKey) return;
      setViewerReady(true);
      gotoCurrentLocation();
    };

    iframeRef.current?.addEventListener("load", onIframeLoad);
    window.addEventListener("message", onMessage);

    return () => {
      active = false;
      iframeRef.current?.removeEventListener("load", onIframeLoad);
      window.removeEventListener("message", onMessage);
    };
  }, [fileUrl]);

  /* Arrow / page changes: jump chapter without reloading the iframe. */
  useEffect(() => {
    if (bufferReady !== "ready" || !viewerReady) return;
    gotoCurrentLocation();
  }, [location, bufferReady, viewerReady, pageIndex]);

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
      contentIframeBindKey={fileUrl}
      bookId={bookId}
      stepIndex={typeof stepIndex === "number" ? stepIndex : Math.max(0, pageIndex - 2)}
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
        />
      ) : (
        <div className="practice-error-message">
          <pre>No EPUB source is available for this page.</pre>
        </div>
      )}
    </PracticeWorkspace>
  );
}
