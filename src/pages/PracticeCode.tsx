import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PracticeQuestionHero from "../components/PracticeQuestionHero";
import type { PracticeTask } from "../data/tasks";
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
  const [heroExpanded, setHeroExpanded] = useState(false);
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

  const selectedCategory = data.categories.find((category: { key: string }) => category.key === categoryKey);

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
    currentDraft !== undefined && currentDraftTouched
      ? currentDraft
      : hintsText;

  const taskContent = initialEditorContent;

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

  function handleNext() {
    setCurrentIndex((value) => Math.min(value + 1, filteredTasks.length - 1));
  }

  function handlePrevious() {
    setCurrentIndex((value) => Math.max(value - 1, 0));
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

  return (
    <div className="practice-page practice-wizard practice-code-page">
      <PracticeQuestionHero
        selectedTask={selectedTask}
        selectedCategory={selectedCategory}
        currentIndex={currentIndex}
        totalTasks={filteredTasks.length}
        heroExpanded={heroExpanded}
        onToggleHero={() => setHeroExpanded((value) => !value)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <section className={`practice-layout full-code ${showExampleCode ? "code-peek-open" : "code-peek-hidden"}`}>
        <section className="practice-right panel">
          <div className="practice-answer-toolbar">
            <div className="panel-heading">Answer</div>
            <div className="practice-header-actions">
              <button
                type="button"
                className="action-button practice-header-button practice-tool-button"
                onClick={() => setShowExampleCode((value) => !value)}
              >
                {showExampleCode ? "Hide Peek" : "Peek"}
              </button>
              <button
                type="button"
                className="action-button practice-header-button practice-tool-button"
                onClick={() => verifyCode()}
              >
                Verify
              </button>
            </div>
          </div>

          <div className="practice-editor-area">
            <div className="practice-editor-shell">
              {loadError ? (
                <div className="practice-error-message">
                  <pre>{loadError}</pre>
                </div>
              ) : (
                <label className="practice-text-label">
                  {selectedTask.type === "text" ? (
                    <textarea
                      className="practice-textarea"
                      value={taskContent}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      placeholder={data.placeholder}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  ) : (
                    <textarea
                      className="practice-codearea"
                      value={taskContent}
                      onChange={(event) => handleDraftChange(event.target.value)}
                      placeholder={data.placeholder}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  )}
                </label>
              )}
            </div>
          </div>

          {showExampleCode && !isMobileView && (
            <section className="practice-peek-desktop" aria-label="Example code peek">
              <div className="practice-preview-header">
                <span>Peek Code</span>
                <button
                  type="button"
                  className="practice-peek-close"
                  onClick={() => setShowExampleCode(false)}
                  aria-label="Close peek"
                >
                  ✕
                </button>
              </div>
              <pre>{peekCode}</pre>
            </section>
          )}
        </section>
      </section>

      {showExampleCode && isMobileView && (
        <div className="modal-backdrop practice-peek-mobile-modal" onClick={() => setShowExampleCode(false)}>
          <div className="modal practice-peek-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Peek Code</h3>
              <button type="button" className="modal-close" onClick={() => setShowExampleCode(false)} aria-label="Close peek">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <pre>{peekCode}</pre>
            </div>
          </div>
        </div>
      )}

      {showChecklistModal && (
        <div className="modal-backdrop" onClick={() => setShowChecklistModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                {(verificationResults[selectedTask.id] ?? checklist.map(() => false)).map((v, i) => (
                  <li key={i} className={v ? "verified" : "not-verified"}>
                    {v ? "✓" : "✗"} {checklist[i] ?? "Step"}
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
