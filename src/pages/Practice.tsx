import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { practicePageData } from "../pageData/practicePage";
import { runCompileCheck } from "../utils/compileVerifier";
import { getCommentHints, verifyTaskFull } from "../utils/taskHints";

export default function Practice() {
  const navigate = useNavigate();
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const data = practicePageData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({});
  const [verificationResults, setVerificationResults] = useState<Record<string, boolean[]>>({});
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [compileErrors, setCompileErrors] = useState<string[]>([]);
  const [compileLanguage, setCompileLanguage] = useState("");
  const [heroExpanded, setHeroExpanded] = useState(true);

  const filteredTasks = useMemo(
    () => data.tasks.filter((task) => task.category === categoryKey),
    [categoryKey, data.tasks],
  );

  const selectedCategory = data.categories.find((category) => category.key === categoryKey);

  useEffect(() => {
    setCurrentIndex(0);
  }, [categoryKey]);

  const selectedTask = filteredTasks[currentIndex];
  const taskHints = selectedTask ? getCommentHints(selectedTask) : "";
  const taskContent = drafts[selectedTask?.id ?? ""] ?? taskHints;
  const checklist = selectedTask?.checklist ?? [];
  const checklistValues = checklistState[selectedTask?.id ?? ""] ?? checklist.map(() => false);

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
  }

  function handleReset() {
    if (!selectedTask) return;
    setDrafts((prev) => ({ ...prev, [selectedTask.id]: getCommentHints(selectedTask) }));
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
        <button
          type="button"
          className="hero-banner-header"
          onClick={() => setHeroExpanded((s) => !s)}
          aria-expanded={heroExpanded}
        >
          <div className="hero-banner-summary">
            <div className="hero-banner-title-row">
              <span className="hero-category-tag">{selectedCategory.label}</span>
              <h2 className="practice-title">{selectedTask.title}</h2>
              <span className="task-count">
                {currentIndex + 1}/{filteredTasks.length}
              </span>
              <span className="task-type-badge">{selectedTask.type.toUpperCase()}</span>
              {allChecklistComplete && <span className="status-badge complete">✓</span>}
            </div>
          </div>
          <span className="hero-chevron" aria-hidden="true">
            {heroExpanded ? "▾" : "▸"}
          </span>
        </button>
        {heroExpanded && (
          <div className="hero-banner-body">
            <p className="practice-description">{selectedTask.description}</p>
          </div>
        )}
      </section>

      <section className="practice-layout full-code">
        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">
              {selectedTask.type === "text"
                ? "Answer area"
                : selectedTask.type === "sql"
                ? "SQL editor"
                : "Code editor"}
            </div>
          </div>

          <label className="practice-text-label">
            {selectedTask.type === "text"
              ? "Free text answer"
              : selectedTask.type === "sql"
              ? "SQL query"
              : "Write your code (hints are comments only)"}
            <textarea
              className={selectedTask.type === "text" ? "practice-textarea" : "practice-codearea"}
              value={taskContent}
              onChange={(event) => handleDraftChange(event.target.value)}
              placeholder={data.placeholder}
            />
          </label>
        </section>
      </section>

      <footer className="practice-footer panel">
        <div className="practice-footer-row">
          <button type="button" className="footer-button secondary" onClick={() => navigate("/")}>Exit</button>
          <button type="button" className="footer-button" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </button>
          <button type="button" className="footer-button" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="footer-button" onClick={() => verifyCode()}>
            Verify
          </button>
          <button type="button" className="footer-button" onClick={handleNext} disabled={currentIndex === filteredTasks.length - 1}>
            Next
          </button>
        </div>
      </footer>

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
