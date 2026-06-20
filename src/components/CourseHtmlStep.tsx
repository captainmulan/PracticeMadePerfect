import type { CourseStep } from "../data/courses";

interface CourseHtmlStepProps {
  step: CourseStep;
}

export default function CourseHtmlStep({ step }: CourseHtmlStepProps) {
  return (
    <div className="course-step-html">
      <div
        className="course-step-html-body practice-answer-html"
        dangerouslySetInnerHTML={{
          __html: step.contentHtml ?? "<p><em>No lesson content yet.</em></p>",
        }}
      />
    </div>
  );
}
