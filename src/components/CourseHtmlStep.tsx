import type { CourseStep } from "../data/courses";
import PracticeWorkspace from "./PracticeWorkspace";
import { buildHtmlStepSrcDoc, extractBookHtmlIframeSrc } from "../utils/htmlStepContent";
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
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
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
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
}: CourseHtmlStepProps) {
  const contentHtml = step.contentHtml ?? "<p><em>No lesson content yet.</em></p>";
  const frameSrc = extractBookHtmlIframeSrc(contentHtml);
  const srcDoc = frameSrc ? undefined : buildHtmlStepSrcDoc(contentHtml);

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
    >
      <iframe
        key={frameSrc ?? step.id}
        title={step.title}
        className="practice-html-iframe"
        sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-popups"
        src={frameSrc}
        srcDoc={srcDoc}
        loading="lazy"
      />
    </PracticeWorkspace>
  );
}
