import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseCodeStep from "../components/CourseCodeStep";
import CourseHtmlStep from "../components/CourseHtmlStep";
import CoursePdfStep from "../components/CoursePdfStep";
import CourseQuizStep from "../components/CourseQuizStep";
import type { CourseStep } from "../data/courses";
import { courseStepLabel } from "../data/courses";
import { useAccountOptional } from "../context/AccountContext";
import { useCourseReader } from "../hooks/useCourseReader";
import { loadCourseProgressForUser, saveCourseProgress } from "../utils/courseUtils";
import { getPracticePageData } from "../utils/contentStore";
import { useStageNavRegistration } from "../hooks/useStageNavRegistration";

export default function CourseWizard() {
  const { courseId } = useParams<{ courseId: string }>();
  const account = useAccountOptional();
  const {
    outline,
    steps,
    outlineLoaded,
    stepLoading,
    error,
    loadStep,
  } = useCourseReader(courseId);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<CourseStep | null>(null);
  const placeholder = getPracticePageData().placeholder;

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    loadCourseProgressForUser(courseId, account?.user?.userId).then((saved) => {
      if (!active) return;
      setStepIndex(Math.min(saved, Math.max(steps.length - 1, 0)));
    });
    return () => {
      active = false;
    };
  }, [account?.user?.userId, courseId, steps.length]);

  useEffect(() => {
    if (!courseId) return;
    saveCourseProgress(courseId, stepIndex);
  }, [courseId, stepIndex]);

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

  const handlePrevious = useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1));
  }, []);

  const handleNext = useCallback(() => {
    setStepIndex((value) => Math.min(steps.length - 1, value + 1));
  }, [steps.length]);

  useStageNavRegistration(
    stepIndex + 1,
    steps.length,
    stepIndex > 0,
    stepIndex < steps.length - 1,
    handlePrevious,
    handleNext,
  );

  if (!outlineLoaded || (stepLoading && !currentStep)) {
    return <div className="page-content panel"><div className="panel-body">Loading course...</div></div>;
  }

  if (error || !outline || !currentStep || steps.length === 0) {
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

  const bookName = `${outline.icon} ${outline.title}`;
  const chapterName = currentStep.chapterTitle;
  const chapterNumber = currentStep.chapterIndex + 1;
  const pageType = courseStepLabel(currentStep);
  const pageIndex = stepIndex + 1;
  const totalPages = steps.length;
  const hasChapterIndex = typeof currentStep.chapterIndex !== undefined
    && currentStep.chapterIndex !== null
    && currentStep.chapterIndex > 0;
  const pageBrief = hasChapterIndex
    ? `<div><strong>Chapter ${currentStep.chapterIndex + 1}</strong></div>${currentStep.description ?? ""}`
    : (currentStep.description ?? "");

  return (
    <div className="page-content course-wizard-page practice-page practice-wizard practice-code-page">
      {currentStep.stepType === "html" && (
        <CourseHtmlStep
          step={currentStep}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={pageIndex}
          totalPages={totalPages}
          pageBrief={pageBrief}
          bookHtmlFolder={outline.bookHtmlFolder}
          courseId={outline.id}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={stepIndex > 0}
          canNext={stepIndex < steps.length - 1}
        />
      )}
      {currentStep.stepType === "pdf" && (
        <CoursePdfStep
          step={currentStep}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={pageIndex}
          totalPages={totalPages}
          pageBrief={pageBrief}
          bookHtmlFolder={outline.bookHtmlFolder}
          courseId={outline.id}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={stepIndex > 0}
          canNext={stepIndex < steps.length - 1}
        />
      )}
      {currentStep.stepType === "code-exam" && (
        <CourseCodeStep
          step={currentStep}
          placeholder={placeholder}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={pageIndex}
          totalPages={totalPages}
          pageBrief={pageBrief}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={stepIndex > 0}
          canNext={stepIndex < steps.length - 1}
        />
      )}
      {currentStep.stepType === "quiz" && (
        <CourseQuizStep
          step={currentStep}
          bookName={bookName}
          chapterName={chapterName}
          chapterNumber={chapterNumber}
          pageType={pageType}
          pageIndex={pageIndex}
          totalPages={totalPages}
          pageBrief={pageBrief}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canPrevious={stepIndex > 0}
          canNext={stepIndex < steps.length - 1}
        />
      )}
    </div>
  );
}
