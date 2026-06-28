import type { CourseStep } from "../data/courses";
import PracticeWorkspace from "./PracticeWorkspace";
import "../styles/course.css";

interface CourseHtmlStepProps {
  step: CourseStep;
  eyebrow: string;
  meta: string;
  progressPct: number;
}

export default function CourseHtmlStep({ step, eyebrow, meta, progressPct }: CourseHtmlStepProps) {
  return (
    <PracticeWorkspace
      eyebrow={eyebrow}
      title={step.title}
      meta={meta}
      progressPct={progressPct}
      description={step.description}
      toolbarLabel="Lesson"
    >
      <div
        className="practice-answer-html practice-workspace-content"
        dangerouslySetInnerHTML={{
          __html: step.contentHtml ?? "<p><em>No lesson content yet.</em></p>",
        }}
      />
    </PracticeWorkspace>
  );
}
