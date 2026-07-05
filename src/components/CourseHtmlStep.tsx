import type { CourseStep } from "../data/courses";
import PracticeWorkspace from "./PracticeWorkspace";
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
      <div
        dangerouslySetInnerHTML={{
          __html: step.contentHtml ?? "<p><em>No lesson content yet.</em></p>",
        }}
      />
    </PracticeWorkspace>
  );
}
