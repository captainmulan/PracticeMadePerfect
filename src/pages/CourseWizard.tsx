import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import CourseCodeStep from "../components/CourseCodeStep";
import CourseHtmlStep from "../components/CourseHtmlStep";
import CourseQuizStep from "../components/CourseQuizStep";
import { courseStepLabel, flattenCourseSteps } from "../data/courses";
import { loadCourseProgress, saveCourseProgress } from "../utils/courseUtils";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { getPracticePageData } from "../utils/contentStore";
import { useStageNavRegistration } from "../hooks/useStageNavRegistration";

export default function CourseWizard() {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, loaded } = useCourseCatalog();
  const course = courses.find((item) => item.id === courseId);
  const steps = useMemo(() => (course ? flattenCourseSteps(course) : []), [course]);
  const [stepIndex, setStepIndex] = useState(0);
  const placeholder = getPracticePageData().placeholder;

  useEffect(() => {
    if (!courseId) return;
    const saved = loadCourseProgress(courseId);
    setStepIndex(Math.min(saved, Math.max(steps.length - 1, 0)));
  }, [courseId, steps.length]);

  useEffect(() => {
    if (!courseId) return;
    saveCourseProgress(courseId, stepIndex);
  }, [courseId, stepIndex]);

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

  if (!loaded) {
    return <div className="page-content panel"><div className="panel-body">Loading course...</div></div>;
  }

  if (!course || steps.length === 0) {
    return (
      <div className="page-content panel">
        <div className="panel-heading">Course not found</div>
        <div className="panel-body">
          <p>This course is missing or has no steps yet.</p>
          <Link to="/" className="primary-button">Back home</Link>
        </div>
      </div>
    );
  }

  const currentStep = steps[stepIndex];
  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100);
  const eyebrow = `${course.icon} ${course.title}`;
  const meta = `${currentStep.chapterTitle} · ${courseStepLabel(currentStep)}`;

  return (
    <div className="page-content course-wizard-page practice-page practice-wizard practice-code-page">
      {currentStep.stepType === "html" && (
        <CourseHtmlStep
          step={currentStep}
          eyebrow={eyebrow}
          meta={meta}
          progressPct={progressPct}
        />
      )}
      {currentStep.stepType === "code-exam" && (
        <CourseCodeStep
          step={currentStep}
          placeholder={placeholder}
          eyebrow={eyebrow}
          meta={meta}
          progressPct={progressPct}
        />
      )}
      {currentStep.stepType === "quiz" && (
        <CourseQuizStep
          step={currentStep}
          eyebrow={eyebrow}
          meta={meta}
          progressPct={progressPct}
        />
      )}
    </div>
  );
}
