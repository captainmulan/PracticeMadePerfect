import { useRef } from "react";
import type { CourseStep } from "../data/courses";
import PracticeWorkspace from "./PracticeWorkspace";
import type { BookBookmark } from "../services/types/account";
import { buildHtmlStepSrcDoc, extractBookHtmlIframeSrc, resolveBookHtmlFolder } from "../utils/htmlStepContent";
import "../styles/course.css";

interface CourseHtmlStepProps {
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

export default function CourseHtmlStep({
  step,
  bookName,
  chapterName,
  chapterNumber,
  pageType,
  pageIndex,
  totalPages,
  pageBrief,
  bookHtmlFolder,
  courseId,
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
}: CourseHtmlStepProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const contentHtml = step.contentHtml ?? "<p><em>No lesson content yet.</em></p>";
  const frameSrc = extractBookHtmlIframeSrc(contentHtml);
  const resolvedFolder = resolveBookHtmlFolder({
    bookHtmlFolder,
    courseId,
    contentHtml,
  });
  const srcDoc = frameSrc
    ? undefined
    : buildHtmlStepSrcDoc(contentHtml, resolvedFolder);

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
      contentIframeRef={iframeRef}
      contentIframeBindKey={step.id}
      bookId={bookId}
      stepIndex={pageIndex - 1}
      stepTitle={step.title}
      bookmarked={bookmarked}
      bookmarks={bookmarks}
      onToggleBookmark={onToggleBookmark}
      onRemoveBookmark={onRemoveBookmark}
      onJumpToBookmark={onJumpToBookmark}
    >
      <iframe
        ref={iframeRef}
        key={frameSrc ?? `${step.id}-${(step.contentHtml ?? "").length}`}
        title={step.title}
        className="practice-html-iframe"
        sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-popups"
        allow="autoplay; encrypted-media"
        src={frameSrc ?? undefined}
        srcDoc={srcDoc}
        loading="lazy"
      />
    </PracticeWorkspace>
  );
}
