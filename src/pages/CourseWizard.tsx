import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseAboutStep from "../components/CourseAboutStep";
import CourseCodeStep from "../components/CourseCodeStep";
import CourseHtmlStep from "../components/CourseHtmlStep";
import CoursePdfStep from "../components/CoursePdfStep";
import CourseEpubStep from "../components/CourseEpubStep";
import CourseQuizStep from "../components/CourseQuizStep";
import type { CourseStep } from "../data/courses";
import { courseStepLabel } from "../data/courses";
import { useAccountOptional } from "../context/AccountContext";
import { useCourseReader } from "../hooks/useCourseReader";
import {
  getBookmarksForCurrentUser,
  isCurrentStepBookmarked,
  loadCourseProgressForUser,
  removeBookmarkForCurrentUser,
  saveCourseProgress,
  toggleCurrentBookmark,
} from "../utils/courseUtils";
import type { BookBookmark } from "../services/types/account";
import { getPracticePageData } from "../utils/contentStore";
import { useStageNavRegistration } from "../hooks/useStageNavRegistration";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { coursesShareShelf } from "../utils/bookCategories";
import { warmupPdfReaderAssets } from "../utils/pdfCache";

export default function CourseWizard() {
  const { courseId } = useParams<{ courseId: string }>();
  const account = useAccountOptional();
  const { courses } = useCourseCatalog();
  const {
    outline,
    steps,
    outlineLoaded,
    stepLoading,
    error,
    loadStep,
  } = useCourseReader(courseId);
  const [stepIndex, setStepIndex] = useState(0);
  const [viewingIntro, setViewingIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState<CourseStep | null>(null);
  const placeholder = getPracticePageData().placeholder;
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookBookmark[]>([]);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    setPdfReady(false);
  }, [courseId]);

  useEffect(() => {
    if (viewingIntro) warmupPdfReaderAssets();
  }, [viewingIntro, courseId]);

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    loadCourseProgressForUser(courseId, account?.user?.userId).then((saved) => {
      if (!active) return;
      const clamped = Math.min(saved, Math.max(steps.length - 1, 0));
      setStepIndex(clamped);
      setViewingIntro(clamped <= 0);
    });
    return () => {
      active = false;
    };
  }, [account?.user?.userId, courseId, steps.length]);

  useEffect(() => {
    if (!courseId || viewingIntro) return;
    saveCourseProgress(courseId, stepIndex);
  }, [courseId, stepIndex, viewingIntro]);

  useEffect(() => {
    const outlineStep = steps[stepIndex];
    if (!outlineStep) {
      setCurrentStep(null);
      return;
    }

    let active = true;
    loadStep(outlineStep).then((fullStep) => {
      if (active) {
        setCurrentStep(fullStep);
      }
    });

    return () => {
      active = false;
    };
  }, [stepIndex, steps, loadStep]);

  useEffect(() => {
    const bookId = outline?.id;
    if (!bookId || stepIndex < 0 || viewingIntro) {
      setBookmarked(false);
      if (!bookId) setBookmarks([]);
      return;
    }
    let active = true;
    void Promise.all([
      getBookmarksForCurrentUser(bookId),
      isCurrentStepBookmarked(bookId, stepIndex),
    ]).then(([list, isBookmarked]) => {
      if (!active) return;
      setBookmarks(list);
      setBookmarked(isBookmarked);
    });
    return () => {
      active = false;
    };
  }, [outline?.id, stepIndex, account?.user?.userId, viewingIntro]);

  const handlePrevious = useCallback(() => {
    if (viewingIntro) return;
    if (stepIndex <= 0) {
      setViewingIntro(true);
      return;
    }
    setStepIndex((value) => Math.max(0, value - 1));
  }, [stepIndex, viewingIntro]);

  const handleNext = useCallback(() => {
    if (viewingIntro) {
      setViewingIntro(false);
      return;
    }
    setStepIndex((value) => Math.min(steps.length - 1, value + 1));
  }, [steps.length, viewingIntro]);

  const handleToggleBookmark = useCallback(async () => {
    const bookId = outline?.id;
    if (!bookId || !currentStep || viewingIntro) return;
    const result = await toggleCurrentBookmark({
      bookId,
      stepIndex,
      stepTitle: currentStep.title ?? null,
      note: null,
    });
    setBookmarks(result.list);
    setBookmarked(Boolean(result.created));
  }, [outline?.id, currentStep, stepIndex, viewingIntro]);

  const handleRemoveBookmark = useCallback(async (bookmarkId: string) => {
    const bookId = outline?.id;
    if (!bookId) return;
    const list = (await removeBookmarkForCurrentUser(bookId, bookmarkId)).filter(
      (item) => item.bookId === bookId,
    );
    setBookmarks(list);
    if (list.findIndex((item) => item.stepIndex === stepIndex) < 0) {
      setBookmarked(false);
    }
  }, [outline?.id, stepIndex]);

  const handlePdfViewerReady = useCallback(() => {
    setPdfReady(true);
  }, []);

  const handleJumpToBookmark = useCallback((targetStepIndex: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, targetStepIndex));
    setViewingIntro(false);
    setStepIndex(clamped);
  }, [steps.length]);

  const relatedBooks = useMemo(() => {
    if (!outline) return [];
    return courses.filter((course) => course.id !== outline.id && coursesShareShelf(course, outline));
  }, [courses, outline]);

  const uiTotalPages = steps.length;
  const uiPageIndex = stepIndex + 1;
  const canGoPrevious = !viewingIntro;
  const canGoNext = viewingIntro || stepIndex < steps.length - 1;

  useStageNavRegistration(
    viewingIntro ? 0 : uiPageIndex,
    viewingIntro ? 0 : uiTotalPages,
    canGoPrevious,
    canGoNext,
    handlePrevious,
    handleNext,
  );

  if (!outlineLoaded || (stepLoading && !currentStep && !viewingIntro)) {
    return <div className="page-content panel"><div className="panel-body">Loading course...</div></div>;
  }

  if (error || !outline || steps.length === 0) {
    return (
      <div className="page-content panel">
        <div className="panel-heading">Course not found</div>
        <div className="panel-body">
          <p>{error ?? "This course is missing or has no steps yet."}</p>
          <Link to="/" className="primary-button">Back home</Link>
        </div>
      </div>
    );
  }

  if (!viewingIntro && !currentStep) {
    return <div className="page-content panel"><div className="panel-body">Loading course...</div></div>;
  }

  const isPdfBook = (currentStep ?? steps[stepIndex] ?? steps[0])?.stepType === "pdf";
  const pdfStep = currentStep?.stepType === "pdf" ? currentStep : null;
  const bookName = `${outline.icon} ${outline.title}`;
  const chapterName = currentStep?.chapterTitle ?? "";
  const chapterNumber = (currentStep?.chapterIndex ?? 0) + 1;
  const pageType = currentStep ? courseStepLabel(currentStep) : "PDF";
  const chapterIndex = currentStep?.chapterIndex;
  const hasChapterIndex = typeof chapterIndex === "number" && chapterIndex > 0;
  const pageBrief = currentStep && hasChapterIndex
    ? `<div><strong>Chapter ${currentStep.chapterIndex + 1}</strong></div>${currentStep.description ?? ""}`
    : (currentStep?.description ?? "");

  const bookmarkProps = {
    bookId: outline.id,
    stepIndex,
    bookmarked,
    bookmarks,
    onToggleBookmark: handleToggleBookmark,
    onRemoveBookmark: handleRemoveBookmark,
    onJumpToBookmark: handleJumpToBookmark,
  };

  const pdfProps = pdfStep
    ? {
        step: pdfStep,
        bookName,
        chapterName,
        chapterNumber,
        pageType,
        pageIndex: uiPageIndex,
        totalPages: uiTotalPages,
        pageBrief,
        bookHtmlFolder: outline.bookHtmlFolder,
        pageViewType: outline.pageViewType,
        courseId: outline.id,
        onPrevious: handlePrevious,
        onNext: handleNext,
        canPrevious: canGoPrevious,
        canNext: canGoNext,
        isWarming: viewingIntro,
        onViewerReady: handlePdfViewerReady,
        ...bookmarkProps,
      }
    : null;

  return (
    <div
      className={`page-content course-wizard-page practice-page practice-wizard practice-code-page${
        viewingIntro ? " course-wizard-page--about" : ""
      }${viewingIntro && isPdfBook ? " course-wizard-page--pdf-warm" : ""}`}
    >
      {pdfProps ? (
        <div className="pdf-reader-layer" aria-hidden={viewingIntro}>
          <CoursePdfStep {...pdfProps} />
        </div>
      ) : null}
      {viewingIntro ? (
        <div className="pdf-about-layer">
          <CourseAboutStep
            course={outline}
            related={relatedBooks}
            onRead={handleNext}
            pdfLoading={isPdfBook && !pdfReady}
          />
        </div>
      ) : null}
      {!viewingIntro && currentStep?.stepType === "html" && (
        <CourseHtmlStep
          step={currentStep}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={uiPageIndex}
          totalPages={uiTotalPages}
          pageBrief={pageBrief}
          bookHtmlFolder={outline.bookHtmlFolder}
          courseId={outline.id}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={canGoPrevious}
          canNext={canGoNext}
          {...bookmarkProps}
        />
      )}
      {!viewingIntro && currentStep?.stepType === "epub" && (
        <CourseEpubStep
          step={currentStep}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={uiPageIndex}
          totalPages={uiTotalPages}
          pageBrief={pageBrief}
          bookHtmlFolder={outline.bookHtmlFolder}
          courseId={outline.id}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={canGoPrevious}
          canNext={canGoNext}
          {...bookmarkProps}
        />
      )}
      {!viewingIntro && currentStep?.stepType === "code-exam" && (
        <CourseCodeStep
          step={currentStep}
          placeholder={placeholder}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={uiPageIndex}
          totalPages={uiTotalPages}
          pageBrief={pageBrief}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={canGoPrevious}
          canNext={canGoNext}
          {...bookmarkProps}
        />
      )}
      {!viewingIntro && currentStep?.stepType === "quiz" && (
        <CourseQuizStep
          step={currentStep}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={uiPageIndex}
          totalPages={uiTotalPages}
          pageBrief={pageBrief}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={canGoPrevious}
          canNext={canGoNext}
          {...bookmarkProps}
        />
      )}
    </div>
  );
}
