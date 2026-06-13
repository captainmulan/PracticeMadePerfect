import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { PracticeTask } from "../data/tasks";
import { getPracticePageData } from "../utils/contentStore";
import { runCompileCheck } from "../utils/compileVerifier";
import { buildEditorContent, verifyTaskFull } from "../utils/taskHints";

export default function Practice() {
  const navigate = useNavigate();
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = getPracticePageData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftTouched, setDraftTouched] = useState<Record<string, boolean>>({});
  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({});
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean[]>>({});
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [compileErrors, setCompileErrors] = useState<string[]>([]);
  const [compileLanguage, setCompileLanguage] = useState("");
  const [showExampleCode, setShowExampleCode] = useState(false);
  const [heroExpanded, setHeroExpanded] = useState(true);

  const filteredTasks = useMemo(
    () => data.tasks.filter((task: PracticeTask) => task.category === categoryKey),
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
  const checklistValues = checklistState[selectedTask?.id ?? ""] ?? checklist.map(() => false);
  const hintsText = selectedTask ? buildEditorContent(selectedTask, false) : "";

  const initialEditorContent =
    currentDraft !== undefined && currentDraftTouched
      ? currentDraft
      : hintsText;

  const taskContent = initialEditorContent;
  const codeLineNumbers = selectedTask?.type !== "text" ? taskContent.split("\n").map((_, index) => index + 1) : [];

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

  function handleReset() {
    if (!selectedTask) return;
    setDrafts((prev) => ({
      ...prev,
      [selectedTask.id]: initialEditorContent,
    }));
    setDraftTouched((prev) => ({
      ...prev,
      [selectedTask.id]: false,
    }));
    setChecklistState((prev) => ({ ...prev, [selectedTask.id]: checklist.map(() => false) }));
    setVerificationResults((prev) => ({ ...prev, [selectedTask.id]: checklist.map(() => false) }));
    setCompileErrors([]);
    setCompileLanguage("");
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

  const allChecklistComplete = checklistValues.every((val) => val);

  return (
    <div className="practice-page practice-wizard">
      <section className={`hero-banner panel ${heroExpanded ? "expanded" : "collapsed"}`}>
        <div className="hero-banner-header">
          <div className="hero-banner-title-row">
            <div className="hero-title">Question</div>
            <div className="hero-category-tag">{selectedCategory.label}</div>
            <div className="task-type-badge">{selectedTask.type.toUpperCase()}</div>
            <div className="hero-page-index">
              {currentIndex + 1}/{filteredTasks.length}
            </div>
          </div>
          <button
            type="button"
            className="panel-toggle"
            onClick={() => setHeroExpanded((value) => !value)}
          >
            {heroExpanded ? "−" : "+"}
          </button>
        </div>
        {heroExpanded && (
          <div className="hero-banner-body">
            <p className="practice-description">{selectedTask.description}</p>
          </div>
        )}
      </section>
      <section className="practice-layout full-code">
        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">Answer</div>
            <div className="practice-header-actions">
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={() => setShowExampleCode((value) => !value)}
              >
                {showExampleCode ? "Hide Peek" : "Peek Code"}
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={() => setHeroExpanded((value) => !value)}
              >
                {heroExpanded ? "Hide Question" : "Show Question"}
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={() => verifyCode()}
              >
                Verify
              </button>
              <button
                type="button"
                className="action-button practice-header-button"
                onClick={handleNext}
                disabled={currentIndex === filteredTasks.length - 1}
              >
                Next
              </button>
            </div>
          </div>

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
                <div className="practice-code-editor">
                  <div className="code-line-numbers" aria-hidden="true">
                    {codeLineNumbers.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                  <textarea
                    className="practice-codearea practice-codearea-with-lines"
                    value={taskContent}
                    onChange={(event) => handleDraftChange(event.target.value)}
                    placeholder={data.placeholder}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              )}
            </label>
          )}
        </section>

        {showExampleCode && (
          <section className="practice-preview panel">
            <div className="practice-preview-header">Peek Code</div>
            <pre>{buildEditorContent(selectedTask, true)}</pre>
          </section>
        )}
      </section>

      {/* Checklist / verification modal */}
      {showChecklistModal && (
        <div className="modal-backdrop" onClick={() => setShowChecklistModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Verification Results</h3>
              <button className="modal-close" onClick={() => setShowChecklistModal(false)}>✕</button>
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
              <button className="footer-button" onClick={() => setShowChecklistModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
