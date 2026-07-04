import { useEffect, useMemo, useState } from "react";
import type { CourseStep } from "../data/courses";
import { courseStepToPracticeTask } from "../utils/courseUtils";
import { runCompileCheck } from "../utils/compileVerifier";
import { buildEditorContent, getFullExampleCode, verifyTaskFull } from "../utils/taskHints";
import PracticeWorkspace from "./PracticeWorkspace";

interface CourseCodeStepProps {
  step: CourseStep;
  placeholder: string;
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

export default function CourseCodeStep({
  step,
  placeholder,
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
}: CourseCodeStepProps) {
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
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches,
  );

  useEffect(() => {
    setDraft(hintsText);
    setChecklistResults((step.checklist ?? []).map(() => false));
    setCompileErrors([]);
    setCompileLanguage("");
    setShowResults(false);
  }, [step.id, hintsText, step.checklist]);

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
    <>
      <PracticeWorkspace
        bookName={bookName}
        chapterName={chapterName}
        chapterNumber={chapterNumber}
        pageType={pageType}
        pageIndex={pageIndex}
        totalPages={totalPages}
        pageBrief={pageBrief}
        title={step.title}
        value={draft}
        placeholder={placeholder}
        showPeek={showPeek}
        isMobileView={isMobileView}
        onTogglePeek={() => setShowPeek((value) => !value)}
        onVerify={verifyCode}
        onChange={setDraft}
        peekCode={peekCode}
        onPrevious={onPrevious}
        onNext={onNext}
        canPrevious={canPrevious}
        canNext={canNext}
      />

      {showResults && (
        <div className="modal-backdrop" onClick={() => setShowResults(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
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
    </>
  );
}
