import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseCodeStep from "../components/CourseCodeStep";
import CourseHtmlStep from "../components/CourseHtmlStep";
import CourseQuizStep from "../components/CourseQuizStep";
import { courseStepLabel, flattenCourseSteps } from "../data/courses";
import { loadCourseProgress, saveCourseProgress } from "../utils/courseUtils";
import { useCourseCatalog } from "../utils/useCourseCatalog";
import { getPracticePageData } from "../utils/contentStore";

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

  return (
    <div className="page-content course-wizard-page practice-page practice-wizard practice-code-page">
      <section className="course-wizard-header panel">
        <div className="course-wizard-header-top">
          <div>
            <div className="course-wizard-eyebrow">{course.icon} {course.title}</div>
            <h1 className="course-wizard-step-title">{currentStep.title}</h1>
            <div className="course-wizard-meta">
              <span>{currentStep.chapterTitle}</span>
              <span>·</span>
              <span>{courseStepLabel(currentStep)}</span>
              <span>·</span>
              <span>{stepIndex + 1} / {steps.length}</span>
            </div>
          </div>
          <div className="course-wizard-nav">
            <button
              type="button"
              className="action-button practice-nav-button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((v) => Math.max(0, v - 1))}
              aria-label="Previous step"
            >
              &lt;
            </button>
            <button
              type="button"
              className="action-button practice-nav-button"
              disabled={stepIndex >= steps.length - 1}
              onClick={() => setStepIndex((v) => Math.min(steps.length - 1, v + 1))}
              aria-label="Next step"
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="course-wizard-progress" aria-hidden="true">
          <div className="course-wizard-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
        {currentStep.description ? <p className="course-wizard-description">{currentStep.description}</p> : null}
      </section>

      <section className="course-wizard-body">
        {currentStep.stepType === "html" && <CourseHtmlStep step={currentStep} />}
        {currentStep.stepType === "code-exam" && <CourseCodeStep step={currentStep} placeholder={placeholder} />}
        {currentStep.stepType === "quiz" && <CourseQuizStep step={currentStep} />}
      </section>

      <div className="course-wizard-footer">
        <Link to="/" className="hero-secondary">Back to courses</Link>
      </div>
    </div>
  );
}
