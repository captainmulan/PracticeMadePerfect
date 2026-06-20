import { useEffect, useMemo, useState } from "react";
import type { CourseStep } from "../data/courses";
import { courseStepToPracticeTask } from "../utils/courseUtils";
import { runCompileCheck } from "../utils/compileVerifier";
import { buildEditorContent, getFullExampleCode, verifyTaskFull } from "../utils/taskHints";
import PracticeCodeEditor from "./PracticeCodeEditor";

interface CourseCodeStepProps {
  step: CourseStep;
  placeholder: string;
}

export default function CourseCodeStep({ step, placeholder }: CourseCodeStepProps) {
  const practiceTask = useMemo(() => courseStepToPracticeTask(step), [step]);
  const hintsText = buildEditorContent(practiceTask, false);
  const [draft, setDraft] = useState(hintsText);
  const [showPeek, setShowPeek] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [compileErrors, setCompileErrors] = useState<string[]>([]);
  const [compileLanguage, setCompileLanguage] = useState("");
  const [checklistResults, setChecklistResults] = useState<boolean[]>(
    () => (step.checklist ?? []).map(() => false),
  );

  useEffect(() => {
    setDraft(hintsText);
    setChecklistResults((step.checklist ?? []).map(() => false));
    setCompileErrors([]);
    setCompileLanguage("");
    setShowResults(false);
  }, [step.id, hintsText, step.checklist]);
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches,
  );

  function verifyCode() {
    const compile = runCompileCheck(practiceTask, draft);
    const outcome = verifyTaskFull(practiceTask, draft, compile);
    setCompileErrors(outcome.compileErrors);
    setCompileLanguage(outcome.compileLanguage);
    setChecklistResults(outcome.checklistResults);
    setShowResults(true);
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const onChange = (event: MediaQueryListEvent) => setIsMobileView(event.matches);
    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const peekCode = getFullExampleCode(practiceTask);

  return (
    <div className="course-step-code">
      <PracticeCodeEditor
        label="Code exam"
        value={draft}
        placeholder={placeholder}
        showPeek={showPeek}
        isMobileView={isMobileView}
        onTogglePeek={() => setShowPeek((v) => !v)}
        onVerify={verifyCode}
        onChange={setDraft}
        peekCode={peekCode}
      />

      {showResults && (
        <div className="modal-backdrop" onClick={() => setShowResults(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Verification Results</h3>
              <button type="button" className="modal-close" onClick={() => setShowResults(false)}>✕</button>
            </div>
            <div className="modal-body">
              {compileErrors.length > 0 && (
                <div className="compile-error-box">
                  <p className="compile-error-title">Compile failed ({compileLanguage})</p>
                  <ul className="compile-error-list">
                    {compileErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <ul>
                {checklistResults.map((passed, index) => (
                  <li key={index} className={passed ? "verified" : "not-verified"}>
                    {passed ? "✓" : "✗"} {step.checklist?.[index] ?? "Step"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="footer-button" onClick={() => setShowResults(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
