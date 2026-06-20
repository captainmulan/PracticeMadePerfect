import type { CourseStep } from "../data/courses";
import "../styles/course.css";

interface CourseHtmlStepProps {
  step: CourseStep;
}

export default function CourseHtmlStep({ step }: CourseHtmlStepProps) {
  return (
    <div className="course-step-html course-step-html-body">
      <section className="practice-layout full-code code-peek-hidden">
        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">Lesson</div>
          </div>
          <div
            className="practice-answer-html"
            dangerouslySetInnerHTML={{
              __html: step.contentHtml ?? "<p><em>No lesson content yet.</em></p>",
            }}
          />
        </section>
      </section>
    </div>
  );
}
