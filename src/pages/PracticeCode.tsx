import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PracticeWorkspace from "../components/PracticeWorkspace";
import type { PracticeTask } from "../data/tasks";
import { useStageNavRegistration } from "../hooks/useStageNavRegistration";
import { usePracticeData } from "../utils/usePracticeData";
import { sortTasksInCategory } from "../utils/taskSort";
import { runCompileCheck } from "../utils/compileVerifier";
import { buildEditorContent, verifyTaskFull, getFullExampleCode } from "../utils/taskHints";

export default function Practice() {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = usePracticeData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftTouched, setDraftTouched] = useState<Record<string, boolean>>({});
  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({});
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean[]>>({});
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [compileErrors, setCompileErrors] = useState<string[]>([]);
  const [compileLanguage, setCompileLanguage] = useState("");
  const [showExampleCode, setShowExampleCode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const syncViewport = (event: MediaQueryListEvent) => setIsMobileView(event.matches);
    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const filteredTasks = useMemo(
    () => sortTasksInCategory(data.tasks.filter((task: PracticeTask) => task.category === categoryKey)),
    [categoryKey, data.tasks],
  );

  const selectedCategory = data.categories.find((category) => category.key === categoryKey);

  useEffect(() => {
    setCurrentIndex(0);
  }, [categoryKey]);

  const selectedTask = filteredTasks[currentIndex];
  const loadError = selectedTask?.loadError;
  const currentDraft = drafts[selectedTask?.id ?? ""];
  const currentDraftTouched = selectedTask ? draftTouched[selectedTask.id] : false;
  const checklist = selectedTask?.checklist ?? [];
  const hintsText = selectedTask ? buildEditorContent(selectedTask, false) : "";
  const peekCode = selectedTask ? getFullExampleCode(selectedTask) : "";

  const initialEditorContent =
    currentDraft !== undefined && currentDraftTouched ? currentDraft : hintsText;

  const taskContent = initialEditorContent;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((value) => Math.max(value - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((value) => Math.min(value + 1, filteredTasks.length - 1));
  }, [filteredTasks.length]);

  useStageNavRegistration(
    currentIndex + 1,
    filteredTasks.length,
    currentIndex > 0,
    currentIndex < filteredTasks.length - 1,
    handlePrevious,
    handleNext,
  );

  function verifyCode() {
    if (!selectedTask) return;

    const compile = runCompileCheck(selectedTask, taskContent);
    const outcome = verifyTaskFull(selectedTask, taskContent, compile);

    setCompileErrors(outcome.compileErrors);
    setCompileLanguage(outcome.compileLanguage);
    setVerificationResults((prev) => ({
      ...prev,
      [selectedTask.id]: outcome.checklistResults,
    }));
    setChecklistState((prev) => ({
      ...prev,
      [selectedTask.id]: outcome.checklistResults,
    }));
    setShowChecklistModal(true);
  }

  function handleDraftChange(value: string) {
    if (!selectedTask) return;
    setDrafts((prev) => ({ ...prev, [selectedTask.id]: value }));
    setDraftTouched((prev) => ({ ...prev, [selectedTask.id]: true }));
  }

  if (!selectedCategory) {
    return (
      <div className="practice-page panel">
        <div className="panel-heading">Category not found</div>
        <div className="panel-body">
          <p>Pick a valid practice type from the home screen.</p>
          <Link to="/" className="primary-button">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="practice-page panel">
        <div className="panel-heading">No tasks available</div>
        <div className="panel-body">
          <p>There are no tasks configured for this category yet.</p>
          <Link to="/" className="primary-button">
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / filteredTasks.length) * 100);

  return (
    <div className="practice-page practice-wizard practice-code-page">
      <PracticeWorkspace
        eyebrow={selectedCategory.label}
        title={selectedTask.title}
        meta={`${selectedTask.type} · ${selectedTask.id}`}
        progressPct={progressPct}
        description={selectedTask.description}
        toolbarLabel="Answer"
        value={taskContent}
        placeholder={data.placeholder}
        isText={selectedTask.type === "text"}
        loadError={loadError}
        showPeek={showExampleCode}
        isMobileView={isMobileView}
        onTogglePeek={() => setShowExampleCode((value) => !value)}
        onVerify={verifyCode}
        onChange={handleDraftChange}
        peekCode={peekCode}
      />

      {showChecklistModal && (
        <div className="modal-backdrop" onClick={() => setShowChecklistModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Verification Results</h3>
              <button type="button" className="modal-close" onClick={() => setShowChecklistModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {compileErrors.length > 0 && (
                <div className="compile-error-box">
                  <p className="compile-error-title">
                    Compile failed ({compileLanguage})
                  </p>
                  <ul className="compile-error-list">
                    {compileErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <ul>
                {(verificationResults[selectedTask.id] ?? checklist.map(() => false)).map((passed, index) => (
                  <li key={index} className={passed ? "verified" : "not-verified"}>
                    {passed ? "✓" : "✗"} {checklist[index] ?? "Step"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="footer-button" onClick={() => setShowChecklistModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
