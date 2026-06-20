import { useMemo, useState } from "react";
import type { CourseStep } from "../data/courses";
import { courseStepToPracticeTask } from "../utils/courseUtils";
import { runCompileCheck } from "../utils/compileVerifier";
import { buildEditorContent, getFullExampleCode, verifyTaskFull } from "../utils/taskHints";

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

  function verifyCode() {
    const compile = runCompileCheck(practiceTask, draft);
    const outcome = verifyTaskFull(practiceTask, draft, compile);
    setCompileErrors(outcome.compileErrors);
    setCompileLanguage(outcome.compileLanguage);
    setChecklistResults(outcome.checklistResults);
    setShowResults(true);
  }

  const peekCode = getFullExampleCode(practiceTask);

  return (
    <div className="course-step-code">
      <div className="course-step-code-toolbar">
        <span className="course-step-code-label">Code exam</span>
        <div className="course-step-code-actions">
          <button type="button" className="action-button practice-tool-button" onClick={() => setShowPeek((v) => !v)}>
            {showPeek ? "Hide Peek" : "Peek"}
          </button>
          <button type="button" className="action-button practice-tool-button" onClick={verifyCode}>
            Verify
          </button>
        </div>
      </div>

      <div className={`course-step-code-layout practice-layout full-code ${showPeek ? "code-peek-open" : "code-peek-hidden"}`}>
        <div className="course-step-editor-shell practice-editor-shell">
          <textarea
            className="practice-codearea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        {showPeek && (
          <section className="practice-preview panel practice-peek-desktop" aria-label="Example code peek">
            <div className="practice-preview-header">
              <span>Peek Code</span>
              <button type="button" className="practice-peek-close" onClick={() => setShowPeek(false)} aria-label="Close peek">
                ✕
              </button>
            </div>
            <pre>{peekCode}</pre>
          </section>
        )}
      </div>

      {showPeek && (
        <div className="modal-backdrop practice-peek-mobile-modal" onClick={() => setShowPeek(false)}>
          <div className="modal practice-peek-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Peek Code</h3>
              <button type="button" className="modal-close" onClick={() => setShowPeek(false)} aria-label="Close peek">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <pre>{peekCode}</pre>
            </div>
            <div className="modal-footer">
              <button type="button" className="footer-button" onClick={() => setShowPeek(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
